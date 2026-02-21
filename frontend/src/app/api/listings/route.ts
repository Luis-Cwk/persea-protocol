import { NextResponse } from 'next/server';

const LISTINGS = [
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
];

export async function GET() {
  return NextResponse.json({ success: true, data: LISTINGS });
}
