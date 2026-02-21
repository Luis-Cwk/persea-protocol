// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/PerseaToken.sol";
import "../src/SkinTraceContract.sol";
import "../src/PitMarketContract.sol";
import "../src/SeedScoreContract.sol";
import "../src/SeedConsentContract.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy PERSEA Token
        PerseaToken token = new PerseaToken();
        console.log("PerseaToken deployed at:", address(token));

        // 2. Deploy SkinTraceContract
        SkinTraceContract skinTrace = new SkinTraceContract();
        console.log("SkinTraceContract deployed at:", address(skinTrace));

        // 3. Deploy PitMarketContract
        PitMarketContract pitMarket = new PitMarketContract(address(skinTrace));
        console.log("PitMarketContract deployed at:", address(pitMarket));

        // 4. Set authorized marketplace in SkinTrace
        skinTrace.setAuthorizedMarketplace(address(pitMarket));
        console.log("Authorized marketplace set to PitMarketContract");

        // 5. Deploy SeedScoreContract
        SeedScoreContract seedScore = new SeedScoreContract(address(token));
        console.log("SeedScoreContract deployed at:", address(seedScore));

        // 6. Deploy SeedConsentContract
        SeedConsentContract seedConsent = new SeedConsentContract();
        console.log("SeedConsentContract deployed at:", address(seedConsent));

        // 7. Grant VERIFIED_BUYER role to deployer for testing
        pitMarket.grantRole(pitMarket.VERIFIED_BUYER(), msg.sender);
        console.log("Deployer granted VERIFIED_BUYER role");

        vm.stopBroadcast();

        // Print summary
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("PerseaToken:", address(token));
        console.log("SkinTraceContract:", address(skinTrace));
        console.log("PitMarketContract:", address(pitMarket));
        console.log("SeedScoreContract:", address(seedScore));
        console.log("SeedConsentContract:", address(seedConsent));
    }
}
