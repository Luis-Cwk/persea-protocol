// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../src/Types.sol";
import "../src/SkinTraceContract.sol";
import "../src/PitMarketContract.sol";
import "../src/SeedScoreContract.sol";
import "../src/SeedConsentContract.sol";
import "../src/PerseaToken.sol";

contract SkinTraceTest is Test {
    SkinTraceContract skinTrace;
    address producer = address(0x1);
    address buyer = address(0x2);

    function setUp() public {
        skinTrace = new SkinTraceContract();
        skinTrace.grantRole(skinTrace.PRODUCER_ROLE(), producer);
    }

    function testRegisterBatch() public {
        vm.prank(producer);
        uint256 batchId = skinTrace.registerBatch(
            ResidueType.SEED,
            1000,
            "Hass",
            QualityState.FRESH,
            "QmTest123",
            1950,
            -10250
        );

        assertEq(batchId, 0);
        assertEq(skinTrace.totalBatches(), 1);

        BatchData memory batch = skinTrace.getBatch(batchId);
        assertEq(batch.producer, producer);
        assertEq(batch.weight, 1000);
        assertEq(uint(batch.residueType), uint(ResidueType.SEED));
    }

    function testTransferCustody() public {
        vm.prank(producer);
        uint256 batchId = skinTrace.registerBatch(
            ResidueType.SEED,
            1000,
            "Hass",
            QualityState.FRESH,
            "QmTest123",
            1950,
            -10250
        );

        vm.prank(producer);
        skinTrace.transferCustody(batchId, buyer, "Uruapan");

        BatchData memory batch = skinTrace.getBatch(batchId);
        assertEq(batch.currentCustodian, buyer);

        CustodyRecord[] memory history = skinTrace.getCustodyHistory(batchId);
        assertEq(history.length, 2);
    }

    function testCannotRegisterWithoutRole() public {
        vm.prank(buyer);
        vm.expectRevert();
        skinTrace.registerBatch(
            ResidueType.SEED,
            1000,
            "Hass",
            QualityState.FRESH,
            "QmTest123",
            1950,
            -10250
        );
    }
}

contract PitMarketTest is Test {
    SkinTraceContract skinTrace;
    PitMarketContract pitMarket;
    PerseaToken token;
    address producer = address(0x1);
    address buyer = address(0x2);

    function setUp() public {
        token = new PerseaToken();
        skinTrace = new SkinTraceContract();
        pitMarket = new PitMarketContract(address(skinTrace));

        skinTrace.grantRole(skinTrace.PRODUCER_ROLE(), producer);
        pitMarket.grantRole(pitMarket.VERIFIED_BUYER(), buyer);

        token.transfer(buyer, 10000 * 10**18);
    }

    function testCreateListing() public {
        vm.prank(producer);
        uint256 batchId = skinTrace.registerBatch(
            ResidueType.SEED,
            1000,
            "Hass",
            QualityState.FRESH,
            "QmTest123",
            1950,
            -10250
        );

        vm.prank(producer);
        uint256 listingId = pitMarket.createListing(batchId, 10 * 10**15, address(token));

        Listing memory listing = pitMarket.getListing(listingId);
        assertEq(listing.seller, producer);
        assertEq(listing.pricePerKg, 10 * 10**15);
        assertEq(listing.totalWeight, 1000);
    }
}

contract SeedScoreTest is Test {
    SeedScoreContract seedScore;
    PerseaToken token;
    address producer = address(0x1);
    address verifier = address(0x2);

    function setUp() public {
        token = new PerseaToken();
        seedScore = new SeedScoreContract(address(token));
        seedScore.grantRole(seedScore.VERIFIER_ROLE(), verifier);

        token.transfer(address(seedScore), 100000 * 10**18);
    }

    function testUpdateScore() public {
        vm.prank(verifier);
        seedScore.updateScore(producer, 1000, 80);

        ProducerScore memory score = seedScore.getProducerScore(producer);
        assertEq(score.totalBatches, 1);
        assertEq(score.totalWeight, 1000);
        assertEq(score.qualityScore, 80);
    }

    function testMintCarbonCredit() public {
        vm.prank(verifier);
        uint256 creditId = seedScore.mintCarbonCredit(producer, 500);

        CarbonCredit memory credit = seedScore.getCarbonCredit(creditId);
        assertEq(credit.owner, producer);
        assertEq(credit.weight, 500);
        assertEq(credit.co2Equivalent, 1000);
    }

    function testGetGreenScore() public {
        vm.prank(verifier);
        seedScore.updateScore(producer, 1000, 80);

        vm.prank(verifier);
        seedScore.recordTransaction(producer);

        vm.prank(verifier);
        seedScore.mintCarbonCredit(producer, 500);

        uint256 greenScore = seedScore.getGreenScore(producer);
        assertGt(greenScore, 0);
    }
}

contract SeedConsentTest is Test {
    SeedConsentContract seedConsent;
    address producer = address(0x1);

    function setUp() public {
        seedConsent = new SeedConsentContract();
    }

    function testGiveConsent() public {
        vm.prank(producer);
        seedConsent.giveConsent(true, true, "marketplace");

        ConsentRecord memory consent = seedConsent.getConsent(producer);
        assertTrue(consent.dataSharingAllowed);
        assertTrue(consent.aggregatedDataAllowed);
    }

    function testRevokeConsent() public {
        vm.prank(producer);
        seedConsent.giveConsent(true, true, "marketplace");

        vm.prank(producer);
        seedConsent.revokeConsent();

        ConsentRecord memory consent = seedConsent.getConsent(producer);
        assertFalse(consent.dataSharingAllowed);
    }

    function testHasConsent() public {
        vm.prank(producer);
        seedConsent.giveConsent(true, false, "analytics");

        assertTrue(seedConsent.hasConsent(producer));
        assertFalse(seedConsent.hasAggregatedConsent(producer));
    }
}
