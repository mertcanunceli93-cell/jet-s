import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Clipboard, Share } from 'react-native';
import { useAuth } from '../../store/useAuth';
import {
  ArrowLeft,
  Gift,
  Copy,
  Share2,
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react-native';


const RECENT_REFERRALS = [
  { id: '1', name: 'Ahmet Yılmaz', date: '22 May 2026', status: 'Aktif', initials: 'AY' },
  { id: '2', name: 'Elif Demir', date: '20 May 2026', status: 'Beklemede', initials: 'ED' },
  { id: '3', name: 'Murat Kaya', date: '18 May 2026', status: 'Aktif', initials: 'MK' },
];

export default function ReferralScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const REFERRAL_CODE = user?.id ? user.id.slice(0, 8).toUpperCase() : '7RKPZ7ZT';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    Clipboard.setString(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleWhatsAppShare = useCallback(() => {
    Alert.alert(
      'WhatsApp Paylaşım',
      `Referans kodum: ${REFERRAL_CODE}\nJetis'e katıl ve kazan!`,
    );
  }, [REFERRAL_CODE]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Jetis'e katıl ve kazan! Referans kodum: ${REFERRAL_CODE}`,
      });
    } catch (error) {
      console.error(error);
    }
  }, [REFERRAL_CODE]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arkadaşını Davet Et</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconBox}>
            <Gift color="#FF7A00" size={40} />
          </View>
          <Text style={styles.heroTitle}>Davet Et, Kazan!</Text>
          <Text style={styles.heroSubtitle}>
            Arkadaşını kurye olarak davet et, ilk teslimatını tamamladığında anında <Text style={{fontWeight: 'bold', color: 'white'}}>₺500</Text> nakit ödül kazan! Üstelik arkadaşın da <Text style={{fontWeight: 'bold', color: 'white'}}>₺250</Text> kazanır.
          </Text>
        </View>

        {/* Referral Code Card */}
        <View style={styles.codeCardOuter}>
          <View style={styles.codeCardInner}>
            <Text style={styles.codeLabel}>REFERANS KODUN</Text>
            <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
            <TouchableOpacity
              style={[styles.copyBtn, copied && styles.copyBtnCopied]}
              onPress={handleCopy}
              activeOpacity={0.8}
            >
              {!copied && <Copy color="white" size={16} />}
              <Text style={styles.copyBtnText}>
                {copied ? 'Kopyalandı! ✓' : 'Kodu Kopyala'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Buttons */}
        <View style={styles.shareSection}>
          <TouchableOpacity
            style={styles.whatsappBtn}
            onPress={handleWhatsAppShare}
            activeOpacity={0.8}
          >
            <MessageCircle color="white" size={20} />
            <Text style={styles.shareBtnText}>WhatsApp ile Paylaş</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Share2 color="white" size={20} />
            <Text style={styles.shareBtnText}>Kodu Paylaş</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Users color="#FF7A00" size={20} />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Toplam Davet</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <TrendingUp color="#4CAF50" size={20} />
            </View>
            <Text style={styles.statValue}>₺360</Text>
            <Text style={styles.statLabel}>Kazanılan</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Clock color="#FFB800" size={20} />
            </View>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Bekleyen</Text>
          </View>
        </View>

        {/* Recent Referrals */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Son Davetler</Text>

          {RECENT_REFERRALS.map((item) => {
            const isActive = item.status === 'Aktif';
            return (
              <View key={item.id} style={styles.referralItem}>
                <View style={styles.referralLeft}>
                  <View style={[styles.avatar, isActive ? styles.avatarActive : styles.avatarPending]}>
                    <Text style={styles.avatarText}>{item.initials}</Text>
                  </View>
                  <View style={styles.referralInfo}>
                    <Text style={styles.referralName}>{item.name}</Text>
                    <Text style={styles.referralDate}>{item.date}</Text>
                  </View>
                </View>
                <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgePending]}>
                  <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextPending]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  /* Hero */
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: 'rgba(255,122,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  /* Referral Code Card */
  codeCardOuter: {
    borderRadius: 28,
    padding: 2,
    marginBottom: 24,
    backgroundColor: 'rgba(255,122,0,0.2)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  codeCardInner: {
    backgroundColor: '#111827',
    borderRadius: 26,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.15)',
  },
  codeLabel: {
    color: '#FF7A00',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 14,
  },
  codeText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
    marginBottom: 22,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF7A00',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  copyBtnCopied: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  copyBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* Share Buttons */
  shareSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  shareBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Recent Referrals */
  recentSection: {
    backgroundColor: '#111827',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  recentTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  referralLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: {
    backgroundColor: 'rgba(255,122,0,0.15)',
  },
  avatarPending: {
    backgroundColor: 'rgba(255,184,0,0.12)',
  },
  avatarText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  referralInfo: {
    gap: 3,
  },
  referralName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  referralDate: {
    color: '#555',
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: 'rgba(76,175,80,0.12)',
  },
  badgePending: {
    backgroundColor: 'rgba(255,184,0,0.12)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextActive: {
    color: '#4CAF50',
  },
  badgeTextPending: {
    color: '#FFB800',
  },
});
