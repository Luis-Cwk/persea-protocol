'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

const RESIDUE_TYPES = [
  { id: 'SEED', label: 'Semilla/Hueso', icon: '🟤' },
  { id: 'PEEL', label: 'Cáscara', icon: '🟢' },
  { id: 'PULP', label: 'Pulpa', icon: '🟡' },
  { id: 'BIOMASS', label: 'Biomasa', icon: '🌿' },
];

const SAMPLE_LISTINGS = [
  {
    id: 1,
    type: 'SEED',
    weight: 500,
    pricePerKg: 0.005,
    variety: 'Hass',
    seller: '0x1234...5678',
  },
  {
    id: 2,
    type: 'PEEL',
    weight: 1000,
    pricePerKg: 0.002,
    variety: 'Hass',
    seller: '0xabcd...efgh',
  },
  {
    id: 3,
    type: 'PULP',
    weight: 200,
    pricePerKg: 0.008,
    variety: 'Méndez',
    seller: '0x9876...5432',
  },
];

export default function MarketPage() {
  const { isConnected } = useAccount();
  const [filter, setFilter] = useState<string>('all');

  const filteredListings = filter === 'all' 
    ? SAMPLE_LISTINGS 
    : SAMPLE_LISTINGS.filter(l => l.type === filter);

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
              onClick={() => setFilter(type.id)}
              className={`px-4 py-2 rounded-lg ${
                filter === type.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-sm text-gray-500">Lote #{listing.id}</span>
                  <h3 className="font-semibold text-lg">
                    {RESIDUE_TYPES.find(t => t.id === listing.type)?.label}
                  </h3>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Activo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Peso:</span>
                  <p className="font-medium">{listing.weight} kg</p>
                </div>
                <div>
                  <span className="text-gray-500">Precio/kg:</span>
                  <p className="font-medium">{listing.pricePerKg} MON</p>
                </div>
                <div>
                  <span className="text-gray-500">Variedad:</span>
                  <p className="font-medium">{listing.variety}</p>
                </div>
                <div>
                  <span className="text-gray-500">Vendedor:</span>
                  <p className="font-medium font-mono text-xs">{listing.seller}</p>
                </div>
              </div>

              <button 
                className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!isConnected}
              >
                {isConnected ? 'Comprar' : 'Conecta Wallet'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No hay listados disponibles</p>
          <p className="mt-2">Sé el primero en listar un lote de residuos</p>
        </div>
      )}
    </div>
  );
}
