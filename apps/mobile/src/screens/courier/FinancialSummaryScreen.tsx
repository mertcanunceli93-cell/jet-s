import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react-native';
import api from '../../lib/api';
import { useEffect, useState } from 'react';

export default function FinancialSummaryScreen({ navigation }: any) {
  const [stats, setStats] = useState({ totalEarnings: 0, totalDeliveries: 0 });

  useEffect(() => {
    api.get('/couriers/stats').then(res => {
      if (res.data?.data) {
        setStats({
          totalEarnings: res.data.data.totalEarnings || 0,
          totalDeliveries: res.data.data.totalDeliveries || 0,
        });
      }
    }).catch(console.error);
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mali Özet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>TOPLAM KAZANÇ (BU AY)</Text>
            <Text style={styles.summaryAmount}>₺{stats.totalEarnings.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Teslimatlar</Text>
              <Text style={styles.summaryStatVal}>{stats.totalDeliveries}</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Bahşiş</Text>
              <Text style={styles.summaryStatVal}>₺450,00</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Kesinti</Text>
              <Text style={[styles.summaryStatVal, { color: '#FF3B30' }]}>-₺996,00</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Aylık Analiz</Text>
        {[
          { month: 'Mayıs 2026', earn: '12.450,50', deliveries: 142, trend: '+15%' },
          { month: 'Nisan 2026', earn: '10.820,00', deliveries: 125, trend: '+5%' },
          { month: 'Mart 2026',  earn: '10.300,75', deliveries: 118, trend: '-2%' },
        ].map((item, i) => (
          <View key={i} style={styles.monthCard}>
            <View style={styles.monthLeft}>
              <Calendar color="#3B82F6" size={24} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.monthText}>{item.month}</Text>
                <Text style={styles.monthSub}>{item.deliveries} Teslimat</Text>
              </View>
            </View>
            <View style={styles.monthRight}>
              <Text style={styles.monthAmount}>₺{item.earn}</Text>
              <Text style={[styles.monthTrend, item.trend.startsWith('-') ? { color: '#FF3B30' } : { color: '#4CAF50' }]}>
                {item.trend}
              </Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  
  summaryCard: { backgroundColor: '#111827', borderRadius: 24, padding: 24, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  summaryTop: { alignItems: 'center', marginBottom: 20 },
  summaryLabel: { color: '#888', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 8 },
  summaryAmount: { color: 'white', fontSize: 36, fontWeight: '900' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },
  summaryStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryStatItem: { alignItems: 'center', flex: 1 },
  summaryStatLabel: { color: '#666', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  summaryStatVal: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  monthCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111827', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  monthLeft: { flexDirection: 'row', alignItems: 'center' },
  monthText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  monthSub: { color: '#666', fontSize: 12, marginTop: 2 },
  monthRight: { alignItems: 'flex-end' },
  monthAmount: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  monthTrend: { fontSize: 12, fontWeight: 'bold', marginTop: 2 }
});
