// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/PitMarketContract.sol";
import "../src/PerseaToken.sol";

contract SetupBuyerScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address pitMarket = 0x1d6975d2C0e466928b7dEB47fe48fAD3624A983B;
        address perseaToken = 0x58fe512A24A5d3160a8B161C64623f40d4bD113d;
        address testBuyer = 0xfe05914BdFAD80734D55b91015Dd09c6dA0Ae5fB;

        vm.startBroadcast(deployerPrivateKey);

        PitMarketContract market = PitMarketContract(pitMarket);
        PerseaToken token = PerseaToken(perseaToken);
        
        // Grant VERIFIED_BUYER role
        bytes32 buyerRole = market.VERIFIED_BUYER();
        market.grantRole(buyerRole, testBuyer);
        console.log("VERIFIED_BUYER role granted to:", testBuyer);
        
        // Also grant PRODUCER role in SkinTrace
        SkinTraceContract skin = SkinTraceContract(0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41);
        bytes32 producerRole = skin.PRODUCER_ROLE();
        skin.grantRole(producerRole, testBuyer);
        console.log("PRODUCER_ROLE granted to:", testBuyer);
        
        // Transfer some PERSEA tokens to buyer for testing (1000 tokens)
        token.transfer(testBuyer, 1000 * 10**18);
        console.log("Transferred 1000 PERSEA tokens to buyer");
        
        vm.stopBroadcast();
    }
}

interface SkinTraceContract {
    function PRODUCER_ROLE() external view returns (bytes32);
    function grantRole(bytes32 role, address account) external;
}
