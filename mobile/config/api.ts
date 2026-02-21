export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const CONTRACT_ADDRESSES = {
  skinTrace: process.env.EXPO_PUBLIC_SKIN_TRACE_ADDRESS,
  pitMarket: process.env.EXPO_PUBLIC_PIT_MARKET_ADDRESS,
  seedScore: process.env.EXPO_PUBLIC_SEED_SCORE_ADDRESS,
  perseaToken: process.env.EXPO_PUBLIC_PERSEA_TOKEN_ADDRESS,
};

export const RESIDUE_TYPES = {
  SEED: { name: 'Semilla/Hueso', icon: '🟤' },
  PEEL: { name: 'Cáscara', icon: '🟢' },
  PULP: { name: 'Pulpa', icon: '🟡' },
  BIOMASS: { name: 'Biomasa', icon: '🌿' },
};

export const QUALITY_STATES = {
  FRESH: 'Fresco',
  PARTIALLY_DEHYDRATED: 'Parcialmente Deshidratado',
  PROCESSED: 'Procesado',
};
