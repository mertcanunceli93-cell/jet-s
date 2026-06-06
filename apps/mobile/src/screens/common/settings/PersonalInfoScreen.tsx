import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Animated, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../../store/useAuth';
import { ArrowLeft, User, Mail, Phone, CheckCircle, Star, Zap, TrendingUp } from 'lucide-react-native';
import api from '../../../lib/api';

const BADGES = [
  { id: 'speed', emoji: '🚀', title: 'Hız Ustası',    desc: '10+ teslimat/gün',        color: '#FF7A00', earned: true  },
  { id: 'star',  emoji: '⭐', title: '5 Yıldız',      desc: '100+ mükemmel teslimat',   color: '#FFC107', earned: true  },
  { id: 'care',  emoji: '🛡️', title: 'Özenli Taşıma', desc: 'Hiç hasar bildirimi yok', color: '#4CAF50', earned: true  },
  { id: 'pro',   emoji: '💼', title: 'Profesyonel',   desc: '90 gün kesintisiz',        color: '#3B82F6', earned: false },
  { id: 'top',   emoji: '🏆', title: 'En İyi Kurye',  desc: 'Bölgenin 1 numarası',      color: '#EC4899', earned: false },
  { id: 'night', emoji: '🌙', title: 'Gece Kartalı',  desc: '20+ gece teslimatı',       color: '#8B5CF6', earned: false },
];

const LEVEL_PROGRESS = 0.68; // 68% to next level

export default function PersonalInfoScreen({ navigation }: any) {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName,  setLastName]  = useState(user?.lastName  || '');
  const [email,     setEmail]     = useState(user?.email     || '');
  const [phone,     setPhone]     = useState(user?.phone     || '');
  const [saved,     setSaved]     = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const barAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(barAnim,  { toValue: LEVEL_PROGRESS, duration: 1200, useNativeDriver: false }),
    ]).start();
  }, []);

  const handleSave = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start(async () => {
      try {
        await api.patch('/users/me', { firstName, lastName, email, phone });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        Alert.alert("Hata", "Bilgiler kaydedilemedi.");
      }
    });
  };

  const renderInput = (
    icon: any, label: string, value: string, setValue: any,
    placeholder: string, keyboardType: any = 'default', autoCapitalize: any = 'words'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.inputIconBox}>
          {React.createElement(icon, { color: '#FF7A00', size: 18 })}
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#555"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kişisel Bilgiler</Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Avatar Card */}
            <View style={styles.avatarCard}>
              <View style={styles.avatarGlow}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{firstName?.[0] || ''}{lastName?.[0] || ''}</Text>
                </View>
              </View>
              <Text style={styles.userName}>{firstName} {lastName}</Text>
              <View style={styles.levelBadge}>
                <Zap color="#FF7A00" size={12} />
                <Text style={styles.levelBadgeText}>Uzman Kurye</Text>
              </View>
            </View>

            {/* Courier Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                {[
                  { icon: Star,       color: '#FFC107', val: '4.9',  label: 'Puan'       },
                  { icon: CheckCircle, color: '#4CAF50', val: '1.240', label: 'Teslimat'   },
                  { icon: Zap,        color: '#FF7A00', val: '12 gün', label: 'Seri'       },
                ].map(({ icon: Icon, color, val, label }) => (
                  <View key={label} style={styles.statItem}>
                    <Icon color={color} size={18} />
                    <Text style={styles.statVal}>{val}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.levelSection}>
                <View style={styles.levelRow}>
                  <Text style={styles.levelFrom}>Uzman</Text>
                  <Text style={styles.levelPct}>%68</Text>
                  <Text style={styles.levelTo}>Elite</Text>
                </View>
                <View style={styles.levelTrack}>
                  <Animated.View style={[styles.levelBar, {
                    width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                  }]} />
                </View>
                <Text style={styles.levelHint}>Elite seviyesine 42 teslimat kaldı</Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Profil Bilgileri</Text>
              {renderInput(User, 'Ad',     firstName, setFirstName, 'Adınız')}
              {renderInput(User, 'Soyad',  lastName,  setLastName,  'Soyadınız')}
              {renderInput(Mail, 'E-posta', email,    setEmail,     'E-posta adresiniz', 'email-address', 'none')}
              {renderInput(Phone, 'Telefon', phone,   setPhone,     'Telefon numaranız', 'phone-pad', 'none')}
            </View>

            {/* Badges */}
            <Text style={styles.sectionTitle}>🏅 Müşteri Rozetlerim</Text>
            <Text style={styles.sectionSub}>Müşterilerin sana verdiği ödüller</Text>
            <View style={styles.badgeGrid}>
              {BADGES.map(b => (
                <View
                  key={b.id}
                  style={[
                    styles.badgeCard,
                    b.earned
                      ? { borderColor: b.color + '45', backgroundColor: b.color + '10' }
                      : styles.badgeLocked,
                  ]}
                >
                  <Text style={styles.badgeEmoji}>{b.earned ? b.emoji : '🔒'}</Text>
                  <Text style={[styles.badgeTitle, b.earned && { color: b.color }]}>{b.title}</Text>
                  <Text style={styles.badgeDesc}>{b.desc}</Text>
                  {b.earned && <View style={[styles.earnedDot, { backgroundColor: b.color }]} />}
                </View>
              ))}
            </View>

            {/* Save Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.saveBtn, saved && styles.saveBtnDone]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                {saved ? (
                  <>
                    <CheckCircle color="white" size={22} />
                    <Text style={styles.saveBtnTxt}>Kaydedildi!</Text>
                  </>
                ) : (
                  <Text style={styles.saveBtnTxt}>Değişiklikleri Kaydet</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#111827', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 50 },

  // Avatar Card
  avatarCard: { alignItems: 'center', marginBottom: 22 },
  avatarGlow: { padding: 5, borderRadius: 55, backgroundColor: 'rgba(255,122,0,0.15)', marginBottom: 14 },
  avatarBox: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FF7A00', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#0B1220' },
  avatarText: { color: 'white', fontSize: 34, fontWeight: '900', letterSpacing: 1 },
  userName: { color: 'white', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,122,0,0.12)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,122,0,0.25)' },
  levelBadgeText: { color: '#FF7A00', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Stats Card
  statsCard: { backgroundColor: '#111827', borderRadius: 28, padding: 20, marginBottom: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  statItem: { alignItems: 'center', gap: 5 },
  statVal: { color: 'white', fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#666', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  levelSection: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 16 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  levelFrom: { color: '#FF7A00', fontWeight: '800', fontSize: 13 },
  levelPct: { color: 'white', fontWeight: '900', fontSize: 16 },
  levelTo: { color: '#888', fontWeight: '700', fontSize: 13 },
  levelTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  levelBar: { height: '100%', backgroundColor: '#FF7A00', borderRadius: 4, shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6 },
  levelHint: { color: '#666', fontSize: 11, textAlign: 'center' },

  // Form
  formCard: { backgroundColor: '#111827', borderRadius: 28, padding: 22, marginBottom: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  formTitle: { color: 'white', fontSize: 16, fontWeight: '800', marginBottom: 18 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  inputIconBox: { width: 48, height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,122,0,0.06)' },
  input: { flex: 1, height: 50, color: 'white', fontSize: 15, paddingHorizontal: 14 },

  // Badges
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  sectionSub: { color: '#666', fontSize: 13, marginBottom: 16 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  badgeCard: {
    width: '30.5%', padding: 14, borderRadius: 20, alignItems: 'center',
    borderWidth: 1.5, backgroundColor: '#111827',
    position: 'relative', overflow: 'hidden',
  },
  badgeLocked: { borderColor: '#2a3444', opacity: 0.45 },
  badgeEmoji: { fontSize: 26, marginBottom: 8 },
  badgeTitle: { color: 'white', fontSize: 11, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  badgeDesc: { color: '#555', fontSize: 9, textAlign: 'center', lineHeight: 13 },
  earnedDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },

  // Save
  saveBtn: {
    backgroundColor: '#FF7A00', height: 62, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  saveBtnDone: { backgroundColor: '#4CAF50', shadowColor: '#4CAF50' },
  saveBtnTxt: { color: 'white', fontSize: 16, fontWeight: '900' },
});
