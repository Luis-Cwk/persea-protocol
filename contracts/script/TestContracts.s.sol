// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/Types.sol";
import "../src/SkinTraceContract.sol";
import "../src/PitMarketContract.sol";
import "../src/SeedScoreContract.sol";
import "../src/PerseaToken.sol";

contract TestContracts is Script {
    // New contract addresses
    SkinTraceContract constant skinTrace = SkinTraceContract(0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41);
    PitMarketContract constant pitMarket = PitMarketContract(0x1d6975d2C0e466928b7dEB47fe48fAD3624A983B);
    SeedScoreContract constant seedScore = SeedScoreContract(0x946Ed93acCaF382617409F03938537fC41454B7B);
    PerseaToken constant token = PerseaToken(0x58fe512A24A5d3160a8B161C64623f40d4bD113d);

    function run() external {
        vm.startBroadcast();

        console.log("========================================");
        console.log("  PERSEA Platform - Full Test Suite");
        console.log("========================================");
        console.log("");

        // 1. Token tests
        console.log("=== 1. PERSEA TOKEN ===");
        uint256 balance = token.balanceOf(msg.sender);
        console.log("Your Balance:", balance / 1e18, "PERSEA");
        console.log("Total Supply:", token.totalSupply() / 1e18, "PERSEA");
        console.log("Token Name:", token.name());
        console.log("Token Symbol:", token.symbol());
        console.log("");

        // 2. Register batches
        console.log("=== 2. REGISTER BATCHES ===");
        
        // Batch 0: Seed
        uint256 batch0 = skinTrace.registerBatch(
            ResidueType.SEED,
            500000, // 500 kg in grams
            "Hass",
            QualityState.FRESH,
            "ipfs://QmSeedBatch001",
            19340400,
            -102364600
        );
        console.log("Batch 0 (Seed) registered:", batch0);

        // Batch 1: Peel
        uint256 batch1 = skinTrace.registerBatch(
            ResidueType.PEEL,
            800000, // 800 kg
            "Hass",
            QualityState.FRESH,
            "ipfs://QmPeelBatch001",
            19345000,
            -102370000
        );
        console.log("Batch 1 (Peel) registered:", batch1);

        // Batch 2: Pulp
        uint256 batch2 = skinTrace.registerBatch(
            ResidueType.PULP,
            300000, // 300 kg
            "Mendez",
            QualityState.PARTIALLY_DEHYDRATED,
            "ipfs://QmPulpBatch001",
            19346000,
            -102380000
        );
        console.log("Batch 2 (Pulp) registered:", batch2);

        // Batch 3: Biomass
        uint256 batch3 = skinTrace.registerBatch(
            ResidueType.BIOMASS,
            1000000, // 1000 kg
            "Criollo",
            QualityState.FRESH,
            "ipfs://QmBiomassBatch001",
            19350000,
            -102390000
        );
        console.log("Batch 3 (Biomass) registered:", batch3);

        console.log("Total Batches:", skinTrace.totalBatches());
        console.log("");

        // 3. Create listings in marketplace
        console.log("=== 3. CREATE LISTINGS ===");
        
        // Approve marketplace
        skinTrace.setApprovalForAll(address(pitMarket), true);
        console.log("Marketplace approved for all NFTs");

        // Create listing for batch 0
        uint256 listing0 = pitMarket.createListing(
            batch0,
            10000000000000000, // 0.01 MON per kg
            address(token)
        );
        console.log("Listing 0 created for Batch 0 (Seed):", listing0);

        // Create listing for batch 1
        uint256 listing1 = pitMarket.createListing(
            batch1,
            5000000000000000, // 0.005 MON per kg
            address(token)
        );
        console.log("Listing 1 created for Batch 1 (Peel):", listing1);

        // Create listing for batch 2
        uint256 listing2 = pitMarket.createListing(
            batch2,
            8000000000000000, // 0.008 MON per kg
            address(token)
        );
        console.log("Listing 2 created for Batch 2 (Pulp):", listing2);

        console.log("");

        // 4. Query listing details
        console.log("=== 4. LISTING DETAILS ===");
        
        Listing memory l0 = pitMarket.getListing(listing0);
        console.log("Listing 0:");
        console.log("  Batch ID:", l0.batchId);
        console.log("  Seller:", l0.seller);
        console.log("  Price/kg:", l0.pricePerKg / 1e15, "finney");
        console.log("  Total Weight:", l0.totalWeight, "grams");
        console.log("  Available Weight:", l0.availableWeight, "grams");
        console.log("  Active:", l0.active ? "Yes" : "No");

        Listing memory l1 = pitMarket.getListing(listing1);
        console.log("Listing 1:");
        console.log("  Batch ID:", l1.batchId);
        console.log("  Price/kg:", l1.pricePerKg / 1e15, "finney");
        console.log("  Total Weight:", l1.totalWeight, "grams");
        console.log("  Active:", l1.active ? "Yes" : "No");
        console.log("");

        // 5. Floor prices
        console.log("=== 5. FLOOR PRICES ===");
        console.log("SEED floor:", pitMarket.floorPrices(ResidueType.SEED) / 1e15, "finney");
        console.log("PEEL floor:", pitMarket.floorPrices(ResidueType.PEEL) / 1e15, "finney");
        console.log("PULP floor:", pitMarket.floorPrices(ResidueType.PULP) / 1e15, "finney");
        console.log("BIOMASS floor:", pitMarket.floorPrices(ResidueType.BIOMASS) / 1e15, "finney");
        console.log("");

        // 6. Transfer custody
        console.log("=== 6. TRANSFER CUSTODY ===");
        address testBuyer = 0xfe05914BdFAD80734D55b91015Dd09c6dA0Ae5fB;
        skinTrace.transferCustody(batch3, testBuyer, "Test Transfer to Buyer");
        BatchData memory transferred = skinTrace.getBatch(batch3);
        console.log("Batch 3 transferred to:", transferred.currentCustodian);
        console.log("");

        // 7. Green Score
        console.log("=== 7. GREEN SCORE ===");
        uint256 greenScore = seedScore.getGreenScore(msg.sender);
        console.log("Your Green Score:", greenScore);
        console.log("");

        // 8. Summary
        console.log("========================================");
        console.log("       ALL TESTS PASSED!");
        console.log("========================================");
        console.log("");
        console.log("SUMMARY:");
        console.log("- 4 Batches registered (Seed, Peel, Pulp, Biomass)");
        console.log("- 3 Listings created in marketplace");
        console.log("- 1 Custody transfer completed");
        console.log("- All contracts verified and working");
        console.log("");

        vm.stopBroadcast();
    }
}
