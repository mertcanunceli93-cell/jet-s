import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { Package, Navigation } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 70) / 2;

type Mode = 'user' | 'courier' | null;

export default function WelcomeScreen({ navigation }: { navigation: any }) {
  const [selectedMode, setSelectedMode] = useState<Mode>(null);

  // Animated values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(30)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      // Logo fades in + scales up
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Tagline fades in
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Subtitle fades in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Cards slide in
      Animated.parallel([
        Animated.timing(cardsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(cardsTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Bottom area fades in
      Animated.timing(bottomOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate('Register', { mode: selectedMode });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      {/* ── Logo Area ── */}
      <View style={styles.logoSection}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Outer glow ring */}
          <Animated.View
            style={[
              styles.glowRing,
              { opacity: Animated.multiply(glowOpacity, glowPulse) },
            ]}
          />
          {/* Logo circle */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>J</Text>
          </View>
        </Animated.View>

        {/* Brand name */}
        <Animated.Text
          style={[
            styles.brandName,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          JETIS
        </Animated.Text>
      </View>

      {/* ── Tagline ── */}
      <Animated.View
        style={[
          styles.taglineSection,
          {
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          },
        ]}
      >
        <Text style={styles.tagline}>Dakikalar İçinde Teslimat</Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Hızlı, güvenilir ve şeffaf kurye hizmeti
        </Animated.Text>
      </Animated.View>

      {/* ── Mode Selection Cards ── */}
      <Animated.View
        style={[
          styles.cardsRow,
          {
            opacity: cardsOpacity,
            transform: [{ translateY: cardsTranslateY }],
          },
        ]}
      >
        {/* Kurye Çağır Card */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            selectedMode === 'user' && styles.modeCardSelectedUser,
          ]}
          activeOpacity={0.8}
          onPress={() => setSelectedMode('user')}
        >
          <View
            style={[
              styles.iconContainer,
              selectedMode === 'user' && styles.iconContainerUser,
            ]}
          >
            <Package
              size={32}
              color={selectedMode === 'user' ? '#FF7A00' : '#888'}
              strokeWidth={1.8}
            />
          </View>
          <Text style={styles.cardEmoji}>📦</Text>
          <Text
            style={[
              styles.cardTitle,
              selectedMode === 'user' && styles.cardTitleActiveUser,
            ]}
          >
            Kurye Çağır
          </Text>
          <Text style={styles.cardDescription}>Anında paket gönder</Text>
          {selectedMode === 'user' && <View style={styles.selectedDotUser} />}
        </TouchableOpacity>

        {/* Kurye Ol Card */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            selectedMode === 'courier' && styles.modeCardSelectedCourier,
          ]}
          activeOpacity={0.8}
          onPress={() => setSelectedMode('courier')}
        >
          <View
            style={[
              styles.iconContainer,
              selectedMode === 'courier' && styles.iconContainerCourier,
            ]}
          >
            <Navigation
              size={32}
              color={selectedMode === 'courier' ? '#4CAF50' : '#888'}
              strokeWidth={1.8}
            />
          </View>
          <Text style={styles.cardEmoji}>🏍️</Text>
          <Text
            style={[
              styles.cardTitle,
              selectedMode === 'courier' && styles.cardTitleActiveCourier,
            ]}
          >
            Kurye Ol
          </Text>
          <Text style={styles.cardDescription}>Kazanmaya başla</Text>
          {selectedMode === 'courier' && (
            <View style={styles.selectedDotCourier} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* ── Bottom CTA ── */}
      <Animated.View style={[styles.bottomSection, { opacity: bottomOpacity }]}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            !selectedMode && styles.continueBtnDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleContinue}
          disabled={!selectedMode}
        >
          <Text
            style={[
              styles.continueBtnText,
              !selectedMode && styles.continueBtnTextDisabled,
            ]}
          >
            Devam Et
          </Text>
        </TouchableOpacity>

        <View style={styles.loginLinkRow}>
          <Text style={styles.loginLinkText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login', { mode: selectedMode })}>
            <Text style={styles.loginLinkAction}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    paddingHorizontal: 24,
  },

  /* ── Logo ── */
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,122,0,0.25)',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,122,0,0.1)',
    borderWidth: 2.5,
    borderColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  logoLetter: {
    color: '#FF7A00',
    fontSize: 48,
    fontWeight: '900',
    marginTop: -2,
  },
  brandName: {
    color: 'white',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 8,
    marginTop: 16,
    textShadowColor: 'rgba(255,122,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },

  /* ── Tagline ── */
  taglineSection: {
    alignItems: 'center',
    marginTop: 28,
  },
  tagline: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#666',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },

  /* ── Cards ── */
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    gap: 14,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modeCardSelectedUser: {
    borderColor: 'rgba(255,122,0,0.5)',
    backgroundColor: 'rgba(255,122,0,0.06)',
    shadowColor: '#FF7A00',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modeCardSelectedCourier: {
    borderColor: 'rgba(76,175,80,0.5)',
    backgroundColor: 'rgba(76,175,80,0.06)',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconContainerUser: {
    backgroundColor: 'rgba(255,122,0,0.12)',
  },
  iconContainerCourier: {
    backgroundColor: 'rgba(76,175,80,0.12)',
  },
  cardEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardTitleActiveUser: {
    color: '#FF7A00',
  },
  cardTitleActiveCourier: {
    color: '#4CAF50',
  },
  cardDescription: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedDotUser: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF7A00',
    marginTop: 14,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedDotCourier: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginTop: 14,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },

  /* ── Bottom ── */
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  continueBtn: {
    backgroundColor: '#FF7A00',
    height: 64,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  continueBtnDisabled: {
    backgroundColor: '#1E2738',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  continueBtnTextDisabled: {
    color: '#555',
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    color: '#666',
    fontSize: 14,
  },
  loginLinkAction: {
    color: '#FF7A00',
    fontSize: 14,
    fontWeight: '700',
  },
});
