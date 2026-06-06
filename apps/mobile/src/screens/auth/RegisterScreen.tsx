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
  ScrollView
} from 'react-native';
import { useAuth } from '../../store/useAuth';
import api from '../../lib/api';

export default function RegisterScreen({ route, navigation }: { route: any, navigation: any }) {
  const mode = route?.params?.mode;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: mode === 'courier' ? 'COURIER' : 'USER'
  });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      await setAuth(res.data.user, res.data.token);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Kayıt başarısız. Şifrenizin en az 8 karakter olduğundan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 50 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>JETIS ekosistemine katılın.</Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleBtn, formData.role === 'USER' && styles.activeRole]}
            onPress={() => setFormData({...formData, role: 'USER'})}
          >
            <Text style={[styles.roleText, formData.role === 'USER' && styles.activeRoleText]}>Müşteriyim</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, formData.role === 'COURIER' && styles.activeRole]}
            onPress={() => setFormData({...formData, role: 'COURIER'})}
          >
            <Text style={[styles.roleText, formData.role === 'COURIER' && styles.activeRoleText]}>Kuryeyim</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <TextInput 
            style={styles.input}
            placeholder="Ad"
            placeholderTextColor="#666"
            value={formData.firstName}
            onChangeText={(v) => setFormData({...formData, firstName: v})}
          />
          <TextInput 
            style={styles.input}
            placeholder="Soyad"
            placeholderTextColor="#666"
            value={formData.lastName}
            onChangeText={(v) => setFormData({...formData, lastName: v})}
          />
          <TextInput 
            style={styles.input}
            placeholder="E-posta"
            placeholderTextColor="#666"
            value={formData.email}
            onChangeText={(v) => setFormData({...formData, email: v})}
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#666"
            secureTextEntry
            value={formData.password}
            onChangeText={(v) => setFormData({...formData, password: v})}
          />

          <TouchableOpacity 
            style={styles.registerBtn} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.registerBtnText}>Kayıt Ol</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    paddingHorizontal: 30,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  roleBtn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  activeRole: {
    borderColor: '#FF7A00',
    backgroundColor: '#FF7A0010',
  },
  roleText: {
    color: '#666',
    fontWeight: 'bold',
  },
  activeRoleText: {
    color: '#FF7A00',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#111827',
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 20,
    color: 'white',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  registerBtn: {
    backgroundColor: '#FF7A00',
    height: 65,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerBtnText: {
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
  }
});
