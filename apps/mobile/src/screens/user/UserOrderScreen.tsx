import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../store/useAuth';
import { Package, MapPin, Calendar, ChevronRight } from 'lucide-react-native';
import api from '../../lib/api';

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'PENDING': return { text: 'BEKLİYOR', color: '#FFB800', bg: 'rgba(255,184,0,0.1)' };
    case 'ACCEPTED': return { text: 'ONAYLANDI', color: '#2196F3', bg: 'rgba(33,150,243,0.1)' };
    case 'PICKED_UP': return { text: 'YOLDA', color: '#FF7A00', bg: 'rgba(255,122,0,0.1)' };
    case 'DELIVERED': return { text: 'TESLİM EDİLDİ', color: '#4CAF50', bg: 'rgba(76,175,80,0.1)' };
    case 'CANCELLED': return { text: 'İPTAL EDİLDİ', color: '#FF3B30', bg: 'rgba(255,59,48,0.1)' };
    default: return { text: status || 'BİLİNMİYOR', color: '#666', bg: 'rgba(255,255,255,0.1)' };
  }
};

export default function UserOrderScreen({ navigation }: { navigation: any }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate('LiveTracking', { orderId: item.id })}
      >
        <View style={styles.orderLeft}>
          <View style={styles.iconBox}>
            <Package color="#FF7A00" size={20} />
          </View>
          <View>
            <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
          </View>
        </View>
        <View style={styles.orderRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <Text style={styles.price}>₺{item.totalPrice}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Siparişlerim</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FF7A00" size="large" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A00" />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Package color="#333" size={60} />
              <Text style={styles.emptyText}>Henüz bir siparişiniz yok.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  header: {
    padding: 25,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,122,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderId: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  orderDate: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  price: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  }
});
