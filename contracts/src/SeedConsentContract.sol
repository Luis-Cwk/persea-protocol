// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./Types.sol";

struct ConsentRecord {
    address producer;
    bool dataSharingAllowed;
    bool aggregatedDataAllowed;
    uint256 timestamp;
    string purpose;
}

contract SeedConsentContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(address => ConsentRecord) public consents;
    mapping(address => mapping(string => bool)) public purposeConsents;

    address[] public registeredProducers;

    event ConsentGiven(
        address indexed producer,
        bool dataSharing,
        bool aggregatedData,
        string purpose
    );

    event ConsentRevoked(address indexed producer);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function giveConsent(
        bool _dataSharingAllowed,
        bool _aggregatedDataAllowed,
        string calldata _purpose
    ) external {
        if (consents[msg.sender].timestamp == 0) {
            registeredProducers.push(msg.sender);
        }

        consents[msg.sender] = ConsentRecord({
            producer: msg.sender,
            dataSharingAllowed: _dataSharingAllowed,
            aggregatedDataAllowed: _aggregatedDataAllowed,
            timestamp: block.timestamp,
            purpose: _purpose
        });

        purposeConsents[msg.sender][_purpose] = true;

        emit ConsentGiven(msg.sender, _dataSharingAllowed, _aggregatedDataAllowed, _purpose);
    }

    function revokeConsent() external {
        require(consents[msg.sender].timestamp > 0, "No consent to revoke");

        consents[msg.sender].dataSharingAllowed = false;
        consents[msg.sender].aggregatedDataAllowed = false;

        emit ConsentRevoked(msg.sender);
    }

    function revokePurposeConsent(string calldata _purpose) external {
        purposeConsents[msg.sender][_purpose] = false;
    }

    function hasConsent(address _producer) external view returns (bool) {
        return consents[_producer].dataSharingAllowed;
    }

    function hasAggregatedConsent(address _producer) external view returns (bool) {
        return consents[_producer].aggregatedDataAllowed;
    }

    function hasPurposeConsent(address _producer, string calldata _purpose) external view returns (bool) {
        return purposeConsents[_producer][_purpose];
    }

    function getConsent(address _producer) external view returns (ConsentRecord memory) {
        return consents[_producer];
    }

    function getRegisteredProducers() external view returns (address[] memory) {
        return registeredProducers;
    }

    function getProducersWithConsent() external view returns (address[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < registeredProducers.length; i++) {
            if (consents[registeredProducers[i]].dataSharingAllowed) {
                count++;
            }
        }

        address[] memory result = new address[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < registeredProducers.length; i++) {
            if (consents[registeredProducers[i]].dataSharingAllowed) {
                result[index] = registeredProducers[i];
                index++;
            }
        }

        return result;
    }
}
