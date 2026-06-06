import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Animated,
  PanResponder, Dimensions, Modal,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../store/useAuth';
import {
  Navigation, Phone, ChevronRight, XCircle, Zap, Clock,
  Shield, CheckCircle, MapPin, Package, Star, Map as MapIcon,
} from 'lucide-react-native';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { NavigationHelper } from '../../lib/NavigationHelper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2035' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1f2d3d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#252f3e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1a2e' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const DEFAULT_REGION = { latitude: 41.0082, longitude: 28.9784, latitudeDelta: 0.04, longitudeDelta: 0.04 };
const PICKUP_COORD  = { latitude: 41.0082, longitude: 28.9784 };
const DROPOFF_COORD = { latitude: 41.0195, longitude: 28.9990 };

// ─── SwipeButton ──────────────────────────────────────────────────────────────
function SwipeButton({ onSwipeSuccess, text, color = '#39FF14', disabled = false, updating = false }: any) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [btnWidth, setBtnWidth] = useState(0);
  const threshold = btnWidth * 0.65;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !updating,
      onPanResponderMove: (_, g) => {
        if (g.dx > 0 && g.dx < btnWidth - 60) pan.setValue({ x: g.dx, y: 0 });
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > threshold) {
          Animated.timing(pan, { toValue: { x: btnWidth - 60, y: 0 }, duration: 150, useNativeDriver: false }).start(() => {
            onSwipeSuccess();
            setTimeout(() => pan.setValue({ x: 0, y: 0 }), 1000);
          });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  return (
    <View
      style={[styles.swipeContainer, { borderColor: color + '40', backgroundColor: color + '12' }]}
      onLayout={e => setBtnWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.swipeTrack, {
        width: pan.x.interpolate({ inputRange: [0, Math.max(1, btnWidth - 60)], outputRange: [60, btnWidth], extrapolate: 'clamp' }),
        backgroundColor: color + '30',
      }]} />
      <Text style={[styles.swipeText, { color }]}>{updating ? 'İşleniyor...' : text}</Text>
      <Animated.View
        style={[styles.swipeThumb, { transform: [{ translateX: pan.x }], backgroundColor: color }]}
        {...panResponder.panHandlers}
      >
        {updating
          ? <ActivityIndicator color="white" size="small" />
          : <ChevronRight color="white" size={26} />
        }
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CourierHomeScreen() {
  const { user } = useAuth();
  const [isOnline,        setIsOnline]        = useState(true);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeOrder,     setActiveOrder]     = useState<any>(null);
  const [loading,         setLoading]         = useState(true);
  const [refreshing,      setRefreshing]      = useState(false);
  const [updating,        setUpdating]        = useState(false);
  const [otpInput,        setOtpInput]        = useState('');
  const [showOtpModal,    setShowOtpModal]    = useState(false);
  const [showNavModal,    setShowNavModal]    = useState(false);

  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  // Pulse animation for online dot
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim,    { toValue: 1.8, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim,    { toValue: 1,   duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    if (isOnline) loop.start();
    else loop.stop();
    return () => loop.stop();
  }, [isOnline]);

  const fetchData = async () => {
    try {
      const [avRes, myRes] = await Promise.all([
        api.get('/orders/available'),
        api.get('/orders/my'),
      ]);
      setAvailableOrders(avRes.data.data.orders || []);
      const active = (myRes.data.data.orders || []).find(
        (o: any) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
      );
      setActiveOrder(active || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const socket = getSocket();
    const handler = () => { if (isOnline) fetchData(); };
    socket.on('new_order', handler);
    return () => { socket.off('new_order', handler); };
  }, [isOnline]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleAcceptOrder = async (orderId: string) => {
    setUpdating(true);
    try {
      const res = await api.post(`/orders/${orderId}/accept`);
      setActiveOrder(res.data.data.order);
      setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
    } catch {
      Alert.alert('Hata', 'Sipariş kabul edilemedi.');
    } finally { setUpdating(false); }
  };

  const handleUpdateStatus = async (status: string, otp?: string) => {
    if (!activeOrder) return;
    setUpdating(true);
    try {
      const body: any = { status };
      if (otp) body.deliveryOtp = otp;
      const res = await api.patch(`/orders/${activeOrder.id}/status`, body);
      if (status === 'DELIVERED' || status === 'CANCELLED') {
        setActiveOrder(null); setShowOtpModal(false); setOtpInput(''); fetchData();
      } else {
        setActiveOrder(res.data.data.order);
      }
    } catch (err: any) {
      Alert.alert('Hata', err?.response?.data?.error || 'Durum güncellenemedi.');
    } finally { setUpdating(false); }
  };

  const handleDeliveryPress = () => {
    if (activeOrder?.deliveryOtp) setShowOtpModal(true);
    else handleUpdateStatus('DELIVERED');
  };

  const toggleOnline = () => {
    setIsOnline(prev => !prev);
    Alert.alert(
      isOnline ? 'Çevrimdışı' : 'Çevrimiçi',
      isOnline ? 'Artık yeni siparişler almayacaksın.' : 'Yeni siparişler almaya başladın! 🚀'
    );
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator color="#FF7A00" size="large" /></View>;
  }

  // ── Active Order View (Midjourney Neon Green Split Screen) ────────────────────────
  if (activeOrder) {
    const isPickedUp = activeOrder.status === 'PICKED_UP';
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        
        {/* TOP HALF: MAP */}
        <View style={{ flex: 1 }}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={DEFAULT_REGION}
            customMapStyle={DARK_MAP_STYLE}
            showsUserLocation
            showsMyLocationButton={false}
          >
            <Marker coordinate={PICKUP_COORD} title="Alış Noktası" pinColor="#39FF14" />
            <Marker coordinate={DROPOFF_COORD} title="Teslimat Noktası" pinColor="#FFFFFF" />
            <Polyline
              coordinates={[PICKUP_COORD, DROPOFF_COORD]}
              strokeColor="#39FF14"
              strokeWidth={5}
              lineDashPattern={[12, 6]}
            />
          </MapView>
          
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 10, left: 10, right: 10 }}>
             <View style={styles.activeHeaderNeon}>
               <View style={styles.neonDot} />
               <Text style={styles.neonHeaderTxt}>SİPARİŞ AKTİF</Text>
             </View>
          </SafeAreaView>
        </View>

        {/* BOTTOM HALF: HIGH CONTRAST DASHBOARD */}
        <View style={styles.bottomDashboard}>
          <View style={styles.routeHeaderInfo}>
            <Text style={styles.routeHeaderTitle}>{isPickedUp ? 'TESLİMAT ADRESİ' : 'ALIŞ ADRESİ'}</Text>
            <Text style={styles.routeHeaderDistance}>2.4 km • 12 dk</Text>
          </View>
          
          <Text style={styles.routeBigAddr} numberOfLines={2}>
            {isPickedUp ? activeOrder.dropoffAddress : activeOrder.pickupAddress}
          </Text>

          {activeOrder.deliveryOtp && isPickedUp && (
            <View style={styles.otpWarningBox}>
               <Shield color="#000" size={16} />
               <Text style={styles.otpWarningTxt}>OTP KODU GEREKLİ</Text>
            </View>
          )}

          <View style={{ flex: 1 }} />

          {/* ACTION BUTTONS */}
          <View style={styles.dashboardActions}>
            <View style={{ gap: 8 }}>
              <TouchableOpacity style={styles.btnActionSmall} onPress={() => setShowNavModal(true)}>
                <Navigation color="#fff" size={24} />
                <Text style={styles.btnActionSmallTxt}>YOL TARİFİ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnActionSmall}>
                <Phone color="#fff" size={24} />
                <Text style={styles.btnActionSmallTxt}>MÜŞTERİ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.btnActionGiant, isPickedUp ? styles.btnDelivered : styles.btnArrived]}
              onPress={isPickedUp ? handleDeliveryPress : () => handleUpdateStatus('PICKED_UP')}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#000" size="large" />
              ) : (
                <>
                  <Text style={styles.btnActionGiantTxt}>
                    {isPickedUp ? 'TESLİM EDİLDİ' : 'PAKETİ ALDIM'}
                  </Text>
                  <ChevronRight color="#000" size={32} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* OTP Modal */}
        <OTPModal
          visible={showOtpModal}
          otpInput={otpInput}
          setOtpInput={setOtpInput}
          updating={updating}
          onClose={() => { setShowOtpModal(false); setOtpInput(''); }}
          onConfirm={() => handleUpdateStatus('DELIVERED', otpInput)}
        />

        {/* Navigation Selection Modal */}
        <NavigationModal 
          visible={showNavModal} 
          onClose={() => setShowNavModal(false)}
          targetCoords={isPickedUp ? DROPOFF_COORD : PICKUP_COORD}
        />
      </View>
    );
  }

  // ── No Active Order View ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Kurye Paneli</Text>
          <Text style={styles.headerSub}>Hoş geldin, {user?.firstName}! 🏍️</Text>
        </View>
        <TouchableOpacity onPress={toggleOnline} style={styles.toggleWrap} activeOpacity={0.8}>
          <View style={[styles.toggleTrack, isOnline ? { backgroundColor: 'rgba(57,255,20,0.15)', borderColor: '#39FF14' } : { backgroundColor: 'rgba(255,59,48,0.1)', borderColor: '#FF3B30' }]}>
            <View style={[styles.toggleKnob, isOnline ? { transform: [{ translateX: 28 }], backgroundColor: '#39FF14', shadowColor: '#39FF14' } : { transform: [{ translateX: 0 }], backgroundColor: '#FF3B30', shadowColor: '#FF3B30' }]} />
          </View>
          <Text style={[styles.toggleLabel, { color: isOnline ? '#39FF14' : '#FF3B30' }]}>
            {isOnline ? 'ÇEVRİMİÇİ' : 'ÇEVRİMDIŞI'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Strip */}
      <View style={styles.statsStrip}>
        {[
          { icon: Zap,  color: '#39FF14', val: isOnline ? availableOrders.length : 0, label: 'Yakın Sipariş' },
          { icon: Clock, color: '#FF7A00', val: activeOrder ? 1 : 0, label: 'Aktif Görev' },
          { icon: Star,  color: '#FFC107', val: '4.9', label: 'Puan' },
        ].map(({ icon: Icon, color, val, label }) => (
          <View key={label} style={styles.stripItem}>
            <Icon color={color} size={18} />
            <Text style={styles.stripVal}>{val}</Text>
            <Text style={styles.stripLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF7A00" />}
        showsVerticalScrollIndicator={false}
      >
        {!isOnline ? (
          // Offline
          <View style={styles.offlineState}>
            <View style={styles.offlineCircle}>
              <XCircle color="#444" size={64} />
            </View>
            <Text style={styles.offlineTitle}>Çevrimdışısın</Text>
            <Text style={styles.offlineSub}>Yeni siparişler almak için çevrimiçi ol.</Text>
            <TouchableOpacity style={styles.goOnlineBtn} onPress={toggleOnline}>
              <Zap color="white" size={20} />
              <Text style={styles.goOnlineTxt}>Çevrimiçi Ol</Text>
            </TouchableOpacity>
          </View>
        ) : availableOrders.length === 0 ? (
          // Empty
          <View style={styles.emptyState}>
            <Package color="#333" size={64} />
            <Text style={styles.emptyTitle}>Şu an uygun iş yok</Text>
            <Text style={styles.emptySub}>Beklemede kal, yeni işler düştüğünde bildirim alırsın.</Text>
          </View>
        ) : (
          // Available Orders
          <>
            <Text style={styles.sectionTitle}>Yakındaki Siparişler ({availableOrders.length})</Text>
            {availableOrders.map(order => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderAccent} />

                <View style={styles.orderTopRow}>
                  <Text style={styles.orderPrice}>₺{order.price || order.totalPrice}</Text>
                  <View style={styles.orderTags}>
                    <View style={styles.tag}><Text style={styles.tagTxt}>{order.deliveryType}</Text></View>
                    {order.vehicleType && (
                      <View style={[styles.tag, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                        <Text style={[styles.tagTxt, { color: '#3B82F6' }]}>{order.vehicleType}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.addrBox}>
                  <View style={styles.addrRow}>
                    <View style={[styles.addrDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.addrTxt} numberOfLines={1}>{order.pickupAddress}</Text>
                  </View>
                  <View style={styles.addrLine} />
                  <View style={styles.addrRow}>
                    <View style={[styles.addrDot, { backgroundColor: '#FF7A00' }]} />
                    <Text style={styles.addrTxt} numberOfLines={1}>{order.deliveryAddress || order.dropoffAddress}</Text>
                  </View>
                </View>

                <SwipeButton
                  text="Görevi Üstlen →"
                  color="#FF7A00"
                  onSwipeSuccess={() => handleAcceptOrder(order.id)}
                  disabled={updating}
                  updating={updating}
                />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <OTPModal
        visible={showOtpModal}
        otpInput={otpInput}
        setOtpInput={setOtpInput}
        updating={updating}
        onClose={() => { setShowOtpModal(false); setOtpInput(''); }}
        onConfirm={() => handleUpdateStatus('DELIVERED', otpInput)}
      />
    </SafeAreaView>
  );
}

// ─── OTP Modal Component ──────────────────────────────────────────────────────
function OTPModal({ visible, otpInput, setOtpInput, updating, onClose, onConfirm }: any) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }).start();
    } else {
      scaleAnim.setValue(0.85);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <Animated.View style={[styles.otpCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.otpBadge}>
            <Shield color="#FF7A00" size={32} />
          </View>
          <Text style={styles.otpTitle}>Güvenli Teslimat</Text>
          <Text style={styles.otpSub}>Müşteriden aldığınız 4 haneli kodu girin</Text>

          <View style={styles.otpBoxRow}>
            {[0,1,2,3].map(i => (
              <View key={i} style={[styles.otpBox, otpInput.length > i && styles.otpBoxFilled]}>
                <Text style={styles.otpDigit}>{otpInput[i] || ''}</Text>
              </View>
            ))}
          </View>

          <View style={styles.keypad}>
            {[['1','2','3'],['4','5','6'],['7','8','9'],['','0','⌫']].map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((k, ki) => (
                  <TouchableOpacity
                    key={ki}
                    style={[styles.key, !k && { opacity: 0 }]}
                    disabled={!k}
                    onPress={() => {
                      if (k === '⌫') setOtpInput((p: string) => p.slice(0,-1));
                      else if (otpInput.length < 4) setOtpInput((p: string) => p + k);
                    }}
                  >
                    <Text style={styles.keyTxt}>{k}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.otpActions}>
            <TouchableOpacity style={styles.otpCancel} onPress={onClose}>
              <Text style={styles.otpCancelTxt}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.otpConfirm, otpInput.length < 4 && { opacity: 0.4 }]}
              disabled={otpInput.length < 4 || updating}
              onPress={onConfirm}
            >
              {updating ? <ActivityIndicator color="white" /> : <Text style={styles.otpConfirmTxt}>Teslim Et</Text>}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Navigation Selection Modal ───────────────────────────────────────────────
function NavigationModal({ visible, onClose, targetCoords }: { visible: boolean, onClose: () => void, targetCoords: { latitude: number, longitude: number } }) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }).start();
    } else {
      scaleAnim.setValue(0.85);
    }
  }, [visible]);

  const handleNav = (type: 'google' | 'yandex') => {
    onClose();
    if (type === 'google') {
      NavigationHelper.openGoogleMaps(targetCoords.latitude, targetCoords.longitude);
    } else {
      NavigationHelper.openYandexNavigation(targetCoords.latitude, targetCoords.longitude);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.navCard, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.navTitle}>Navigasyonu Başlat</Text>
          <Text style={styles.navSub}>Lütfen tercih ettiğiniz harita uygulamasını seçin.</Text>

          <TouchableOpacity style={styles.navBtn} onPress={() => handleNav('google')}>
            <MapIcon color="#fff" size={24} />
            <Text style={styles.navBtnTxt}>Google Maps ile Git</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navBtn} onPress={() => handleNav('yandex')}>
            <Navigation color="#fff" size={24} />
            <Text style={styles.navBtnTxt}>Yandex Navigasyon ile Git</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  loader: { flex: 1, backgroundColor: '#0B1220', justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 18,
    backgroundColor: '#111827',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  headerSub: { color: '#666', fontSize: 13, marginTop: 2 },

  // Toggle
  toggleWrap: { alignItems: 'center', gap: 4 },
  toggleTrack: {
    width: 60, height: 32, borderRadius: 16,
    justifyContent: 'center', paddingHorizontal: 4,
    flexDirection: 'row', alignItems: 'center',
  },
  trackOn: { backgroundColor: 'rgba(76,175,80,0.15)', borderWidth: 1, borderColor: 'rgba(76,175,80,0.4)' },
  trackOff: { backgroundColor: 'rgba(100,100,100,0.15)', borderWidth: 1, borderColor: 'rgba(100,100,100,0.3)' },
  toggleKnob: { width: 24, height: 24, borderRadius: 12 },
  knobOn: { backgroundColor: '#4CAF50', alignSelf: 'flex-end', shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8, elevation: 4 },
  knobOff: { backgroundColor: '#555' },
  toggleLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },

  onlineDotSmall: { position: 'absolute', left: 6, width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  onlinePulseSmall: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#4CAF50' },

  // Stats Strip
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: 10,
  },
  stripItem: { flex: 1, alignItems: 'center', gap: 4 },
  stripVal: { color: 'white', fontSize: 18, fontWeight: '900' },
  stripLabel: { color: '#555', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 18 },

  // Offline / Empty
  offlineState: { alignItems: 'center', marginTop: 60, padding: 30 },
  offlineCircle: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(100,100,100,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(100,100,100,0.15)' },
  offlineTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  offlineSub: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  goOnlineBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 40, height: 56, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 30, shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8 },
  goOnlineTxt: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 60, padding: 20 },
  emptyTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptySub: { color: '#666', fontSize: 13, textAlign: 'center', marginTop: 10, lineHeight: 18 },

  // Order Card
  orderCard: {
    backgroundColor: '#111827', borderRadius: 28, padding: 22, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  orderAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#FF7A00', borderTopLeftRadius: 28, borderBottomLeftRadius: 28 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginLeft: 10 },
  orderPrice: { color: '#FF7A00', fontSize: 26, fontWeight: '900' },
  orderTags: { flexDirection: 'row', gap: 6 },
  tag: { backgroundColor: 'rgba(255,122,0,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagTxt: { color: '#FF7A00', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  addrBox: { marginBottom: 18, marginLeft: 10 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addrDot: { width: 8, height: 8, borderRadius: 4 },
  addrTxt: { color: '#ccc', fontSize: 14, fontWeight: '500', flex: 1 },
  addrLine: { width: 2, height: 18, backgroundColor: '#2a3444', marginLeft: 3, marginVertical: 4 },

  // Swipe Button
  swipeContainer: {
    height: 60, borderRadius: 30, justifyContent: 'center',
    position: 'relative', overflow: 'hidden', borderWidth: 1,
  },
  swipeTrack: { position: 'absolute', left: 0, height: '100%', borderRadius: 30 },
  swipeText: { textAlign: 'center', fontWeight: '800', fontSize: 14, zIndex: 1 },
  swipeThumb: {
    position: 'absolute', left: 4, width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', zIndex: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },

  // ── Map (Active Order) Neon Split Screen Styles ─────────────────────────────
  activeHeaderNeon: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, alignSelf: 'center', borderWidth: 1, borderColor: '#39FF14' },
  neonDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#39FF14', marginRight: 8, shadowColor: '#39FF14', shadowOffset: { width:0, height:0 }, shadowOpacity: 1, shadowRadius: 8 },
  neonHeaderTxt: { color: '#39FF14', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  bottomDashboard: { flex: 1, backgroundColor: '#000000', padding: 24, borderTopWidth: 2, borderColor: '#39FF14' },
  routeHeaderInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  routeHeaderTitle: { color: '#666', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  routeHeaderDistance: { color: '#39FF14', fontSize: 16, fontWeight: '900' },
  routeBigAddr: { color: 'white', fontSize: 24, fontWeight: 'bold', lineHeight: 32 },

  otpWarningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#39FF14', padding: 12, borderRadius: 12, marginTop: 20, alignSelf: 'flex-start' },
  otpWarningTxt: { color: '#000', fontSize: 14, fontWeight: '900', marginLeft: 8 },

  dashboardActions: { flexDirection: 'row', alignItems: 'stretch', gap: 16, marginTop: 20, height: 100 },
  btnActionSmall: { width: 80, flex: 1, backgroundColor: '#1A1A1A', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  btnActionSmallTxt: { color: 'white', fontSize: 9, fontWeight: 'bold', marginTop: 6, textAlign: 'center' },
  btnActionGiant: { flex: 1, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 100 },
  btnArrived: { backgroundColor: '#39FF14' },
  btnDelivered: { backgroundColor: '#FFFFFF' },
  btnActionGiantTxt: { color: '#000', fontSize: 18, fontWeight: '900' },

  // OTP Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  otpCard: {
    backgroundColor: '#111827', borderRadius: 32, padding: 30, alignItems: 'center', width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,122,0,0.25)',
    shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 30,
  },
  otpBadge: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,122,0,0.2)' },
  otpTitle: { color: 'white', fontSize: 22, fontWeight: '900', marginBottom: 6 },
  otpSub: { color: '#666', fontSize: 13, textAlign: 'center', marginBottom: 28 },
  otpBoxRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  otpBox: { width: 58, height: 68, borderRadius: 18, backgroundColor: '#0B1220', borderWidth: 2, borderColor: '#2a3444', alignItems: 'center', justifyContent: 'center' },
  otpBoxFilled: { borderColor: '#FF7A00', backgroundColor: 'rgba(255,122,0,0.06)' },
  otpDigit: { color: 'white', fontSize: 30, fontWeight: '900' },
  keypad: { gap: 10, width: '100%', marginBottom: 24 },
  keyRow: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  key: { width: 72, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  keyTxt: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  otpActions: { flexDirection: 'row', gap: 12, width: '100%' },
  otpCancel: { flex: 1, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  otpCancelTxt: { color: '#999', fontSize: 16, fontWeight: 'bold' },
  otpConfirm: { flex: 1, height: 54, borderRadius: 16, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  otpConfirmTxt: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Navigation Modal
  navCard: { backgroundColor: '#111827', borderRadius: 24, padding: 24, width: '100%', borderWidth: 1, borderColor: '#333' },
  navTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  navSub: { color: '#888', fontSize: 13, marginBottom: 20 },
  navBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  navBtnTxt: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 14 },
});
