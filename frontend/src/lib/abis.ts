export const SKIN_TRACE_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { name: '_residueType', type: 'uint8' },
      { name: '_weight', type: 'uint256' },
      { name: '_variety', type: 'string' },
      { name: '_quality', type: 'uint8' },
      { name: '_ipfsHash', type: 'string' },
      { name: '_latitude', type: 'int256' },
      { name: '_longitude', type: 'int256' },
    ],
    name: 'registerBatch',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_batchId', type: 'uint256' }],
    name: 'getBatch',
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'producer', type: 'address' },
      { name: 'residueType', type: 'uint8' },
      { name: 'weight', type: 'uint256' },
      { name: 'variety', type: 'string' },
      { name: 'quality', type: 'uint8' },
      { name: 'ipfsHash', type: 'string' },
      { name: 'latitude', type: 'int256' },
      { name: 'longitude', type: 'int256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'currentCustodian', type: 'address' },
      { name: 'isListed', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalBatches',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_batchId', type: 'uint256' },
      { name: '_isListed', type: 'bool' },
    ],
    name: 'setListedStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const PIT_MARKET_ABI = [
  {
    inputs: [{ name: '_skinTraceContract', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { name: '_batchId', type: 'uint256' },
      { name: '_pricePerKg', type: 'uint256' },
      { name: '_paymentToken', type: 'address' },
    ],
    name: 'createListing',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_listingId', type: 'uint256' },
      { name: '_weight', type: 'uint256' },
    ],
    name: 'makeOffer',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_listingId', type: 'uint256' }],
    name: 'getListing',
    outputs: [
      { name: 'batchId', type: 'uint256' },
      { name: 'seller', type: 'address' },
      { name: 'pricePerKg', type: 'uint256' },
      { name: 'totalWeight', type: 'uint256' },
      { name: 'availableWeight', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'active', type: 'bool' },
      { name: 'createdAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint8' }],
    name: 'floorPrices',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'listingCounter',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const SEED_SCORE_ABI = [
  {
    inputs: [{ name: '_producer', type: 'address' }],
    name: 'getProducerScore',
    outputs: [
      { name: 'totalBatches', type: 'uint256' },
      { name: 'totalWeight', type: 'uint256' },
      { name: 'successfulTransactions', type: 'uint256' },
      { name: 'carbonCreditsEarned', type: 'uint256' },
      { name: 'lastUpdated', type: 'uint256' },
      { name: 'qualityScore', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_producer', type: 'address' }],
    name: 'getGreenScore',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const PERSEA_TOKEN_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
