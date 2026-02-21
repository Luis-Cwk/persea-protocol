import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { useBatchStore } from '../store/batchStore';
import { API_URL } from '../config/api';

const RESIDUE_TYPES = [
  { id: 'SEED', label: 'Semilla/Hueso', icon: '🟤', color: '#8B4513' },
  { id: 'PEEL', label: 'Cáscara', icon: '🟢', color: '#556B2F' },
  { id: 'PULP', label: 'Pulpa', icon: '🟡', color: '#9ACD32' },
  { id: 'BIOMASS', label: 'Biomasa', icon: '🌿', color: '#228B22' },
];

const VARIETIES = ['Hass', 'Méndez', 'Criollo', 'Fuerte'];

export default function RegisterScreen() {
  const router = useRouter();
  const { pendingBatches, addPendingBatch, removePendingBatch } = useBatchStore();
  
  const [step, setStep] = useState(1);
  const [residueType, setResidueType] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [variety, setVariety] = useState('Hass');
  const [quality, setQuality] = useState('FRESH');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  const handleTakePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar fotos');
      return;
    }
    router.push('/camera');
  };

  const handleSubmit = async () => {
    if (!residueType || !weight || !location) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      const batchData = {
        residueType,
        weight: parseFloat(weight),
        variety,
        quality,
        latitude: location.latitude,
        longitude: location.longitude,
        photo,
        timestamp: Date.now(),
      };

      addPendingBatch(batchData);
      Alert.alert('Éxito', 'Lote guardado localmente. Se sincronizará cuando tengas conexión.');
      
      setStep(1);
      setResidueType(null);
      setWeight('');
      setPhoto(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el lote');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registrar Lote</Text>
        <Text style={styles.subtitle}>Paso {step} de 4</Text>
      </View>

      <ScrollView style={styles.content}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Tipo de Residuo</Text>
            <View style={styles.grid}>
              {RESIDUE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    residueType === type.id && { borderColor: type.color, borderWidth: 3 },
                  ]}
                  onPress={() => {
                    setResidueType(type.id);
                    setStep(2);
                  }}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Peso y Variedad</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="Ej: 150.5"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Variedad</Text>
              <View style={styles.varietyButtons}>
                {VARIETIES.map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={[styles.varietyBtn, variety === v && styles.varietyBtnActive]}
                    onPress={() => setVariety(v)}
                  >
                    <Text style={[styles.varietyText, variety === v && styles.varietyTextActive]}>
                      {v}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => setStep(3)}
            >
              <Text style={styles.nextBtnText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Foto de Evidencia</Text>
            
            <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
              <Text style={styles.photoBtnIcon}>📷</Text>
              <Text style={styles.photoBtnText}>Tomar Foto</Text>
            </TouchableOpacity>

            {photo && (
              <View style={styles.photoPreview}>
                <Text style={styles.photoSuccess}>✓ Foto capturada</Text>
              </View>
            )}

            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>📍 Ubicación</Text>
              {location ? (
                <Text style={styles.locationText}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              ) : (
                <Text style={styles.locationText}>Obteniendo ubicación...</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => setStep(4)}
            >
              <Text style={styles.nextBtnText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Confirmar Registro</Text>
            
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tipo:</Text>
                <Text style={styles.summaryValue}>{residueType}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Peso:</Text>
                <Text style={styles.summaryValue}>{weight} kg</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Variedad:</Text>
                <Text style={styles.summaryValue}>{variety}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ubicación:</Text>
                <Text style={styles.summaryValue}>
                  {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Registrando...' : 'Registrar Lote'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {pendingBatches.length > 0 && (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingText}>
            {pendingBatches.length} lote(s) pendiente(s) de sincronizar
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#14532d',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#86efac',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#14532d',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dcfce7',
  },
  typeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#14532d',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  varietyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  varietyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  varietyBtnActive: {
    backgroundColor: '#22c55e',
  },
  varietyText: {
    fontSize: 14,
    color: '#374151',
  },
  varietyTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  photoBtn: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderStyle: 'dashed',
  },
  photoBtnIcon: {
    fontSize: 40,
  },
  photoBtnText: {
    fontSize: 16,
    color: '#16a34a',
    marginTop: 8,
  },
  photoPreview: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  photoSuccess: {
    color: '#16a34a',
    fontWeight: '500',
  },
  locationInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  nextBtn: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  submitBtn: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#14532d',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pendingBanner: {
    backgroundColor: '#fbbf24',
    padding: 12,
    alignItems: 'center',
  },
  pendingText: {
    color: '#78350f',
    fontWeight: '500',
  },
});
