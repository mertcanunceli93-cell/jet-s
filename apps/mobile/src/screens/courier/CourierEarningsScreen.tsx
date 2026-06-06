import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, Animated,
} from 'react-native';
import {
  ArrowUpRight, ArrowDownRight, Wallet, Activity,
  CreditCard, TrendingUp, Award, Gift, Zap, Star, Package,
} from 'lucide-react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import api from '../../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Static mock data ──────────────────────────────────────────────────────────

const MOCK_DAILY_BARS = [
  { value: 15,  label: '00', frontColor: 'rgba(255,122,0,0.5)', topLabelComponent: () => null },
  { value: 0,   label: '04', frontColor: 'rgba(255,255,255,0.08)', topLabelComponent: () => null },
  { value: 45,  label: '08', frontColor: 'rgba(255,122,0,0.5)', topLabelComponent: () => null },
  { value: 120, label: '12', frontColor: 'rgba(255,122,0,0.5)', topLabelComponent: () => null },
  { value: 180, label: '16', frontColor: 'rgba(255,122,0,0.5)', topLabelComponent: () => null },
  { value: 210, label: '20', frontColor: '#FF7A00', topLabelComponent: () => <Text style={{ color: '#FF7A00', fontSize: 9, fontWeight: 'bold', marginBottom: 2 }}>Şimdi</Text> },
];

const WEEKLY_BARS = [
  { value: 185, label: 'Pzt', frontColor: 'rgba(255,122,0,0.5)', topLabelComponent: () => null },
  { value: 240, label: 'Sal', frontColor: 'rgba(255,122,0,0.5)', topLabelComponent: () => null },
  { value: 190, label: 'Çar', frontColor: 'rgba(255,122,0,0.5)', topLabelComponent: () => null },
  { value: 310, label: 'Per', frontColor: '#FF7A00', topLabelComponent: () => <Text style={{ color: '#FF7A00', fontSize: 9, fontWeight: 'bold', marginBottom: 2 }}>Bugün</Text> },
  { value: 280, label: 'Cum', frontColor: 'rgba(255,122,0,0.5)' },
  { value: 350, label: 'Cmt', frontColor: 'rgba(255,122,0,0.5)' },
  { value: 420, label: 'Paz', frontColor: 'rgba(255,122,0,0.5)' },
];

const MOCK_MONTHLY_BARS = [
  { value: 1200, label: 'H1', frontColor: 'rgba(255,122,0,0.5)', topLabelComponent: () => null },
  { value: 1450, label: 'H2', frontColor: 'rgba(255,122,0,0.5)', topLabelComponent: () => null },
  { value: 1600, label: 'H3', frontColor: '#FF7A00', topLabelComponent: () => <Text style={{ color: '#FF7A00', fontSize: 9, fontWeight: 'bold', marginBottom: 2 }}>Bu Hafta</Text> },
  { value: 1850, label: 'H4', frontColor: 'rgba(255,122,0,0.5)' },
];

const EARNINGS_PIE = [
  { value: 65, color: '#FF7A00', text: '%65', label: 'Teslimat Ücreti' },
  { value: 15, color: '#4CAF50', text: '%15', label: 'Bahşiş' },
  { value: 12, color: '#3B82F6', text: '%12', label: 'Surge Bonusu' },
  { value: 8,  color: '#EC4899', text: '%8',  label: 'Kesinti' },
];

const MOCK_TRANSACTIONS = [
  { id: 't1', type: 'earn',     title: 'Teslimat Tamamlandı', sub: "McDonald's → Kadıköy",    amount: '+₺145.50', time: '14:32', color: '#4CAF50' },
  { id: 't2', type: 'tip',      title: 'Bahşiş Alındı',       sub: 'Müşteri: ⭐⭐⭐⭐⭐',      amount: '+₺25.00',  time: '14:35', color: '#4CAF50' },
  { id: 't3', type: 'surge',    title: 'Yoğunluk Bonusu',     sub: 'Kadıköy 1.5x Bölgesi',    amount: '+₺32.75',  time: '12:10', color: '#3B82F6' },
  { id: 't4', type: 'withdraw', title: 'Bakiye Çekimi',        sub: 'Garanti BBVA *4521',       amount: '-₺500.00', time: 'Dün',    color: '#FF3B30' },
  { id: 't5', type: 'earn',     title: 'Teslimat Tamamlandı', sub: 'Starbucks → Cihangir',     amount: '+₺98.25',  time: 'Dün',    color: '#4CAF50' },
];

const BADGES = [
  { id: 'speed', emoji: '🚀', title: 'Hız Ustası',    desc: '10+ teslimat/gün',        color: '#FF7A00', earned: true  },
  { id: 'star',  emoji: '⭐', title: '5 Yıldız',      desc: '100+ mükemmel teslimat',   color: '#FFC107', earned: true  },
  { id: 'care',  emoji: '🛡️', title: 'Özenli Taşıma', desc: 'Hiç hasar bildirimi yok', color: '#4CAF50', earned: true  },
  { id: 'pro',   emoji: '💼', title: 'Profesyonel',   desc: '90 gün kesintisiz',        color: '#3B82F6', earned: false },
  { id: 'top',   emoji: '🏆', title: 'En İyi Kurye',  desc: 'Bölgenin 1 numarası',      color: '#EC4899', earned: false },
];

const PERIOD_OPTIONS = ['Günlük', 'Haftalık', 'Aylık'];

// ─── CountingNumber ────────────────────────────────────────────────────────────
function CountingNumber({ value, style }: { value: number; style: any }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const duration = 1800;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(value * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <Text style={style}>₺{display.toFixed(2)}</Text>;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function CourierEarningsScreen({ navigation }: any) {
  const [stats, setStats] = useState({ balance: 0, net: 0, pending: 0, total: 0, jobs: 0 });
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState(1); // Haftalık default
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/couriers/stats');
        const total = res.data.data.totalEarnings || 0;
        const jobs = res.data.data.totalDeliveries || 0;
        setStats({ balance: total, net: total * 0.92, pending: 0, total, jobs });
      } catch { /* ignore */ } finally {
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#FF7A00" size="large" />
      </View>
    );
  }

  const weeklyTotal = WEEKLY_BARS.reduce((a, b) => a + b.value, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Finans & Kazançlar</Text>
          <Text style={styles.headerSub}>Detaylı mali analizin</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <CreditCard color="#FF7A00" size={22} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        {/* ── Hero Balance Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>KULLANILABİLİR BAKİYE</Text>
              <CountingNumber value={stats.balance} style={styles.heroBalance} />
            </View>
            <View style={styles.walletIcon}>
              <Wallet color="#FF7A00" size={28} />
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <View style={styles.heroDot} />
              <Text style={styles.heroStatText}>Bekleyen: <Text style={styles.heroStatVal}>₺0.00</Text></Text>
            </View>
            <View style={styles.heroStatItem}>
              <Activity color="#4CAF50" size={12} />
              <Text style={styles.heroStatText}>{stats.jobs} Teslimat</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.85} onPress={() => navigation.navigate('PaymentMethods')}>
            <ArrowUpRight color="black" size={20} />
            <Text style={styles.withdrawText}>BAKİYEYİ BANKAYA ÇEK</Text>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickItem} activeOpacity={0.75} onPress={() => navigation.navigate('Transactions')}>
              <View style={[styles.quickIcon, { backgroundColor: '#3B82F618' }]}>
                <Activity color="#3B82F6" size={20} />
              </View>
              <Text style={styles.quickLabel}>İşlem{'\n'}Geçmişi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickItem} activeOpacity={0.75} onPress={() => navigation.navigate('FinancialSummary')}>
              <View style={[styles.quickIcon, { backgroundColor: '#8B5CF618' }]}>
                <TrendingUp color="#8B5CF6" size={20} />
              </View>
              <Text style={styles.quickLabel}>Mali{'\n'}Özet</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickItem} activeOpacity={0.75} onPress={() => navigation.navigate('Referral')}>
              <View style={[styles.quickIcon, { backgroundColor: '#EC489918' }]}>
                <Gift color="#EC4899" size={20} />
              </View>
              <Text style={styles.quickLabel}>Arkadaşı{'\n'}Davet</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Period Selector ── */}
        <View style={styles.periodRow}>
          {PERIOD_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              style={[styles.periodBtn, activePeriod === i && styles.periodBtnActive]}
              onPress={() => setActivePeriod(i)}
            >
              <Text style={[styles.periodText, activePeriod === i && styles.periodTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Bar Chart Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>{activePeriod === 0 ? 'Günlük Performans' : activePeriod === 1 ? 'Haftalık Performans' : 'Aylık Performans'}</Text>
              <Text style={styles.cardSub}>Bu {activePeriod === 0 ? 'günün' : activePeriod === 1 ? 'haftanın' : 'ayın'} kazanç özeti</Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingUp color="#4CAF50" size={14} />
              <Text style={styles.trendText}>{activePeriod === 0 ? '+4%' : activePeriod === 1 ? '+12%' : '+23%'}</Text>
            </View>
          </View>

          <BarChart
            data={activePeriod === 0 ? MOCK_DAILY_BARS : activePeriod === 1 ? WEEKLY_BARS : MOCK_MONTHLY_BARS}
            barWidth={activePeriod === 0 ? 32 : activePeriod === 1 ? 28 : 45}
            spacing={activePeriod === 0 ? 16 : activePeriod === 1 ? 14 : 25}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: '#555', fontSize: 10 }}
            noOfSections={4}
            maxValue={activePeriod === 0 ? 250 : activePeriod === 1 ? 400 : 2000}
            barBorderRadius={8}
            backgroundColor="transparent"
            width={SCREEN_WIDTH - 80}
            height={150}
            labelWidth={activePeriod === 0 ? 35 : activePeriod === 1 ? 32 : 50}
            xAxisLabelTextStyle={{ color: '#666', fontSize: 10, fontWeight: 'bold' }}
          />

          <View style={styles.chartStats}>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatVal}>₺{activePeriod === 0 ? MOCK_DAILY_BARS.reduce((a, b) => a + b.value, 0) : activePeriod === 1 ? WEEKLY_BARS.reduce((a, b) => a + b.value, 0) : MOCK_MONTHLY_BARS.reduce((a, b) => a + b.value, 0)}</Text>
              <Text style={styles.chartStatLabel}>Bu {activePeriod === 0 ? 'Gün' : activePeriod === 1 ? 'Hafta' : 'Ay'}</Text>
            </View>
            <View style={styles.chartStatDivider} />
            <View style={styles.chartStat}>
              <Text style={styles.chartStatVal}>₺{activePeriod === 0 ? Math.round(MOCK_DAILY_BARS.reduce((a, b) => a + b.value, 0) / 3) : activePeriod === 1 ? Math.round(WEEKLY_BARS.reduce((a, b) => a + b.value, 0) / 4) : Math.round(MOCK_MONTHLY_BARS.reduce((a, b) => a + b.value, 0) / 3)}</Text>
              <Text style={styles.chartStatLabel}>Ortalama</Text>
            </View>
            <View style={styles.chartStatDivider} />
            <View style={styles.chartStat}>
              <Text style={styles.chartStatVal}>{activePeriod === 0 ? '12:00' : activePeriod === 1 ? 'Çarşamba' : '2. Hafta'}</Text>
              <Text style={styles.chartStatLabel}>En Yüksek</Text>
            </View>
          </View>
        </View>

        {/* ── Earnings Breakdown ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kazanç Kırılımı</Text>
          <Text style={styles.cardSub}>Gelirinin nasıl oluştuğu</Text>

          <View style={styles.pieRow}>
            <PieChart
              data={EARNINGS_PIE}
              donut
              innerRadius={50}
              radius={80}
              innerCircleColor="#111827"
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#FF7A00', fontSize: 18, fontWeight: '900' }}>%92</Text>
                  <Text style={{ color: '#666', fontSize: 9 }}>NET</Text>
                </View>
              )}
            />
            <View style={styles.pieLegend}>
              {EARNINGS_PIE.map(item => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.legendLabel}>{item.label}</Text>
                  </View>
                  <Text style={[styles.legendPct, { color: item.color }]}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={styles.pieNote}>* Platform kesintisi %8 olarak uygulanmaktadır.</Text>
        </View>

        {/* ── Badges ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏅 Rozetlerim</Text>
          <Text style={styles.sectionSub}>{BADGES.filter(b => b.earned).length}/{BADGES.length} kazanıldı</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
          {BADGES.map(b => (
            <View
              key={b.id}
              style={[
                styles.badgeCard,
                b.earned
                  ? { borderColor: b.color + '40', backgroundColor: b.color + '10' }
                  : { borderColor: '#333', opacity: 0.5 },
              ]}
            >
              <Text style={styles.badgeEmoji}>{b.earned ? b.emoji : '🔒'}</Text>
              <Text style={[styles.badgeTitle, b.earned && { color: b.color }]}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Transactions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}><Text style={styles.seeAll}>Tümünü Gör</Text></TouchableOpacity>
        </View>

        {MOCK_TRANSACTIONS.map(tx => (
          <TouchableOpacity key={tx.id} style={styles.txItem} activeOpacity={0.75} onPress={() => navigation.navigate('TransactionDetail', { id: tx.id })}>
            <View style={[styles.txIcon, { backgroundColor: tx.color + '18' }]}>
              {tx.type === 'withdraw'
                ? <ArrowUpRight color={tx.color} size={20} />
                : tx.type === 'surge'
                  ? <Zap color={tx.color} size={20} />
                  : <ArrowDownRight color={tx.color} size={20} />
              }
            </View>
            <View style={styles.txBody}>
              <Text style={styles.txTitle}>{tx.title}</Text>
              <Text style={styles.txSub}>{tx.sub}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={[styles.txAmount, { color: tx.color }]}>{tx.amount}</Text>
              <Text style={styles.txTime}>{tx.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  loader: { flex: 1, backgroundColor: '#0B1220', justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingVertical: 18,
    backgroundColor: '#111827',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  headerSub: { color: '#666', fontSize: 13, marginTop: 2 },
  headerBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 20, paddingBottom: 40 },

  // Hero Card
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 32, padding: 25, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,122,0,0.2)',
    overflow: 'hidden',
    shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 30, elevation: 10,
  },
  heroGlow: {
    position: 'absolute', top: -60, right: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,122,0,0.08)',
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  heroLabel: { color: '#777', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  heroBalance: { color: 'white', fontSize: 44, fontWeight: '900', letterSpacing: -1 },
  walletIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,122,0,0.2)' },

  heroStats: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  heroStatItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC107' },
  heroStatText: { color: '#888', fontSize: 13 },
  heroStatVal: { color: 'white', fontWeight: 'bold' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 },

  withdrawBtn: {
    backgroundColor: 'white', height: 54, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginBottom: 20,
  },
  withdrawText: { color: 'black', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },

  quickActions: { flexDirection: 'row', justifyContent: 'space-around' },
  quickItem: { alignItems: 'center', gap: 8 },
  quickIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: '#888', fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 0.3 },

  // Period
  periodRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  periodBtn: { flex: 1, height: 40, borderRadius: 12, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  periodBtnActive: { backgroundColor: '#FF7A00', borderColor: '#FF7A00' },
  periodText: { color: '#666', fontWeight: '700', fontSize: 13 },
  periodTextActive: { color: 'white' },

  // Card
  card: { backgroundColor: '#111827', borderRadius: 28, padding: 22, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardTitle: { color: 'white', fontSize: 17, fontWeight: '800', marginBottom: 4 },
  cardSub: { color: '#666', fontSize: 12 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(76,175,80,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  trendText: { color: '#4CAF50', fontWeight: '800', fontSize: 12 },

  chartStats: { flexDirection: 'row', marginTop: 18 },
  chartStat: { flex: 1, alignItems: 'center' },
  chartStatVal: { color: 'white', fontWeight: '900', fontSize: 16 },
  chartStatLabel: { color: '#666', fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  chartStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  // Pie
  pieRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 16 },
  pieLegend: { flex: 1, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  legendPct: { fontWeight: '900', fontSize: 13 },
  pieNote: { color: '#555', fontSize: 11, marginTop: 16, textAlign: 'center' },

  // Badges
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: 'white', fontSize: 17, fontWeight: '800' },
  sectionSub: { color: '#FF7A00', fontSize: 12, fontWeight: '700' },
  seeAll: { color: '#FF7A00', fontSize: 13, fontWeight: '700' },
  badgesScroll: { gap: 14, paddingBottom: 4, marginBottom: 24 },
  badgeCard: { width: 110, padding: 16, borderRadius: 22, alignItems: 'center', borderWidth: 1, backgroundColor: '#111827' },
  badgeEmoji: { fontSize: 30, marginBottom: 8 },
  badgeTitle: { color: 'white', fontSize: 12, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  badgeDesc: { color: '#666', fontSize: 10, textAlign: 'center' },

  // Transactions
  txItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#111827', padding: 16, borderRadius: 18,
    marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)',
  },
  txIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txBody: { flex: 1 },
  txTitle: { color: 'white', fontWeight: '700', fontSize: 14 },
  txSub: { color: '#666', fontSize: 12, marginTop: 3 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontWeight: '900', fontSize: 15 },
  txTime: { color: '#555', fontSize: 11, marginTop: 3 },
});
