import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, CheckCircle2, MapPin, Receipt, Clock } from 'lucide-react-native';

export default function TransactionDetailScreen({ navigation, route }: any) {
  // Mock data for the specific transaction
  const id = route?.params?.id || 't1';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşlem Detayı</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.heroSection}>
          <View style={styles.successIcon}>
            <CheckCircle2 color="#4CAF50" size={48} />
          </View>
          <Text style={styles.heroAmount}>+₺145,50</Text>
          <Text style={styles.heroStatus}>Başarıyla Tamamlandı</Text>
          <Text style={styles.heroDate}>30 Mayıs 2026 • 14:32</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sipariş Bilgileri</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>İşlem ID</Text>
            <Text style={styles.infoValue}>#{id.toUpperCase()}8F92A</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kategori</Text>
            <Text style={styles.infoValue}>Teslimat Ücreti</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.routeBox}>
            <View style={styles.routePoint}>
              <MapPin color="#4CAF50" size={16} />
              <Text style={styles.routeText}>McDonald's Kadıköy</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <MapPin color="#FF7A00" size={16} />
              <Text style={styles.routeText}>Moda Sahil (3.2 km)</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ücret Kırılımı</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teslimat Ücreti (3.2 km)</Text>
            <Text style={styles.infoValue}>₺102,60</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Yoğunluk Bonusu (1.2x)</Text>
            <Text style={styles.infoValue}>₺20,52</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Müşteri Bahşişi</Text>
            <Text style={styles.infoValue}>₺30,00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: '#FF3B30' }]}>Platform Kesintisi (%5)</Text>
            <Text style={[styles.infoValue, { color: '#FF3B30' }]}>-₺7,62</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: 'white', fontWeight: 'bold' }]}>Net Kazanç</Text>
            <Text style={[styles.infoValue, { color: '#4CAF50', fontWeight: 'bold', fontSize: 16 }]}>₺145,50</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.supportBtn}>
          <Receipt color="white" size={20} />
          <Text style={styles.supportBtnText}>Sorun Bildir</Text>
        </TouchableOpacity>

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
  
  heroSection: { alignItems: 'center', marginVertical: 30 },
  successIcon: { backgroundColor: 'rgba(76,175,80,0.1)', padding: 20, borderRadius: 50, marginBottom: 16 },
  heroAmount: { color: 'white', fontSize: 40, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  heroStatus: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  heroDate: { color: '#888', fontSize: 13 },

  card: { backgroundColor: '#111827', borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sectionTitle: { color: '#888', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { color: '#ccc', fontSize: 14 },
  infoValue: { color: 'white', fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 8 },

  routeBox: { backgroundColor: '#0B1220', borderRadius: 12, padding: 16, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeText: { color: 'white', fontSize: 14, fontWeight: '500' },
  routeLine: { width: 2, height: 20, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 7, marginVertical: 4 },

  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  supportBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
