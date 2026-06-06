import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useAuth } from '../../store/useAuth';
import api from '../../lib/api';

export default function LoginScreen({ route, navigation }: { route: any, navigation: any }) {
  const mode = route?.params?.mode;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      await setAuth(res.data.user, res.data.token);
    } catch (err) {
      alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (testEmail: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: testEmail, password: 'password123' });
      await setAuth(res.data.user, res.data.token);
    } catch (err) {
      alert('Hızlı giriş başarısız. Lütfen backend sunucusunun ve veritabanı tohumlamasının (seed) yapıldığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>J</Text>
        </View>
        <Text style={styles.title}>JETIS</Text>
        <Text style={styles.subtitle}>Dakikalar içinde teslimat için giriş yapın.</Text>
      </View>

      <View style={styles.form}>
        <TextInput 
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput 
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Şifremi Unuttum</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginBtn} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginBtnText}>Giriş Yap</Text>}
        </TouchableOpacity>

        {/* Geliştirici Hızlı Girişleri */}
        <View style={styles.devLoginContainer}>
          <Text style={styles.devLoginTitle}>Geliştirici Hızlı Girişleri</Text>
          <View style={styles.devLoginButtons}>
            <TouchableOpacity 
              style={[styles.devLoginBtn, { backgroundColor: 'rgba(255,122,0,0.1)', borderColor: '#FF7A00' }]} 
              onPress={() => handleQuickLogin('user@jetis.com')}
              disabled={loading}
            >
              <Text style={[styles.devLoginBtnText, { color: '#FF7A00' }]}>Müşteri Girişi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.devLoginBtn, { backgroundColor: 'rgba(76,175,80,0.1)', borderColor: '#4CAF50' }]} 
              onPress={() => handleQuickLogin('courier@jetis.com')}
              disabled={loading}
            >
              <Text style={[styles.devLoginBtnText, { color: '#4CAF50' }]}>Kurye Girişi</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register', { mode })}>
            <Text style={styles.linkText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    padding: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF7A0020',
    borderWidth: 2,
    borderColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logoText: {
    color: '#FF7A00',
    fontSize: 40,
    fontWeight: '900',
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#111827',
    height: 65,
    borderRadius: 20,
    paddingHorizontal: 20,
    color: 'white',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    color: '#666',
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: '#FF7A00',
    height: 65,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  loginBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
  },
  linkText: {
    color: '#FF7A00',
    fontWeight: 'bold',
  },
  devLoginContainer: {
    marginTop: 35,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  devLoginTitle: {
    color: '#555',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  devLoginButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  devLoginBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  devLoginBtnText: {
    fontSize: 13,
    fontWeight: '800',
  }
});
