import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react-native';

const FAQS = [
  { id: 1, q: 'Kazançlarımı ne zaman çekebilirim?', a: 'Kazançlarınızı her hafta Salı günü banka hesabınıza aktarabilirsiniz. Alt limit 500 TL\'dir.' },
  { id: 2, q: 'Siparişi iptal edersem ne olur?', a: 'Sık sık iptal edilen siparişler puanınızı düşürebilir. Lütfen acil durumlar dışında işleri iptal etmemeye özen gösterin.' },
  { id: 3, q: 'Hesabım neden askıya alındı?', a: 'Genellikle çok düşük puan veya kural ihlallerinde hesap askıya alınır. Destek ekibine ulaşabilirsiniz.' }
];

export default function HelpCenterScreen({ navigation }: any) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım Merkezi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <MessageCircle color="#fff" size={32} />
          </View>
          <Text style={styles.contactTitle}>Bize Ulaşın</Text>
          <Text style={styles.contactDesc}>Sorununuza çözüm bulamadıysanız destek ekibimiz 7/24 hizmetinizde.</Text>
          <TouchableOpacity style={styles.contactBtn} onPress={() => navigation.navigate('LiveSupport')}>
            <Text style={styles.contactBtnText}>Canlı Destek Başlat</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>
        
        {FAQS.map(faq => {
          const isExp = expanded === faq.id;
          return (
            <TouchableOpacity 
              key={faq.id} 
              style={[styles.faqCard, isExp && styles.faqCardActive]} 
              onPress={() => setExpanded(isExp ? null : faq.id)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <HelpCircle color={isExp ? '#FF7A00' : '#666'} size={20} />
                  <Text style={[styles.faqQ, isExp && { color: '#FF7A00' }]}>{faq.q}</Text>
                </View>
                {isExp ? <ChevronUp color="#FF7A00" size={20} /> : <ChevronDown color="#666" size={20} />}
              </View>
              {isExp && (
                <View style={styles.faqBody}>
                  <Text style={styles.faqA}>{faq.a}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  contactCard: { backgroundColor: 'rgba(255,122,0,0.1)', borderRadius: 24, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,122,0,0.2)', marginBottom: 30 },
  contactIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF7A00', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  contactTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  contactDesc: { color: '#ccc', textAlign: 'center', fontSize: 13, marginBottom: 20, paddingHorizontal: 10 },
  contactBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 16 },
  contactBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  faqCard: { backgroundColor: '#111827', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  faqCardActive: { borderColor: 'rgba(255,122,0,0.3)' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  faqQ: { color: 'white', fontSize: 14, fontWeight: 'bold', flex: 1 },
  faqBody: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 0 },
  faqA: { color: '#aaa', fontSize: 13, lineHeight: 20 }
});
