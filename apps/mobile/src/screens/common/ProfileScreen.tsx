import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Switch,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../store/useAuth';
import { 
  User, Shield, Bell, CreditCard, LogOut, ChevronRight, 
  Gift, Settings, HelpCircle, Moon, Smartphone, Star,
  Car, Zap, Activity
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

import api from '../../lib/api';

// ─── Reusable Menu Item Component ───────────────────────────────────────────
function MenuItem({ item, isLast }: { item: any, isLast: boolean }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[styles.menuItem, isLast && styles.menuItemLast]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={item.action}
        activeOpacity={0.8}
      >
        <View style={styles.menuLeft}>
          <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
            <item.icon color={item.color} size={22} />
          </View>
          <View>
            <Text style={styles.menuText}>{item.title}</Text>
            {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
          </View>
        </View>

        {item.type === 'switch' ? (
          <Switch 
            value={item.value} 
            onValueChange={item.onToggle} 
            trackColor={{ false: '#333', true: item.color }}
            thumbColor={'#fff'}
          />
        ) : (
          <ChevronRight color="#444" size={20} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [courierStats, setCourierStats] = useState({ rating: 4.9, deliveries: 0, level: 'Uzman' });

  useEffect(() => {
    if (user?.role === 'COURIER') {
      api.get('/couriers/stats').then(res => {
        if (res.data?.data) {
          setCourierStats(prev => ({
            ...prev,
            deliveries: res.data.data.totalDeliveries || 0,
            rating: res.data.data.rating || 4.9
          }));
        }
      }).catch(console.error);
    }
  }, [user]);

  // Entrance Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
    ]).start();
  }, []);

  // Menu Configurations
  const handleNotImplemented = (title: string) => {
    Alert.alert(
      title, 
      "Bu özellik şu an geliştirme aşamasında. Çok yakında eklenecek!", 
      [{ text: "Tamam", style: "default" }]
    );
  };

  const accountMenu = [
    { id: '1', title: 'Kişisel Bilgiler', subtitle: 'Ad, Soyad, E-posta', icon: User, color: '#3B82F6', action: () => navigation.navigate('PersonalInfo') },
    { id: '2', title: 'Araç Bilgileri', subtitle: 'Plaka, Ruhsat, Araç Tipi', icon: Car, color: '#8B5CF6', action: () => navigation.navigate('VehicleInfo') },
    { id: '3', title: 'Ödeme Yöntemleri', subtitle: 'Banka Hesapları, IBAN', icon: CreditCard, color: '#10B981', action: () => navigation.navigate('PaymentMethods') },
  ];

  const settingsMenu = [
    { id: 'n1', title: 'Anlık Bildirimler', icon: Bell, color: '#F59E0B', type: 'switch', value: notificationsEnabled, onToggle: (val: boolean) => setNotificationsEnabled(val) },
    { id: 'n2', title: 'Karanlık Tema', icon: Moon, color: '#6366F1', type: 'switch', value: darkModeEnabled, onToggle: (val: boolean) => setDarkModeEnabled(val) },
    { id: 'n3', title: 'Güvenlik ve Şifre', icon: Shield, color: '#EC4899', action: () => navigation.navigate('SecuritySettings') },
  ];

  const supportMenu = [
    { id: 's1', title: 'Arkadaşını Davet Et', subtitle: 'Kazançlı çıkın!', icon: Gift, color: '#FF7A00', action: () => navigation.navigate('Referral') },
    { id: 's2', title: 'Yardım Merkezi', icon: HelpCircle, color: '#06B6D4', action: () => navigation.navigate('HelpCenter') },
    { id: 's3', title: 'Uygulama Ayarları', icon: Settings, color: '#64748B', action: () => navigation.navigate('AppSettings') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Glossy Header Background */}
      <View style={styles.headerBackground} />
      
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* ── Profile Card ── */}
          <View style={styles.profileCard}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                </Text>
              </View>
            </View>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            
            <View style={styles.badgeContainer}>
              <View style={styles.roleBadge}>
                <Zap color="#FF7A00" size={12} />
                <Text style={styles.roleBadgeText}>
                  {user?.role === 'COURIER' ? 'Premium Kurye' : 'Müşteri'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Courier Stats Strip (Only for Couriers) ── */}
          {user?.role === 'COURIER' && (
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Star color="#F59E0B" size={20} fill="#F59E0B" />
                <Text style={styles.statValue}>{courierStats.rating}</Text>
                <Text style={styles.statLabel}>Puan</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Activity color="#10B981" size={20} />
                <Text style={styles.statValue}>{courierStats.deliveries}</Text>
                <Text style={styles.statLabel}>Teslimat</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Shield color="#8B5CF6" size={20} />
                <Text style={styles.statValue}>{courierStats.level}</Text>
                <Text style={styles.statLabel}>Seviye</Text>
              </View>
            </View>
          )}

          {/* ── Menus ── */}
          <Text style={styles.sectionTitle}>Hesap Yönetimi</Text>
          <View style={styles.menuGroup}>
            {accountMenu.map((item, index) => (
              <MenuItem key={item.id} item={item} isLast={index === accountMenu.length - 1} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Tercihler</Text>
          <View style={styles.menuGroup}>
            {settingsMenu.map((item, index) => (
              <MenuItem key={item.id} item={item} isLast={index === settingsMenu.length - 1} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>Destek & Diğer</Text>
          <View style={styles.menuGroup}>
            {supportMenu.map((item, index) => (
              <MenuItem key={item.id} item={item} isLast={index === supportMenu.length - 1} />
            ))}
          </View>

          {/* ── Logout Button ── */}
          <TouchableOpacity 
            style={styles.logoutBtn} 
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert(
                "Çıkış Yap",
                "Hesabınızdan çıkmak istediğinize emin misiniz?",
                [
                  { text: "İptal", style: "cancel" },
                  { text: "Çıkış Yap", style: "destructive", onPress: logout }
                ]
              );
            }}
          >
            <LogOut color="#FF3B30" size={20} />
            <Text style={styles.logoutText}>Güvenli Çıkış Yap</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>JETIS App v1.0.0</Text>
          
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: '#FF7A00',
    opacity: 0.05,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  topBar: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Profile Card
  profileCard: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarGlow: {
    padding: 4,
    borderRadius: 55,
    backgroundColor: 'rgba(255,122,0,0.15)',
    marginBottom: 15,
  },
  avatarBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0B1220',
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
  },
  name: {
    color: 'white',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  email: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  badgeContainer: {
    marginTop: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,122,0,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.3)',
  },
  roleBadgeText: {
    color: '#FF7A00',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 24,
    paddingVertical: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },
  statLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Menu Groups
  sectionTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 15,
    marginBottom: 10,
  },
  menuGroup: {
    backgroundColor: '#111827',
    borderRadius: 24,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  menuSubtitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,59,48,0.1)',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.2)',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '800',
  },
  versionText: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
    fontWeight: '600',
  }
});
