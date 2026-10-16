# Bebek Günlüğü

Notebook'taki günlük emzirme/uyku/rutin sayfasının web app hâli. iPhone'da
ana ekrana eklenip native app gibi açılır, veriler Firebase'de saklanır —
telefon değişse, sekme kapansa da kaybolmaz.

## Son değişiklikler (v5) — aşağıdaki eski anlatımla çelişen yerde bu geçerli

- **Görünüm düğmesi üç durumlu:** Gündüz (güneş) → Pastel (palet) → Gece (ay).
  Gündüz aynı; Pastel'de düzen aynı, kartlar ve kutucuklar pastel renklerde;
  Gece bir tık daha açık, daha az boğuk. Seçim her telefonda ayrı saklanır.
- **Sekmeler: Gün / Hafta / Gelişim / Aşı.** Aşı takvimi kendi sekmesinde,
  başında sıradaki aşı yazar.
- **Gün sekmesinin sırası:** Günün bilgisi (AI, Gelişim'den buraya taşındı) →
  gün başlığı → Günlük bakış (önceki sürümdeki gibi emojili kutucuklar) →
  emzirme kartı / uyku sayacı → Günün ritmi → Akış | Kayıtlar (eski adı
  "Listeler"; Akış daraltılmışken son 5 kayıt) → Bebeğin günü / Annenin günü
  (yan yana iki kare, dokununca açılır) → Notlar.
- **Alt şerit: Beslenme / Tuvalet / Uyku** (pastel). Beslenme → Emzirme, Mama,
  Sağılan. Uyku takibi kapalıysa Uyku düğmesi soluk durur, dokununca uyarı verir.
- **Emzirme kartı:** Sağ ya da Sol'a dokununca o taraf başlar (kutu sarı),
  kutunun sağ altındaki "Bitir" o tarafı durdurur; diğer tarafa dokununca o
  başlar. Mama / Ek süt kartta girilir, emzirme **Kaydet**'e basınca kaydedilir.
  Kaydet'e kadar kayıt "taslak"tır (`draft: true`): iki telefonda da kartta
  görünür, uygulama kapansa da kaybolmaz ama Akış'ta ve toplamlarda yer almaz.
  × ile iptal edilir ("Geri al" ile döner). 3 saat hiç dokunulmayan taslak
  kendiliğinden normal kayıt sayılır. "Elle gir / Elle düzelt" her zaman var.
- **Mama / Sağılan / elle giriş penceresi:** kayıt sadece **Kaydet**'e basınca
  eklenir (×, Vazgeç ya da dışarı dokunmak hiçbir şey kaydetmez). Mama 0 cc ile
  gelir; 0 cc ya da işaretsiz tuvalet kaydedilmez, uyarı verir.
- **Sağılan süt** ayrı kayıt olarak girilebilir (`type: "pumped"`); öğün
  sayısına girmez, Günlük bakış ve haftalık ortalamadaki Sağılan'a eklenir.
  (Eski sürüme dönülürse bu kayıtlar saatsiz emzirme satırı gibi görünür.)
- **Bir Bakışta** (üstteki kutucuklu düğme): bugünün özeti tek ekranda — son
  beslenme ve sıradaki taraf + Başlat, uyku (Uyudu/Uyandı), bez (+Çiş/+Kaka),
  Mama/Ek süt/Toplam + Sağılan, gelişim haftası, güncel kilo, sıradaki aşı.
- Başlıkta artık "Aslan" yazıyor (dört düğme sığsın diye); dar ekranda küçük
  simge gizlenir. Service worker önbelleği `v5`.

## Bu sürümde neler var

Ana ekranın üstünde **Gün / Hafta / Gelişim** sekmeleri var; sekmeye dokunarak
ya da yana kaydırarak geçiliyor. Uygulama varsayılan olarak Gün sekmesiyle
açılır; bir sekmenin en altındaki "Ana Sayfa yap"a dokunursan o sekme ana
sayfa olur (pati dolu ve renkli görünür; diğerlerinde soluk). Bu tercih her
telefonda ayrı tutulur. Arka plandan geri dönen uygulama kaldığın sekmede
açılır; tamamen kapatıp açınca ya da ↻ ile yenileyince ana sayfa gelir.
Açılırken/yenilenirken ekranın ortasında uygulama simgesi büyük ve soluk
şekilde görünür. Üstteki güneş/ay düğmesi Gündüz ve Gece görünümü arasında
geçirir; altta her sekmede hızlı kayıt şeridi (Emzirme, Mama, Tuvalet, Uyku)
durur.

**Gelişim sekmesi:** Gelişim dönemleri (en üstte), Günün bilgisi (AI),
Büyüme takibi, Aşı takvimi, Gelişim aşamaları.

**Hafta sekmesi:** Haftalık bakış ve Haftalık değerlendirme (AI).

**Haftalık bakış nasıl okunur** (Hafta sekmesinde; hangi güne
bakarsan bak hep bugüne kadarki son 7 günü gösterir): her çubuk
bir gün (altında gün adı; en sağdaki bugün). Satırlar: günlük ortalama
beslenme (emzirme + mama öğünleri), sağ ve sol meme için günlük toplam
emzirme süresinin ortalaması (dk), günlük ortalama mama ve sağılan süt
miktarı (cc), günlük ortalama çiş ve kaka sayısı, uyku
(açıksa). Ortalamalar sadece o türden kayıt girilmiş, tamamlanmış günlerden
hesaplanır — kayıtsız günler ve henüz bitmemiş bugün (soluk çubuklar)
ortalamayı düşürmez. Bitişi girilmemiş ya da mantıksız (ör. 3 saatten uzun)
emzirme süreleri hesaba katılmaz. Yapay zeka değerlendirmesi de birebir aynı
hesabı kullanır.

**Gün sekmesi (varsayılan ana sayfa) — günlük kayıtlar:** en üstte gün gezinme
(◀ tarih ▶) ve varsa süren emzirme/uyku sayacı, sonra Günün ritmi (24 saatlik
şerit: uykular, emzirme/mama, çiş/kaka; bugünse "şimdi" çizgisi), Günlük bakış
(o günün öğün sayısı, emzirme süresi, uyku süresi, toplam mama, ek süt, ikisinin
toplamı, sağılan süt, çiş ve kaka sayısı — kayıt girdikçe ya da diğer telefondan
veri geldikçe anında güncellenir; tarih değiştirince o günü gösterir), sonra
Kayıtlar: "Akış" (tüm kayıtlar saat sırasıyla, dokununca düzenlenir) ya da
"Listeler" görünümünde Beslenme takibi ("+ Emzirme"
ile sağ/sol meme saatleri — her meme kendi satırında, başlangıç – bitiş —
ve aynı öğünde verilen mama, ek süt, sağılan süt;
"+ Mama" ile sadece mama verilen öğün: saat + miktar — yeni mama satırı o
günün son mama miktarıyla başlar, miktarlar +/- ile ya da sayıya dokunup
yazarak girilir), Tuvalet takibi (çiş/kaka — emzirmeden bağımsız, kendi
saatiyle ayrı kayıt), Uyku takibi (Ayarlar'dan kapatılabilir), Bebeğin
günü, Annenin günü, Notlar. Gün gün gezinme (◀ ▶ ve tarih seçici) bu
sayfayla ilgili. Bütün saat kutularında (emzirme, mama, tuvalet, uyku) dolu
saatin içindeki ⊗ o saati siler.

**Beslenme ve Tuvalet takibinde kısa / tam görünüm** (Listeler görünümünde; Akış'ta da ilk 8 kayıttan sonrası "Tümünü göster" ile açılır): varsayılan olarak
ekranda o günün sadece en son girilen kaydı ve yeni kayıt düğmeleri durur;
üstte "3 öğünün sonuncusu · Tümünü göster" gibi kısa bir satır o gün kaç
kayıt olduğunu söyler. Bölümün sağ üstündeki yuvarlak büyüt/küçült düğmesi
(dışa bakan oklar) o günün tüm kayıtlarını açar; açıkken düğme içe bakan
oklara döner ve basınca yeniden sadece son kayıt kalır (üstteki satıra
dokunmak da tümünü açar). Kayıt ekleme aynı: "+ Emzirme", "+ Mama", "+ Tuvalet ekle"
ile eklenen kayıt en son kayıt olduğu için hemen görünür. Kısa/tam tercihi
her bölüm için ayrı ve her telefonda ayrı hatırlanır; eşinin ekranını
etkilemez.

Diğer özellikler:
- **Kayıt silme:** "Bu kaydı sil" (ve büyüme ölçümlerindeki "Sil") önce
  hangi kaydın silineceğini yazan bir Evet/Hayır penceresi açar. Sildikten
  sonra altta 10 saniye "… silindi · Geri al" görünür; "Geri al" kaydı
  aynı yerine geri koyar. Bu arada başka güne geçtiysen de geri alınır,
  uygulama seni o güne götürür.
- Ayarlar → **Takip seçenekleri → Uyku takibi** anahtarı: kapalıyken uyku
  kayıtları, uyku sayacı ve Uyku düğmesi, ritim şeridindeki uykular ve
  haftalık uyku grafiği gizlenir, yapay zeka haftalık
  değerlendirmede uykuya hiç değinmez (uyku verisi ona gönderilmez). Eski
  uyku kayıtları silinmez, tekrar açınca geri gelir. Ayar iki telefonda da
  aynı anda geçerlidir.
- Sağ üstteki ayar düğmesiyle **Ayarlar**: Bebeğin günü, Annenin günü, Gelişim
  aşamaları, Aşı takvimi ve Gelişim dönemleri listelerindeki seçenekleri
  kendin düzenleyebilir, silebilir, yenisini ekleyebilirsin. Aşı takvimi
  (ay) ve Gelişim dönemleri (hafta) her zaman kendiliğinden kronolojik
  sırada durur — yeni eklenen ya da ayı/haftası değiştirilen kayıt doğru
  yerine geçer. Diğer listelerde sıra, satırın solundaki ▲▼ ile elle
  ayarlanır; ana ekrandaki listeler de bu sırayı izler.
- **Büyüme takibi**: kilo/boy/baş çevresi ölçümü ekle, aradaki geçmişi
  basit bir grafikte gör
- **Aşı takvimi**: T.C. Sağlık Bakanlığı'nın 2026 ulusal çocukluk aşı
  takvimine göre, doğum tarihinden hesaplanan 20 doz — Tamam/Kalan/Geciken
  özetiyle, tek tek işaretleyebilirsin
- **Gelişim dönemleri** (Gelişim sekmesinin en üstünde): iki bölümden oluşur.
  - **İlk 12 hafta, hafta hafta:** her hafta için bir rehber kartı:
    Beslenme, Uyku, Bez, Bu hafta ayrıca, Sizin için; gerekli haftalarda
    Kontrol kutusu (ilk hafta, 15. gün, 41. gün ve 2. ay aile hekimi
    izlemleri, aşılar, kalça muayenesi gibi). Kart açılışta bebeğin
    bulunduğu haftayı gösterir; üstteki 1–12 düğmeleriyle ileri-geri
    bakılabilir, noktalı haftalarda bir kontrol ya da gelişim dönemi vardır.
    Bu kartların içeriği sabittir.
  - **3 ay +:** 12. haftadan sonra gelişim daha uzun dönemlerle sürer. Şu
    anki dönem öne çıkar; altında tüm dönemlerin zaman çizelgesi (geçti,
    şu an, kaç hafta sonra) yer alır. Her dönem bir sonrakinin başladığı
    haftaya kadar sürer. Bu dönemler Ayarlar'dan düzenlenebilir;
    1–12. haftalara düşenler o haftanın kartında da görünür.
  - Uzun dönemler belirli bir ürünün ("Wonder Weeks" gibi) markalı takvimi
    değildir; genel gelişim bilgisine dayanan, kendi yazdığımız bir özettir.
    Haftalık kartlardaki kontrol zamanları Sağlık Bakanlığı'nın bebek izlem
    protokolüne göredir. Hepsi bilgilendirme amaçlıdır.
- **Aşı takvimi ve Gelişim dönemleri için Ayarlar'dan doğum tarihini
  girmen gerekiyor**, yoksa o kartlar boş görünür. İkisi de bilgilendirme
  amaçlıdır, kesinleşmiş program için çocuk doktorunuza ve e-Nabız
  kaydına bakmayı unutma
- Tarihin üzerine dokununca açılan **takvim**: istediğin güne direkt
  dokunup gidebilirsin (◀ ▶ ile tek tek gitmek de hâlâ duruyor). Bugünün
  tarihi renkli bir çerçeveyle, kayıt girilmiş günler ise altlarında
  küçük bir noktayla ayırt ediliyor.
- Sağ üstteki **↻ Yenile** butonu: GitHub'a yüklenen yeni sürümü görmek
  için (kayıtlar zaten canlı güncelleniyor). Gönderilmemiş kayıt varken
  önce onları gönderir; bağlantı yoksa yenilemez, uyarır.
- **Çıkış yap** seçeneği Ayarlar'ın en altındaki "Hesap" bölümünde
  (hangi hesapla giriş yapıldığını da gösterir, onay sorar). Ana ekranda
  yanlışlıkla basılmasın diye oradan kaldırıldı.
- Uygulama gece açık kalıp sabah kullanılırsa kendiliğinden bugünün
  sayfasına geçer; haftalık bakış, aşı/gelişim durumları ve günün bilgisi
  de yeni güne göre tazelenir.
- Ayarlar'ın en altında **Veri yedeği**: tüm kayıtlarını tek bir JSON
  dosyası olarak indirebilirsin — Firebase'e ek olarak elinde bağımsız
  bir kopya bulunsun diye, ayda bir falan almanı öneririm.
- Giriş yapan herkes aynı veriyi canlı görür (sen ve eşin, ayrı telefonlardan).
  iPad ya da bilgisayardan da aynı adresi açıp aynı hesapla giriş yapman
  yeterli. Aynı anda farklı bölümlere kayıt girerseniz (biri emzirme, biri
  tuvalet gibi) birbirinizinkini ezmezsiniz; aynı bölümü aynı saniyelerde
  düzenlerseniz son kaydeden geçerli olur.
- Ana ekrana eklenebilir PWA + otomatik kaydetme
- Gündüz / Gece temalı arayüz (Outfit + Onest yazı tipleri), üstte uygulama
  simgesindeki aslan, giriş ekranında çimenlerde oturan aslan sahnesi
- **AI özellikleri** (kurulumu opsiyonel, aşağıda anlatılıyor): yaşa göre
  günlük bir bilgi kartı, ve butona basınca son 7 günün verisinden kısa,
  yargısız bir haftalık değerlendirme

**Henüz yok:** DSÖ büyüme yüzdelikleri (persentil karşılaştırması) —
şimdilik büyüme takibi sadece kendi ölçümlerinin grafiğini gösteriyor.
Bunun dışında planlanan tüm katmanlar tamam.

**Eski çiş/kaka kayıtları hakkında:** daha önce emzirme satırına işlenmiş
çiş/kaka verileri kaybolmadı, o günlere bakınca Tuvalet takibi'nde otomatik
görünür (saatini emzirme saatinden alır). Yeni işaretlediklerin ise kendi
saatiyle, emzirmeden bağımsız kaydolur.

**Bu turda değişenler — yeni tema:** `index.html`, `sw.js` ve `manifest.json`
(üçünü de GitHub'a yükle; Firebase kuralı değişmedi, kayıtların biçimi aynı).

- **Görünüm:** Gündüz (açık, ferah) ve Gece (koyu "Ay ışığı"). Üstteki güneş/ay
  düğmesiyle tek dokunuşla geçilir; saate göre kendiliğinden değişmez. Seçim her
  telefonda ayrı saklanır. Yazı tipleri Outfit + Onest.
- **Sekmeler:** üstte Gün / Hafta / Gelişim (yana kaydırarak da geçilir). Her
  sekmenin en altındaki pati düğmesi o sekmeyi bu telefonun ana sayfası yapar.
  - Gün: gün gezinme, süren sayaçlar, Günün ritmi (24 saatlik şerit), Günlük
    bakış (artık Öğün, Emzirme ve Uyku toplamı da var), Kayıtlar, Bebeğin günü,
    Annenin günü, Notlar.
  - Hafta: Haftalık bakış + yapay zekâ Haftalık değerlendirme.
  - Gelişim: Gelişim dönemleri, yapay zekâ Günün bilgisi, Büyüme, Aşı takvimi,
    Gelişim aşamaları.
- **Kayıtlar:** "Akış" günün tüm kayıtlarını saat sırasıyla gösterir; birine
  dokununca düzenleme penceresi açılır (Sil / Tamam). "Listeler" önceki
  Beslenme / Tuvalet / Uyku kartlarını aynen gösterir; seçim telefonda saklanır.
- **Alttaki hızlı kayıt şeridi:** Emzirme (Sağ/Sol memeden başlat), Mama (saat
  ve son miktarla gelir), Tuvalet (Çiş / Kaka / İkisi tek dokunuş), Uyku (şimdi
  başlat). Her birinde "elle gir" seçeneği hep var; geçmiş bir güne bakarken
  sadece elle giriş açılır. Hızlı eklenen kayıt birkaç saniye "Geri al"ınabilir.
- **Sayaçlar:** başlatılan emzirme/uyku, Gün sekmesinin en üstünde büyük sayaçla
  görünür: diğer memeye geç, Bitir, Uyandı, Elle düzelt. Sayaç ayrı bir yerde
  tutulmaz: başlangıcı girilmiş, bitişi boş kayıt "sürüyor" demektir; süre
  başlangıç saatinden hesaplanır. Bu yüzden iki telefonda da aynı görünür,
  uygulama kapanıp açılsa da kaybolmaz, gece yarısını geçen uyku dünün kaydına
  yazılır. 3 saatten eski bitişsiz emzirme (16 saatten eski uyku) sayaç sayılmaz,
  Akış'ta "bitiş yok" diye görünür.
- **Uyku takibi kapalıyken** uyku sayacı, şeritteki uykular, Akış'taki uyku
  kayıtları, Uyku kutusu ve Uyku düğmesi de gizlenir.

**Eski haline dönmek:** önceki sürümün tam kopyası
`aslan-gunlugu-eski-hali-2026-10-16.zip` içinde (GERI-DONUS.txt'de adımlar var).
Dosyaları GitHub'a yeniden yüklemek yeterli; kayıtlar Firebase'de durduğu için
hiçbir kayıt kaybolmaz. Yeni sürümün sayaçla eklediği gizli saniye alanlarını
(`rightStartAt` vb.) eski sürüm görmezden gelir ve silmez.

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

`icon-*.png`, `favicon-32.png`, `auth-scene.png` ve `paw-tile.png`
dosyaları aslan temalı görseller — beğenmezsen aynı isimlerle kendi
görselini koyman yeterli (180×180, 192×192, 512×512). Açılış/yenileme
ekranındaki büyük soluk görsel de `icon-512.png`'dir (ayrı dosya yok).
`lion-mascot.png` artık kullanılmıyor; repoda kalmasının zararı yok.

- Uygulama simgesi kenara kadar dolu, köşesiz bir kare: köşeleri iPhone
  kendisi yuvarlar. Kendi görselini koyarsan köşeleri yuvarlatılmış ya da
  beyaz kenarlı olmasın, yoksa simgede çift çerçeve görünür.
  `icon-maskable-512.png` aynı resmin kenarlardan boşluklu hâli (Android
  simgeyi daireye kırpınca yazı kesilmesin diye).
- `favicon-32.png` (tarayıcı sekmesindeki minik simge) sadece aslanın yüzü;
  32 pikselde tüm resim seçilmiyor.
- Simgeyi değiştirince `index.html`, `manifest.json` ve `sw.js`'teki
  `?v=2` sürümlerini bir artır (`?v=3`), `sw.js`'teki `CACHE_NAME`'i de;
  yoksa telefon eski simgeyi önbellekten göstermeye devam edebilir.
- **iPhone ana ekrandaki simgeyi eklendiği anda kaydeder**, sonradan
  güncellemez. Yeni simge için: ana ekrandaki uygulamayı sil, Safari'de
  siteyi açıp Paylaş → Ana Ekrana Ekle ile yeniden ekle. Kayıtlar
  Firebase'de olduğu için hiçbir şey kaybolmaz; sadece bir kez yeniden
  giriş yaparsın, ana sayfa ve kısa/tam görünüm tercihleri de
  varsayılana döner. Eklerken isim kutusuna istediğin adı yazabilirsin.

## AI özellikleri kurulumu (Cloudflare Worker)

Bu kısım opsiyonel — kurmazsan uygulamanın geri kalanı aynen çalışır,
sadece "Günün bilgisi" ve "Haftalık değerlendirme" kartları README'ye
yönlendiren bir mesaj gösterir.

1. **Ücretsiz bir Gemini API key al:** [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   adresine git, Google hesabınla giriş yap, **Create API key**'e bas,
   çıkan anahtarı kopyala. Kart bilgisi istemez.
2. **Cloudflare'de yeni bir Worker oluştur:** [dash.cloudflare.com](https://dash.cloudflare.com)
   → sol menüden **Workers & Pages** → **Create application** (bazı
   hesaplarda sadece **Create** yazar) → şablon galerisinden **"Hello
   World" Worker** ya da benzer boş/basit bir şablon seç → bir isim ver
   (ör. `bebek-gunlugu-ai`) → **Deploy** (şimdilik varsayılan kodla,
   birazdan değiştireceğiz).
3. **Kodu yapıştır:** Oluşan Worker'a gir → **Edit code** → editördeki
   her şeyi sil, bu klasördeki `worker.js` içeriğini yapıştır → **Deploy**.
4. **Gemini key'ini secret olarak ekle:** Worker sayfasında **Settings →
   Variables and Secrets** → **Add** → tür: **Secret**, isim:
   `GEMINI_API_KEY`, değer: 1. adımda kopyaladığın key → **Save & deploy**.
5. (Opsiyonel ama önerilir) Aynı yerde bir değişken daha ekle: tür
   **Text**, isim `ALLOWED_ORIGIN`, değer senin GitHub Pages adresin
   (ör. `https://semihcanyanar-pixel.github.io`) — böylece Worker'ı
   sadece kendi siten çağırabilir.
6. **Worker adresini kopyala:** Worker'ın ana sayfasında
   `https://bebek-gunlugu-ai.KULLANICI-ADIN.workers.dev` gibi bir adres
   göreceksin, onu kopyala.
7. **index.html'e yapıştır:** `WORKER_URL = "BURAYA_WORKER_URL"` satırını
   bulup değerini 6. adımdaki adresle değiştir, dosyayı GitHub'a tekrar
   yükle.

Kurulduktan sonra "Günün bilgisi" günde bir kez otomatik oluşup
`meta/aiCache`'te önbelleğe alınıyor (ikiniz de aynı kartı görür, her
açılışta yeniden üretilmiyor). "Haftalık değerlendirme" ise sadece
butona bastığınızda oluşuyor — ikisi de çok düşük hacimde çağrı
yapıyor, ücretsiz kotayı zorlaman beklenmez.

## Sorun giderme

- **Giriş çalışmıyor:** Authentication'da Email/Password sağlayıcısının
  açık olduğunu ve hesabın gerçekten oluşturulduğunu kontrol et. Giriş
  ekranındaki mesaj artık sebebi söylüyor (yanlış şifre / çok deneme
  kilidi / bağlantı yok).
- **Şifreyi unuttum:** giriş ekranında e-postanı yazıp "Şifremi unuttum"a
  dokun; gelen e-postadaki bağlantıdan yeni şifre belirle (spam klasörüne
  de bak). Alternatif: Firebase Console → Authentication → Users →
  hesabın satırındaki ⋮ → Reset password.
- **iPhone yanlış şifreyi öneriyor:** bütün uygulamaların aynı adreste
  (`semihcanyanar-pixel.github.io`) olduğu için iPhone'un Parolalar'ı
  hepsinin şifresini aynı siteninmiş gibi saklıyor ve başka bir uygulamanın
  şifresini önerebiliyor. Şifreyi elle yaz; Ayarlar → Parolalar'da bu
  adresteki eski kaydı da güncelleyebilirsin.
- **Veriler kaydolmuyor / "Kaydedilemedi" yazıyor:** Firestore Rules'ın
  yayınlandığından (Publish) ve `firebaseConfig`'in doğru proje ID'sini
  gösterdiğinden emin ol.
- **Güncelleme sonrası eski hâli görünüyor:** GitHub'a yeni `index.html`
  yükledikten sonra 1-2 dakika bekle (GitHub Pages yayına alıyor), sonra
  uygulamada sol üstteki **↻** butonuna bas. Yine de eski bir sürüm takılı
  kalırsa: iPhone'da Ayarlar → Uygulamalar → Safari → Gelişmiş → Website
  Data → siteyi bul → sola kaydır → Sil, sonra sayfayı yeniden aç.
- **Saat seçicideki "Sıfırla" saati silmiyor:** o düğme iPhone'un kendi
  seçicisine ait; bazı iOS sürümlerinde alanı boşaltmıyor, seçiciyi açtığın
  andaki saate geri döndürüyor ve uygulama ona karışamıyor. Bir saati
  silmek için kutunun içindeki ⊗ düğmesini kullan. Ayrıca boş
  bir saat kutusuna dokunmak iPhone'da kutuyu hemen şu anki saatle doldurur;
  yanlışlıkla dokunduysan yine ⊗ ile silebilirsin.
- **AI kartları "README'deki adımları tamamla" diyor:** `WORKER_URL`
  hâlâ `BURAYA_...` ile mi başlıyor, kontrol et.
- **"Günün bilgisi" sürekli "Hazırlanıyor…" yazıyor ya da bir hata
  gösteriyor:** en güncel `worker.js`'i kullandığından emin ol — ilk
  sürümde "gemini-2.5-flash" modeli vardı, Google bunu artık sadece daha
  önce kullanmış hesaplara açık tutuyor, yeni API key'lerde 404 hatası
  veriyor. Güncel dosya "gemini-3.5-flash-lite" kullanıyor. Worker'a
  girip **Edit code**'dan içeriği güncel `worker.js` ile değiştirip
  tekrar **Deploy** etmen yeterli. Hâlâ olmuyorsa artık hatanın kendisini
  ekranda göreceksin (parantez içinde) — onu paylaşırsan birlikte bakarız.
