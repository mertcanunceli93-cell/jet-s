import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { ArrowLeft, Shield, Key, Smartphone } from 'lucide-react-native';

export default function SecuritySettingsScreen({ navigation }: any) {
  const [twoFactor, setTwoFactor] = useState(false);

  const handleChangePassword = () => {
    Alert.alert(
      'Şifre Değiştir',
      'Şifre sıfırlama bağlantısı kayıtlı e-posta adresinize gönderilecektir. Onaylıyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Gönder', onPress: () => Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı gönderildi.') }
      ]
    );
  };

  const handle2FAToggle = (val: boolean) => {
    if (val) {
      Alert.alert(
        'İki Adımlı Doğrulama',
        '2FA kurulumu için SMS ile telefonunuza bir kod gönderilecek.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Devam Et', onPress: () => {
            Alert.alert('Kurulum Tamamlandı', '2FA başarıyla aktif edildi.');
            setTwoFactor(true);
          }}
        ]
      );
    } else {
      Alert.alert(
        '2FA Kapat',
        'İki adımlı doğrulamayı devre dışı bırakmak istediğinize emin misiniz? Bu işlem hesabınızı daha az güvenli hale getirir.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Devre Dışı Bırak', onPress: () => {
            setTwoFactor(false);
            Alert.alert('Kapatıldı', 'İki adımlı doğrulama devre dışı bırakıldı.');
          }, style: 'destructive' }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Güvenlik</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconHeader}>
          <View style={styles.shieldGlow}>
            <Shield color="#FF7A00" size={48} />
          </View>
          <Text style={styles.title}>Hesap Güvenliği</Text>
          <Text style={styles.subtitle}>Hesabınızı daha güvende tutun.</Text>
        </View>

        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                <Key color="#3B82F6" size={20} />
              </View>
              <Text style={styles.menuText}>Şifre Değiştir</Text>
            </View>
            <Text style={styles.menuSubText}>Son değişim: 2 ay önce</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                <Smartphone color="#F59E0B" size={20} />
              </View>
              <View>
                <Text style={styles.menuText}>İki Adımlı Doğrulama (2FA)</Text>
                <Text style={styles.menuDesc}>SMS veya Authy ile doğrulama</Text>
              </View>
            </View>
            <Switch 
              value={twoFactor} 
              onValueChange={handle2FAToggle} 
              trackColor={{ false: '#333', true: '#F59E0B' }}
            />
          </View>
        </View>
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
  iconHeader: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  shieldGlow: { padding: 20, borderRadius: 50, backgroundColor: 'rgba(255,122,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,122,0,0.2)', marginBottom: 15 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 14, marginTop: 5 },
  settingsGroup: { backgroundColor: '#111827', borderRadius: 24, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  menuSubText: { color: '#666', fontSize: 12 },
  menuDesc: { color: '#888', fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }
});
