import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, ScrollView, TextInput, Alert } from 'react-native';
import { ArrowLeft, Building2, CheckCircle, Info, Landmark } from 'lucide-react-native';
import { useAuth } from '../../../store/useAuth';

export default function PaymentMethodsScreen({ navigation }: any) {
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [iban, setIban] = useState('TR');
  const [bankName, setBankName] = useState('');
  const [fullName, setFullName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`.trim());

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  const handleSave = () => {
    if (iban.length < 26) {
      Alert.alert('Hata', 'Lütfen geçerli bir IBAN numarası girin.');
      return;
    }
    Alert.alert('Başarılı', 'Banka hesap bilgileriniz güncellendi. Ödemeleriniz bu hesaba yapılacaktır.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme Yöntemleri</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
          
          <View style={styles.infoCard}>
            <Info color="#3B82F6" size={24} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Ödeme Takvimi</Text>
              <Text style={styles.infoDesc}>
                Kabul ettiğiniz ve başarıyla tamamladığınız teslimatların ücretleri, her hafta <Text style={styles.boldText}>Çarşamba</Text> günü kayıtlı IBAN numaranıza otomatik olarak yatırılır.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Banka Hesap Bilgileri</Text>
          <Text style={styles.sectionSub}>Ödemelerin yapılacağı vadesiz TL hesabını girin.</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Soyad (Hesap Sahibi)</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Örn: Ahmet Yılmaz"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Banka Adı (Opsiyonel)</Text>
              <View style={styles.inputWithIcon}>
                <Building2 color="#666" size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, paddingHorizontal: 0 }]}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Örn: Garanti BBVA"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IBAN Numarası</Text>
              <View style={[styles.inputWithIcon, iban.length === 26 ? styles.inputSuccess : null]}>
                <Landmark color={iban.length === 26 ? "#4CAF50" : "#666"} size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1, borderWidth: 0, paddingHorizontal: 0, color: iban.length === 26 ? '#4CAF50' : 'white', fontWeight: 'bold' }]}
                  value={iban}
                  onChangeText={(text) => {
                    const clean = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                    if (clean.startsWith('TR')) {
                       setIban(clean.substring(0, 26));
                    } else if (clean.length === 0) {
                       setIban('TR');
                    } else {
                       setIban('TR' + clean.substring(0, 24));
                    }
                  }}
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  placeholderTextColor="#666"
                  maxLength={26}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <CheckCircle color="white" size={20} />
            <Text style={styles.saveBtnText}>Hesabı Kaydet</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: '#111827' },
  backBtn: { padding: 5 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  infoCard: { flexDirection: 'row', backgroundColor: 'rgba(59,130,246,0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)', marginBottom: 24, alignItems: 'flex-start' },
  infoTextContainer: { flex: 1, marginLeft: 12 },
  infoTitle: { color: '#3B82F6', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  infoDesc: { color: '#D1D5DB', fontSize: 13, lineHeight: 20 },
  boldText: { fontWeight: 'bold', color: 'white' },

  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  sectionSub: { color: '#888', fontSize: 13, marginBottom: 20 },

  formContainer: { backgroundColor: '#111827', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputGroup: { marginBottom: 20 },
  label: { color: '#aaa', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#0B1220', borderRadius: 12, paddingHorizontal: 16, height: 52, color: 'white', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B1220', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', height: 52 },
  inputIcon: { paddingHorizontal: 16 },
  inputSuccess: { borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.05)' },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FF7A00', height: 60, borderRadius: 20, marginTop: 10, shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
