import { NextResponse } from 'next/server';

const BATCHES = [
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
];

export async function GET() {
  return NextResponse.json({ success: true, data: BATCHES });
}
