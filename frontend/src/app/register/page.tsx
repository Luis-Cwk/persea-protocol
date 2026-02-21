'use client';

import { RegisterBatchForm } from '@/components/RegisterBatchForm';

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-green-800 mb-6">
        Registrar Nuevo Lote
      </h1>
      <RegisterBatchForm />
    </div>
  );
}
