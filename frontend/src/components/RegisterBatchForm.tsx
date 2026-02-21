'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/config';
import { SKIN_TRACE_ABI } from '@/lib/abis';

const RESIDUE_TYPES = [
  { id: 0, label: 'Semilla/Hueso', icon: '🟤' },
  { id: 1, label: 'Cáscara', icon: '🟢' },
  { id: 2, label: 'Pulpa', icon: '🟡' },
  { id: 3, label: 'Biomasa', icon: '🌿' },
];

const QUALITY_STATES = [
  { id: 0, label: 'Fresco' },
  { id: 1, label: 'Parcialmente Deshidratado' },
  { id: 2, label: 'Procesado' },
];

export function RegisterBatchForm() {
  const { isConnected, address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [formData, setFormData] = useState({
    residueType: 0,
    weight: '',
    variety: 'Hass',
    quality: 0,
    latitude: '0',
    longitude: '0',
    ipfsHash: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      alert('Ingresa un peso válido');
      return;
    }

    const weightInGrams = parseUnits(formData.weight, 3);
    const lat = parseUnits(formData.latitude || '0', 6);
    const lon = parseUnits(formData.longitude || '0', 6);

    writeContract({
      address: CONTRACT_ADDRESSES.skinTrace,
      abi: SKIN_TRACE_ABI,
      functionName: 'registerBatch',
      args: [
        formData.residueType,
        weightInGrams,
        formData.variety,
        formData.quality,
        formData.ipfsHash || `ipfs://batch-${Date.now()}`,
        lat,
        lon,
      ],
      chainId: monadTestnet.id,
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">Conecta tu wallet para registrar un lote</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-green-800">Registrar Nuevo Lote</h2>
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-green-800 text-sm">
          Wallet conectada: <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
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
              onClick={() => setFormData({ ...formData, residueType: type.id })}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.residueType === type.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <span className="block text-lg">{type.icon}</span>
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Peso (kg)
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: 500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variedad
          </label>
          <select
            value={formData.variety}
            onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="Hass">Hass</option>
            <option value="Mendez">Méndez</option>
            <option value="Criollo">Criollo</option>
            <option value="Fuerte">Fuerte</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado de Calidad
        </label>
        <div className="grid grid-cols-3 gap-2">
          {QUALITY_STATES.map((quality) => (
            <button
              key={quality.id}
              type="button"
              onClick={() => setFormData({ ...formData, quality: quality.id })}
              className={`p-2 rounded-lg border-2 transition-all text-sm ${
                formData.quality === quality.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              {quality.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Latitud (opcional)
          </label>
          <input
            type="text"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Ej: 19.4326"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longitud (opcional)
          </label>
          <input
            type="text"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Ej: -99.1332"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          IPFS Hash (opcional)
        </label>
        <input
          type="text"
          value={formData.ipfsHash}
          onChange={(e) => setFormData({ ...formData, ipfsHash: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="ipfs://Qm..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPending || isConfirming ? 'Registrando...' : 'Registrar Lote'}
      </button>

      {hash && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">
            {isConfirming ? '⏳ Confirmando transacción...' : isSuccess ? '✅ Lote registrado exitosamente!' : '📝 Transacción enviada'}
          </p>
          <a
            href={`https://testnet.monadscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Ver en explorer: {hash.slice(0, 10)}...{hash.slice(-8)}
          </a>
        </div>
      )}

      {isSuccess && (
        <button
          type="button"
          onClick={() => {
            setFormData({
              residueType: 0,
              weight: '',
              variety: 'Hass',
              quality: 0,
              latitude: '0',
              longitude: '0',
              ipfsHash: '',
            });
          }}
          className="w-full py-2 px-4 rounded-lg font-semibold text-green-600 border border-green-600 hover:bg-green-50"
        >
          Registrar otro lote
        </button>
      )}
    </form>
  );
}
