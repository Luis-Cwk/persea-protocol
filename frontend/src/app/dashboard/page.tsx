'use client';

import { useAccount } from 'wagmi';
import { StatsCards } from '@/components/StatsCards';
import { MyBatches } from '@/components/MyBatches';
import { PurchaseHistory } from '@/components/PurchaseHistory';
import Link from 'next/link';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-green-800 mb-4">
          Conecta tu Wallet
        </h1>
        <p className="text-gray-600">
          Necesitas conectar tu wallet para ver tu dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>
        <p className="text-sm text-gray-500 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
      </div>

      <StatsCards />

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-green-800 mb-4">Acciones Rapidas</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/register"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <span className="text-2xl mr-3">📦</span>
            <div>
              <p className="font-medium">Registrar Lote</p>
              <p className="text-sm text-gray-500">Nuevo lote de residuos</p>
            </div>
          </Link>
          <Link
            href="/market"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <span className="text-2xl mr-3">🏪</span>
            <div>
              <p className="font-medium">Ir al Mercado</p>
              <p className="text-sm text-gray-500">Comprar o vender</p>
            </div>
          </Link>
          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <p className="font-medium">Ver Datos</p>
              <p className="text-sm text-gray-500">Estadisticas agregadas</p>
            </div>
          </div>
        </div>
      </div>

      <MyBatches />

      <PurchaseHistory />
    </div>
  );
}
