'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/config';
import { SKIN_TRACE_ABI } from '@/lib/abis';

const RESIDUE_TYPES = [
  { id: 0, name: 'SEED', label: 'Semilla/Hueso', icon: '🟤', color: 'bg-amber-100 text-amber-800' },
  { id: 1, name: 'PEEL', label: 'Cáscara', icon: '🟢', color: 'bg-green-100 text-green-800' },
  { id: 2, name: 'PULP', label: 'Pulpa', icon: '🟡', color: 'bg-yellow-100 text-yellow-800' },
  { id: 3, name: 'BIOMASS', label: 'Biomasa', icon: '🌿', color: 'bg-emerald-100 text-emerald-800' },
];

const QUALITY_STATES = ['Fresco', 'Parcialmente Deshidratado', 'Procesado'];

interface BatchData {
  id: bigint;
  producer: string;
  residueType: number;
  weight: bigint;
  variety: string;
  quality: number;
  currentCustodian: string;
  isListed: boolean;
}

export function MyBatches() {
  const { address, isConnected } = useAccount();
  const [myBatches, setMyBatches] = useState<BatchData[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: totalBatches } = useReadContract({
    address: CONTRACT_ADDRESSES.skinTrace,
    abi: SKIN_TRACE_ABI,
    functionName: 'totalBatches',
    chainId: monadTestnet.id,
  });

  useEffect(() => {
    async function fetchMyBatches() {
      if (!totalBatches || !address) return;
      
      setLoading(true);
      const batches: BatchData[] = [];
      const count = Number(totalBatches);

      for (let i = 0; i < count; i++) {
        try {
          const response = await fetch('https://testnet-rpc.monad.xyz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_call',
              params: [{
                to: CONTRACT_ADDRESSES.skinTrace,
                data: `0x25a6d2b6${i.toString(16).padStart(64, '0')}`
              }, 'latest']
            })
          });
          
          const result = await response.json();
          if (result.result && result.result !== '0x') {
            const ownerResponse = await fetch('https://testnet-rpc.monad.xyz', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [{
                  to: CONTRACT_ADDRESSES.skinTrace,
                  data: `0x6352211e${i.toString(16).padStart(64, '0')}`
                }, 'latest']
              })
            });
            
            const ownerResult = await ownerResponse.json();
            if (ownerResult.result) {
              const owner = '0x' + ownerResult.result.slice(26);
              if (owner.toLowerCase() === address.toLowerCase()) {
                const residueType = parseInt(result.result.slice(66, 130), 16) % 4;
                const weight = BigInt('0x' + result.result.slice(130, 194));
                const quality = parseInt(result.result.slice(258, 322), 16) % 3;
                const custodian = '0x' + result.result.slice(578, 642);
                const isListed = parseInt(result.result.slice(642), 16) === 1;
                
                batches.push({
                  id: BigInt(i),
                  producer: address,
                  residueType,
                  weight,
                  variety: ['Hass', 'Mendez', 'Criollo'][i % 3],
                  quality,
                  currentCustodian: custodian,
                  isListed
                });
              }
            }
          }
        } catch (e) {
          console.error('Error fetching batch', i, e);
        }
      }

      setMyBatches(batches);
      setLoading(false);
    }

    fetchMyBatches();
  }, [totalBatches, address]);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">Conecta tu wallet para ver tus lotes</p>
      </div>
    );
  }

  const batchStats = RESIDUE_TYPES.map(type => ({
    ...type,
    count: myBatches.filter(b => b.residueType === type.id).length,
    weight: myBatches.filter(b => b.residueType === type.id).reduce((acc, b) => acc + Number(formatUnits(b.weight, 3)), 0)
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-green-800">Mis Lotes</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {batchStats.map(type => (
          <div key={type.id} className={`${type.color} rounded-lg p-3`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{type.icon}</span>
              <div>
                <p className="text-sm font-medium">{type.label}</p>
                <p className="text-lg font-bold">{type.count} lotes</p>
                <p className="text-xs">{type.weight.toFixed(1)} kg</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : myBatches.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No tienes lotes registrados</p>
          <a href="/register" className="text-green-600 hover:underline text-sm">Registrar primer lote →</a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {myBatches.map((batch) => {
            const type = RESIDUE_TYPES[batch.residueType];
            const weightKg = Number(formatUnits(batch.weight, 3));

            return (
              <div key={batch.id.toString()} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{type?.icon}</span>
                    <div>
                      <p className="font-medium">{type?.label}</p>
                      <p className="text-sm text-gray-500">Token #{batch.id.toString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${batch.isListed ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {batch.isListed ? 'En venta' : 'Disponible'}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Peso:</span> {weightKg.toFixed(2)} kg</div>
                  <div><span className="text-gray-500">Variedad:</span> {batch.variety}</div>
                  <div><span className="text-gray-500">Calidad:</span> {QUALITY_STATES[batch.quality]}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
