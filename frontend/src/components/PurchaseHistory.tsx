'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES } from '@/lib/config';

const RESIDUE_TYPES = ['🟤 Semilla', '🟢 Cáscara', '🟡 Pulpa', '🌿 Biomasa'];

interface Purchase {
  listingId: number;
  batchId: number;
  residueType: number;
  weight: number;
  totalPrice: number;
  seller: string;
  status: string;
  timestamp: number;
}

export function PurchaseHistory() {
  const { address, isConnected } = useAccount();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      if (!address) return;
      setLoading(true);

      const mockPurchases: Purchase[] = [
        {
          listingId: 0,
          batchId: 0,
          residueType: 0,
          weight: 100,
          totalPrice: 1,
          seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
          status: 'Pendiente',
          timestamp: Date.now() - 86400000
        },
        {
          listingId: 1,
          batchId: 1,
          residueType: 1,
          weight: 200,
          totalPrice: 1,
          seller: '0xa98100E028ffE19Cbc1E9BF9BCF33458e064892A',
          status: 'Completado',
          timestamp: Date.now() - 172800000
        },
      ];

      setPurchases(mockPurchases);
      setLoading(false);
    }

    fetchPurchases();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">Conecta tu wallet para ver tu historial</p>
      </div>
    );
  }

  const totalPurchased = purchases.reduce((acc, p) => acc + p.weight, 0);
  const totalSpent = purchases.reduce((acc, p) => acc + p.totalPrice, 0);
  const completedCount = purchases.filter(p => p.status === 'Completado').length;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-green-800">Historial de Compras</h2>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Compras</p>
          <p className="text-2xl font-bold text-green-600">{purchases.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Peso Total</p>
          <p className="text-2xl font-bold text-green-600">{totalPurchased} kg</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500">Completadas</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : purchases.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">No tienes compras registradas</p>
          <a href="/market" className="text-green-600 hover:underline text-sm">Ir al marketplace →</a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Peso</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases.map((purchase, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{RESIDUE_TYPES[purchase.residueType]}</td>
                  <td className="px-4 py-3 text-sm">{purchase.weight} kg</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      purchase.status === 'Completado' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(purchase.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
