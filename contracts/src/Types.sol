// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

enum ResidueType {
    SEED,
    PEEL,
    PULP,
    BIOMASS
}

enum QualityState {
    FRESH,
    PARTIALLY_DEHYDRATED,
    PROCESSED
}

struct BatchData {
    uint256 id;
    address producer;
    ResidueType residueType;
    uint256 weight;
    string variety;
    QualityState quality;
    string ipfsHash;
    int256 latitude;
    int256 longitude;
    uint256 timestamp;
    address currentCustodian;
    bool isListed;
}

struct CustodyRecord {
    address from;
    address to;
    uint256 timestamp;
    string location;
}
