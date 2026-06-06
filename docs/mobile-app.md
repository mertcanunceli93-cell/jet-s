# 🚀 Kurye Yolda - Mobil Uygulama Proje Dokümantasyonu
*Antigravity Altyapısı ile Geliştirilen Yeni Nesil, Hızlı ve Güvenilir Teslimat Platformu*

---

## 📱 Proje Özeti
**"Kurye Yolda"**, kullanıcıların saniyeler içinde kurye çağırabildiği ve dileyenlerin kurye olarak ek gelir elde edebildiği, harita tabanlı yenilikçi bir mobil uygulamadır. Hem **müşteri (gönderici)** hem de **kurye** deneyimini tek bir ekosistemde birleştirir.

---

## ✨ Temel Özellikler ve Ekran Analizleri

### 1. 👥 Çift Yönlü Kullanım Modu
Uygulama açılışında kullanıcıya iki ana senaryo sunulur:
* **Kurye Çağır:** Kullanıcılar anında bulundukları konuma kurye talep edebilir.
* **Kurye Ol:** Kendi aracı, motoru veya bisikleti ile sisteme dahil olmak isteyenler kayıt olup hemen kazanmaya başlayabilir.

### 2. 📍 Kolay Sipariş ve Harita Entegrasyonu
* **Hızlı Aksiyon:** Harita üzerinden yakındaki kuryeleri anlık olarak görüntüleme ve "Paket Gönder" butonu ile saniyeler içinde işlem başlatma.
* **Şeffaf Fiyatlandırma ve Onay:** Sipariş onaylanmadan önce; rota, toplam mesafe, teslimat süresi, toplam tutar (örn: ₺517.23) ve ödeme yöntemi (Nakit, Kredi Kartı vb.) açıkça gösterilir.

### 3. 🗺️ Canlı Gönderi Durumu ve Takip
Gönderici ve alıcılar, paketlerinin durumunu anlık olarak izleyebilir. Uygulama içi durum akışı:
1.  ✔️ *Kurye Atandı*
2.  ✔️ *Alış Noktasında*
3.  ✔️ *Paket Alındı*
4.  🚚 **Yolda** (Teslimat adresine gidiyor) - *Aktif Durum*
* Harita üzerinden canlı (real-time) kurye takibi desteklenmektedir.

### 4. 🛵 Kurye (Sürücü) Paneli
* **Görev Keşfi:** Kuryeler, harita üzerinde çevrelerindeki ("Yakındaki Siparişler") iş fırsatlarını görebilir.
* **Durum Yönetimi:** Çevrimiçi/Çevrimdışı toggle (aç-kapat) butonu ile kurye çalışma saatlerini kendi esnekliğine göre belirler.

### 5. 💳 Gelişmiş Finans ve Ödeme Paneli
Kuryelerin motivasyonunu ve güvenini artırmak için tasarlanmış şeffaf finansal arayüz:
* **Bakiye Takibi:** Güncel bakiye, Net Kazanç ve Bekleyen Ödemeler.
* **Hızlı Erişim Menüleri:** Sipariş geçmişi, hesaplaşmalar, ödemeler ve mali özet gibi modüllere kolay ulaşım.
* **Hesap Durumu:** Toplam işlem hacmi ve periyodik kazanç grafikleri.

### 6. 🎁 Referans (Davet) Sistemi
* **Kullanıcı Kazanımı:** Özel davet kodları (Örn: `7RKPZ7ZT`) ile kullanıcıların ve kuryelerin arkadaşlarını davet etmesine olanak tanır.
* Kodu paylaşarak hem davet edenin hem de davet edilenin avantaj kazanmasını sağlayan büyüme odaklı (growth-hacking) sistem.

---

## 🎨 UI / UX ve Tasarım Notları

| Özellik | Açıklama |
| :--- | :--- |
| **Renk Paleti** | Dinamik ve enerjik hissettiren **Turuncu**, temiz bir görünüm için **Beyaz** ve kontrast/okunabilirlik için **Siyah/Koyu Gri** tonları kullanılmıştır. |
| **Ergonomi** | Alt navigasyon barları, yuvarlatılmış köşeli kart tasarımları (rounded cards) ve geniş butonlar ile tek elle kullanıma son derece uygundur. |
| **Harita Odaklılık** | İhtiyaç duyulan aksiyonların büyük çoğunluğu lokasyon bazlı olduğu için arayüzün merkezinde interaktif, temiz ve Google Maps tabanlı haritalar yer alır. |

---

> 💡 **Geliştirici Notu (Antigravity):**
> *Bu uygulama, yüksek eşzamanlılık (concurrency) ve düşük gecikme (low-latency) gerektiren canlı kurye takibi, anlık soket bağlantıları ve harita güncellemeleri için Antigravity prensipleri baz alınarak performans odaklı geliştirilmektedir.*
