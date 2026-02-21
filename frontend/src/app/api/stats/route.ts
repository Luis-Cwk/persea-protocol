import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalBatches: 4,
      totalListings: 3,
      totalUsers: 2,
      totalVolume: '0',
      platformFee: '150'
    }
  });
}
