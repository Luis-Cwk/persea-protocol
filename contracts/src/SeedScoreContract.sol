// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Types.sol";

struct ProducerScore {
    uint256 totalBatches;
    uint256 totalWeight;
    uint256 successfulTransactions;
    uint256 carbonCreditsEarned;
    uint256 lastUpdated;
    uint256 qualityScore;
}

struct CarbonCredit {
    uint256 id;
    address owner;
    uint256 weight;
    uint256 co2Equivalent;
    uint256 mintedAt;
    bool claimed;
}

contract SeedScoreContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    mapping(address => ProducerScore) public producerScores;

    mapping(uint256 => CarbonCredit) public carbonCredits;
    uint256 public carbonCreditCounter;

    mapping(address => uint256[]) public producerCarbonCredits;

    uint256 public constant CO2_PER_KG_BIOMASS = 2;
    uint256 public constant QUALITY_MULTIPLIER = 10;

    IERC20 public rewardToken;
    uint256 public rewardPerCredit = 10 * 10**18;

    event ScoreUpdated(
        address indexed producer,
        uint256 totalBatches,
        uint256 qualityScore
    );

    event CarbonCreditMinted(
        uint256 indexed creditId,
        address indexed owner,
        uint256 weight,
        uint256 co2Equivalent
    );

    event CarbonCreditClaimed(
        uint256 indexed creditId,
        address indexed owner,
        uint256 reward
    );

    constructor(address _rewardToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        rewardToken = IERC20(_rewardToken);
    }

    function updateScore(
        address _producer,
        uint256 _batchWeight,
        uint256 _qualityRating
    ) external onlyRole(VERIFIER_ROLE) {
        ProducerScore storage score = producerScores[_producer];

        score.totalBatches++;
        score.totalWeight += _batchWeight;
        score.qualityScore = (score.qualityScore * (score.totalBatches - 1) + _qualityRating) / score.totalBatches;
        score.lastUpdated = block.timestamp;

        emit ScoreUpdated(_producer, score.totalBatches, score.qualityScore);
    }

    function recordTransaction(address _producer) external onlyRole(VERIFIER_ROLE) {
        producerScores[_producer].successfulTransactions++;
    }

    function mintCarbonCredit(
        address _owner,
        uint256 _weight
    ) external onlyRole(VERIFIER_ROLE) returns (uint256) {
        uint256 co2Equivalent = _weight * CO2_PER_KG_BIOMASS;

        uint256 creditId = carbonCreditCounter;
        carbonCreditCounter++;

        carbonCredits[creditId] = CarbonCredit({
            id: creditId,
            owner: _owner,
            weight: _weight,
            co2Equivalent: co2Equivalent,
            mintedAt: block.timestamp,
            claimed: false
        });

        producerCarbonCredits[_owner].push(creditId);
        producerScores[_owner].carbonCreditsEarned++;

        emit CarbonCreditMinted(creditId, _owner, _weight, co2Equivalent);

        return creditId;
    }

    function claimCarbonCredit(uint256 _creditId) external {
        CarbonCredit storage credit = carbonCredits[_creditId];

        require(credit.owner == msg.sender, "Not credit owner");
        require(!credit.claimed, "Already claimed");

        credit.claimed = true;

        uint256 reward = rewardPerCredit * credit.co2Equivalent / 1000;
        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");

        emit CarbonCreditClaimed(_creditId, msg.sender, reward);
    }

    function getProducerScore(address _producer) external view returns (ProducerScore memory) {
        return producerScores[_producer];
    }

    function getProducerCarbonCredits(address _producer) external view returns (uint256[] memory) {
        return producerCarbonCredits[_producer];
    }

    function getCarbonCredit(uint256 _creditId) external view returns (CarbonCredit memory) {
        return carbonCredits[_creditId];
    }

    function getGreenScore(address _producer) external view returns (uint256) {
        ProducerScore memory score = producerScores[_producer];

        if (score.totalBatches == 0) return 0;

        uint256 baseScore = (score.successfulTransactions * 100) / score.totalBatches;
        uint256 qualityBonus = score.qualityScore * QUALITY_MULTIPLIER;
        uint256 carbonBonus = score.carbonCreditsEarned * 5;

        return baseScore + qualityBonus + carbonBonus;
    }

    function setRewardPerCredit(uint256 _reward) external onlyRole(ADMIN_ROLE) {
        rewardPerCredit = _reward;
    }

    function setRewardToken(address _token) external onlyRole(ADMIN_ROLE) {
        rewardToken = IERC20(_token);
    }
}
