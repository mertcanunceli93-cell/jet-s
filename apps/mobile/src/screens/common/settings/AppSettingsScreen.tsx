import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Alert, Vibration } from 'react-native';
import { ArrowLeft, Bell, Navigation, Moon, Volume2, MapPin } from 'lucide-react-native';
import { useTheme } from '../../../store/useTheme';

export default function AppSettingsScreen({ navigation }: any) {
  const { isDark, toggleTheme, colors } = useTheme();
  const [navApp, setNavApp] = useState('google');
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(true);

  const handleSoundChange = (val: boolean) => {
    setSound(val);
    if (val) {
      // Simulate playing a sound
      Alert.alert('Ses Açıldı', 'Uygulama içi bildirim sesleri aktif.');
    }
  };

  const handleVibrateChange = (val: boolean) => {
    setVibrate(val);
    if (val) {
      Vibration.vibrate(200);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Uygulama Ayarları</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Görünüm</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Moon color="#8B5CF6" size={20} />
              <View>
                <Text style={[styles.switchText, { color: colors.text }]}>Karanlık Tema</Text>
                <Text style={styles.descText}>Göz yormayan koyu mod</Text>
              </View>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: '#8B5CF6' }} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Harita ve Navigasyon</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity style={styles.radioRow} onPress={() => setNavApp('google')}>
            <View style={styles.radioLeft}>
              <MapPin color="#4CAF50" size={20} />
              <Text style={[styles.radioText, { color: colors.text }]}>Google Haritalar</Text>
            </View>
            <View style={[styles.radioCircle, navApp === 'google' && styles.radioCircleActive]}>
              {navApp === 'google' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
          {/* Sadece Google Haritalar istendiği için diğerlerini kaldırdık */}
        </View>

        <Text style={styles.sectionTitle}>Ses ve Bildirim</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Volume2 color="#FF7A00" size={20} />
              <View>
                <Text style={[styles.switchText, { color: colors.text }]}>Uygulama İçi Sesler</Text>
                <Text style={styles.descText}>Sipariş geliş sesi ve uyarılar</Text>
              </View>
            </View>
            <Switch value={sound} onValueChange={handleSoundChange} trackColor={{ true: '#FF7A00' }} />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.separator }]} />
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Bell color="#FF7A00" size={20} />
              <View>
                <Text style={[styles.switchText, { color: colors.text }]}>Titreşim</Text>
                <Text style={styles.descText}>Bildirimlerde cihaz titresin</Text>
              </View>
            </View>
            <Switch value={vibrate} onValueChange={handleVibrateChange} trackColor={{ true: '#FF7A00' }} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  sectionTitle: { color: '#888', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginLeft: 5, letterSpacing: 1 },
  card: { borderRadius: 20, marginBottom: 30, borderWidth: 1 },
  radioRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  radioLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  radioText: { fontSize: 16, fontWeight: '600' },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#666', alignItems: 'center', justifyContent: 'center' },
  radioCircleActive: { borderColor: '#4CAF50' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50' },
  divider: { height: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  switchText: { fontSize: 16, fontWeight: '600' },
  descText: { fontSize: 12, color: '#888', marginTop: 3 },
});
