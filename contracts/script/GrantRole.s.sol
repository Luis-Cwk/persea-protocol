// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/SkinTraceContract.sol";

contract GrantRoleScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address skinTrace = 0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41;
        address testBuyer = 0xfe05914BdFAD80734D55b91015Dd09c6dA0Ae5fB;

        vm.startBroadcast(deployerPrivateKey);

        SkinTraceContract skin = SkinTraceContract(skinTrace);
        
        // Grant PRODUCER_ROLE to test buyer
        bytes32 producerRole = skin.PRODUCER_ROLE();
        skin.grantRole(producerRole, testBuyer);
        
        console.log("PRODUCER_ROLE granted to:", testBuyer);
        
        vm.stopBroadcast();
    }
}
