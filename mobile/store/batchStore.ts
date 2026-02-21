import { create } from 'zustand';
import { AsyncStorage } from 'react-native';

interface PendingBatch {
  residueType: string;
  weight: number;
  variety: string;
  quality: string;
  latitude: number;
  longitude: number;
  photo?: string;
  timestamp: number;
}

interface BatchState {
  pendingBatches: PendingBatch[];
  addPendingBatch: (batch: PendingBatch) => void;
  removePendingBatch: (index: number) => void;
  syncBatches: () => Promise<void>;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  pendingBatches: [],

  addPendingBatch: (batch) => {
    set((state) => ({
      pendingBatches: [...state.pendingBatches, batch],
    }));
  },

  removePendingBatch: (index) => {
    set((state) => ({
      pendingBatches: state.pendingBatches.filter((_, i) => i !== index),
    }));
  },

  syncBatches: async () => {
    const { pendingBatches, removePendingBatch } = get();
    
    for (let i = 0; i < pendingBatches.length; i++) {
      const batch = pendingBatches[i];
      try {
        const response = await fetch('http://localhost:3000/batches/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            residueType: batch.residueType,
            weight: batch.weight,
            variety: batch.variety,
            quality: batch.quality,
            latitude: batch.latitude,
            longitude: batch.longitude,
          }),
        });

        if (response.ok) {
          removePendingBatch(i);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  },
}));
