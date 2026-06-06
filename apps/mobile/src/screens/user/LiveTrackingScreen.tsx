import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView, Animated, RefreshControl } from 'react-native';
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Clock,
  Bike,
  CheckCircle2,
  Package,
  Navigation,
} from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';

// ── Types ──────────────────────────────────────────────────────────────────────
interface TimelineStep {
  id: number;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

const getTimelineSteps = (status?: string): TimelineStep[] => {
  const isPending = status === 'PENDING';
  const isAccepted = status === 'ACCEPTED';
  const isPickedUp = status === 'PICKED_UP';
  const isDelivered = status === 'DELIVERED';

  return [
    { id: 1, label: 'Kurye Atandı', status: isDelivered || isPickedUp || isAccepted ? 'completed' : 'active' },
    { id: 2, label: 'Alış Noktasında', status: isDelivered || isPickedUp ? 'completed' : isAccepted ? 'active' : 'pending' },
    { id: 3, label: 'Paket Alındı', status: isDelivered || isPickedUp ? 'completed' : 'pending' },
    { id: 4, label: 'Yolda', status: isDelivered ? 'completed' : isPickedUp ? 'active' : 'pending' },
  ];
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function LiveTrackingScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [courierLocation, setCourierLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Pulsing animation for the active step dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.6,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const fetchOrder = async () => {
    try {
      setError(null);
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data.data || res.data);
    } catch (err: any) {
      console.error(err);
      setError('Sipariş bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };

  useEffect(() => {
    const socket = getSocket();
    
    const handleLocationUpdate = (data: any) => {
      if (data.orderId === orderId) {
        setCourierLocation({ latitude: data.lat, longitude: data.lng });
      }
    };

    socket.on('courier_location_updated', handleLocationUpdate);

    return () => {
      socket.off('courier_location_updated', handleLocationUpdate);
    };
  }, [orderId]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderTimelineStep = (step: TimelineStep, index: number) => {
    const isLast = index === 3;
    const isCompleted = step.status === 'completed';
    const isActive = step.status === 'active';

    return (
      <View key={step.id} style={styles.timelineRow}>
        {/* Dot + Connector */}
        <View style={styles.timelineDotColumn}>
          {isCompleted && (
            <View style={styles.completedDot}>
              <CheckCircle2 color="#fff" size={14} />
            </View>
          )}

          {isActive && (
            <View style={styles.activeDotWrapper}>
              <Animated.View
                style={[
                  styles.activePulseRing,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View style={styles.activeDot} />
            </View>
          )}

          {!isCompleted && !isActive && (
            <View style={styles.pendingDot} />
          )}

          {/* Vertical line */}
          {!isLast && (
            <View
              style={[
                styles.timelineLine,
                {
                  backgroundColor:
                    isCompleted ? '#4CAF50' : 'rgba(255,255,255,0.08)',
                },
              ]}
            />
          )}
        </View>

        {/* Label */}
        <View style={styles.timelineLabelContainer}>
          <Text
            style={[
              styles.timelineLabel,
              isCompleted && styles.timelineLabelCompleted,
              isActive && styles.timelineLabelActive,
            ]}
          >
            {step.label}
          </Text>
          {isActive && (
            <View style={styles.activebadge}>
              <Text style={styles.activeBadgeText}>ŞU AN</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ── Loading / Error States ─────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#FF7A00" size="large" />
          <Text style={styles.loadingText}>Takip bilgileri yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Package color="#FF3B30" size={48} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchOrder}>
            <Text style={styles.retryBtnText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────

  const shortId = orderId?.slice(0, 8).toUpperCase() ?? '';

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Canlı Takip</Text>
          <Text style={styles.headerSubtitle}>#{shortId}</Text>
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF7A00"
          />
        }
      >
        {/* ─── Map Area ──────────────────────────────────────── */}
        <View style={styles.mapArea}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: order?.dropoffLocation?.lat || 41.0082,
              longitude: order?.dropoffLocation?.lng || 28.9784,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* Dropoff Location Marker */}
            {(order?.dropoffLocation?.lat && order?.dropoffLocation?.lng) && (
              <Marker
                coordinate={{
                  latitude: order.dropoffLocation.lat,
                  longitude: order.dropoffLocation.lng,
                }}
                title="Teslimat Noktası"
                pinColor="#FF7A00"
              />
            )}

            {/* Courier Location Marker */}
            {courierLocation && (
              <Marker
                coordinate={courierLocation}
                title="Kurye"
                pinColor="#4CAF50"
              />
            )}
          </MapView>
        </View>

        {/* ─── Bottom Sheet (Fixed) ─────────────────────────────────── */}
        <View style={styles.bottomSheet}>
          {/* Drag indicator */}
          <View style={styles.dragIndicator} />

          {/* ETA Banner */}
          <View style={styles.etaBanner}>
            <Clock color="#FF7A00" size={18} />
            <Text style={styles.etaText}>Tahmini Varış: ~12 dk</Text>
          </View>

          {/* ── Timeline ──────────────────────────────────────────────── */}
          <View style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>SİPARİŞ DURUMU</Text>
            <View style={styles.timelineContainer}>
              {getTimelineSteps(order?.status).map((step, i) => renderTimelineStep(step, i))}
            </View>
          </View>

          {/* ── Courier Info ──────────────────────────────────────────── */}
          <View style={styles.courierCard}>
            <Text style={styles.sectionTitle}>KURYE BİLGİSİ</Text>
            {order?.courier?.user ? (
              <>
                <View style={styles.courierRow}>
                  {/* Avatar */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {`${order.courier.user.firstName?.[0] ?? ''}${order.courier.user.lastName?.[0] ?? ''}`.toUpperCase()}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.courierInfo}>
                    <Text style={styles.courierName}>
                      {order.courier.user.firstName} {order.courier.user.lastName}
                    </Text>
                    <View style={styles.courierMeta}>
                      <Star color="#FFB800" size={13} fill="#FFB800" />
                      <Text style={styles.courierRating}>4.9</Text>
                      <View style={styles.metaDivider} />
                      <Bike color="#666" size={13} />
                      <Text style={styles.courierVehicle}>Motosiklet</Text>
                    </View>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={styles.courierActions}>
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    activeOpacity={0.7}
                  >
                    <Phone color="#FF7A00" size={16} />
                    <Text style={styles.actionBtnOutlineText}>Kuryeyi Ara</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnFilled}
                    activeOpacity={0.7}
                  >
                    <MessageCircle color="#fff" size={16} />
                    <Text style={styles.actionBtnFilledText}>Mesaj Gönder</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.courierRow}>
                <View style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                  <Text style={[styles.avatarText, { color: '#666' }]}>?</Text>
                </View>
                <View style={styles.courierInfo}>
                  <Text style={styles.courierName}>Kurye Aranıyor...</Text>
                  <Text style={styles.courierVehicle}>En yakın kurye atanıyor...</Text>
                </View>
              </View>
            )}
          </View>

          {/* Bottom safe spacing */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  scrollView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingText: {
    color: '#666',
    marginTop: 16,
    fontSize: 14,
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(255,122,0,0.12)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryBtnText: {
    color: '#FF7A00',
    fontWeight: '700',
    fontSize: 14,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#FF7A00',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerRightPlaceholder: {
    width: 42,
  },

  // ── Map Placeholder ─────────────────────────────────────────────────────────
  mapArea: {
    height: 300,
    backgroundColor: '#0D1A2D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,18,32,0.4)',
  },
  mapContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  mapPinCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,122,0,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,122,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mapTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  mapSubtitle: {
    color: '#666',
    fontSize: 12,
  },
  mapDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,122,0,0.15)',
  },
  mapDotLarge: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,122,0,0.08)',
  },

  // ── Bottom Sheet ────────────────────────────────────────────────────────────
  bottomSheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: 12,
    paddingHorizontal: 24,
    minHeight: 500,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
    marginBottom: 20,
  },

  // ── ETA Banner ──────────────────────────────────────────────────────────────
  etaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,122,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.2)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 10,
  },
  etaText: {
    color: '#FF7A00',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Section Title ───────────────────────────────────────────────────────────
  sectionTitle: {
    color: '#666',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 18,
  },

  // ── Timeline ────────────────────────────────────────────────────────────────
  timelineCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },
  timelineDotColumn: {
    width: 28,
    alignItems: 'center',
  },
  completedDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDotWrapper: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePulseRing: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,122,0,0.2)',
  },
  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF7A00',
  },
  pendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 7,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    borderRadius: 1,
  },
  timelineLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
    paddingTop: 3,
    gap: 10,
  },
  timelineLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  timelineLabelCompleted: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  timelineLabelActive: {
    color: '#FF7A00',
    fontWeight: '700',
    fontSize: 15,
  },
  activebadge: {
    backgroundColor: 'rgba(255,122,0,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#FF7A00',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // ── Courier Card ────────────────────────────────────────────────────────────
  courierCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,122,0,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,122,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FF7A00',
    fontSize: 18,
    fontWeight: '800',
  },
  courierInfo: {
    marginLeft: 16,
    flex: 1,
  },
  courierName: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 5,
  },
  courierMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  courierRating: {
    color: '#FFB800',
    fontSize: 13,
    fontWeight: '700',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 4,
  },
  courierVehicle: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  courierActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,122,0,0.35)',
    backgroundColor: 'rgba(255,122,0,0.06)',
    gap: 8,
  },
  actionBtnOutlineText: {
    color: '#FF7A00',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnFilled: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FF7A00',
    gap: 8,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  actionBtnFilledText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
