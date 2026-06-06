import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, ScrollView, TextInput, Alert } from 'react-native';
import { ArrowLeft, Car, CheckCircle, Navigation, AlertCircle, Clock, Shield, FileText, Bike, AlertTriangle } from 'lucide-react-native';

interface VehicleDoc {
  id: string;
  title: string;
  desc: string;
  status: 'approved' | 'expiring' | 'pending';
  expiry: string | null;
  icon: any;
  color: string;
}

const DOCUMENTS: VehicleDoc[] = [
  { id: 'dl',  title: 'Ehliyet',                         desc: 'B Sınıfı veya üzeri sürücü belgesi',  status: 'approved', expiry: '15.06.2028', icon: Shield,       color: '#4CAF50' },
  { id: 'reg', title: 'Araç Ruhsatı',                    desc: 'Araç tescil belgesi',                 status: 'approved', expiry: '31.12.2025', icon: FileText,     color: '#4CAF50' },
  { id: 'p1',  title: 'P1 Psikoteknik Belgesi',          desc: 'Ticari taşımacılık yeterlilik belgesi',status: 'expiring', expiry: '10.07.2025', icon: AlertCircle, color: '#FF9500' },
  { id: 'bg',  title: 'Sabıka Kaydı',                    desc: 'Son 6 ay içinde alınmış belge',       status: 'pending',  expiry: null,         icon: Clock,        color: '#3B82F6' },
];

const STATUS_CONFIG = {
  approved: { label: 'ONAYLANDI ✓',        bg: 'rgba(76,175,80,0.12)',    color: '#4CAF50' },
  expiring: { label: 'YAKINDA BİTİYOR ⚠',  bg: 'rgba(255,149,0,0.12)',   color: '#FF9500' },
  pending:  { label: 'YÜKLEME BEKLİYOR',   bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6' },
};

const VEHICLES = [
  { id: 'motocycle', title: 'Motosiklet', desc: 'Hızlı ve pratik', icon: Navigation },
  { id: 'car',       title: 'Otomobil',   desc: 'Geniş hacimli',  icon: Car },
  { id: 'bicycle',   title: 'Bisiklet',   desc: 'Çevre dostu',    icon: Bike },
];

export default function VehicleInfoScreen({ navigation }: any) {
  const [selected, setSelected] = useState('motocycle');
  const [plate,    setPlate]    = useState('34 ABC 123');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleSave = () => {
    Alert.alert('Kaydedildi', 'Araç bilgileriniz güncellendi.', [{ text: 'Tamam' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Araç Bilgileri</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Vehicle Type Selection */}
          <Text style={styles.sectionTitle}>Araç Tipi</Text>
          <Text style={styles.sectionSub}>Sipariş alırken kullanılacak araç tipini seçin.</Text>
          <View style={styles.vehicleGrid}>
            {VEHICLES.map(v => {
              const isActive = selected === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                  onPress={() => setSelected(v.id)}
                  activeOpacity={0.8}
                >
                  {isActive && (
                    <View style={styles.checkBadge}>
                      <CheckCircle color="white" size={13} />
                    </View>
                  )}
                  <View style={[styles.vehicleIcon, isActive && styles.vehicleIconActive]}>
                    <v.icon color={isActive ? '#FF7A00' : '#555'} size={30} />
                  </View>
                  <Text style={[styles.vehicleTitle, isActive && { color: '#FF7A00' }]}>{v.title}</Text>
                  <Text style={styles.vehicleDesc}>{v.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Plate Input */}
          <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Plaka</Text>
          <View style={styles.plateWrap}>
            <View style={styles.plateTR}><Text style={styles.plateTRTxt}>TR</Text></View>
            <TextInput
              style={styles.plateInput}
              value={plate}
              onChangeText={setPlate}
              placeholder="34 ABC 123"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
            />
          </View>

          {/* Documents Section */}
          <View style={styles.docSection}>
            <Text style={styles.sectionTitle}>Belge ve Onay Durumu</Text>
            <Text style={styles.sectionSub}>Kurye olarak çalışmak için gerekli belgeler</Text>

            {DOCUMENTS.map(doc => {
              const cfg = STATUS_CONFIG[doc.status];
              return (
                <View key={doc.id} style={styles.docItem}>
                  <View style={[styles.docIcon, { backgroundColor: doc.color + '18' }]}>
                    <doc.icon color={doc.color} size={20} />
                  </View>
                  <View style={styles.docBody}>
                    <Text style={styles.docTitle}>{doc.title}</Text>
                    <Text style={styles.docDesc}>{doc.desc}</Text>
                    {doc.expiry && (
                      <Text style={[styles.docExpiry, doc.status === 'expiring' && { color: '#FF9500' }]}>
                        SKT: {doc.expiry}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity style={[styles.statusBadge, { backgroundColor: cfg.bg }]} onPress={() => {
                    if (doc.status !== 'approved') {
                      Alert.alert('Belge Yükle', `${doc.title} belgesini güncellemek veya yüklemek istiyor musunuz?`, [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Yükle', onPress: () => Alert.alert('Başarılı', 'Kamera açılıyor...') }
                      ]);
                    }
                  }}>
                    <Text style={[styles.statusTxt, { color: cfg.color }]}>{cfg.label}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <View style={styles.docNote}>
              <Text style={styles.docNoteIcon}>📋</Text>
              <Text style={styles.docNoteText}>Belgelerinizi güncellemek için destek ekibimizle iletişime geçin.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <CheckCircle color="white" size={20} />
            <Text style={styles.saveBtnTxt}>Bilgileri Güncelle</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#111827', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 40 },

  sectionTitle: { color: 'white', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  sectionSub: { color: '#666', fontSize: 13, marginBottom: 16 },

  vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  vehicleCard: {
    width: '47%', backgroundColor: '#111827', borderRadius: 24, padding: 20,
    alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.04)',
    position: 'relative',
  },
  vehicleCardActive: {
    borderColor: '#FF7A00', backgroundColor: 'rgba(255,122,0,0.06)',
    shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 6,
  },
  checkBadge: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FF7A00', alignItems: 'center', justifyContent: 'center' },
  vehicleIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  vehicleIconActive: { backgroundColor: 'rgba(255,122,0,0.15)' },
  vehicleTitle: { color: '#ccc', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  vehicleDesc: { color: '#555', fontSize: 11, textAlign: 'center' },

  plateWrap: {
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, height: 64,
    overflow: 'hidden', borderWidth: 3, borderColor: '#ccc', marginBottom: 8,
  },
  plateTR: { backgroundColor: '#003399', width: 44, height: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 },
  plateTRTxt: { color: 'white', fontSize: 11, fontWeight: '900' },
  plateInput: { flex: 1, textAlign: 'center', fontSize: 26, fontWeight: '900', color: 'black', letterSpacing: 2 },

  // Documents
  docSection: { marginTop: 28 },
  docItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#111827', padding: 16, borderRadius: 18, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
  },
  docIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docBody: { flex: 1 },
  docTitle: { color: 'white', fontSize: 14, fontWeight: '800', marginBottom: 2 },
  docDesc: { color: '#666', fontSize: 12 },
  docExpiry: { color: '#888', fontSize: 11, marginTop: 3, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexShrink: 0 },
  statusTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  docNote: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 14, marginTop: 6, alignItems: 'flex-start' },
  docNoteIcon: { fontSize: 16 },
  docNoteText: { color: '#888', fontSize: 12, lineHeight: 18, flex: 1 },

  saveBtn: {
    backgroundColor: '#FF7A00', height: 60, borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 28,
    shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  saveBtnTxt: { color: 'white', fontSize: 16, fontWeight: '900' },
});
