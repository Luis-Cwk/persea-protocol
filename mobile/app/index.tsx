import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBatchStore } from '../store/batchStore';
import { RESIDUE_TYPES } from '../config/api';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { pendingBatches } = useBatchStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🥑 PERSÉA</Text>
        <Text style={styles.subtitle}>Del árbol al dato</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Lotes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <Text style={styles.statIcon}>⚖️</Text>
            <Text style={styles.statValue}>0 kg</Text>
            <Text style={styles.statLabel}>Peso Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <Text style={styles.statIcon}>🌱</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Green Score</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fce7f3' }]}>
            <Text style={styles.statIcon}>🌿</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Créditos CO₂</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionText}>Registrar Lote</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={styles.actionText}>Mis Lotes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🏪</Text>
              <Text style={styles.actionText}>Mercado</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Estadísticas</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pendingBatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pendientes de Sincronizar</Text>
            {pendingBatches.map((batch, index) => (
              <View key={index} style={styles.pendingCard}>
                <View style={styles.pendingHeader}>
                  <Text style={styles.pendingIcon}>
                    {RESIDUE_TYPES[batch.residueType as keyof typeof RESIDUE_TYPES]?.icon || '📦'}
                  </Text>
                  <Text style={styles.pendingType}>
                    {RESIDUE_TYPES[batch.residueType as keyof typeof RESIDUE_TYPES]?.name || batch.residueType}
                  </Text>
                </View>
                <Text style={styles.pendingWeight}>{batch.weight} kg</Text>
                <Text style={styles.pendingVariety}>{batch.variety}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Residuos</Text>
          {Object.entries(RESIDUE_TYPES).map(([key, value]) => (
            <View key={key} style={styles.residueTypeRow}>
              <Text style={styles.residueTypeIcon}>{value.icon}</Text>
              <View style={styles.residueTypeInfo}>
                <Text style={styles.residueTypeName}>{value.name}</Text>
                <Text style={styles.residueTypeDesc}>
                  {key === 'SEED' && 'Aceite, almidón, polifenoles'}
                  {key === 'PEEL' && 'Celulosa, lignina, extractos'}
                  {key === 'PULP' && 'Aceite premium, puré'}
                  {key === 'BIOMASS' && 'Biochar, aceites esenciales'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#14532d',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
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
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 56) / 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  pendingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  pendingType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pendingWeight: {
    fontSize: 14,
    color: '#6b7280',
  },
  pendingVariety: {
    fontSize: 12,
    color: '#9ca3af',
  },
  residueTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  residueTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  residueTypeInfo: {
    flex: 1,
  },
  residueTypeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  residueTypeDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
