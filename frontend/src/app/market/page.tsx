'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/config';
import { PIT_MARKET_ABI, SKIN_TRACE_ABI } from '@/lib/abis';

const RESIDUE_TYPES = [
  { id: 0, name: 'SEED', label: 'Semilla/Hueso', icon: '🟤' },
  { id: 1, name: 'PEEL', label: 'Cáscara', icon: '🟢' },
  { id: 2, name: 'PULP', label: 'Pulpa', icon: '🟡' },
  { id: 3, name: 'BIOMASS', label: 'Biomasa', icon: '🌿' },
];

interface Listing {
  batchId: bigint;
  seller: string;
  pricePerKg: bigint;
  totalWeight: bigint;
  availableWeight: bigint;
  paymentToken: string;
  active: boolean;
  createdAt: bigint;
}

interface Batch {
  id: bigint;
  producer: string;
  residueType: number;
  weight: bigint;
  variety: string;
  quality: number;
  currentCustodian: string;
  isListed: boolean;
}

export default function MarketPage() {
  const { isConnected, address } = useAccount();
  const [filter, setFilter] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [buyWeight, setBuyWeight] = useState<string>('100');
  const [listings, setListings] = useState<(Listing & { batch?: Batch })[]>([]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: listingCounter } = useReadContract({
    address: CONTRACT_ADDRESSES.pitMarket,
    abi: PIT_MARKET_ABI,
    functionName: 'listingCounter',
    chainId: monadTestnet.id,
  });

  useEffect(() => {
    if (isSuccess) {
      setSelectedListing(null);
      setBuyWeight('100');
    }
  }, [isSuccess]);

  useEffect(() => {
    async function fetchListings() {
      if (!listingCounter) return;
      const count = Number(listingCounter);
      const fetchedListings: (Listing & { batch?: Batch })[] = [];

      for (let i = 0; i < count; i++) {
        try {
          const response = await fetch(`/api/listings`);
          const data = await response.json();
          if (data.success && data.data[i]) {
            fetchedListings.push(data.data[i] as Listing & { batch?: Batch });
          }
        } catch (e) {
          console.error('Error fetching listing', i, e);
        }
      }
      setListings(fetchedListings);
    }
    fetchListings();
  }, [listingCounter, isSuccess]);

  const handleBuy = (listingId: number, weightKg: string) => {
    const weightInGrams = parseUnits(weightKg, 3);
    writeContract({
      address: CONTRACT_ADDRESSES.pitMarket,
      abi: PIT_MARKET_ABI,
      functionName: 'makeOffer',
      args: [BigInt(listingId), weightInGrams],
      chainId: monadTestnet.id,
    });
  };

  const filteredListings = filter === 'all'
    ? listings.filter(l => l.active)
    : listings.filter(l => l.active && RESIDUE_TYPES.find(t => t.name === filter)?.id === l.batch?.residueType);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">
          Mercado de Residuos
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Todos
          </button>
          {RESIDUE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilter(type.name)}
              className={`px-4 py-2 rounded-lg ${
                filter === type.name
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {listingCounter && (
        <p className="text-sm text-gray-500">
          Total listings: {listingCounter.toString()}
        </p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing, index) => {
          const residueType = RESIDUE_TYPES[listing.batch?.residueType ?? 0];
          const pricePerKgMon = listing.pricePerKg ? formatUnits(listing.pricePerKg, 18) : '0';
          const totalWeightKg = listing.availableWeight ? Number(formatUnits(listing.availableWeight, 3)) : 0;

          return (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Listing #{index}</span>
                    <h3 className="font-semibold text-lg">
                      {residueType?.icon} {residueType?.label}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    listing.active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {listing.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Disponible:</span>
                    <p className="font-medium">{totalWeightKg.toFixed(2)} kg</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Precio/kg:</span>
                    <p className="font-medium">{parseFloat(pricePerKgMon).toFixed(6)} MON</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Variedad:</span>
                    <p className="font-medium">{listing.batch?.variety || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Vendedor:</span>
                    <p className="font-medium font-mono text-xs">
                      {listing.seller?.slice(0, 6)}...{listing.seller?.slice(-4)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={buyWeight}
                      onChange={(e) => setBuyWeight(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      placeholder="Peso (kg)"
                      min="1"
                      max={totalWeightKg.toString()}
                    />
                    <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                      kg
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleBuy(index, buyWeight)}
                    disabled={!isConnected || isPending || isConfirming || !listing.active}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isPending || isConfirming 
                      ? 'Procesando...' 
                      : isConnected 
                        ? `Comprar ${buyWeight} kg` 
                        : 'Conecta Wallet'}
                  </button>
                </div>

                {listing.seller?.toLowerCase() === address?.toLowerCase() && (
                  <p className="mt-2 text-xs text-blue-600 text-center">
                    Este es tu listing
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No hay listados disponibles</p>
          <p className="mt-2">Sé el primero en listar un lote de residuos</p>
        </div>
      )}

      {hash && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
          <p className="text-sm font-medium">
            {isConfirming ? 'Confirmando transacción...' : isSuccess ? 'Transacción exitosa!' : 'Transacción enviada'}
          </p>
          <a 
            href={`https://testnet.monadscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Ver en explorer
          </a>
        </div>
      )}
    </div>
  );
}
