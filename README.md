# Bebek Günlüğü

Notebook'taki günlük emzirme/uyku/rutin sayfasının web app hâli. iPhone'da
ana ekrana eklenip native app gibi açılır, veriler Firebase'de saklanır —
telefon değişse, sekme kapansa da kaybolmaz.

## Bu ilk sürümde neler var

- Emzirme kayıtları (sağ/sol meme saatleri, ek süt, çiş/kaka, sağılan süt)
- Uyku kayıtları (uyudu/uyandı saatleri)
- Bebeğin günü + Annenin günü kontrol listeleri
- Notlar
- Gün gün gezinme (◀ ▶ ve tarih seçici)
- Giriş yapan herkes aynı veriyi canlı görür (sen ve eşin, ayrı telefonlardan)
- Ana ekrana eklenebilir PWA + otomatik kaydetme

**Henüz yok, sıradaki katmanlar:** büyüme takibi, aşı takvimi, gelişim
kilometre taşları, "kriz takvimi", haftalık ortalamalar, AI özellikleri.
Bunlar için ayrı bir tur yapacağız — önce bu temel katmanı gerçek veriyle
test edelim.

## 1) Firebase projesi kur (~10 dakika)

1. [console.firebase.google.com](https://console.firebase.google.com) →
   **Add project** → proje adını gir (ör. `bebek-gunlugu`) → Google
   Analytics'i kapatabilirsin, gerekli değil.
2. Sol menüden **Build → Authentication → Get started** → **Sign-in method**
   sekmesinde **Email/Password**'ü etkinleştir.
3. Aynı yerde **Users** sekmesinden **Add user** ile ikiniz için birer hesap
   oluştur (kendi e-postan + eşininki, birer şifre belirleyin). Uygulamada
   kayıt ol ekranı yok — hesapları sadece siz buradan açıyorsunuz, güvenlik
   bunun üstüne kuruluyor.
4. Sol menüden **Build → Firestore Database → Create database** → bir bölge
   seç (örn. `eur3 (europe-west)`) → **Start in production mode**.
5. Firestore'da **Rules** sekmesine geç, bu klasördeki `firestore.rules`
   dosyasının içeriğini yapıştır, **Publish**'e bas.
6. Proje ayarlarına dön (dişli ikonu → **Project settings**), aşağıda
   **Your apps** → **</> (Web)** ikonuna tıkla, bir takma ad ver, kaydet.
   Karşına çıkan `firebaseConfig` nesnesini kopyala.

## 2) Config'i yapıştır

`index.html` içinde `BURAYA_...` ile başlayan 6 satırı, bir önceki adımda
kopyaladığın gerçek değerlerle değiştir:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Bu değerler gizli değildir, herkesin tarayıcısında zaten görünür durumda
olacaklar — asıl güvenliği `firestore.rules` sağlıyor. GitHub bu satırları
"olası API key" diye işaretlerse (secret scanning uyarısı), o uyarıyı
repo **Settings → Security → Secret scanning alerts** kısmından "false
positive" olarak işaretleyip geçebilirsin; push'u engellemez.

## 3) GitHub Pages'e yayınla

1. GitHub'da yeni, boş bir repo aç.
2. Bu klasördeki tüm dosyaları (`index.html`, `manifest.json`, `sw.js`,
   `icon-180.png`, `icon-192.png`, `icon-512.png`, `favicon-32.png`) repo
   köküne push'la.
3. Repo **Settings → Pages** → **Source: Deploy from a branch** → branch
   `main`, klasör `/ (root)` → **Save**.
4. Birkaç dakika sonra `https://kullanici-adin.github.io/repo-adi/`
   adresinde canlı olur.

## 4) iPhone'a ekle

Safari'de siteyi aç → **Paylaş** → **Ana Ekrana Ekle**. Artık gerçek bir app
gibi kendi ikonuyla açılıyor.

## İkonlar hakkında

`icon-*.png` dosyaları basit bir ay-yıldız placeholder — beğenmezsen aynı
isimlerle kendi görselini koyman yeterli (180×180, 192×192, 512×512).

## Sorun giderme

- **Giriş çalışmıyor:** Authentication'da Email/Password sağlayıcısının
  açık olduğunu ve hesabın gerçekten oluşturulduğunu kontrol et.
- **Veriler kaydolmuyor / "Kaydedilemedi" yazıyor:** Firestore Rules'ın
  yayınlandığından (Publish) ve `firebaseConfig`'in doğru proje ID'sini
  gösterdiğinden emin ol.
- **Ana ekrana eklenince eski hâli görünüyor:** Service worker eski
  sürümü önbelleğe almış olabilir; uygulamayı sil, Safari'de siteyi
  yeniden aç, tekrar ekle.
