import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatWeight(grams: number | string): string {
  const weight = typeof grams === 'string' ? parseFloat(grams) : grams;
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(2)} kg`;
  }
  return `${weight.toFixed(2)} g`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatPrice(priceWei: string | bigint): string {
  const price = typeof priceWei === 'string' ? BigInt(priceWei) : priceWei;
  const eth = Number(price) / 1e18;
  return `${eth.toFixed(4)} MON`;
}

export function getResidueColor(type: string): string {
  const colors: Record<string, string> = {
    SEED: '#8B4513',
    PEEL: '#556B2F',
    PULP: '#9ACD32',
    BIOMASS: '#228B22',
  };
  return colors[type] || '#666666';
}

export function getResidueName(type: string): string {
  const names: Record<string, string> = {
    SEED: 'Semilla/Hueso',
    PEEL: 'Cáscara',
    PULP: 'Pulpa',
    BIOMASS: 'Biomasa',
  };
  return names[type] || type;
}

export function getQualityName(quality: string): string {
  const names: Record<string, string> = {
    FRESH: 'Fresco',
    PARTIALLY_DEHYDRATED: 'Parcialmente Deshidratado',
    PROCESSED: 'Procesado',
  };
  return names[quality] || quality;
}

export function calculateGreenScore(data: {
  totalBatches: number;
  successfulTransactions: number;
  qualityScore: number;
  carbonCredits: number;
}): number {
  if (data.totalBatches === 0) return 0;

  const baseScore = (data.successfulTransactions * 100) / data.totalBatches;
  const qualityBonus = data.qualityScore * 10;
  const carbonBonus = data.carbonCredits * 5;

  return Math.min(100, baseScore + qualityBonus + carbonBonus);
}
