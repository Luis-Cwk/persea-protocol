// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Types.sol";
import "./SkinTraceContract.sol";

struct Listing {
    uint256 batchId;
    address seller;
    uint256 pricePerKg;
    uint256 totalWeight;
    uint256 availableWeight;
    address paymentToken;
    bool active;
    uint256 createdAt;
}

struct Offer {
    uint256 listingId;
    address buyer;
    uint256 weight;
    uint256 totalPrice;
    uint256 createdAt;
    bool accepted;
    bool completed;
}

struct TxData {
    uint256 listingId;
    address buyer;
    address seller;
    uint256 weight;
    uint256 totalPrice;
    uint256 completedAt;
    bytes32 deliveryProof;
}

contract PitMarketContract is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIED_BUYER = keccak256("VERIFIED_BUYER");

    SkinTraceContract public skinTraceContract;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(uint256 => TxData) public transactions;

    mapping(address => uint256) public escrowBalances;

    mapping(ResidueType => uint256) public floorPrices;

    uint256 public listingCounter;
    uint256 public transactionCounter;

    uint256 public platformFeePercent = 150;

    address public feeCollector;

    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed batchId,
        address indexed seller,
        uint256 pricePerKg,
        uint256 totalWeight
    );

    event OfferMade(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 weight,
        uint256 totalPrice
    );

    event OfferAccepted(
        uint256 indexed listingId,
        uint256 indexed offerIndex,
        address indexed buyer
    );

    event DeliveryConfirmed(
        uint256 indexed transactionId,
        bytes32 deliveryProof
    );

    event PaymentReleased(
        uint256 indexed transactionId,
        address indexed seller,
        uint256 amount
    );

    constructor(address _skinTraceContract) {
        skinTraceContract = SkinTraceContract(_skinTraceContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        feeCollector = msg.sender;

        floorPrices[ResidueType.SEED] = 5 * 10**15;
        floorPrices[ResidueType.PEEL] = 1 * 10**15;
        floorPrices[ResidueType.PULP] = 3 * 10**15;
        floorPrices[ResidueType.BIOMASS] = 5 * 10**14;
    }

    function setFloorPrice(ResidueType _type, uint256 _price) external onlyRole(ADMIN_ROLE) {
        floorPrices[_type] = _price;
    }

    function setPlatformFee(uint256 _feePercent) external onlyRole(ADMIN_ROLE) {
        require(_feePercent <= 500, "Fee too high");
        platformFeePercent = _feePercent;
    }

    function createListing(
        uint256 _batchId,
        uint256 _pricePerKg,
        address _paymentToken
    ) external returns (uint256) {
        BatchData memory batch = skinTraceContract.getBatch(_batchId);

        require(skinTraceContract.ownerOf(_batchId) == msg.sender, "Not batch owner");
        require(!batch.isListed, "Already listed");
        require(_pricePerKg >= floorPrices[batch.residueType], "Below floor price");

        uint256 listingId = listingCounter;
        listingCounter++;

        listings[listingId] = Listing({
            batchId: _batchId,
            seller: msg.sender,
            pricePerKg: _pricePerKg,
            totalWeight: batch.weight,
            availableWeight: batch.weight,
            paymentToken: _paymentToken,
            active: true,
            createdAt: block.timestamp
        });

        skinTraceContract.setListedStatus(_batchId, true);

        emit ListingCreated(listingId, _batchId, msg.sender, _pricePerKg, batch.weight);

        return listingId;
    }

    function makeOffer(
        uint256 _listingId,
        uint256 _weight
    ) external onlyRole(VERIFIED_BUYER) nonReentrant returns (uint256) {
        Listing storage listing = listings[_listingId];
        require(listing.active, "Listing not active");
        require(_weight <= listing.availableWeight, "Insufficient weight");
        require(_weight > 0, "Invalid weight");

        uint256 totalPrice = listing.pricePerKg * _weight;

        IERC20 paymentToken = IERC20(listing.paymentToken);
        require(paymentToken.transferFrom(msg.sender, address(this), totalPrice), "Payment failed");

        escrowBalances[msg.sender] += totalPrice;

        uint256 offerIndex = offers[_listingId].length;
        offers[_listingId].push(Offer({
            listingId: _listingId,
            buyer: msg.sender,
            weight: _weight,
            totalPrice: totalPrice,
            createdAt: block.timestamp,
            accepted: false,
            completed: false
        }));

        emit OfferMade(_listingId, msg.sender, _weight, totalPrice);

        return offerIndex;
    }

    function acceptOffer(uint256 _listingId, uint256 _offerIndex) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Listing not active");

        Offer storage offer = offers[_listingId][_offerIndex];
        require(!offer.accepted, "Already accepted");

        offer.accepted = true;
        listing.availableWeight -= offer.weight;

        if (listing.availableWeight == 0) {
            listing.active = false;
        }
    }

    function confirmDelivery(
        uint256 _listingId,
        uint256 _offerIndex,
        bytes32 _deliveryProof,
        int256,
        int256
    ) external nonReentrant {
        Offer storage offer = offers[_listingId][_offerIndex];
        Listing storage listing = listings[_listingId];

        require(offer.accepted && !offer.completed, "Invalid offer state");
        require(msg.sender == offer.buyer, "Only buyer can confirm");

        offer.completed = true;

        uint256 txId = transactionCounter;
        transactionCounter++;

        transactions[txId] = TxData({
            listingId: _listingId,
            buyer: offer.buyer,
            seller: listing.seller,
            weight: offer.weight,
            totalPrice: offer.totalPrice,
            completedAt: block.timestamp,
            deliveryProof: _deliveryProof
        });

        escrowBalances[offer.buyer] -= offer.totalPrice;

        uint256 platformFee = (offer.totalPrice * platformFeePercent) / 10000;
        uint256 sellerProceeds = offer.totalPrice - platformFee;

        IERC20 paymentToken = IERC20(listing.paymentToken);
        require(paymentToken.transfer(listing.seller, sellerProceeds), "Seller payment failed");
        require(paymentToken.transfer(feeCollector, platformFee), "Fee payment failed");

        if (offer.weight == listing.totalWeight) {
            skinTraceContract.safeTransferFrom(
                listing.seller,
                offer.buyer,
                listing.batchId
            );
        }

        emit DeliveryConfirmed(txId, _deliveryProof);
        emit PaymentReleased(txId, listing.seller, sellerProceeds);
    }

    function cancelOffer(uint256 _listingId, uint256 _offerIndex) external nonReentrant {
        Offer storage offer = offers[_listingId][_offerIndex];
        require(msg.sender == offer.buyer, "Only buyer can cancel");
        require(!offer.accepted, "Offer already accepted");

        Listing storage listing = listings[_listingId];
        IERC20 paymentToken = IERC20(listing.paymentToken);

        escrowBalances[offer.buyer] -= offer.totalPrice;
        require(paymentToken.transfer(offer.buyer, offer.totalPrice), "Refund failed");

        offer.accepted = true;
        offer.completed = true;
    }

    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Not seller");

        for (uint256 i = 0; i < offers[_listingId].length; i++) {
            Offer storage offer = offers[_listingId][i];
            if (offer.accepted && !offer.completed) {
                revert("Active offers exist");
            }
        }

        listing.active = false;
        skinTraceContract.setListedStatus(listing.batchId, false);
    }

    function getListing(uint256 _listingId) external view returns (Listing memory) {
        return listings[_listingId];
    }

    function getOffers(uint256 _listingId) external view returns (Offer[] memory) {
        return offers[_listingId];
    }

    function getTransaction(uint256 _txId) external view returns (TxData memory) {
        return transactions[_txId];
    }
}
