'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/config';
import { PIT_MARKET_ABI } from '@/lib/abis';

const PERSEA_TOKEN_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const RESIDUE_TYPES = [
  { id: 0, name: 'SEED', label: 'Semilla/Hueso', icon: '🟤' },
  { id: 1, name: 'PEEL', label: 'Cáscara', icon: '🟢' },
  { id: 2, name: 'PULP', label: 'Pulpa', icon: '🟡' },
  { id: 3, name: 'BIOMASS', label: 'Biomasa', icon: '🌿' },
];

const STATIC_LISTINGS = [
  { listingId: 0, batchId: 0, seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', pricePerKg: '10000000000000000', availableWeight: '500000', active: true, residueType: 0, variety: 'Hass' },
  { listingId: 1, batchId: 1, seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', pricePerKg: '5000000000000000', availableWeight: '800000', active: true, residueType: 1, variety: 'Hass' },
  { listingId: 2, batchId: 2, seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A', pricePerKg: '8000000000000000', availableWeight: '300000', active: true, residueType: 2, variety: 'Mendez' },
];

export default function MarketPage() {
  const { isConnected, address } = useAccount();
  const [filter, setFilter] = useState<string>('all');
  const [buyWeight, setBuyWeight] = useState<string>('100');

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.perseaToken,
    abi: PERSEA_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.perseaToken,
    abi: PERSEA_TOKEN_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.pitMarket] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (isSuccess) {
      refetchBalance?.();
      refetchAllowance?.();
    }
  }, [isSuccess, refetchBalance, refetchAllowance]);

  const handleApprove = async () => {
    const maxAmount = parseUnits('1000000', 18);
    writeContract({
      address: CONTRACT_ADDRESSES.perseaToken,
      abi: PERSEA_TOKEN_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.pitMarket, maxAmount],
      chainId: monadTestnet.id,
    });
  };

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
    ? STATIC_LISTINGS.filter(l => l.active)
    : STATIC_LISTINGS.filter(l => l.active && RESIDUE_TYPES.find(t => t.name === filter)?.id === l.residueType);

  const hasAllowance = allowance && allowance > 0n;
  const balanceFormatted = balance ? formatUnits(balance, 18) : '0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">Mercado de Residuos</h1>
        <div className="flex space-x-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Todos</button>
          {RESIDUE_TYPES.map((type) => (
            <button key={type.id} onClick={() => setFilter(type.name)} className={`px-4 py-2 rounded-lg ${filter === type.name ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {isConnected && address && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Tu balance PERSEA:</p>
              <p className="text-xl font-bold text-green-600">{parseFloat(balanceFormatted).toFixed(2)} PERSEA</p>
            </div>
            {!hasAllowance ? (
              <button onClick={handleApprove} disabled={isPending} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                {isPending ? 'Aprobando...' : 'Aprobar PERSEA'}
              </button>
            ) : (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">PERSEA aprobado</span>
            )}
          </div>
          {!hasAllowance && (
            <p className="text-xs text-orange-600 mt-2">Debes aprobar PERSEA antes de comprar</p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => {
          const residueType = RESIDUE_TYPES[listing.residueType];
          const pricePerKgMon = formatUnits(BigInt(listing.pricePerKg), 18);
          const totalWeightKg = Number(formatUnits(BigInt(listing.availableWeight), 3));
          const totalPrice = parseFloat(pricePerKgMon) * parseFloat(buyWeight);

          return (
            <div key={listing.listingId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Listing #{listing.listingId}</span>
                    <h3 className="font-semibold text-lg">{residueType?.icon} {residueType?.label}</h3>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Activo</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Disponible:</span><p className="font-medium">{totalWeightKg.toFixed(2)} kg</p></div>
                  <div><span className="text-gray-500">Precio/kg:</span><p className="font-medium">{parseFloat(pricePerKgMon).toFixed(6)} PERSEA</p></div>
                  <div><span className="text-gray-500">Variedad:</span><p className="font-medium">{listing.variety}</p></div>
                  <div><span className="text-gray-500">Vendedor:</span><p className="font-medium font-mono text-xs">{listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}</p></div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <input type="number" value={buyWeight} onChange={(e) => setBuyWeight(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Peso (kg)" min="1" max={totalWeightKg.toString()} />
                    <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm">kg</span>
                  </div>
                  <p className="text-xs text-gray-500">Total: {totalPrice.toFixed(4)} PERSEA</p>

                  <button onClick={() => handleBuy(listing.listingId, buyWeight)} disabled={!isConnected || isPending || isConfirming || !hasAllowance} className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isPending || isConfirming ? 'Procesando...' : isConnected ? hasAllowance ? `Comprar ${buyWeight} kg` : 'Aprueba PERSEA primero' : 'Conecta Wallet'}
                  </button>
                </div>

                {listing.seller.toLowerCase() === address?.toLowerCase() && (
                  <p className="mt-2 text-xs text-blue-600 text-center">Este es tu listing</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No hay listados disponibles</p>
        </div>
      )}

      {hash && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
          <p className="text-sm font-medium">{isConfirming ? 'Confirmando...' : isSuccess ? 'Transaccion exitosa!' : 'Enviada'}</p>
          <a href={`https://testnet.monadscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Ver en explorer</a>
        </div>
      )}
    </div>
  );
}
