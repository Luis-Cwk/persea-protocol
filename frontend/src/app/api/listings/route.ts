import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PIT_MARKET_ADDRESS = '0x1d6975d2C0e466928b7dEB47fe48fAD3624A983B';
const MONAD_RPC = 'https://testnet-rpc.monad.xyz';

export async function GET() {
  try {
    const listings = [
      {
        listingId: 0,
        batchId: 0,
        seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        pricePerKg: '10000000000000000',
        totalWeight: '500000',
        availableWeight: '500000',
        active: true,
        batch: { id: 0, residueType: 0, variety: 'Hass' }
      },
      {
        listingId: 1,
        batchId: 1,
        seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        pricePerKg: '5000000000000000',
        totalWeight: '800000',
        availableWeight: '800000',
        active: true,
        batch: { id: 1, residueType: 1, variety: 'Hass' }
      },
      {
        listingId: 2,
        batchId: 2,
        seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
        pricePerKg: '8000000000000000',
        totalWeight: '300000',
        availableWeight: '300000',
        active: true,
        batch: { id: 2, residueType: 2, variety: 'Mendez' }
      }
    ];

    return NextResponse.json({ success: true, data: listings });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}
