'use client';

import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/config';
import { SEED_SCORE_ABI } from '@/lib/abis';

export function StatsCards() {
  const { address, isConnected } = useAccount();

  const { data: greenScore } = useReadContract({
    address: CONTRACT_ADDRESSES.seedScore,
    abi: SEED_SCORE_ABI,
    functionName: 'getGreenScore',
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!address && isConnected },
  });

  const { data: producerScore } = useReadContract({
    address: CONTRACT_ADDRESSES.seedScore,
    abi: SEED_SCORE_ABI,
    functionName: 'getProducerScore',
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!address && isConnected },
  });

  const totalBatches = producerScore ? Number(producerScore[0]) : 0;
  const totalWeight = producerScore ? Number(formatUnits(producerScore[1], 3)) : 0;
  const carbonCredits = producerScore ? Number(producerScore[3]) : 0;
  const score = greenScore ? Number(greenScore) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Green Score</p>
            <p className="text-3xl font-bold text-green-600">{score}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <span className="text-2xl">🌱</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Lotes</p>
            <p className="text-3xl font-bold text-green-600">{totalBatches}</p>
          </div>
          <div className="p-3 bg-amber-100 rounded-full">
            <span className="text-2xl">📦</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Peso Total</p>
            <p className="text-3xl font-bold text-green-600">{totalWeight.toFixed(1)} kg</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <span className="text-2xl">⚖️</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Créditos Carbono</p>
            <p className="text-3xl font-bold text-green-600">{carbonCredits}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <span className="text-2xl">🌿</span>
          </div>
        </div>
      </div>
    </div>
  );
}
