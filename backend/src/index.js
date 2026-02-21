require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Contract addresses
const CONTRACTS = {
  skinTrace: process.env.SKIN_TRACE_ADDRESS || '0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41',
  pitMarket: process.env.PIT_MARKET_ADDRESS || '0x1d6975d2C0e466928b7dEB47fe48fAD3624A983B',
  seedScore: process.env.SEED_SCORE_ADDRESS || '0x946Ed93acCaF382617409F03938537fC41454B7B',
  perseaToken: process.env.PERSEA_TOKEN_ADDRESS || '0x58fe512A24A5d3160a8B161C64623f40d4bD113d',
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    chain: 'Monad Testnet',
    chainId: 10143
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'PERSÉA Platform API',
    version: '1.0.0',
    description: 'Trazabilidad y Aprovechamiento de Residuos del Aguacate en Blockchain',
    contracts: CONTRACTS,
    endpoints: {
      health: '/health',
      batches: '/api/batches',
      listings: '/api/listings',
      users: '/api/users',
    }
  });
});

// Get contract addresses
app.get('/api/contracts', (req, res) => {
  res.json({ success: true, data: CONTRACTS });
});

// Batches endpoints
app.get('/api/batches', (req, res) => {
  // Mock data for demo - in production would query blockchain
  res.json({
    success: true,
    data: [
      {
        tokenId: 0,
        residueType: 'SEED',
        weight: '500000',
        variety: 'Hass',
        quality: 'FRESH',
        producer: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        isListed: true,
        ipfsHash: 'ipfs://QmSeedBatch001'
      },
      {
        tokenId: 1,
        residueType: 'PEEL',
        weight: '800000',
        variety: 'Hass',
        quality: 'FRESH',
        producer: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        isListed: true,
        ipfsHash: 'ipfs://QmPeelBatch001'
      },
      {
        tokenId: 2,
        residueType: 'PULP',
        weight: '300000',
        variety: 'Mendez',
        quality: 'PARTIALLY_DEHYDRATED',
        producer: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        isListed: true,
        ipfsHash: 'ipfs://QmPulpBatch001'
      },
      {
        tokenId: 3,
        residueType: 'BIOMASS',
        weight: '1000000',
        variety: 'Criollo',
        quality: 'FRESH',
        producer: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        currentCustodian: '0xfe05914BdFAD80734D55b91015Dd09c6dA0Ae5fB',
        isListed: false,
        ipfsHash: 'ipfs://QmBiomassBatch001'
      }
    ]
  });
});

app.get('/api/batches/:tokenId', (req, res) => {
  const { tokenId } = req.params;
  const batches = {
    0: { tokenId: 0, residueType: 'SEED', weight: '500000', variety: 'Hass', quality: 'FRESH', producer: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', isListed: true },
    1: { tokenId: 1, residueType: 'PEEL', weight: '800000', variety: 'Hass', quality: 'FRESH', producer: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', isListed: true },
    2: { tokenId: 2, residueType: 'PULP', weight: '300000', variety: 'Mendez', quality: 'PARTIALLY_DEHYDRATED', producer: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', isListed: true },
    3: { tokenId: 3, residueType: 'BIOMASS', weight: '1000000', variety: 'Criollo', quality: 'FRESH', producer: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', currentCustodian: '0xfe05914BdFAD80734D55b91015Dd09c6dA0Ae5fB', isListed: false }
  };

  const batch = batches[tokenId];
  if (!batch) {
    return res.status(404).json({ success: false, error: 'Batch not found' });
  }
  res.json({ success: true, data: batch });
});

// Listings endpoints
app.get('/api/listings', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        listingId: 0,
        batchId: 0,
        residueType: 'SEED',
        seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        pricePerKg: '10000000000000000',
        totalWeight: '500000',
        availableWeight: '500000',
        active: true
      },
      {
        listingId: 1,
        batchId: 1,
        residueType: 'PEEL',
        seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        pricePerKg: '5000000000000000',
        totalWeight: '800000',
        availableWeight: '800000',
        active: true
      },
      {
        listingId: 2,
        batchId: 2,
        residueType: 'PULP',
        seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        pricePerKg: '8000000000000000',
        totalWeight: '300000',
        availableWeight: '300000',
        active: true
      }
    ]
  });
});

app.get('/api/listings/:listingId', (req, res) => {
  const { listingId } = req.params;
  const listings = {
    0: { listingId: 0, batchId: 0, residueType: 'SEED', seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', pricePerKg: '10000000000000000', totalWeight: '500000', active: true },
    1: { listingId: 1, batchId: 1, residueType: 'PEEL', seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', pricePerKg: '5000000000000000', totalWeight: '800000', active: true },
    2: { listingId: 2, batchId: 2, residueType: 'PULP', seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', pricePerKg: '8000000000000000', totalWeight: '300000', active: true }
  };

  const listing = listings[listingId];
  if (!listing) {
    return res.status(404).json({ success: false, error: 'Listing not found' });
  }
  res.json({ success: true, data: listing });
});

// Floor prices
app.get('/api/floor-prices', (req, res) => {
  res.json({
    success: true,
    data: {
      SEED: '5000000000000000',
      PEEL: '1000000000000000',
      PULP: '3000000000000000',
      BIOMASS: '0'
    }
  });
});

// User endpoints
app.get('/api/users/:address', (req, res) => {
  const { address } = req.params;
  res.json({
    success: true,
    data: {
      address: address.toLowerCase(),
      greenScore: 0,
      totalBatches: 0,
      totalWeight: '0'
    }
  });
});

app.get('/api/users/:address/green-score', (req, res) => {
  const { address } = req.params;
  res.json({
    success: true,
    data: {
      address: address.toLowerCase(),
      greenScore: 0
    }
  });
});

// Platform stats
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalBatches: 4,
      totalListings: 3,
      totalUsers: 2,
      totalVolume: '0',
      platformFee: '150'
    }
  });
});

// Residue types info
app.get('/api/residue-types', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 0, name: 'SEED', label: 'Semilla/Hueso', icon: '🟤', color: '#8B4513', description: '340,000 ton/año - Aceite, almidón, polifenoles' },
      { id: 1, name: 'PEEL', label: 'Cáscara', icon: '🟢', color: '#556B2F', description: '270,000 ton/año - Celulosa, lignina, extractos' },
      { id: 2, name: 'PULP', label: 'Pulpa', icon: '🟡', color: '#9ACD32', description: '140,000 ton/año - Aceite premium, puré' },
      { id: 3, name: 'BIOMASS', label: 'Biomasa', icon: '🌿', color: '#228B22', description: '120,000 ton/año - Biochar, aceites esenciales' }
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🥑 PERSÉA API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
