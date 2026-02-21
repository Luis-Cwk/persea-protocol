'use client';

import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/config';

const RESIDUE_TYPES = [
  { id: 0, label: 'Semilla/Hueso', icon: '🟤' },
  { id: 1, label: 'Cáscara', icon: '🟢' },
  { id: 2, label: 'Pulpa', icon: '🟡' },
  { id: 3, label: 'Biomasa', icon: '🌿' },
];

export function RegisterBatchForm() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">Conecta tu wallet para registrar un lote</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-green-800">Registrar Nuevo Lote</h2>
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-green-800">
          🎉 <strong>Contratos desplegados en Monad Testnet</strong>
        </p>
        <p className="text-sm text-green-600 mt-2">
          SkinTraceContract: {CONTRACT_ADDRESSES.skinTrace}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Residuo
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {RESIDUE_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              className="p-3 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all"
            >
              <span className="block text-lg">{type.icon}</span>
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800 text-sm">
          ℹ️ El registro de lotes requiere interactuar con el smart contract. 
          Próximamente estará disponible la funcionalidad completa de registro.
        </p>
      </div>

      <button
        disabled
        className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gray-400 cursor-not-allowed"
      >
        Próximamente: Registrar Lote
      </button>
    </div>
  );
}
