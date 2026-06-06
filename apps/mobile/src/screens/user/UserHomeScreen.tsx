import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../store/useAuth';
import { Package, MapPin, Clock, Plus, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';

export default function UserHomeScreen({ navigation }: { navigation: any }) {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = getSocket();
    const handleOrderUpdated = () => {
      fetchData();
    };
    
    socket.on('order_updated', handleOrderUpdated);
    
    return () => {
      socket.off('order_updated', handleOrderUpdated);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const activeOrder = orders.find(o => ['PENDING', 'ACCEPTED', 'PICKED_UP'].includes(o.status));
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A00" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Merhaba, {user?.firstName} 👋</Text>
            <Text style={styles.subtitle}>Paketin nerede merak mı ediyorsun?</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Package color="#FF7A00" size={24} />
            <Text style={styles.statValue}>{activeOrder ? 1 : 0}</Text>
            <Text style={styles.statLabel}>Aktif</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle2 color="#4CAF50" size={24} />
            <Text style={styles.statValue}>{deliveredCount}</Text>
            <Text style={styles.statLabel}>Teslim</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.ctaCard} onPress={() => navigation.navigate('CreateOrder')}>
          <View style={styles.ctaInfo}>
            <Text style={styles.ctaTitle}>Hemen Kurye Çağır</Text>
            <Text style={styles.ctaSubtitle}>En yakın kurye kapına gelsin.</Text>
          </View>
          <View style={styles.plusCircle}>
            <Plus color="white" size={28} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Sipariş Takibi</Text>
        {loading ? (
          <ActivityIndicator color="#FF7A00" style={{ marginTop: 20 }} />
        ) : activeOrder ? (
          <TouchableOpacity 
            style={styles.orderCard} 
            onPress={() => navigation.navigate('LiveTracking', { orderId: activeOrder.id })}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>#{activeOrder.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={styles.orderStatus}>{activeOrder.status === 'PICKED_UP' ? 'YOLDA' : 'HAZIRLANIYOR'}</Text>
            </View>
            <View style={styles.addressRow}>
              <MapPin color="#FF7A00" size={16} />
              <Text style={styles.addressText} numberOfLines={1}>{activeOrder.dropoffAddress}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: activeOrder.status === 'PICKED_UP' ? '70%' : '30%' }]} />
            </View>
            <Text style={styles.etaText}>Canlı takip için dokun</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Package color="#333" size={40} />
            <Text style={styles.emptyText}>Aktif siparişiniz bulunmuyor.</Text>
          </View>
        )}

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Tümü</Text></TouchableOpacity>
        </View>
        
        {orders.slice(0, 3).map((order) => (
          <View key={order.id} style={styles.historyItem}>
            <View style={styles.historyIcon}>
              <Package color="#666" size={20} />
            </View>
            <View style={styles.historyContent}>
              <Text style={styles.historyTitle}>#{order.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={styles.historyDate}>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</Text>
            </View>
            <Text style={[styles.historyPrice, { color: order.status === 'DELIVERED' ? '#4CAF50' : '#FF7A00' }]}>
              ₺{order.totalPrice}
            </Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  welcome: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  ctaCard: {
    backgroundColor: '#FF7A00',
    borderRadius: 28,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaInfo: {
    flex: 1,
  },
  ctaTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  plusCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.2)',
    marginBottom: 30,
  },
  emptyCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333',
    marginBottom: 30,
  },
  emptyText: {
    color: '#666',
    marginTop: 10,
    fontSize: 14,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  orderId: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderStatus: {
    color: '#FF7A00',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  addressText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0B1220',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 3,
  },
  etaText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAll: {
    color: '#FF7A00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  historyDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  historyPrice: {
    fontWeight: 'bold',
    fontSize: 16,
  }
});

