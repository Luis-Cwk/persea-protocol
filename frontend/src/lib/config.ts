import { http, createConfig } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MonadScan',
      url: 'https://testnet.monadscan.com',
    },
  },
  testnet: true,
});

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id';

export const config = getDefaultConfig({
  appName: 'PERSEA Platform',
  projectId,
  chains: [monadTestnet],
  ssr: true,
});

export { monadTestnet };

export const CONTRACT_ADDRESSES = {
  skinTrace: '0x1Deed2c283b950439E1AfE726AEb7Ee257E6aa41' as `0x${string}`,
  pitMarket: '0x1d6975d2C0e466928b7dEB47fe48fAD3624A983B' as `0x${string}`,
  seedScore: '0x946Ed93acCaF382617409F03938537fC41454B7B' as `0x${string}`,
  perseaToken: '0x58fe512A24A5d3160a8B161C64623f40d4bD113d' as `0x${string}`,
} as const;

export const RESIDUE_TYPES = {
  0: 'Semilla/Hueso',
  1: 'Cáscara',
  2: 'Pulpa',
  3: 'Biomasa',
} as const;

export const QUALITY_STATES = {
  0: 'Fresco',
  1: 'Parcialmente Deshidratado',
  2: 'Procesado',
} as const;
