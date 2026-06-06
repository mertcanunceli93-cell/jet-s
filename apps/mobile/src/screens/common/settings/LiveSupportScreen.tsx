import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { ArrowLeft, Send, Bot, Phone, Clock, Shield } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

// ─── Operational Response Engine ───────────────────────────────────────────────
// Keyword-based intent detection simulating the Antigravity Operations Center
const INTENTS: { keywords: string[]; reply: string }[] = [
  // Kargo & Takip
  {
    keywords: ['kargo', 'takip', 'nerede', 'durum', 'sipariş nerede', 'geldi mi', 'gelmedi'],
    reply: 'Sipariş numaranızı iletir misiniz? Saha koordinasyon sistemimiz üzerinden kuryemizin anlık GPS konumunu teyit edip size hemen bilgi vereceğim.',
  },
  // Gecikme
  {
    keywords: ['gecik', 'geç kaldı', 'geç geldi', 'hâlâ gelmedi', 'bekliyorum', 'ne zaman gelecek'],
    reply: 'Gecikme kaydını operasyon merkezine iletiyorum. Lütfen sipariş kodunuzu paylaşın; kuryemizin güzergahını sistemden anlık olarak kontrol edip süreci hızlandıracağım.',
  },
  // İptal
  {
    keywords: ['iptal', 'vazgeç', 'istemiyorum', 'geri al'],
    reply: 'İptal prosedürünü başlatıyorum. Sipariş numaranızı ilettiğiniz an, saha ekiplerimize teslimatı durdurma talimatı geçeceğim.',
  },
  // Hasar & Şikâyet
  {
    keywords: ['hasar', 'kırık', 'bozuk', 'yanlış', 'eksik', 'şikayet', 'memnun değil'],
    reply: 'Bu hasar kaydını derhal Saha Koordinatörlerine aktarıyorum. Lütfen sipariş numaranızı ve hasarın fotoğrafını iletin. İade sürecinizi resmi olarak başlatıp yeni kurye atamasını yapacağım.',
  },
  // Adres Değişikliği
  {
    keywords: ['adres', 'adres değiştir', 'yanlış adres', 'farklı adres', 'alıcı değiştir'],
    reply: 'Adres güncellemesi için kuryenin teslimata çıkmamış olması gerekmektedir. Sipariş numaranızı ve yeni adresi iletirseniz, kuryemizin rota optimizasyonunu sistemden anında revize edeceğim.',
  },
  // Ödeme & Fatura
  {
    keywords: ['ödeme', 'fatura', 'ücret', 'para', 'iade', 'bakiye', 'cüzdan', 'çek'],
    reply: 'Finans sistemimizi kontrol ediyorum. Bakiye çekim işlemleriniz her Çarşamba resmi olarak banka hesabınıza yansıtılır. İşleminizi kontrol etmem için kayıtlı IBAN veya işlem referansınızı iletir misiniz?',
  },
  // Kampanya & İndirim
  {
    keywords: ['kampanya', 'indirim', 'kod', 'kupon', 'promosyon', 'ücretsiz'],
    reply: 'Güncel indirim kodlarınızı hesabınızın "Kampanyalar" sekmesinden teyit edebilirsiniz. Referans sistemiyle davet ettiğiniz her yeni kurye için hesabınıza ₺500 aktarılacaktır.',
  },
  // Kurye İletişim
  {
    keywords: ['kurye', 'arama', 'iletişim', 'ulaşamıyorum', 'telefon', 'mesaj'],
    reply: 'Güvenlik protokollerimiz gereği kurye ile direkt iletişimi uygulama üzerinden sağlamalısınız. Ulaşamıyorsanız sipariş numaranızı iletin, Operasyon Merkezi olarak kuryeye telsiz veya acil hat üzerinden biz ulaşalım.',
  },
  // Güvenlik Uyarısı
  {
    keywords: ['şifre', 'kredi kartı', 'tc', 'kimlik', 'kart numara'],
    reply: 'Lütfen kredi kartı şifrenizi veya tam TC Kimlik numaranızı paylaşmayın. Antigravity güvenlik protokolleri gereği bu verileri talep etmiyoruz ve sistemde şifreli tutuyoruz.',
  },
  // İnsan Temsilci / Eskalasyon
  {
    keywords: ['insan', 'müşteri temsilcisi', 'gerçek kişi', 'bağlan', 'yetmez', 'çözmüyor', 'amir'],
    reply: 'Talebinizi doğrudan Operasyon Merkezi Yönetimi\'ne aktarıyorum. Üst düzey yetkililerimiz konuyu inceleyip en kısa sürede tarafınıza resmi dönüş yapacaktır.',
  },
  // Çalışma Saatleri
  {
    keywords: ['saat', 'çalışma', 'açık mı', 'kapalı', 'mesai'],
    reply: 'Saha operasyonlarımız 7/24 kesintisiz devam etmektedir. Merkez ofis destek hattımız ise 09:00 - 22:00 saatleri arasında tüm sorunlarınıza müdahale etmektedir.',
  },
  // Teşekkür
  {
    keywords: ['teşekkür', 'sağol', 'sağ ol', 'eyvallah', 'çok iyi', 'harika', 'süper'],
    reply: 'Görevimiz. Teslimat operasyonunuzla ilgili başka bir müdahale talebiniz olursa buradayız.',
  },
  // Selamlama
  {
    keywords: ['merhaba', 'selam', 'hey', 'nasıl', 'iyi günler', 'iyi akşamlar'],
    reply: 'Antigravity Destek Merkezi. Operasyonel bir sorununuz veya teslimat talebiniz varsa hemen sistemden kontrol edelim. Sipariş numaranızı alabilir miyim?',
  },
  // E-posta / Resmi
  {
    keywords: ['mail', 'e-posta', 'eposta', 'resmi', 'yazılı', 'dilekçe'],
    reply: 'Resmi yazışmalar ve hukuki talepleriniz için destek@antigravity.com adresine detaylı bir e-posta iletebilirsiniz. Kaydınız anında işleme alınacaktır.',
  },
];

function generateReply(userText: string): string {
  const lower = userText.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.keywords.some(kw => lower.includes(kw))) {
      return intent.reply;
    }
  }
  return 'Talebinizi işleme alabilmem için lütfen geçerli bir sipariş numarası veya takip kodu iletin. Saha sistemimiz üzerinden anında müdahale sağlayacağım.';
}

// ─── Typing Dots Animation ──────────────────────────────────────────────────
function TypingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
    animate(dot1, 0).start();
    animate(dot2, 200).start();
    animate(dot3, 400).start();
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.botAvatar}>
        <Shield color="white" size={14} />
      </View>
      <View style={styles.typingBubble}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Quick Reply Chips ──────────────────────────────────────────────────────
const QUICK_REPLIES = [
  'Siparişim nerede?',
  'Kurye ile iletişim',
  'İade yapmak istiyorum',
  'İnsan temsilciye bağla',
];

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function LiveSupportScreen({ navigation }: any) {
  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Antigravity Operasyon Merkezi Destek Hattı.\n\nSistemimize bağlandınız. Saha operasyonlarımız, teslimat süreçleriniz veya hesap işlemleriniz hakkında anında aksiyon almam için sipariş numaranızı veya sorununuzu belirtebilirsiniz.',
      sender: 'bot',
      timestamp: now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, isTyping]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setShowQuickReplies(false);

    // Simulate realistic response delay (800-2000ms)
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: generateReply(text),
        sender: 'bot',
        timestamp: now(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  }, []);

  const handleSend = useCallback(() => {
    sendMessage(inputText);
  }, [inputText, sendMessage]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isBot = item.sender === 'bot';
    return (
      <View style={[styles.msgWrapper, isBot ? styles.msgWrapperBot : styles.msgWrapperUser]}>
        {isBot && (
          <View style={styles.botAvatar}>
            <Shield color="white" size={16} />
          </View>
        )}
        <View style={[styles.msgBubble, isBot ? styles.msgBubbleBot : styles.msgBubbleUser]}>
          <Text style={[styles.msgText, isBot ? styles.msgTextBot : styles.msgTextUser]}>{item.text}</Text>
          <Text style={[styles.msgTime, isBot ? styles.msgTimeBot : styles.msgTimeUser]}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarSmall}>
            <Shield color="white" size={18} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Canlı Destek</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>Operasyon Merkezi • Çevrimiçi</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Phone color="#FF7A00" size={20} />
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Shield color="#FF7A00" size={14} />
        <Text style={styles.infoBannerText}>
          Bu sohbet güvenli ve şifrelidir. Kart bilgilerinizi asla paylaşmayınız.
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? <TypingDots /> : null}
        />

        {/* Quick Replies */}
        {showQuickReplies && (
          <View style={styles.quickRepliesRow}>
            {QUICK_REPLIES.map((qr, i) => (
              <TouchableOpacity key={i} style={styles.quickReplyChip} onPress={() => sendMessage(qr)}>
                <Text style={styles.quickReplyText}>{qr}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.75}
          >
            <Send color="white" size={18} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#111827', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { padding: 6 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginLeft: 8 },
  headerAvatarSmall: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#FF7A00',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4CAF50' },
  headerSubtitle: { color: '#888', fontSize: 11, fontWeight: '600' },
  headerAction: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: 'rgba(255,122,0,0.1)', alignItems: 'center', justifyContent: 'center',
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,122,0,0.06)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,122,0,0.1)',
  },
  infoBannerText: { color: '#999', fontSize: 11, flex: 1 },

  // Chat
  chatContent: { padding: 16, paddingBottom: 10 },

  msgWrapper: { flexDirection: 'row', marginBottom: 16, maxWidth: '82%' },
  msgWrapperBot: { alignSelf: 'flex-start' },
  msgWrapperUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },

  botAvatar: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF7A00',
    alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 4,
  },

  msgBubble: { padding: 14, borderRadius: 20, maxWidth: '100%' },
  msgBubbleBot: {
    backgroundColor: '#111827', borderTopLeftRadius: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  msgBubbleUser: { backgroundColor: '#FF7A00', borderTopRightRadius: 6 },

  msgText: { fontSize: 14, lineHeight: 21 },
  msgTextBot: { color: '#E5E7EB' },
  msgTextUser: { color: 'white' },

  msgTime: { fontSize: 10, marginTop: 6, alignSelf: 'flex-end' },
  msgTimeBot: { color: '#555' },
  msgTimeUser: { color: 'rgba(255,255,255,0.65)' },

  // Typing
  typingContainer: { flexDirection: 'row', alignItems: 'center', paddingLeft: 0, marginBottom: 10 },
  typingBubble: {
    backgroundColor: '#111827', paddingHorizontal: 18, paddingVertical: 14,
    borderRadius: 20, borderTopLeftRadius: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF7A00' },

  // Quick Replies
  quickRepliesRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, paddingBottom: 10,
  },
  quickReplyChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,122,0,0.4)', backgroundColor: 'rgba(255,122,0,0.08)',
  },
  quickReplyText: { color: '#FF7A00', fontSize: 13, fontWeight: '600' },

  // Input
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#111827', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    flex: 1, backgroundColor: '#0B1220', color: 'white',
    borderRadius: 22, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12,
    minHeight: 45, maxHeight: 120,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', fontSize: 15,
  },
  sendBtn: {
    width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#FF7A00',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF7A00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  sendBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
});
