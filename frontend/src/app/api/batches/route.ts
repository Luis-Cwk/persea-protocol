import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { SKIN_TRACE_ABI } from '@/lib/abis';
import { monadTestnet } from '@/lib/config';

const client = createPublicClient({
  chain: monadTestnet,
  transport: http('https://testnet-rpc.monad.xyz'),
});

const SKIN_TRACE_ADDRESS = '0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41' as `0x${string}`;

export async function GET() {
  try {
    const totalBatches = await client.readContract({
      address: SKIN_TRACE_ADDRESS,
      abi: SKIN_TRACE_ABI,
      functionName: 'totalBatches',
    }) as bigint;

    const batches = [];
    
    for (let i = 0; i < Number(totalBatches); i++) {
      try {
        const batchData = await client.readContract({
          address: SKIN_TRACE_ADDRESS,
          abi: SKIN_TRACE_ABI,
          functionName: 'getBatch',
          args: [BigInt(i)],
        }) as [bigint, `0x${string}`, number, bigint, string, number, string, bigint, bigint, bigint, `0x${string}`, boolean];

        batches.push({
          tokenId: Number(batchData[0]),
          producer: batchData[1],
          residueType: batchData[2],
          weight: batchData[3].toString(),
          variety: batchData[4],
          quality: batchData[5],
          ipfsHash: batchData[6],
          latitude: batchData[7].toString(),
          longitude: batchData[8].toString(),
          timestamp: Number(batchData[9]),
          currentCustodian: batchData[10],
          isListed: batchData[11],
        });
      } catch (e) {
        console.error('Error fetching batch', i, e);
      }
    }

    return NextResponse.json({ success: true, data: batches });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}
