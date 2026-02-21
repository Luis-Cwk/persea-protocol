'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { StatsCards } from '@/components/StatsCards';

export default function HomePage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-4">
          🥑 PERSÉA Protocol
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Trazabilidad y Aprovechamiento de Residuos del Aguacate en Blockchain
        </p>
        <p className="text-lg text-green-700 font-medium">
          Del árbol al dato — trazado en cadena.
        </p>
      </section>

      {isConnected && address && (
        <section>
          <h2 className="text-2xl font-bold text-green-800 mb-4">Tu Dashboard</h2>
          <StatsCards />
        </section>
      )}

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/register"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-green-800 group-hover:text-green-600">
            Registrar Lote
          </h3>
          <p className="text-gray-600 mt-2">
            Registra un nuevo lote de residuos de aguacate
          </p>
        </Link>

        <Link
          href="/market"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="text-4xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-green-800 group-hover:text-green-600">
            Mercado
          </h3>
          <p className="text-gray-600 mt-2">
            Compra y vende residuos de aguacate
          </p>
        </Link>

        <Link
          href="/dashboard"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-green-800 group-hover:text-green-600">
            Dashboard
          </h3>
          <p className="text-gray-600 mt-2">
            Visualiza tus estadísticas y Green Score
          </p>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-xl font-semibold text-green-800">
            Datos
          </h3>
          <p className="text-gray-600 mt-2">
            Explora datos agregados del protocolo
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          Tipos de Residuos
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border-l-4 border-amber-700 pl-4">
            <h3 className="font-semibold text-amber-700">🟤 Semilla/Hueso</h3>
            <p className="text-sm text-gray-600 mt-1">
              340,000 ton/año. Aceite, almidón, polifenoles para cosmética y bioplásticos.
            </p>
          </div>
          <div className="border-l-4 border-green-700 pl-4">
            <h3 className="font-semibold text-green-700">🟢 Cáscara</h3>
            <p className="text-sm text-gray-600 mt-1">
              270,000 ton/año. Celulosa, lignina, extractos fenólicos para compost y colorantes.
            </p>
          </div>
          <div className="border-l-4 border-lime-600 pl-4">
            <h3 className="font-semibold text-lime-700">🟡 Pulpa Descartada</h3>
            <p className="text-sm text-gray-600 mt-1">
              140,000 ton/año. Aceite premium, puré, biodigestores.
            </p>
          </div>
          <div className="border-l-4 border-green-800 pl-4">
            <h3 className="font-semibold text-green-800">🌿 Biomasa de Poda</h3>
            <p className="text-sm text-gray-600 mt-1">
              120,000 ton/año. Aceites esenciales, biocarbón, mulching.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-green-900 text-white rounded-lg p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Construido sobre Monad Blockchain
          </h2>
          <p className="text-green-100 mb-6">
            EVM-compatible. Bajas comisiones. Finalidad rápida. 
            Bridge cross-chain hacia Ethereum y Polygon para compradores internacionales.
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <div>
              <p className="text-3xl font-bold">870K</p>
              <p className="text-green-300">ton/año residuos</p>
            </div>
            <div>
              <p className="text-3xl font-bold">$320M</p>
              <p className="text-green-300">valor potencial</p>
            </div>
            <div>
              <p className="text-3xl font-bold">4,200</p>
              <p className="text-green-300">productores</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
