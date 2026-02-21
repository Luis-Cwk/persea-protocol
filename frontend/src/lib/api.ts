import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('persea_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface Batch {
  id: string;
  tokenId: number;
  producerId: string;
  residueType: string;
  weight: string;
  variety: string;
  quality: string;
  ipfsHash: string;
  latitude: string;
  longitude: string;
  currentCustodian: string;
  isListed: boolean;
  txHash: string;
  createdAt: string;
  producer?: {
    id: string;
    address: string;
    name: string;
  };
}

export interface Listing {
  id: string;
  listingId: number;
  batchId: string;
  sellerId: string;
  pricePerKg: string;
  availableWeight: string;
  paymentToken: string;
  active: boolean;
  txHash: string;
  createdAt: string;
  batch?: Batch;
  seller?: {
    id: string;
    address: string;
    name: string;
  };
}

export interface User {
  id: string;
  address: string;
  email?: string;
  name?: string;
  role: string;
  userScores?: {
    totalBatches: number;
    totalWeight: string;
    greenScore: number;
  };
}

export async function registerUser(data: {
  address: string;
  email?: string;
  name?: string;
  signature: string;
  message: string;
}) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

export async function loginUser(data: {
  address: string;
  signature: string;
  message: string;
}) {
  const response = await api.post('/auth/login', data);
  return response.data;
}

export async function getBatches(params?: {
  residueType?: string;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data: Batch[] }> {
  const response = await api.get('/batches', { params });
  return response.data;
}

export async function getBatch(tokenId: number): Promise<{ success: boolean; data: Batch }> {
  const response = await api.get(`/batches/${tokenId}`);
  return response.data;
}

export async function registerBatch(formData: FormData): Promise<{ success: boolean; data: any }> {
  const response = await api.post('/batches/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function getListings(params?: {
  residueType?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data: Listing[] }> {
  const response = await api.get('/market', { params });
  return response.data;
}

export async function getListing(listingId: number): Promise<{ success: boolean; data: Listing }> {
  const response = await api.get(`/market/${listingId}`);
  return response.data;
}

export async function createListing(data: {
  batchId: number;
  pricePerKg: string;
  paymentToken: string;
}): Promise<{ success: boolean; data: { listingId: number; txHash: string } }> {
  const response = await api.post('/market', data);
  return response.data;
}

export async function makeOffer(data: {
  listingId: number;
  weight: number;
}): Promise<{ success: boolean; data: { txHash: string } }> {
  const response = await api.post('/market/offer', data);
  return response.data;
}

export async function getUserProfile(address?: string): Promise<{ success: boolean; data: User }> {
  const response = await api.get(`/users/profile/${address || ''}`);
  return response.data;
}

export async function getGreenScore(address: string): Promise<{
  success: boolean;
  data: { greenScore: number };
}> {
  const response = await api.get(`/users/${address}/green-score`);
  return response.data;
}

export async function getAggregatedData(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{ success: boolean; data: any }> {
  const response = await api.get('/data/aggregated', { params });
  return response.data;
}

export async function getMarketPrices(): Promise<{ success: boolean; data: any }> {
  const response = await api.get('/data/prices');
  return response.data;
}
