// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Types.sol";

contract SkinTraceContract is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant MARKETPLACE_ROLE = keccak256("MARKETPLACE_ROLE");

    uint256 private _batchIdCounter;

    mapping(uint256 => BatchData) public batches;
    mapping(uint256 => CustodyRecord[]) public custodyHistory;

    // Marketplace authorization
    address public authorizedMarketplace;

    event BatchRegistered(
        uint256 indexed batchId,
        address indexed producer,
        ResidueType residueType,
        uint256 weight,
        string ipfsHash
    );

    event CustodyTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event MarketplaceSet(address indexed marketplace);

    constructor() ERC721("PERSEA Batch NFT", "PBNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PRODUCER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    function setAuthorizedMarketplace(address _marketplace) external onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedMarketplace = _marketplace;
        emit MarketplaceSet(_marketplace);
    }

    function registerBatch(
        ResidueType _residueType,
        uint256 _weight,
        string calldata _variety,
        QualityState _quality,
        string calldata _ipfsHash,
        int256 _latitude,
        int256 _longitude
    ) external onlyRole(PRODUCER_ROLE) returns (uint256) {
        uint256 batchId = _batchIdCounter;
        _batchIdCounter++;

        _safeMint(msg.sender, batchId);
        _setTokenURI(batchId, _ipfsHash);

        batches[batchId] = BatchData({
            id: batchId,
            producer: msg.sender,
            residueType: _residueType,
            weight: _weight,
            variety: _variety,
            quality: _quality,
            ipfsHash: _ipfsHash,
            latitude: _latitude,
            longitude: _longitude,
            timestamp: block.timestamp,
            currentCustodian: msg.sender,
            isListed: false
        });

        custodyHistory[batchId].push(CustodyRecord({
            from: address(0),
            to: msg.sender,
            timestamp: block.timestamp,
            location: "Origin"
        }));

        emit BatchRegistered(batchId, msg.sender, _residueType, _weight, _ipfsHash);

        return batchId;
    }

    function transferCustody(
        uint256 _batchId,
        address _newCustodian,
        string calldata _location
    ) external {
        require(ownerOf(_batchId) == msg.sender, "Not the owner");
        require(_newCustodian != address(0), "Invalid custodian");
        require(!batches[_batchId].isListed, "Batch is listed in marketplace");

        batches[_batchId].currentCustodian = _newCustodian;

        custodyHistory[_batchId].push(CustodyRecord({
            from: msg.sender,
            to: _newCustodian,
            timestamp: block.timestamp,
            location: _location
        }));

        emit CustodyTransferred(_batchId, msg.sender, _newCustodian, block.timestamp);
    }

    function getCustodyHistory(uint256 _batchId) external view returns (CustodyRecord[] memory) {
        return custodyHistory[_batchId];
    }

    function getBatch(uint256 _batchId) external view returns (BatchData memory) {
        return batches[_batchId];
    }

    function updateQuality(uint256 _batchId, QualityState _newQuality) external onlyRole(VERIFIER_ROLE) {
        batches[_batchId].quality = _newQuality;
    }

    // Only owner OR authorized marketplace can set listed status
    function setListedStatus(uint256 _batchId, bool _isListed) external {
        require(
            ownerOf(_batchId) == msg.sender || msg.sender == authorizedMarketplace,
            "Not authorized"
        );
        batches[_batchId].isListed = _isListed;
    }

    function totalBatches() external view returns (uint256) {
        return _batchIdCounter;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
