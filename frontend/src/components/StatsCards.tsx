'use client';

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Green Score</p>
            <p className="text-3xl font-bold text-green-600">0</p>
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
            <p className="text-3xl font-bold text-green-600">0</p>
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
            <p className="text-3xl font-bold text-green-600">0 kg</p>
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
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <span className="text-2xl">🌿</span>
          </div>
        </div>
      </div>
    </div>
  );
}
