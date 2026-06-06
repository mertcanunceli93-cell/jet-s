import { SafeAreaView } from 'react-native-safe-area-context';
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Animated, FlatList, Dimensions, Platform, Alert } from 'react-native';
import {
  Package,
  MapPin,
  Clock,
  Zap,
  CheckCircle,
  ChevronRight,
  Bike,
  Car,
  Filter,
  Navigation,
  TrendingUp,
  AlertCircle,
  Star,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../store/useAuth';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';

// ─── Types ───────────────────────────────────────────────────────────────────

type VehicleType = 'MOTO' | 'ARABA' | 'HER_ARAC';
type FilterKey = 'all' | 'nearest' | 'highest_pay' | 'moto' | 'car';

interface AvailableOrder {
  id: string;
  pickupName: string;
  pickupDistrict: string;
  pickupDistance: number;  // km to pickup
  dropoffDistrict: string;
  totalDistance: number;   // total delivery km
  price: number;
  vehicleType: VehicleType;
  expiresInSeconds: number;
  deliveryType: string;
  rating: number;
}

// ─── Mock Data (2026 Fiyatlandırması) ────────────────────────────────────────
// Motor: ₺45 taban + ₺18/km  |  Araba: ₺80 taban + ₺28/km

const calcPrice = (dist: number, v: VehicleType) =>
  v === 'ARABA' ? +(80 + dist * 28).toFixed(2) : +(45 + dist * 18).toFixed(2);

const MOCK_ORDERS: AvailableOrder[] = [
  {
    id: 'ord_001',
    pickupName: "McDonald's Kadıköy",
    pickupDistrict: 'Kadıköy',
    pickupDistance: 0.8,
    dropoffDistrict: 'Moda',
    totalDistance: 3.2,
    price: calcPrice(3.2, 'MOTO'),      // ₺102.6
    vehicleType: 'MOTO',
    expiresInSeconds: 87,
    deliveryType: 'HIZLI',
    rating: 4.9,
  },
  {
    id: 'ord_002',
    pickupName: 'Migros Beşiktaş',
    pickupDistrict: 'Beşiktaş',
    pickupDistance: 1.4,
    dropoffDistrict: 'Ortaköy',
    totalDistance: 5.1,
    price: calcPrice(5.1, 'ARABA'),     // ₺222.8
    vehicleType: 'ARABA',
    expiresInSeconds: 42,
    deliveryType: 'STANDART',
    rating: 4.7,
  },
  {
    id: 'ord_003',
    pickupName: 'Sushi Lab Nişantaşı',
    pickupDistrict: 'Nişantaşı',
    pickupDistance: 2.1,
    dropoffDistrict: 'Levent',
    totalDistance: 6.8,
    price: calcPrice(6.8, 'ARABA'),     // ₺270.4
    vehicleType: 'ARABA',
    expiresInSeconds: 120,
    deliveryType: 'SOĞUK ZİNCİR',
    rating: 5.0,
  },
  {
    id: 'ord_004',
    pickupName: 'Burger King Ümraniye',
    pickupDistrict: 'Ümraniye',
    pickupDistance: 0.5,
    dropoffDistrict: 'Çekmeköy',
    totalDistance: 4.3,
    price: calcPrice(4.3, 'MOTO'),      // ₺122.4
    vehicleType: 'MOTO',
    expiresInSeconds: 65,
    deliveryType: 'HIZLI',
    rating: 4.6,
  },
  {
    id: 'ord_005',
    pickupName: 'Starbucks Taksim',
    pickupDistrict: 'Taksim',
    pickupDistance: 1.0,
    dropoffDistrict: 'Cihangir',
    totalDistance: 2.4,
    price: calcPrice(2.4, 'MOTO'),      // ₺88.2
    vehicleType: 'MOTO',
    expiresInSeconds: 55,
    deliveryType: 'HIZLI',
    rating: 4.8,
  },
  {
    id: 'ord_006',
    pickupName: 'İKEA Bayrampaşa',
    pickupDistrict: 'Bayrampaşa',
    pickupDistance: 0.4,
    dropoffDistrict: 'Güngören',
    totalDistance: 8.5,
    price: calcPrice(8.5, 'ARABA'),     // ₺318.0
    vehicleType: 'ARABA',
    expiresInSeconds: 110,
    deliveryType: 'BÜYÜK KARGO',
    rating: 4.5,
  },
];

const EXTRA_ORDERS: Omit<AvailableOrder, 'id'>[] = [
  {
    pickupName: 'Pizza Hut Bakırköy',
    pickupDistrict: 'Bakırköy',
    pickupDistance: 0.9,
    dropoffDistrict: 'Florya',
    totalDistance: 7.2,
    price: calcPrice(7.2, 'ARABA'),     // ₺281.6
    vehicleType: 'ARABA',
    expiresInSeconds: 90,
    deliveryType: 'STANDART',
    rating: 4.5,
  },
  {
    pickupName: 'Köfteci Ramiz Şişli',
    pickupDistrict: 'Şişli',
    pickupDistance: 1.6,
    dropoffDistrict: 'Mecidiyeköy',
    totalDistance: 3.9,
    price: calcPrice(3.9, 'MOTO'),      // ₺115.2
    vehicleType: 'MOTO',
    expiresInSeconds: 75,
    deliveryType: 'HIZLI',
    rating: 4.8,
  },
  {
    pickupName: 'Carrefour Kartal',
    pickupDistrict: 'Kartal',
    pickupDistance: 0.3,
    dropoffDistrict: 'Pendik',
    totalDistance: 5.5,
    price: calcPrice(5.5, 'ARABA'),     // ₺234.0
    vehicleType: 'ARABA',
    expiresInSeconds: 100,
    deliveryType: 'SOĞUK ZİNCİR',
    rating: 4.9,
  },
  {
    pickupName: 'Getir Market Üsküdar',
    pickupDistrict: 'Üsküdar',
    pickupDistance: 0.6,
    dropoffDistrict: 'Bağlarbaşı',
    totalDistance: 2.8,
    price: calcPrice(2.8, 'MOTO'),      // ₺95.4
    vehicleType: 'MOTO',
    expiresInSeconds: 50,
    deliveryType: 'HIZLI',
    rating: 4.7,
  },
];

// ─── Filter Config ────────────────────────────────────────────────────────────

interface FilterOption {
  key: FilterKey;
  label: string;
}

const FILTERS: FilterOption[] = [
  { key: 'all',         label: '⚡ Tümü'       },
  { key: 'nearest',    label: '📍 En Yakın'    },
  { key: 'highest_pay',label: '💰 En Yüksek'  },
  { key: 'moto',       label: '🏍️ Motor'       },
  { key: 'car',        label: '🚗 Araba'       },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

let _idCounter = 1000;
function genId(): string {
  return `ord_sim_${++_idCounter}`;
}

function formatCountdown(secs: number): string {
  if (secs <= 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getVehicleLabel(v: VehicleType): string {
  switch (v) {
    case 'MOTO': return 'Sadece Moto';
    case 'ARABA': return 'Sadece Araba';
    default: return 'Her Araç';
  }
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

interface CountdownBarProps {
  initialSeconds: number;
  totalSeconds: number;
}

function CountdownBar({ initialSeconds, totalSeconds }: CountdownBarProps) {
  const progress = useRef(new Animated.Value(initialSeconds / totalSeconds)).current;
  const color = initialSeconds < 30 ? '#FF3B30' : initialSeconds < 60 ? '#FF9500' : '#4CAF50';

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: initialSeconds * 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressBar, { width, backgroundColor: color }]} />
    </View>
  );
}

interface OrderCardProps {
  order: AvailableOrder;
  onAccept: (id: string) => void;
  acceptingId: string | null;
}

function OrderCard({ order, onAccept, acceptingId }: OrderCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(order.expiresInSeconds);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const isAccepting = acceptingId === order.id;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Countdown tick
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const urgentColor =
    secondsLeft <= 30 ? '#FF3B30' :
    secondsLeft <= 60 ? '#FF9500' :
    '#4CAF50';

  const urgentBg =
    secondsLeft <= 30 ? 'rgba(255,59,48,0.12)' :
    secondsLeft <= 60 ? 'rgba(255,149,0,0.12)' :
    'rgba(76,175,80,0.12)';

  const VehicleIcon =
    order.vehicleType === 'MOTO' ? Bike :
    order.vehicleType === 'ARABA' ? Car :
    Zap;

  const vehicleBadgeColor =
    order.vehicleType === 'MOTO' ? '#FF7A00' :
    order.vehicleType === 'ARABA' ? '#3B82F6' :
    '#4CAF50';

  const vehicleBadgeBg =
    order.vehicleType === 'MOTO' ? 'rgba(255,122,0,0.12)' :
    order.vehicleType === 'ARABA' ? 'rgba(59,130,246,0.12)' :
    'rgba(76,175,80,0.12)';

  return (
    <Animated.View
      style={[
        styles.orderCard,
        {
          opacity: opacityAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Top Row: Price + Badges */}
      <View style={styles.cardTopRow}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>NET KAZANÇ</Text>
          <Text style={styles.priceValue}>₺{order.price.toFixed(2)}</Text>
        </View>
        <View style={styles.badgeGroup}>
          {/* Delivery Type */}
          <View style={styles.deliveryBadge}>
            <Zap color="#FF7A00" size={10} />
            <Text style={styles.deliveryBadgeText}>{order.deliveryType}</Text>
          </View>
          {/* Rating */}
          <View style={styles.ratingBadge}>
            <Star color="#FFC107" size={10} fill="#FFC107" />
            <Text style={styles.ratingText}>{order.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      {/* Vehicle Type Badge */}
      <View style={[styles.vehicleBadge, { backgroundColor: vehicleBadgeBg, borderColor: `${vehicleBadgeColor}30` }]}>
        <VehicleIcon color={vehicleBadgeColor} size={13} />
        <Text style={[styles.vehicleBadgeText, { color: vehicleBadgeColor }]}>
          {getVehicleLabel(order.vehicleType)}
        </Text>
      </View>

      {/* Route Timeline */}
      <View style={styles.routeContainer}>
        {/* Pickup */}
        <View style={styles.routeRow}>
          <View style={styles.routeIconCol}>
            <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
            <View style={styles.routeLine} />
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeTag}>ALIŞ NOKTASİ</Text>
            <Text style={styles.routeName} numberOfLines={1}>{order.pickupName}</Text>
            <View style={styles.distancePill}>
              <Navigation color="#4CAF50" size={11} />
              <Text style={[styles.distanceText, { color: '#4CAF50' }]}>
                {order.pickupDistance.toFixed(1)} km uzakta
              </Text>
            </View>
          </View>
        </View>

        {/* Dropoff */}
        <View style={[styles.routeRow, { marginTop: 4 }]}>
          <View style={styles.routeIconCol}>
            <View style={[styles.routeDot, { backgroundColor: '#FF7A00' }]} />
          </View>
          <View style={styles.routeInfo}>
            <Text style={[styles.routeTag, { color: '#FF7A00' }]}>TESLİMAT BÖLGESİ</Text>
            <Text style={styles.routeName}>{order.dropoffDistrict}</Text>
            <View style={styles.distancePill}>
              <MapPin color="#FF7A00" size={11} />
              <Text style={[styles.distanceText, { color: '#FF7A00' }]}>
                {order.totalDistance.toFixed(1)} km toplam
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Countdown Section */}
      <View style={[styles.countdownRow, { backgroundColor: urgentBg }]}>
        <Clock color={urgentColor} size={14} />
        <Text style={[styles.countdownText, { color: urgentColor }]}>
          {formatCountdown(secondsLeft)} kaldı
        </Text>
        <View style={{ flex: 1 }}>
          <CountdownBar
            initialSeconds={order.expiresInSeconds}
            totalSeconds={order.expiresInSeconds}
          />
        </View>
        {secondsLeft <= 30 && (
          <AlertCircle color={urgentColor} size={14} />
        )}
      </View>

      {/* Accept Button */}
      <TouchableOpacity
        style={[
          styles.acceptBtn,
          isAccepting && styles.acceptBtnLoading,
        ]}
        onPress={() => onAccept(order.id)}
        disabled={acceptingId !== null}
        activeOpacity={0.85}
      >
        {isAccepting ? (
          <>
            <ActivityIndicator color="white" size="small" />
            <Text style={styles.acceptBtnText}>İşleniyor...</Text>
          </>
        ) : (
          <>
            <Text style={styles.acceptBtnText}>Siparişi Kabul Et</Text>
            <CheckCircle color="white" size={20} />
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Success Modal ────────────────────────────────────────────────────────────

interface SuccessModalProps {
  visible: boolean;
  onDismiss: () => void;
}

function SuccessModal({ visible, onDismiss }: SuccessModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.spring(checkAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }).start();
      });

      const timer = setTimeout(onDismiss, 3200);
      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0.6);
      opacityAnim.setValue(0);
      checkAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.successCard,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Glowing check circle */}
          <Animated.View
            style={[
              styles.successIconCircle,
              {
                transform: [{ scale: checkAnim }],
              },
            ]}
          >
            <CheckCircle color="#4CAF50" size={52} />
          </Animated.View>

          <Text style={styles.successTitle}>Sipariş Alındı! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Sipariş başarıyla alındı!{'\n'}Aktif siparişlerinize eklendi.
          </Text>

          <View style={styles.successDivider} />

          <View style={styles.successInfoRow}>
            <View style={styles.successInfoItem}>
              <TrendingUp color="#FF7A00" size={18} />
              <Text style={styles.successInfoLabel}>Aktif Görev</Text>
            </View>
            <View style={styles.successInfoItem}>
              <Navigation color="#4CAF50" size={18} />
              <Text style={styles.successInfoLabel}>Navigasyon Hazır</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.successBtn} onPress={onDismiss}>
            <Text style={styles.successBtnText}>Göreve Başla</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OrderPoolScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<AvailableOrder[]>(MOCK_ORDERS);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;

  // ── Pulsing online indicator ──────────────────────────────────────────────
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1.6, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.4, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // ── Simulated real-time pool updates (every 15 s) ─────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => {
        const roll = Math.random();

        if (roll < 0.45 && prev.length > 0) {
          // Remove a random order (simulating expiry / someone else grabbing it)
          const idx = Math.floor(Math.random() * prev.length);
          const next = [...prev];
          next.splice(idx, 1);
          return next;
        } else if (roll < 0.85 && EXTRA_ORDERS.length > 0) {
          // Add a new random order
          const extra = EXTRA_ORDERS[Math.floor(Math.random() * EXTRA_ORDERS.length)];
          const newOrder: AvailableOrder = {
            ...extra,
            id: genId(),
            expiresInSeconds: 60 + Math.floor(Math.random() * 90),
          };
          return [newOrder, ...prev];
        }
        return prev;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // ── Accept handler ────────────────────────────────────────────────────────
  const handleAccept = async (orderId: string) => {
    setAcceptingId(orderId);
    try {
      await api.post(`/orders/${orderId}/accept`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.navigate('İşler');
      }, 1500);
      getSocket().emit('order_accepted', orderId);
    } catch (e) {
      Alert.alert('Hata', 'Sipariş kabul edilemedi. Başkası almış olabilir.');
    } finally {
      setAcceptingId(null);
    }
  };

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      const shuffled = [...MOCK_ORDERS].sort(() => Math.random() - 0.5);
      setOrders(shuffled.slice(0, 3 + Math.floor(Math.random() * 3)));
      setRefreshing(false);
    }, 1200);
  }, []);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredOrders: AvailableOrder[] = (() => {
    let list = [...orders];
    switch (activeFilter) {
      case 'nearest':
        return list.sort((a, b) => a.pickupDistance - b.pickupDistance);
      case 'highest_pay':
        return list.sort((a, b) => b.price - a.price);
      case 'moto':
        return list.filter(o => o.vehicleType === 'MOTO');
      case 'car':
        return list.filter(o => o.vehicleType === 'ARABA');
      default:
        return list;
    }
  })();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.onlineIndicator}>
            {/* Pulse ring */}
            <Animated.View
              style={[
                styles.pulsRing,
                { transform: [{ scale: pulseAnim }], opacity: pulseOpacity },
              ]}
            />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Sipariş Havuzu</Text>
            <Text style={styles.headerSubtitle}>
              {orders.length > 0
                ? `Havuzda ${orders.length} Aktif Sipariş Var`
                : 'Şu an havuz boş'}
            </Text>
          </View>
        </View>

        {/* Live badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CANLI</Text>
        </View>
      </View>

      {/* ── Stats Strip ── */}
      <View style={styles.statsStrip}>
        <View style={styles.stripItem}>
          <Text style={styles.stripValue}>{orders.length}</Text>
          <Text style={styles.stripLabel}>Havuzda</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.stripItem}>
          <Text style={styles.stripValue}>
            {orders.length > 0
              ? `₺${Math.max(...orders.map(o => o.price)).toFixed(0)}`
              : '—'}
          </Text>
          <Text style={styles.stripLabel}>En Yüksek</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.stripItem}>
          <Text style={styles.stripValue}>
            {orders.length > 0
              ? `${Math.min(...orders.map(o => o.pickupDistance)).toFixed(1)} km`
              : '—'}
          </Text>
          <Text style={styles.stripLabel}>En Yakın</Text>
        </View>
      </View>

      {/* ── Filter Bar ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterBar}
      >
        {FILTERS.map(f => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Order List ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF7A00"
            colors={['#FF7A00']}
          />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyCircle}>
              <Package color="#333" size={52} />
            </View>
            <Text style={styles.emptyTitle}>Havuz Şu An Boş</Text>
            <Text style={styles.emptySubtitle}>
              Yeni siparişler düştüğünde otomatik olarak görünecek.{'\n'}
              Beklemede kal! 🏍️
            </Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
              <Zap color="white" size={16} />
              <Text style={styles.refreshBtnText}>Yenile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              acceptingId={acceptingId}
            />
          ))
        )}

        {/* Bottom breathing room */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Success Modal ── */}
      <SuccessModal
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  onlineIndicator: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
  },
  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#111827',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,59,48,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.25)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },
  liveText: {
    color: '#FF3B30',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  // ── Stats Strip ───────────────────────────────────────────────────────────
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 12,
  },
  stripItem: {
    flex: 1,
    alignItems: 'center',
  },
  stripValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  stripLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  stripDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 4,
  },

  // ── Filter Bar ────────────────────────────────────────────────────────────
  filterBar: {
    backgroundColor: '#0B1220',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A2235',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: 80,
  },
  filterChipActive: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  filterChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: 'white',
  },

  // ── Scroll Content ────────────────────────────────────────────────────────
  scrollContent: {
    padding: 16,
    paddingTop: 14,
  },

  // ── Order Card ────────────────────────────────────────────────────────────
  orderCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  priceBlock: {
    flex: 1,
  },
  priceLabel: {
    color: '#4CAF50',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  priceValue: {
    color: 'white',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  badgeGroup: {
    alignItems: 'flex-end',
    gap: 6,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,122,0,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.2)',
  },
  deliveryBadgeText: {
    color: '#FF7A00',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,193,7,0.1)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    color: '#FFC107',
    fontSize: 10,
    fontWeight: '800',
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  vehicleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Route Timeline ────────────────────────────────────────────────────────
  routeContainer: {
    marginBottom: 14,
    paddingLeft: 2,
  },
  routeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  routeIconCol: {
    alignItems: 'center',
    width: 16,
    paddingTop: 3,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeLine: {
    width: 2,
    height: 36,
    backgroundColor: '#2A3447',
    marginTop: 3,
    borderRadius: 1,
  },
  routeInfo: {
    flex: 1,
    paddingBottom: 12,
  },
  routeTag: {
    color: '#666',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  routeName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Countdown ─────────────────────────────────────────────────────────────
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '800',
    minWidth: 38,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },

  // ── Accept Button ─────────────────────────────────────────────────────────
  acceptBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FF7A00',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  acceptBtnLoading: {
    backgroundColor: '#CC6200',
    shadowOpacity: 0.2,
  },
  acceptBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // ── Empty State ───────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 24,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#555',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  refreshBtn: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  refreshBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },

  // ── Success Modal ─────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successCard: {
    backgroundColor: '#111827',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.25)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76,175,80,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.2)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  successTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  successDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 24,
  },
  successInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 28,
  },
  successInfoItem: {
    alignItems: 'center',
    gap: 8,
  },
  successInfoLabel: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
  },
  successBtn: {
    backgroundColor: '#4CAF50',
    height: 54,
    width: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  successBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
