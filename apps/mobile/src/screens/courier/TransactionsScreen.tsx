import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react-native';

const MOCK_TRANSACTIONS = [
  { id: 't1', type: 'earn',     title: 'Teslimat Tamamlandı', sub: "McDonald's → Kadıköy",    amount: '+₺145.50', time: 'Bugün, 14:32', color: '#4CAF50' },
  { id: 't2', type: 'tip',      title: 'Bahşiş Alındı',       sub: 'Müşteri: ⭐⭐⭐⭐⭐',      amount: '+₺25.00',  time: 'Bugün, 14:35', color: '#4CAF50' },
  { id: 't3', type: 'surge',    title: 'Yoğunluk Bonusu',     sub: 'Kadıköy 1.5x Bölgesi',    amount: '+₺32.75',  time: 'Bugün, 12:10', color: '#3B82F6' },
  { id: 't4', type: 'withdraw', title: 'Bakiye Çekimi',        sub: 'Garanti BBVA *4521',       amount: '-₺500.00', time: 'Dün, 09:00',   color: '#FF3B30' },
  { id: 't5', type: 'earn',     title: 'Teslimat Tamamlandı', sub: 'Starbucks → Cihangir',     amount: '+₺98.25',  time: 'Dün, 18:45',   color: '#4CAF50' },
  { id: 't6', type: 'earn',     title: 'Teslimat Tamamlandı', sub: 'Burger King → Ümraniye',   amount: '+₺122.40', time: 'Dün, 15:30',   color: '#4CAF50' },
  { id: 't7', type: 'earn',     title: 'Teslimat Tamamlandı', sub: 'Migros → Beşiktaş',        amount: '+₺222.80', time: '28 May, 11:20', color: '#4CAF50' },
];

export default function TransactionsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşlem Geçmişi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
  txTime: { color: '#555', fontSize: 11, marginTop: 4 },
});
