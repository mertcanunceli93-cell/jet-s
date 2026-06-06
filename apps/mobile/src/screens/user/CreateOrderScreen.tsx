import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MapPin, Package, Clock, Shield, ArrowRight, ChevronLeft } from 'lucide-react-native';
import api from '../../lib/api';

type DeliveryType = 'STANDARD' | 'EXPRESS' | 'VIP';

export default function CreateOrderScreen({ navigation }: { navigation: any }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    packageDetails: '',
    deliveryType: 'STANDARD' as DeliveryType,
    price: 0,
    quoteId: '',
  });

  const calculatePrice = async () => {
    if (!formData.pickupAddress || !formData.deliveryAddress) {
      Alert.alert('Uyarı', 'Lütfen her iki adresi de girin.');
      return;
    }
    setLoadingPrice(true);
    try {
      const res = await api.post('/pricing/calculate', {
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        deliveryType: formData.deliveryType,
        vehicleType: 'MOTO'
      });
      const data = res.data.data;
      setFormData(prev => ({
        ...prev,
        price: data.price,
        quoteId: data.quoteId
      }));
      setStep(2);
    } catch (err) {
      Alert.alert('Hata', 'Fiyat hesaplanamadı. Lütfen adresleri kontrol edin.');
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/orders', {
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        packageDetails: formData.packageDetails,
        deliveryType: formData.deliveryType,
        vehicleType: 'MOTO',
        quoteId: formData.quoteId,
      }, {
        headers: { 'Idempotency-Key': Math.random().toString(36).substring(7) }
      });
      
      Alert.alert('Başarılı', 'Siparişiniz alındı!', [
        { text: 'Tamam', onPress: () => navigation.navigate('Ana Sayfa') }
      ]);
    } catch (err) {
      Alert.alert('Hata', 'Sipariş oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kurye Çağır</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Nereden Alınacak?</Text>
            <View style={styles.inputBox}>
              <MapPin color="#666" size={20} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Alış adresi..."
                placeholderTextColor="#444"
                multiline
                value={formData.pickupAddress}
                onChangeText={text => setFormData({...formData, pickupAddress: text})}
              />
            </View>

            <Text style={styles.label}>Nereye Teslim Edilecek?</Text>
            <View style={styles.inputBox}>
              <MapPin color="#FF7A00" size={20} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="Teslimat adresi..."
                placeholderTextColor="#444"
                multiline
                value={formData.deliveryAddress}
                onChangeText={text => setFormData({...formData, deliveryAddress: text})}
              />
            </View>

            <TouchableOpacity 
              style={styles.primaryBtn}
              onPress={calculatePrice}
              disabled={loadingPrice}
            >
              {loadingPrice ? <ActivityIndicator color="white" /> : (
                <>
                  <Text style={styles.primaryBtnText}>Fiyatı Hesapla</Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.priceCard}>
                <Text style={styles.priceLabel}>Tahmini Tutar</Text>
                <Text style={styles.priceValue}>₺{formData.price}</Text>
            </View>

            <Text style={styles.label}>Gönderi Tipi</Text>
            <View style={styles.typeRow}>
              {(['STANDARD', 'EXPRESS', 'VIP'] as DeliveryType[]).map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.typeBtn, formData.deliveryType === type && styles.typeBtnActive]}
                  onPress={() => setFormData({...formData, deliveryType: type})}
                >
                  <Text style={[styles.typeBtnText, formData.deliveryType === type && styles.typeBtnTextActive]}>
                    {type === 'STANDARD' ? 'Standart' : type === 'EXPRESS' ? 'Hızlı' : 'VIP'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Paket İçeriği Notu</Text>
            <TextInput 
                style={styles.inputSingle}
                placeholder="Örn: Hassas evrak, yemek vb."
                placeholderTextColor="#444"
                value={formData.packageDetails}
                onChangeText={text => setFormData({...formData, packageDetails: text})}
            />

            <TouchableOpacity 
              style={[styles.primaryBtn, { marginTop: 40 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text style={styles.primaryBtnText}>Siparişi Tamamla</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111827',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 25,
  },
  stepContainer: {
    width: '100%',
  },
  label: {
    color: '#666',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 20,
  },
  inputBox: {
    backgroundColor: '#111827',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 100,
  },
  inputIcon: {
    marginTop: 5,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  inputSingle: {
    backgroundColor: '#111827',
    borderRadius: 18,
    height: 60,
    paddingHorizontal: 20,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  primaryBtn: {
    backgroundColor: '#FF7A00',
    height: 65,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    gap: 10,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceCard: {
    backgroundColor: '#111827',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.3)',
    marginBottom: 20,
  },
  priceLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceValue: {
    color: 'white',
    fontSize: 42,
    fontWeight: '900',
    marginTop: 10,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#111827',
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  typeBtnActive: {
    backgroundColor: 'rgba(255,122,0,0.1)',
    borderColor: '#FF7A00',
  },
  typeBtnText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  typeBtnTextActive: {
    color: '#FF7A00',
  }
});
