import { createPublicClient, createWalletClient, http, parseAbi, formatUnits } from 'viem';
import { monadTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const RPC_URL = process.env.RPC_URL || 'https://testnet-rpc.monad.xyz';
const CHAIN_ID = Number(process.env.CHAIN_ID) || 10143;

const SKIN_TRACE_ADDRESS = process.env.SKIN_TRACE_ADDRESS as `0x${string}`;
const PIT_MARKET_ADDRESS = process.env.PIT_MARKET_ADDRESS as `0x${string}`;
const SEED_SCORE_ADDRESS = process.env.SEED_SCORE_ADDRESS as `0x${string}`;
const SEED_CONSENT_ADDRESS = process.env.SEED_CONSENT_ADDRESS as `0x${string}`;
const PERSEA_TOKEN_ADDRESS = process.env.PERSEA_TOKEN_ADDRESS as `0x${string}`;

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(RPC_URL),
});

export function getWalletClient(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(RPC_URL),
  });
}

export const SKIN_TRACE_ABI = parseAbi([
  'function registerBatch(uint8 residueType, uint256 weight, string variety, uint8 quality, string ipfsHash, int256 latitude, int256 longitude) external returns (uint256)',
  'function transferCustody(uint256 batchId, address newCustodian, string location) external',
  'function getBatch(uint256 batchId) external view returns (tuple(uint256 id, address producer, uint8 residueType, uint256 weight, string variety, uint8 quality, string ipfsHash, int256 latitude, int256 longitude, uint256 timestamp, address currentCustodian, bool isListed))',
  'function getCustodyHistory(uint256 batchId) external view returns (tuple(address from, address to, uint256 timestamp, string location)[])',
  'function totalBatches() external view returns (uint256)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'event BatchRegistered(uint256 indexed batchId, address indexed producer, uint8 residueType, uint256 weight, string ipfsHash)',
  'event CustodyTransferred(uint256 indexed batchId, address indexed from, address indexed to, uint256 timestamp)',
]);

export const PIT_MARKET_ABI = parseAbi([
  'function createListing(uint256 batchId, uint256 pricePerKg, address paymentToken) external returns (uint256)',
  'function makeOffer(uint256 listingId, uint256 weight) external returns (uint256)',
  'function acceptOffer(uint256 listingId, uint256 offerIndex) external',
  'function confirmDelivery(uint256 listingId, uint256 offerIndex, bytes32 deliveryProof, int256 latitude, int256 longitude) external',
  'function getListing(uint256 listingId) external view returns (tuple(uint256 batchId, address seller, uint256 pricePerKg, uint256 totalWeight, uint256 availableWeight, address paymentToken, bool active, uint256 createdAt))',
  'function getOffers(uint256 listingId) external view returns (tuple(uint256 listingId, address buyer, uint256 weight, uint256 totalPrice, uint256 createdAt, bool accepted, bool completed)[])',
  'event ListingCreated(uint256 indexed listingId, uint256 indexed batchId, address indexed seller, uint256 pricePerKg, uint256 totalWeight)',
  'event OfferMade(uint256 indexed listingId, address indexed buyer, uint256 weight, uint256 totalPrice)',
  'event DeliveryConfirmed(uint256 indexed transactionId, bytes32 deliveryProof)',
]);

export const SEED_SCORE_ABI = parseAbi([
  'function updateScore(address producer, uint256 batchWeight, uint256 qualityRating) external',
  'function mintCarbonCredit(address owner, uint256 weight) external returns (uint256)',
  'function getProducerScore(address producer) external view returns (tuple(uint256 totalBatches, uint256 totalWeight, uint256 successfulTransactions, uint256 carbonCreditsEarned, uint256 lastUpdated, uint256 qualityScore))',
  'function getGreenScore(address producer) external view returns (uint256)',
  'function claimCarbonCredit(uint256 creditId) external',
  'event CarbonCreditMinted(uint256 indexed creditId, address indexed owner, uint256 weight, uint256 co2Equivalent)',
]);

export const SEED_CONSENT_ABI = parseAbi([
  'function giveConsent(bool dataSharingAllowed, bool aggregatedDataAllowed, string purpose) external',
  'function revokeConsent() external',
  'function hasConsent(address producer) external view returns (bool)',
  'function getConsent(address producer) external view returns (tuple(address producer, bool dataSharingAllowed, bool aggregatedDataAllowed, uint256 timestamp, string purpose))',
]);

export const PERSEA_TOKEN_ABI = parseAbi([
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function mint(address to, uint256 amount) external',
  'function totalSupply() external view returns (uint256)',
]);

export const contracts = {
  skinTrace: {
    address: SKIN_TRACE_ADDRESS,
    abi: SKIN_TRACE_ABI,
  },
  pitMarket: {
    address: PIT_MARKET_ADDRESS,
    abi: PIT_MARKET_ABI,
  },
  seedScore: {
    address: SEED_SCORE_ADDRESS,
    abi: SEED_SCORE_ABI,
  },
  seedConsent: {
    address: SEED_CONSENT_ADDRESS,
    abi: SEED_CONSENT_ABI,
  },
  perseaToken: {
    address: PERSEA_TOKEN_ADDRESS,
    abi: PERSEA_TOKEN_ABI,
  },
};

export async function getBatchFromChain(batchId: bigint) {
  return publicClient.readContract({
    address: SKIN_TRACE_ADDRESS,
    abi: SKIN_TRACE_ABI,
    functionName: 'getBatch',
    args: [batchId],
  });
}

export async function getListingFromChain(listingId: bigint) {
  return publicClient.readContract({
    address: PIT_MARKET_ADDRESS,
    abi: PIT_MARKET_ABI,
    functionName: 'getListing',
    args: [listingId],
  });
}

export async function getProducerScoreFromChain(producer: `0x${string}`) {
  return publicClient.readContract({
    address: SEED_SCORE_ADDRESS,
    abi: SEED_SCORE_ABI,
    functionName: 'getProducerScore',
    args: [producer],
  });
}

export async function getGreenScoreFromChain(producer: `0x${string}`) {
  return publicClient.readContract({
    address: SEED_SCORE_ADDRESS,
    abi: SEED_SCORE_ABI,
    functionName: 'getGreenScore',
    args: [producer],
  });
}
