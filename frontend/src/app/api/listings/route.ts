import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { PIT_MARKET_ABI, SKIN_TRACE_ABI } from '@/lib/abis';
import { monadTestnet } from '@/lib/config';

const client = createPublicClient({
  chain: monadTestnet,
  transport: http('https://testnet-rpc.monad.xyz'),
});

const CONTRACTS = {
  pitMarket: '0x1d6975d2C0e466928b7dEB47fe48fAD3624A983B' as `0x${string}`,
  skinTrace: '0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41' as `0x${string}`,
};

export async function GET() {
  try {
    const listingCounter = await client.readContract({
      address: CONTRACTS.pitMarket,
      abi: PIT_MARKET_ABI,
      functionName: 'listingCounter',
    }) as bigint;

    const listings = [];
    
    for (let i = 0; i < Number(listingCounter); i++) {
      try {
        const listingData = await client.readContract({
          address: CONTRACTS.pitMarket,
          abi: PIT_MARKET_ABI,
          functionName: 'getListing',
          args: [BigInt(i)],
        }) as [bigint, `0x${string}`, bigint, bigint, bigint, `0x${string}`, boolean, bigint];

        let batch = null;
        try {
          const batchData = await client.readContract({
            address: CONTRACTS.skinTrace,
            abi: SKIN_TRACE_ABI,
            functionName: 'getBatch',
            args: [listingData[0]],
          }) as [bigint, `0x${string}`, number, bigint, string, number, string, bigint, bigint, bigint, `0x${string}`, boolean];

          batch = {
            id: batchData[0],
            producer: batchData[1],
            residueType: batchData[2],
            weight: batchData[3],
            variety: batchData[4],
            quality: batchData[5],
            currentCustodian: batchData[10],
            isListed: batchData[11],
          };
        } catch (e) {
          console.error('Error fetching batch', listingData[0].toString(), e);
        }

        listings.push({
          listingId: i,
          batchId: Number(listingData[0]),
          seller: listingData[1],
          pricePerKg: listingData[2].toString(),
          totalWeight: listingData[3].toString(),
          availableWeight: listingData[4].toString(),
          paymentToken: listingData[5],
          active: listingData[6],
          createdAt: Number(listingData[7]),
          batch,
        });
      } catch (e) {
        console.error('Error fetching listing', i, e);
      }
    }

    return NextResponse.json({ success: true, data: listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
