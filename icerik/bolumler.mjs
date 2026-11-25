/**
 * Eğitim bölümleri — ADIMLI DERS AKIŞI. Her bölüm 5–7 adımdan oluşur:
 *   metin    — konu anlatımı (HTML: p, h3, ul/ol, strong, em)
 *   video    — YouTube (takipli, ileri sarma yok), isteğe bağlı ara sorular
 *   ornek    — gerçek bir girişimin kısa hikâyesi + "ne öğreniyoruz?"
 *   kartlar  — anahtar kavramlar (çevrilince açıklama)
 *   sina     — kısa sorular, anında geri bildirim ve açıklama
 *   etkinlik — yazılı görev; cevap kişinin "Fikrim" defterine kaydedilir
 *
 * TASLAK İÇERİK: genel ve doğrulanabilir bilgilere dayanır. Videolar YouTube'da
 * varlıkları, gömülebilirlikleri ve süreleri denetlenerek seçildi (24.11.2026);
 * ara sorular videoların başlığında söylenen ana mesaja dayanır, ayrıntıya değil.
 * Örnek hikâyelerde yalnızca kamuya açık temel bilgiler (kuruluş yeri, yılı, ne
 * yaptığı) kullanıldı. İhtiyaç analizi (WP2) ve HBV'nin proje formatına (WP3 A-1)
 * göre içerik ekibi gözden geçirecek.
 */
const ul = m => '<ul>' + m.map(x => `<li>${x}</li>`).join('') + '</ul>';
const ol = m => '<ol>' + m.map(x => `<li>${x}</li>`).join('') + '</ol>';

/* JRC EntreComp video serisi: başlık = ana mesaj; soru videonun sonuna yakın sorulur. */
const jrcSorusu = (sn, dogruTr, dogruEn) => ({
  sn, tur: 'cs',
  soru: { tr: 'Bu videonun ana mesajına göre girişimcilik neyle ilgilidir?', en: 'According to the main message of this video, what is entrepreneurship about?' },
  secenekler: [
    { tr: dogruTr, en: dogruEn },
    { tr: 'Yalnızca çok para kazanmak', en: 'Only making a lot of money' },
    { tr: 'Her şeyi tek başına yapmak', en: 'Doing everything alone' },
  ],
  dogru: 0,
});

export const BOLUMLER = [
  /* ============================== 1. BAŞLARKEN ============================== */
  {
    id: 'baslarken', renk: 'mavi', simge: 'pusula', dakika: 15,
    baslik: { tr: 'Başlarken', en: 'Getting started' },
    ozet: { tr: 'Eğitim nasıl işler, sende neler değişecek, sertifikanı nasıl alırsın?', en: 'How the training works, what will change for you and how to earn your certificate.' },
    hedefler: {
      tr: ['Eğitimin yapısını ve nasıl ilerleyeceğini bilirsin', 'Girişimciliğin yalnızca şirket kurmak olmadığını görürsün', 'Bu eğitimden kendi beklentini yazarsın'],
      en: ['You know how the training is structured and how to progress', 'You see that entrepreneurship is not only about starting a company', 'You write down what you expect from this training'],
    },
    adimlar: [
      {
        id: 'hosgeldin', tur: 'metin', baslik: { tr: 'Hoş geldin', en: 'Welcome' },
        govde: {
          tr: '<p>Bu eğitim, <strong>yeşil, sosyal ve dijital (GSD) girişimciliği</strong> tanıman ve kendi fikrini ilk proje planına dönüştürmen için hazırlandı. Ücretsizdir, kendi hızında ilerlersin ve telefondan da rahatça kullanabilirsin.</p>'
            + '<h3>Bu eğitim kimin için?</h3><p>17–30 yaş arası gençler, gençlik çalışanları ve bir fikri olan ya da bir fikir arayan herkes için. Daha önce hiç iş kurmamış olman, hatta "girişimci" kelimesini kendine yakıştırmaman sorun değil: bu eğitim tam da oradan başlıyor.</p>'
            + '<h3>Nasıl ilerleyeceksin?</h3>'
            + ol(['Altı bölümü sırayla tamamla. Her bölüm 5–7 kısa adımdan oluşur: konu anlatımı, video, gerçek bir girişimin hikâyesi, anahtar kavramlar, kısa sorular ve bir etkinlik.',
              'Her adımı bitirdiğinde soldaki listede yeşil bir tik çıkar. Videoları ileri saramazsın ama istediğin yerde durdurup sonra devam edebilirsin.',
              'Etkinliklerde yazdıkların <strong>Fikrim</strong> sayfanda toplanır; son bölümde bunlarla kendi proje planını kurarsın.',
              'Altı bölümü bitirince 10 soruluk son teste girersin; 7 doğru yeterli, istediğin kadar deneyebilirsin.',
              'Kısa ve isimsiz görüş anketini doldurduğunda doğrulama kodlu sertifikan hazır olur.'])
            + '<h3>Bu eğitim nereden geliyor?</h3><p>E-YOUTHPRENEUR, Türkiye, İtalya, Romanya, Hollanda Krallığı, Portekiz ve Danimarka\'dan yedi kurumun yürüttüğü bir Erasmus+ iş birliği ortaklığıdır. Amacı, gençlerin girişimcilik becerilerini — özellikle çevreye, topluma ve dijital dünyaya katkı sunan fikirler için — güçlendirmektir.</p>',
          en: '<p>This training helps you discover <strong>green, social and digital (GSD) entrepreneurship</strong> and turn your own idea into a first project plan. It is free, you go at your own pace and it works well on your phone.</p>'
            + '<h3>Who is it for?</h3><p>Young people aged 17–30, youth workers and anyone who has an idea — or is looking for one. It does not matter if you have never started a business or never thought of yourself as an "entrepreneur": this training starts exactly there.</p>'
            + '<h3>How will you progress?</h3>'
            + ol(['Complete the six parts in order. Each part has 5–7 short steps: a lesson, a video, the story of a real venture, key concepts, a short quiz and an activity.',
              'When you finish a step, a green tick appears in the list on the left. You cannot skip ahead in videos, but you can pause anywhere and continue later.',
              'What you write in the activities is collected on your <strong>My idea</strong> page; in the last part you use it to build your own project plan.',
              'After the six parts you take a 10-question final test; 7 correct answers are enough and you can try as often as you like.',
              'When you fill in the short, anonymous feedback survey, your certificate with a verification code is ready.'])
            + '<h3>Where does this training come from?</h3><p>E-YOUTHPRENEUR is an Erasmus+ cooperation partnership of seven organisations from Türkiye, Italy, Romania, the Kingdom of the Netherlands, Portugal and Denmark. Its aim is to strengthen young people\'s entrepreneurial skills — especially for ideas that contribute to the environment, society and the digital world.</p>',
        },
      },
      {
        id: 'girisimci-kim', tur: 'video', baslik: { tr: 'Girişimci olmak ne demek?', en: 'What does it mean to be an entrepreneur?' },
        youtube: 'lJjILQu2xM8', sure: 205, kaynak: 'The School of Life',
        not: { tr: 'Video İngilizce; oynatıcıdaki CC düğmesinden Türkçe altyazıyı açabilirsin.', en: 'Turn on subtitles with the CC button in the player.' },
        sorular: [],
      },
      {
        id: 'efsaneler', tur: 'sina', baslik: { tr: 'Doğru mu, efsane mi?', en: 'Fact or myth?' },
        sorular: [
          { soru: { tr: 'Girişimci olmak için önce bir şirket kurmak gerekir.', en: 'To be an entrepreneur you first have to start a company.' },
            secenekler: [{ tr: 'Doğru', en: 'True' }, { tr: 'Efsane', en: 'Myth' }], dogru: 1,
            aciklama: { tr: 'Efsane. Bir okul projesini, gönüllü bir kampanyayı ya da mahalle etkinliğini örgütlemek de girişimciliktir: bir fikri başkaları için değer yaratan eyleme dönüştürüyorsun.', en: 'Myth. Organising a school project, a volunteer campaign or a neighbourhood event is also entrepreneurship: you turn an idea into action that creates value for others.' } },
          { soru: { tr: 'Girişimcilik doğuştan gelen bir yetenektir, sonradan öğrenilemez.', en: 'Entrepreneurship is a talent you are born with; it cannot be learned.' },
            secenekler: [{ tr: 'Doğru', en: 'True' }, { tr: 'Efsane', en: 'Myth' }], dogru: 1,
            aciklama: { tr: 'Efsane. Avrupa Birliği girişimciliği öğrenilebilen bir yetkinlik olarak tanımlar (EntreComp). Fırsatı fark etmek, planlamak, başkalarıyla çalışmak pratikle gelişir.', en: 'Myth. The European Union defines entrepreneurship as a competence that can be learned (EntreComp). Spotting opportunities, planning and working with others all improve with practice.' } },
          { soru: { tr: 'Bir girişim kâr etmenin yanında çevreye ya da topluma da değer yaratabilir.', en: 'A venture can create value for the environment or society as well as making a profit.' },
            secenekler: [{ tr: 'Doğru', en: 'True' }, { tr: 'Efsane', en: 'Myth' }], dogru: 0,
            aciklama: { tr: 'Doğru. Bu eğitimin konusu tam da bu: yeşil ve sosyal girişimler hem ayakta kalmayı hem de etki yaratmayı hedefler.', en: 'True. That is exactly what this training is about: green and social ventures aim both to be sustainable and to create impact.' } },
        ],
      },
      {
        id: 'beklenti', tur: 'etkinlik', baslik: { tr: 'Senin hedefin', en: 'Your goal' },
        soru: { tr: 'Bu eğitimin sonunda yapabilmek istediğin bir şeyi yaz. Aklında bir fikir varsa onu da bir cümleyle not et.', en: 'Write one thing you want to be able to do at the end of this training. If you already have an idea, note it in one sentence.' },
        ipucu: { tr: 'Örn. "Mahallemdeki bir soruna çözüm bulan küçük bir proje başlatmak istiyorum."', en: 'e.g. "I want to start a small project that solves a problem in my neighbourhood."' },
      },
    ],
  },

  /* ============================== 2. GİRİŞİMCİLİĞE GİRİŞ ============================== */
  {
    id: 'giris', renk: 'lacivert', simge: 'ampul', dakika: 30,
    baslik: { tr: 'Girişimciliğe giriş', en: 'Introduction to entrepreneurship' },
    ozet: { tr: 'Sorunlara fırsat gözüyle bakmak ve Avrupa\'nın girişimcilik yetkinlik çerçevesi EntreComp.', en: 'Looking at problems as opportunities, and Europe\'s entrepreneurship competence framework, EntreComp.' },
    hedefler: {
      tr: ['Girişimciliği "değer yaratma" olarak tanımlarsın', 'EntreComp\'un üç alanını ve örnek yetkinlikleri bilirsin', 'Çevrende fırsat olabilecek sorunları fark edersin'],
      en: ['You define entrepreneurship as "creating value"', 'You know the three areas of EntreComp and example competences', 'You notice problems around you that could be opportunities'],
    },
    adimlar: [
      {
        id: 'deger', tur: 'metin', baslik: { tr: 'Girişimcilik: değer yaratmak', en: 'Entrepreneurship: creating value' },
        govde: {
          tr: '<p>Avrupa Birliği girişimciliği şöyle tanımlar: <strong>fırsatlar ve fikirler üzerine harekete geçmek ve bunları başkaları için değere dönüştürmek.</strong> Bu değer ekonomik olabilir, ama sosyal ya da kültürel de olabilir.</p>'
            + '<h3>Üç tür değer</h3>'
            + ul(['<strong>Ekonomik değer:</strong> insanların ödemeye razı olduğu bir ürün ya da hizmet; iş ve gelir yaratır.',
              '<strong>Sosyal değer:</strong> bir topluluğun hayatını iyileştirir — örneğin yalnız yaşayan yaşlılara destek ya da gençlere ücretsiz kurs.',
              '<strong>Çevresel değer:</strong> atığı, kirliliği ya da kaynak tüketimini azaltır.'])
            + '<p>Pek çok başarılı girişim bunlardan birkaçını birlikte yaratır. Örneğin atık yiyeceği ucuza satan bir uygulama hem kullanıcıya para kazandırır, hem işletmeye gelir getirir, hem de israfı azaltır.</p>'
            + '<h3>Fırsat nereden gelir?</h3><p>Fırsatların çoğu bir <strong>sorundan</strong> doğar: bir şey zor, pahalı, yavaş, israf ya da adaletsizse, orada bir fırsat vardır. Girişimci bakış açısı, şikâyet ettiğimiz şeylere "bunu nasıl daha iyi yapabiliriz?" diye bakmaktır.</p>'
            + '<p>Fırsat fark etmenin üç basit yolu:</p>'
            + ul(['<strong>Gözle:</strong> bir gün boyunca insanların neye takıldığını, nerede beklediğini, neyi attığını not et.',
              '<strong>Sor:</strong> "Bu konuda seni en çok ne zorluyor?" sorusu çok şey anlatır.',
              '<strong>Birleştir:</strong> iki ayrı alanı bir araya getir — ör. boş araç koltukları + aynı yöne gidenler.']),
          en: '<p>The European Union defines entrepreneurship as <strong>acting upon opportunities and ideas and transforming them into value for others.</strong> The value can be financial, but it can also be social or cultural.</p>'
            + '<h3>Three kinds of value</h3>'
            + ul(['<strong>Economic value:</strong> a product or service people are willing to pay for; it creates jobs and income.',
              '<strong>Social value:</strong> it improves life in a community — for example support for older people living alone, or free courses for young people.',
              '<strong>Environmental value:</strong> it reduces waste, pollution or the use of resources.'])
            + '<p>Many successful ventures create several of these at once. An app that sells surplus food cheaply saves users money, brings income to shops and reduces waste.</p>'
            + '<h3>Where do opportunities come from?</h3><p>Most opportunities come from a <strong>problem</strong>: if something is difficult, expensive, slow, wasteful or unfair, there is an opportunity. The entrepreneurial mindset looks at what we complain about and asks "how could this be done better?"</p>'
            + '<p>Three simple ways to spot opportunities:</p>'
            + ul(['<strong>Observe:</strong> for one day, note where people get stuck, where they wait and what they throw away.',
              '<strong>Ask:</strong> "What is the most difficult thing for you about this?" tells you a lot.',
              '<strong>Combine:</strong> bring two separate things together — e.g. empty car seats + people travelling the same way.']),
        },
      },
      {
        id: 'firsat-video', tur: 'video', baslik: { tr: 'Fırsatları fark etmek', en: 'Spotting opportunities' },
        youtube: 'LctfWCH5j0w', sure: 152, kaynak: 'Joint Research Centre (JRC), European Commission',
        not: { tr: 'Avrupa Komisyonu Ortak Araştırma Merkezi\'nin EntreComp serisinden. İngilizce; CC ile altyazı açılabilir.', en: 'From the European Commission Joint Research Centre\'s EntreComp series. Subtitles via CC.' },
        sorular: [jrcSorusu(138, 'Fırsatları fark etmek', 'Spotting opportunities')],
      },
      {
        id: 'entrecomp', tur: 'metin', baslik: { tr: 'EntreComp: üç alan, on beş yetkinlik', en: 'EntreComp: three areas, fifteen competences' },
        govde: {
          tr: '<p><strong>EntreComp</strong>, Avrupa Komisyonu\'nun 2016\'da yayımladığı Girişimcilik Yetkinlik Çerçevesi\'dir. Girişimciliği bir meslek değil, herkesin geliştirebileceği bir <strong>yetkinlik</strong> olarak ele alır. Üç alan ve her alanda beşer olmak üzere on beş yetkinlikten oluşur.</p>'
            + '<h3>1. Fikirler ve fırsatlar</h3>' + ul(['Fırsatları fark etmek', 'Yaratıcılık', 'Vizyon', 'Fikirlere değer biçmek', 'Etik ve sürdürülebilir düşünme'])
            + '<h3>2. Kaynaklar</h3>' + ul(['Öz farkındalık ve öz yeterlik', 'Motivasyon ve azim', 'Kaynakları harekete geçirmek', 'Finansal ve ekonomik okuryazarlık', 'Başkalarını harekete geçirmek'])
            + '<h3>3. Eyleme geçmek</h3>' + ul(['İnisiyatif almak', 'Planlama ve yönetim', 'Belirsizlik, muğlaklık ve riskle başa çıkmak', 'Başkalarıyla çalışmak', 'Deneyimle öğrenmek'])
            + '<p>Bu eğitimdeki her bölüm bu yetkinliklerden birkaçını çalıştırır. Örneğin "Kendi proje fikrin" bölümü planlama, inisiyatif alma ve deneyimle öğrenmeye odaklanır.</p>',
          en: '<p><strong>EntreComp</strong> is the Entrepreneurship Competence Framework published by the European Commission in 2016. It treats entrepreneurship not as a job but as a <strong>competence</strong> everyone can develop. It has three areas with five competences each — fifteen in total.</p>'
            + '<h3>1. Ideas and opportunities</h3>' + ul(['Spotting opportunities', 'Creativity', 'Vision', 'Valuing ideas', 'Ethical and sustainable thinking'])
            + '<h3>2. Resources</h3>' + ul(['Self-awareness and self-efficacy', 'Motivation and perseverance', 'Mobilising resources', 'Financial and economic literacy', 'Mobilising others'])
            + '<h3>3. Into action</h3>' + ul(['Taking the initiative', 'Planning and management', 'Coping with uncertainty, ambiguity and risk', 'Working with others', 'Learning through experience'])
            + '<p>Each part of this training works on several of these competences. "Your project idea", for example, focuses on planning, taking the initiative and learning through experience.</p>',
        },
      },
      {
        id: 'entrecomp-video', tur: 'video', baslik: { tr: 'EntreComp kısaca', en: 'EntreComp in brief' },
        youtube: 'UwZPcJky0Ko', sure: 245, kaynak: 'European Training Foundation',
        not: { tr: 'Avrupa Eğitim Vakfı (ETF) animasyonu. İngilizce; CC ile altyazı açılabilir.', en: 'Animation by the European Training Foundation (ETF). Subtitles via CC.' },
        sorular: [{
          sn: 220, tur: 'cs',
          soru: { tr: 'Bu videoda anlatılan Avrupa çerçevesinin adı nedir?', en: 'What is the name of the European framework presented in this video?' },
          secenekler: [{ tr: 'EntreComp', en: 'EntreComp' }, { tr: 'Erasmus+', en: 'Erasmus+' }, { tr: 'Avrupa Yeşil Mutabakatı', en: 'European Green Deal' }],
          dogru: 0,
        }],
      },
      {
        id: 'blablacar', tur: 'ornek', baslik: { tr: 'Örnek: BlaBlaCar', en: 'Case: BlaBlaCar' },
        kurulus: 'BlaBlaCar', yer: { tr: 'Fransa · 2006', en: 'France · 2006' },
        govde: {
          tr: '<p>Şehirler arası yolculuk yapan pek çok araçta boş koltuk vardır; aynı yöne gitmek isteyen pek çok kişi de pahalı ya da seyrek ulaşımla uğraşır. BlaBlaCar bu iki şeyi bir araya getirdi: sürücüler boş koltuklarını paylaşır, yolcular yol masrafına katkı verir.</p><p>Fikir yeni bir araç ya da yol icat etmedi; <strong>zaten var olan ama boşa giden bir kaynağı</strong> fark etti ve bir dijital platformla insanları eşleştirdi.</p>',
          en: '<p>Many cars travelling between cities have empty seats, while many people going the same way struggle with expensive or infrequent transport. BlaBlaCar brought these together: drivers share their empty seats and passengers contribute to travel costs.</p><p>The idea did not invent a new vehicle or road; it noticed <strong>a resource that already existed but was wasted</strong> and matched people through a digital platform.</p>',
        },
        ders: { tr: 'Fırsat çoğu zaman göz önündedir: boşa giden kaynakları ve birbirini bulamayan insanları ara.', en: 'Opportunities are often in plain sight: look for wasted resources and people who cannot find each other.' },
      },
      {
        id: 'kavramlar', tur: 'kartlar', baslik: { tr: 'Anahtar kavramlar', en: 'Key concepts' },
        kartlar: [
          { on: { tr: 'Girişimcilik', en: 'Entrepreneurship' }, arka: { tr: 'Fırsat ve fikirler üzerine harekete geçip bunları başkaları için değere dönüştürmek.', en: 'Acting on opportunities and ideas and transforming them into value for others.' } },
          { on: { tr: 'Fırsat', en: 'Opportunity' }, arka: { tr: 'Karşılanmamış bir ihtiyaç ya da daha iyi çözülebilecek bir sorun.', en: 'An unmet need or a problem that could be solved better.' } },
          { on: { tr: 'Değer', en: 'Value' }, arka: { tr: 'Bir fikrin başkalarına sağladığı fayda: ekonomik, sosyal ya da çevresel.', en: 'The benefit an idea gives others: economic, social or environmental.' } },
          { on: { tr: 'EntreComp', en: 'EntreComp' }, arka: { tr: 'AB\'nin girişimcilik yetkinlik çerçevesi: 3 alan, 15 yetkinlik.', en: 'The EU entrepreneurship competence framework: 3 areas, 15 competences.' } },
          { on: { tr: 'Belirsizlik', en: 'Uncertainty' }, arka: { tr: 'Sonucun önceden bilinmemesi. Girişimci onu yok edemez ama küçük denemelerle azaltır.', en: 'Not knowing the outcome in advance. Entrepreneurs cannot remove it but reduce it with small tests.' } },
        ],
      },
      {
        id: 'sorunlar', tur: 'etkinlik', baslik: { tr: 'Üç sorun, bir fırsat', en: 'Three problems, one opportunity' },
        soru: { tr: 'Okulunda, mahallende ya da şehrinde gördüğün üç sorunu yaz. Sonra en çok çözmek istediğini seç ve nedenini bir cümleyle açıkla.', en: 'Write three problems you see at school, in your neighbourhood or city. Then pick the one you most want to solve and explain why in one sentence.' },
        ipucu: { tr: '1) … 2) … 3) … — En çok … çünkü …', en: '1) … 2) … 3) … — Most of all … because …' },
      },
    ],
  },

  /* ============================== 3. YEŞİL ============================== */
  {
    id: 'yesil', renk: 'yesil', simge: 'yaprak', dakika: 35,
    baslik: { tr: 'Yeşil girişimcilik', en: 'Green entrepreneurship' },
    ozet: { tr: 'Gezegene iyi gelen fikirler: döngüsel ekonomi, onarım, ileri dönüşüm.', en: 'Ideas that are good for the planet: circular economy, repair, upcycling.' },
    hedefler: {
      tr: ['Yeşil girişimciliği ve döngüsel ekonomiyi açıklarsın', '"Yeşil aklama"yı fark edersin', 'Çevrendeki bir atığı fırsata çevirecek bir fikir üretirsin'],
      en: ['You explain green entrepreneurship and the circular economy', 'You recognise "greenwashing"', 'You come up with an idea to turn a local waste into an opportunity'],
    },
    adimlar: [
      {
        id: 'yesil-nedir', tur: 'metin', baslik: { tr: 'Yeşil girişimcilik nedir?', en: 'What is green entrepreneurship?' },
        govde: {
          tr: '<p>Yeşil girişimcilik; çevreye verilen zararı azaltan ya da onarılmasına yardım eden ürün, hizmet veya iş modelleri geliştirmektir. Avrupa Yeşil Mutabakatı, Avrupa\'yı <strong>2050\'ye kadar iklim nötr</strong> yapmayı hedefliyor; bu yüzden yeşil becerilere ve yeşil fikirlere ihtiyaç her yıl artıyor.</p>'
            + '<h3>Doğrusal ekonomi: al, üret, at</h3><p>Bugün tükettiğimiz pek çok şey kısa bir yolculuk yapar: hammadde çıkarılır, ürün yapılır, bir süre kullanılır ve atılır. Bu model hem kaynakları tüketir hem de büyük miktarda atık üretir.</p>'
            + '<h3>Döngüsel ekonomi: kullanımda tut</h3><p>Döngüsel ekonomide amaç malzemeleri ve ürünleri <strong>olabildiğince uzun süre kullanımda tutmak</strong>tır:</p>'
            + ul(['<strong>Azalt:</strong> daha az malzeme ve enerjiyle aynı ihtiyacı karşıla.', '<strong>Yeniden kullan ve paylaş:</strong> bir ürünü daha çok kişi, daha uzun süre kullansın.',
              '<strong>Onar:</strong> bozulanı atma, düzelt; tamir edilebilir tasarla.', '<strong>Geri dönüştür ve ileri dönüştür:</strong> atığı yeni malzemeye ya da daha değerli bir ürüne çevir.'])
            + '<h3>Gençler için yeşil fikir alanları</h3>'
            + ul(['Yiyecek israfını azaltan hizmetler', 'Tamir, kiralama ve ikinci el', 'Atıktan tasarım (ileri dönüşüm)', 'Enerji ve su tasarrufu danışmanlığı', 'Yerel ve mevsimlik üretimi tüketiciyle buluşturmak']),
          en: '<p>Green entrepreneurship means developing products, services or business models that reduce harm to the environment or help repair it. The European Green Deal aims to make Europe <strong>climate-neutral by 2050</strong>, so demand for green skills and green ideas grows every year.</p>'
            + '<h3>Linear economy: take, make, throw away</h3><p>Much of what we consume makes a short journey: raw materials are extracted, a product is made, used for a while and thrown away. This model uses up resources and creates a lot of waste.</p>'
            + '<h3>Circular economy: keep it in use</h3><p>In a circular economy the aim is to <strong>keep materials and products in use for as long as possible</strong>:</p>'
            + ul(['<strong>Reduce:</strong> meet the same need with less material and energy.', '<strong>Reuse and share:</strong> let more people use a product for longer.',
              '<strong>Repair:</strong> fix instead of throwing away; design things to be repairable.', '<strong>Recycle and upcycle:</strong> turn waste into new materials or a product of higher value.'])
            + '<h3>Green idea areas for young people</h3>'
            + ul(['Services that reduce food waste', 'Repair, rental and second-hand', 'Design from waste (upcycling)', 'Energy and water saving advice', 'Connecting local and seasonal producers with consumers']),
        },
      },
      {
        id: 'dongusel-video', tur: 'video', baslik: { tr: 'Döngüsel ekonomi', en: 'The circular economy' },
        youtube: 'zCRKvDyyHmI', sure: 229, kaynak: 'Ellen MacArthur Foundation',
        not: { tr: 'Video İngilizce; oynatıcıdaki CC düğmesiyle altyazıyı açabilirsin.', en: 'Turn on subtitles with the CC button in the player.' },
        sorular: [
          { sn: 45, tur: 'dy', soru: { tr: 'Döngüsel ekonomide ürünler kullanıldıktan sonra atılmak üzere tasarlanır.', en: 'In a circular economy, products are designed to be thrown away after use.' }, dogru: 1 },
          { sn: 120, tur: 'cs', soru: { tr: 'Döngüsel ekonominin amacı hangisidir?', en: 'What is the aim of the circular economy?' },
            secenekler: [{ tr: 'Malzemeleri ve ürünleri kullanımda tutmak', en: 'Keep materials and products in use' }, { tr: 'Daha hızlı üretip daha hızlı atmak', en: 'Produce and discard faster' }, { tr: 'Yalnızca geri dönüşüm kutusu kullanmak', en: 'Only use recycling bins' }], dogru: 0 },
        ],
      },
      {
        id: 'toogoodtogo', tur: 'ornek', baslik: { tr: 'Örnek: Too Good To Go', en: 'Case: Too Good To Go' },
        kurulus: 'Too Good To Go', yer: { tr: 'Danimarka · 2016', en: 'Denmark · 2016' },
        govde: {
          tr: '<p>Fırınlar, restoranlar ve marketler gün sonunda satılmayan ama hâlâ yenebilir durumdaki yiyecekleri çoğu zaman atar. Kopenhag\'da kurulan Too Good To Go, bu işletmelerin fazla yiyeceklerini indirimli bir "sürpriz paket" olarak bir uygulama üzerinden satmasını sağlar.</p><p>Herkes kazanır: kullanıcı ucuza yemek alır, işletme atacağı üründen gelir elde eder, yiyecek israfı azalır. Bugün pek çok Avrupa ülkesinde kullanılıyor.</p>',
          en: '<p>Bakeries, restaurants and shops often throw away food that did not sell but is still good to eat. Founded in Copenhagen, Too Good To Go lets these businesses sell their surplus food as a discounted "surprise bag" through an app.</p><p>Everyone wins: users get food cheaply, businesses earn from products they would have thrown away and food waste is reduced. It is now used in many European countries.</p>',
        },
        ders: { tr: 'Atık, yanlış yerdeki bir kaynaktır. En iyi yeşil fikirler çoğu zaman bir israfı herkes için kazanca çevirir.', en: 'Waste is a resource in the wrong place. The best green ideas often turn waste into a win for everyone.' },
      },
      {
        id: 'repaircafe', tur: 'ornek', baslik: { tr: 'Örnek: Repair Café', en: 'Case: Repair Café' },
        kurulus: 'Repair Café', yer: { tr: 'Hollanda · 2009', en: 'Netherlands · 2009' },
        govde: {
          tr: '<p>Amsterdam\'da Martine Postma\'nın başlattığı Repair Café\'lerde insanlar bozuk eşyalarını — lamba, kıyafet, bisiklet, küçük ev aletleri — getirir ve gönüllü tamircilerle birlikte ücretsiz onarır. Fikir kısa sürede yayıldı; bugün dünya genelinde binlerce Repair Café var.</p><p>Büyük bir yatırım gerektirmedi: bir salon, birkaç gönüllü ve bir duyuru yetti. Hem atığı azaltıyor hem de komşuları bir araya getiriyor.</p>',
          en: '<p>At Repair Cafés, started by Martine Postma in Amsterdam, people bring broken items — lamps, clothes, bikes, small appliances — and repair them for free together with volunteer fixers. The idea spread quickly; today there are thousands of Repair Cafés around the world.</p><p>It needed no big investment: a room, a few volunteers and an announcement were enough. It reduces waste and brings neighbours together.</p>',
        },
        ders: { tr: 'Yeşil bir girişim kâr amaçlı olmak zorunda değil; küçük, yerel ve kolay kopyalanabilir bir model de büyük etki yaratabilir.', en: 'A green venture does not have to be for profit; a small, local model that is easy to copy can have a big impact.' },
      },
      {
        id: 'etik-video', tur: 'video', baslik: { tr: 'Etik ve sürdürülebilir düşünme', en: 'Ethical and sustainable thinking' },
        youtube: 'Hg_tEWqB--s', sure: 124, kaynak: 'Joint Research Centre (JRC), European Commission',
        not: { tr: 'EntreComp serisinden. İngilizce; CC ile altyazı açılabilir.', en: 'From the EntreComp series. Subtitles via CC.' },
        sorular: [jrcSorusu(110, 'Etik ve sürdürülebilir düşünmek', 'Ethical and sustainable thinking')],
      },
      {
        id: 'yesil-kavram', tur: 'kartlar', baslik: { tr: 'Anahtar kavramlar', en: 'Key concepts' },
        kartlar: [
          { on: { tr: 'Döngüsel ekonomi', en: 'Circular economy' }, arka: { tr: 'Malzeme ve ürünlerin olabildiğince uzun süre kullanımda tutulduğu ekonomi modeli.', en: 'An economic model that keeps materials and products in use for as long as possible.' } },
          { on: { tr: 'İleri dönüşüm', en: 'Upcycling' }, arka: { tr: 'Atığı, ilk hâlinden daha değerli yeni bir ürüne dönüştürmek.', en: 'Turning waste into a new product of higher value than the original.' } },
          { on: { tr: 'Karbon ayak izi', en: 'Carbon footprint' }, arka: { tr: 'Bir ürünün, hizmetin ya da kişinin neden olduğu toplam sera gazı salımı.', en: 'The total greenhouse gas emissions caused by a product, service or person.' } },
          { on: { tr: 'Yeşil aklama', en: 'Greenwashing' }, arka: { tr: 'Bir ürünü olduğundan daha çevreci gösteren yanıltıcı iddialar. Yeşil girişimci iddialarını kanıtlayabilmeli.', en: 'Misleading claims that make a product look greener than it is. A green entrepreneur must be able to prove their claims.' } },
          { on: { tr: 'Yaşam döngüsü', en: 'Life cycle' }, arka: { tr: 'Bir ürünün hammaddeden üretime, kullanımdan atığa kadar bütün yolculuğu.', en: 'A product\'s whole journey from raw material to production, use and disposal.' } },
        ],
      },
      {
        id: 'yesil-sina', tur: 'sina', baslik: { tr: 'Bilgini sına', en: 'Check your knowledge' },
        sorular: [
          { soru: { tr: 'Bir şirket, ürününün sadece ambalajını yeşile boyayıp "doğa dostu" yazıyor; başka bir şey değişmiyor. Bu neye örnektir?', en: 'A company paints only the packaging green and writes "eco-friendly"; nothing else changes. What is this an example of?' },
            secenekler: [{ tr: 'Yeşil aklama', en: 'Greenwashing' }, { tr: 'İleri dönüşüm', en: 'Upcycling' }, { tr: 'Döngüsel ekonomi', en: 'Circular economy' }], dogru: 0,
            aciklama: { tr: 'Yanıltıcı çevre iddiası yeşil aklamadır. Avrupa\'da bu tür iddialara karşı kurallar giderek sıkılaşıyor.', en: 'A misleading environmental claim is greenwashing. Rules against such claims are getting stricter in Europe.' } },
          { soru: { tr: 'Hangisi döngüsel ekonomiye en iyi örnektir?', en: 'Which is the best example of the circular economy?' },
            secenekler: [{ tr: 'Eski kot pantolonlardan çanta dikip satmak', en: 'Sewing and selling bags made from old jeans' }, { tr: 'Her sezon yeni kıyafet koleksiyonu çıkarmak', en: 'Launching a new clothing collection every season' }, { tr: 'Tek kullanımlık bardakları daha ucuza üretmek', en: 'Producing single-use cups more cheaply' }], dogru: 0,
            aciklama: { tr: 'Atık bir malzemeyi daha değerli bir ürüne dönüştürmek (ileri dönüşüm) malzemeyi kullanımda tutar.', en: 'Turning a waste material into a more valuable product (upcycling) keeps the material in use.' } },
        ],
      },
      {
        id: 'yesil-etkinlik', tur: 'etkinlik', baslik: { tr: 'Atıktan fırsata', en: 'From waste to opportunity' },
        soru: { tr: 'Evinde, okulunda ya da mahallende en çok atılan şey ne? Bu atığı bir fırsata çevirecek bir fikir yaz: kim kullanır, nasıl işler?', en: 'What is thrown away most at home, school or in your neighbourhood? Write an idea that turns this waste into an opportunity: who would use it and how would it work?' },
        ipucu: { tr: 'Örn. "Okul kantinindeki ekmek artıkları → hayvan barınağı ile anlaşma…"', en: 'e.g. "Leftover bread from the school canteen → agreement with an animal shelter…"' },
      },
    ],
  },

  /* ============================== 4. SOSYAL ============================== */
  {
    id: 'sosyal', renk: 'mor', simge: 'eller', dakika: 35,
    baslik: { tr: 'Sosyal girişimcilik', en: 'Social entrepreneurship' },
    ozet: { tr: 'Toplumsal sorunları girişimci düşünceyle çözmek ve etkiyi ölçmek.', en: 'Solving social problems with entrepreneurial thinking, and measuring impact.' },
    hedefler: {
      tr: ['Sosyal işletmeyi diğer kuruluşlardan ayırırsın', '"Sorun – kişi – değişim" zincirini kurarsın', 'Bir fikrin etkisini nasıl ölçeceğini düşünürsün'],
      en: ['You tell a social enterprise apart from other organisations', 'You build the "problem – people – change" chain', 'You think about how to measure an idea\'s impact'],
    },
    adimlar: [
      {
        id: 'sosyal-nedir', tur: 'metin', baslik: { tr: 'Sosyal işletme nedir?', en: 'What is a social enterprise?' },
        govde: {
          tr: '<p>Sosyal işletme her şeyden önce <strong>insanlar ya da topluluklar için olumlu bir değişim yaratmak</strong> amacıyla vardır. Gelir elde edebilir, ama kârını çoğunlukla bu sosyal amaca yeniden yatırır. Bu yönüyle hem sıradan bir şirketten (amacı kâr) hem de yalnızca bağışla çalışan bir hayır kurumundan ayrılır.</p>'
            + '<h3>Üç soru</h3>'
            + ul(['Sorun <strong>kimin</strong>? Gençler, yaşlılar, göçmenler, engelli bireyler, kırsalda yaşayanlar…', 'Fikrin sayesinde onlar için <strong>ne</strong> değişiyor?', 'Fikir zamanla kendi masrafını <strong>nasıl</strong> karşılayacak?'])
            + '<h3>Farklı biçimler</h3><p>Sosyal girişimler kooperatif, gelir elde eden dernek, sosyal amaçlı şirket ya da gönüllü bir topluluk girişimi olabilir. Önemli olan hukuki biçim değil, <strong>amacın ve etkinin</strong> merkezde olmasıdır.</p>'
            + '<h3>Etkiyi düşünmek</h3><p>Sosyal girişimci "ne yaptık?" sorusunun yanında "<strong>ne değişti?</strong>" sorusunu da sorar. Örneğin 50 gence kurs vermek bir çıktıdır; o gençlerden kaçının iş bulduğu ya da kendine güveninin arttığı ise etkidir. Bu düşünce biçimine <em>değişim teorisi</em> denir: yaptığın şeyin hangi adımlarla hangi değişime yol açacağını yazarsın.</p>',
          en: '<p>A social enterprise exists first of all to <strong>create a positive change for people or communities</strong>. It can earn income, but it mainly reinvests its profits in that social purpose. This sets it apart both from an ordinary company (whose goal is profit) and from a charity that relies only on donations.</p>'
            + '<h3>Three questions</h3>'
            + ul(['<strong>Who</strong> has the problem? Young people, older people, migrants, people with disabilities, people in rural areas…', '<strong>What</strong> changes for them because of your idea?', '<strong>How</strong> will the idea pay for itself over time?'])
            + '<h3>Different forms</h3><p>Social ventures can be cooperatives, associations with an income, companies with a social goal or volunteer community initiatives. What matters is not the legal form but that <strong>purpose and impact</strong> are at the centre.</p>'
            + '<h3>Thinking about impact</h3><p>A social entrepreneur asks not only "what did we do?" but also "<strong>what changed?</strong>". Running a course for 50 young people is an output; how many of them found a job or gained confidence is the impact. This way of thinking is called a <em>theory of change</em>: you write down the steps by which your activity leads to change.</p>',
        },
      },
      {
        id: 'sosyal-video', tur: 'video', baslik: { tr: 'Sosyal girişimcilik nedir?', en: 'What is social entrepreneurship?' },
        youtube: 'wVK_aQsBAVE', sure: 180, kaynak: 'Saïd Business School, University of Oxford',
        not: { tr: 'Oxford Üniversitesi Saïd İşletme Okulu. İngilizce; CC ile altyazı açılabilir.', en: 'Saïd Business School, University of Oxford. Subtitles via CC.' },
        sorular: [],
      },
      {
        id: 'auticon', tur: 'ornek', baslik: { tr: 'Örnek: Auticon', en: 'Case: Auticon' },
        kurulus: 'Auticon', yer: { tr: 'Almanya · 2011', en: 'Germany · 2011' },
        govde: {
          tr: '<p>Auticon, otizm spektrumundaki yetişkinleri bilişim danışmanı olarak istihdam eden bir şirkettir. Pek çok otizmli yetişkin güçlü analitik becerilere sahip olduğu hâlde iş bulmakta zorlanır; Auticon bu becerileri yazılım testi, veri analizi gibi alanlarda müşterilere hizmet olarak sunar.</p><p>Sosyal amaç (kapsayıcı istihdam) iş modelinin tam merkezindedir: şirket, sorunu yaşayan kişileri "yardım edilen" değil, değer yaratan çalışanlar olarak konumlar.</p>',
          en: '<p>Auticon is a company that employs autistic adults as IT consultants. Many autistic adults have strong analytical skills but struggle to find work; Auticon offers these skills to clients in areas such as software testing and data analysis.</p><p>The social purpose (inclusive employment) is at the very centre of the business model: the company positions the people affected by the problem not as people "being helped" but as employees who create value.</p>',
        },
        ders: { tr: 'En güçlü sosyal fikirler, sorunu yaşayan insanların güçlü yanlarını görünür kılar.', en: 'The strongest social ideas make the strengths of the people affected visible.' },
      },
      {
        id: 'askida', tur: 'ornek', baslik: { tr: 'Örnek: Askıda ekmek', en: 'Case: "Bread on the hook"' },
        kurulus: { tr: 'Askıda ekmek geleneği', en: '"Askıda ekmek" tradition' }, yer: { tr: 'Türkiye', en: 'Türkiye' },
        govde: {
          tr: '<p>Türkiye\'de pek çok fırında, bir müşteri kendi ekmeğinin yanında bir ekmek daha parasını ödeyip "askıya" bırakır. İhtiyacı olan biri gelip kimseye bir şey sormadan o ekmeği alabilir. Kimse kimin verdiğini, kimin aldığını bilmez.</p><p>Bu basit gelenek, sosyal girişimciliğin iki önemli ilkesini gösterir: <strong>onur</strong> (ihtiyaç sahibi teşhir edilmez) ve <strong>kolay katılım</strong> (herkes küçük bir katkıyla dahil olabilir). Bugün aynı fikri dijital platformlara taşıyan girişimler de var.</p>',
          en: '<p>In many bakeries in Türkiye, a customer pays for an extra loaf of bread and leaves it "on the hook". Someone in need can come and take that bread without having to ask anyone. Nobody knows who gave and who took.</p><p>This simple tradition shows two important principles of social entrepreneurship: <strong>dignity</strong> (people in need are not exposed) and <strong>easy participation</strong> (anyone can join with a small contribution). Today there are also ventures that bring the same idea to digital platforms.</p>',
        },
        ders: { tr: 'Sosyal bir çözüm tasarlarken yardım alanın onurunu korumak, çözümün kendisi kadar önemlidir.', en: 'When designing a social solution, protecting the dignity of those who receive help matters as much as the solution itself.' },
      },
      {
        id: 'harekete-video', tur: 'video', baslik: { tr: 'Başkalarını harekete geçirmek', en: 'Mobilising others' },
        youtube: 'W1S34E-E9Xg', sure: 179, kaynak: 'Joint Research Centre (JRC), European Commission',
        not: { tr: 'EntreComp serisinden. İngilizce; CC ile altyazı açılabilir.', en: 'From the EntreComp series. Subtitles via CC.' },
        sorular: [jrcSorusu(166, 'Başkalarını harekete geçirmek', 'Mobilising others')],
      },
      {
        id: 'sosyal-sina', tur: 'sina', baslik: { tr: 'Bilgini sına', en: 'Check your knowledge' },
        sorular: [
          { soru: { tr: 'Bir proje 100 gence kodlama kursu verdi. Bunlardan hangisi bir ETKİDİR (çıktı değil)?', en: 'A project gave a coding course to 100 young people. Which of these is an IMPACT (not an output)?' },
            secenekler: [{ tr: 'Katılanların 30\'unun 6 ay içinde staj ya da iş bulması', en: '30 participants finding an internship or job within 6 months' }, { tr: '100 kişiye kurs verilmesi', en: '100 people receiving the course' }, { tr: '20 ders saati yapılması', en: '20 hours of lessons being held' }], dogru: 0,
            aciklama: { tr: 'Kurs ve ders saati yaptığın işlerdir (çıktı). Gençlerin hayatında ne değiştiği ise etkidir.', en: 'The course and lesson hours are what you did (outputs). What changed in the young people\'s lives is the impact.' } },
          { soru: { tr: 'Sosyal işletmeyi sıradan bir şirketten ayıran temel özellik nedir?', en: 'What mainly distinguishes a social enterprise from an ordinary company?' },
            secenekler: [{ tr: 'Sosyal amacın merkezde olması ve kârın çoğunlukla bu amaca yatırılması', en: 'The social purpose is central and profits are mainly reinvested in it' }, { tr: 'Hiç gelir elde etmemesi', en: 'It never earns any income' }, { tr: 'Yalnızca büyük şehirlerde kurulabilmesi', en: 'It can only be founded in big cities' }], dogru: 0,
            aciklama: { tr: 'Sosyal işletmeler gelir elde edebilir; fark, bu gelirin ve işin amacının topluma yönelik olmasıdır.', en: 'Social enterprises can earn income; the difference is that the income and the purpose of the work are directed at society.' } },
        ],
      },
      {
        id: 'sosyal-etkinlik', tur: 'etkinlik', baslik: { tr: 'Etki cümlen', en: 'Your impact sentence' },
        soru: { tr: 'Şu cümleyi kendi fikrinle tamamla: "Benim fikrim sayesinde … (kim), … (ne değişir) yapabilecek. Bunu … ile ölçebilirim."', en: 'Complete the sentence with your own idea: "Because of my idea, … (who) will be able to … (what changes). I can measure this by …"' },
        ipucu: { tr: 'Etkiyi ölçmek için basit bir gösterge yeter: kişi sayısı, tasarruf, memnuniyet…', en: 'A simple indicator is enough to measure impact: number of people, savings, satisfaction…' },
      },
    ],
  },

  /* ============================== 5. DİJİTAL ============================== */
  {
    id: 'dijital', renk: 'camgobegi', simge: 'ekran', dakika: 30,
    baslik: { tr: 'Dijital girişimcilik', en: 'Digital entrepreneurship' },
    ozet: { tr: 'Küçük başla, uzağa ulaş: ücretsiz araçlar, platformlar ve sorumlu yapay zekâ.', en: 'Start small, reach far: free tools, platforms and responsible AI.' },
    hedefler: {
      tr: ['Dijital araçlarla bir fikri düşük maliyetle nasıl deneyeceğini bilirsin', 'Kişisel veri ve yapay zekâ konusunda sorumlu davranırsın', 'Fikrin için bir dijital deneme planlarsın'],
      en: ['You know how to test an idea cheaply with digital tools', 'You act responsibly with personal data and AI', 'You plan a digital test for your idea'],
    },
    adimlar: [
      {
        id: 'dijital-nedir', tur: 'metin', baslik: { tr: 'Dijital girişimcilik ve araç kutun', en: 'Digital entrepreneurship and your toolbox' },
        govde: {
          tr: '<p>Dijital girişimcilik; dijital ürün, hizmet ya da kanallarla değer yaratmaktır: bir uygulama, çevrim içi mağaza, sosyal medya kanalı, çevrim içi kurs ya da insanları eşleştiren bir platform. Dijital araçların en büyük gücü, bir fikri <strong>çok az parayla ve çok hızlı</strong> denemeyi mümkün kılmasıdır.</p>'
            + '<h3>Ücretsiz araç kutun</h3>'
            + ul(['<strong>Fikrini göster:</strong> ücretsiz bir web sitesi oluşturucu ya da bir sosyal medya sayfası.', '<strong>İnsanlara sor:</strong> çevrim içi form ve anket araçları.',
              '<strong>Birlikte çalış:</strong> ortak belgeler, görev panoları, çevrim içi toplantılar.', '<strong>Tasarla:</strong> ücretsiz grafik ve sunum araçları.',
              '<strong>Yapay zekâdan yardım al:</strong> beyin fırtınası, metin taslağı, çeviri, özetleme.'])
            + '<h3>Platform düşüncesi</h3><p>Bazı dijital girişimler bir ürün satmaz; <strong>iki grubu buluşturur</strong>: ikinci el satan ile alan, sürücü ile yolcu, gönüllü ile ihtiyaç sahibi. Bu modelde en zor iş, iki tarafı da aynı anda platforma çekmektir; bu yüzden genellikle küçük bir bölgede ya da toplulukta başlanır.</p>'
            + '<h3>Sorumlu ol</h3>'
            + ul(['<strong>Kişisel veri:</strong> yalnızca gerçekten ihtiyacın olan veriyi topla, nasıl kullanacağını açıkça söyle ve izin al (Avrupa\'da GDPR, Türkiye\'de KVKK).',
              '<strong>Görseller ve paylaşım:</strong> başkalarının fotoğrafını ya da eserini izinsiz kullanma.',
              '<strong>Yapay zekâ:</strong> ürettiği bilgiyi kontrol etmeden doğru bilgi gibi sunma; kişisel verileri yapay zekâ araçlarına yükleme.'])
            + '<p>Avrupa Birliği\'nin <strong>DigComp</strong> çerçevesi, bu dijital becerileri (bilgi okuryazarlığı, iletişim, içerik üretimi, güvenlik, sorun çözme) tanımlar.</p>',
          en: '<p>Digital entrepreneurship means creating value with digital products, services or channels: an app, an online shop, a social media channel, an online course or a platform that matches people. The great strength of digital tools is that they let you test an idea <strong>very cheaply and very quickly</strong>.</p>'
            + '<h3>Your free toolbox</h3>'
            + ul(['<strong>Show your idea:</strong> a free website builder or a social media page.', '<strong>Ask people:</strong> online form and survey tools.',
              '<strong>Work together:</strong> shared documents, task boards, online meetings.', '<strong>Design:</strong> free graphics and presentation tools.',
              '<strong>Get help from AI:</strong> brainstorming, drafting texts, translating, summarising.'])
            + '<h3>Platform thinking</h3><p>Some digital ventures do not sell a product; they <strong>bring two groups together</strong>: second-hand sellers and buyers, drivers and passengers, volunteers and people in need. The hardest part is bringing both sides onto the platform at the same time, so these usually start in one small area or community.</p>'
            + '<h3>Be responsible</h3>'
            + ul(['<strong>Personal data:</strong> collect only the data you really need, say clearly how you will use it and ask for consent (GDPR in Europe, KVKK in Türkiye).',
              '<strong>Images and sharing:</strong> do not use other people\'s photos or work without permission.',
              '<strong>AI:</strong> do not present what it produces as fact without checking; do not upload personal data to AI tools.'])
            + '<p>The European Union\'s <strong>DigComp</strong> framework describes these digital skills (information literacy, communication, content creation, safety, problem solving).</p>',
        },
      },
      {
        id: 'yaraticilik-video', tur: 'video', baslik: { tr: 'Yaratıcılık', en: 'Creativity' },
        youtube: 'NRc9h1V4vSo', sure: 156, kaynak: 'Joint Research Centre (JRC), European Commission',
        not: { tr: 'EntreComp serisinden. İngilizce; CC ile altyazı açılabilir.', en: 'From the EntreComp series. Subtitles via CC.' },
        sorular: [jrcSorusu(141, 'Yaratıcılık', 'Creativity')],
      },
      {
        id: 'vinted', tur: 'ornek', baslik: { tr: 'Örnek: Vinted', en: 'Case: Vinted' },
        kurulus: 'Vinted', yer: { tr: 'Litvanya · 2008', en: 'Lithuania · 2008' },
        govde: {
          tr: '<p>Vinted, kullanılmış kıyafetlerin alınıp satıldığı bir çevrim içi platform olarak Vilnius\'ta başladı. Dolaplarda kullanılmadan bekleyen kıyafetleri, onları ucuza almak isteyen insanlarla buluşturur.</p><p>Bu örnek dijital ve yeşil girişimciliğin nasıl birleşebileceğini gösterir: platform bir ürün üretmez, ama var olan ürünlerin <strong>daha uzun süre kullanılmasını</strong> sağlar.</p>',
          en: '<p>Vinted started in Vilnius as an online platform for buying and selling second-hand clothes. It connects clothes lying unused in wardrobes with people who want to buy them cheaply.</p><p>This case shows how digital and green entrepreneurship can come together: the platform does not produce anything, but it helps existing products <strong>stay in use for longer</strong>.</p>',
        },
        ders: { tr: 'Dijital bir platform, yeşil bir amaca hizmet edebilir: kaynakları yeniden dolaşıma sokmak.', en: 'A digital platform can serve a green purpose: putting resources back into circulation.' },
      },
      {
        id: 'ecosia', tur: 'ornek', baslik: { tr: 'Örnek: Ecosia', en: 'Case: Ecosia' },
        kurulus: 'Ecosia', yer: { tr: 'Almanya · 2009', en: 'Germany · 2009' },
        govde: {
          tr: '<p>Berlin merkezli Ecosia bir internet arama motorudur. Diğer arama motorları gibi reklamlardan gelir elde eder, ama bu gelirin büyük kısmını dünyanın farklı yerlerinde ağaç dikme projelerine aktarır.</p><p>Kullanıcı için hiçbir şey değişmez — her gün yaptığı aramayı yapar — ama bu sıradan davranış çevresel bir etkiye dönüşür.</p>',
          en: '<p>Based in Berlin, Ecosia is an internet search engine. Like other search engines it earns money from advertising, but it puts most of this income into tree-planting projects around the world.</p><p>Nothing changes for the user — they search as they do every day — but this ordinary behaviour turns into environmental impact.</p>',
        },
        ders: { tr: 'İnsanların zaten yaptığı bir şeyi etkiye dönüştürmek, davranış değiştirmeye çalışmaktan çoğu zaman daha kolaydır.', en: 'Turning something people already do into impact is often easier than trying to change their behaviour.' },
      },
      {
        id: 'deneyim-video', tur: 'video', baslik: { tr: 'Deneyimle öğrenmek', en: 'Learning through experience' },
        youtube: 'Q0uGwvBVCus', sure: 115, kaynak: 'Joint Research Centre (JRC), European Commission',
        not: { tr: 'EntreComp serisinden. İngilizce; CC ile altyazı açılabilir.', en: 'From the EntreComp series. Subtitles via CC.' },
        sorular: [jrcSorusu(102, 'Deneyimle öğrenmek', 'Learning through experience')],
      },
      {
        id: 'dijital-sina', tur: 'sina', baslik: { tr: 'Bilgini sına', en: 'Check your knowledge' },
        sorular: [
          { soru: { tr: 'Fikrin için bir çevrim içi anket hazırlıyorsun. Hangisi doğru bir yaklaşımdır?', en: 'You are preparing an online survey for your idea. Which is the right approach?' },
            secenekler: [{ tr: 'Yalnızca gerçekten gereken soruları sormak ve verinin nasıl kullanılacağını açıklamak', en: 'Asking only the questions you really need and explaining how the data will be used' }, { tr: 'Her ihtimale karşı adres ve kimlik numarası da istemek', en: 'Also asking for address and ID number, just in case' }, { tr: 'Cevapları herkesin görebileceği bir yerde paylaşmak', en: 'Sharing the answers where everyone can see them' }], dogru: 0,
            aciklama: { tr: 'Veri en azlığı ve şeffaflık, GDPR ve KVKK\'nın temel ilkeleridir.', en: 'Data minimisation and transparency are core principles of GDPR and KVKK.' } },
          { soru: { tr: 'Yapay zekâ aracı sunumun için bir istatistik üretti. Ne yapmalısın?', en: 'An AI tool produced a statistic for your presentation. What should you do?' },
            secenekler: [{ tr: 'Güvenilir bir kaynaktan doğrulamadan kullanmamak', en: 'Not use it without checking it against a reliable source' }, { tr: 'Doğrudan kullanmak', en: 'Use it directly' }, { tr: 'Sayıyı biraz yuvarlayıp kullanmak', en: 'Round the number a bit and use it' }], dogru: 0,
            aciklama: { tr: 'Yapay zekâ araçları inandırıcı ama yanlış bilgi üretebilir. Kaynağını gösteremediğin bilgiyi kullanma.', en: 'AI tools can produce convincing but wrong information. Do not use information you cannot source.' } },
        ],
      },
      {
        id: 'dijital-etkinlik', tur: 'etkinlik', baslik: { tr: 'Bir haftalık dijital deneme', en: 'A one-week digital test' },
        soru: { tr: 'Fikrini bu hafta dijital olarak nasıl deneyebilirsin? Hangi aracı kullanacağını, kime ulaşacağını ve neyi öğrenmek istediğini yaz.', en: 'How could you test your idea digitally this week? Write which tool you will use, who you will reach and what you want to learn.' },
        ipucu: { tr: 'Örn. "Ücretsiz bir form ile 20 öğrenciye … sorusunu soracağım; en az 10\'u ilgilenirse …"', en: 'e.g. "I will ask 20 students … with a free form; if at least 10 are interested …"' },
      },
    ],
  },

  /* ============================== 6. KENDİ PROJE FİKRİN ============================== */
  {
    id: 'fikir', renk: 'turuncu', simge: 'roket', dakika: 40,
    baslik: { tr: 'Kendi proje fikrin', en: 'Your project idea' },
    ozet: { tr: 'Sıra sende: İş Modeli Kanvası ile fikrini kur, küçük bir denemeyle test et.', en: 'Your turn: build your idea with the Business Model Canvas and test it with a small experiment.' },
    hedefler: {
      tr: ['İş Modeli Kanvası\'nın bölümlerini kullanırsın', 'Fikrin için en küçük denemeyi (MVP) tasarlarsın', 'Proje planını tek sayfada toplarsın'],
      en: ['You use the parts of the Business Model Canvas', 'You design the smallest test (MVP) for your idea', 'You put your project plan on one page'],
    },
    adimlar: [
      {
        id: 'kanvas', tur: 'metin', baslik: { tr: 'Fikirden plana: İş Modeli Kanvası', en: 'From idea to plan: the Business Model Canvas' },
        govde: {
          tr: '<p><strong>İş Modeli Kanvası</strong>, Alexander Osterwalder ve Yves Pigneur\'ün geliştirdiği, bir fikrin nasıl değer yarattığını <strong>tek sayfada</strong> gösteren bir araçtır. Uzun bir iş planı yazmadan önce fikrin temel parçalarını görmeni sağlar.</p>'
            + '<h3>Kanvasın dokuz bloğu</h3>'
            + ol(['<strong>Müşteri segmentleri:</strong> kimin için değer yaratıyorsun?', '<strong>Değer önerisi:</strong> onların hangi sorununu çözüyor, hangi ihtiyacını karşılıyorsun?',
              '<strong>Kanallar:</strong> onlara nasıl ulaşıyorsun?', '<strong>Müşteri ilişkileri:</strong> onlarla nasıl bir ilişki kuruyorsun?',
              '<strong>Gelir akışları:</strong> fikir kendini nasıl finanse ediyor?', '<strong>Temel kaynaklar:</strong> neye ihtiyacın var? (insan, mekân, araç, bilgi)',
              '<strong>Temel faaliyetler:</strong> en önemli işlerin neler?', '<strong>Temel ortaklıklar:</strong> kimlerle birlikte çalışıyorsun?',
              '<strong>Maliyet yapısı:</strong> en büyük giderlerin neler?'])
            + '<p>Sosyal ve yeşil girişimler için kanvasa çoğu zaman iki blok eklenir: <strong>sosyal/çevresel etki</strong> ve <strong>etkiyi nasıl ölçeceğin</strong>.</p>'
            + '<h3>Bu eğitimdeki kısa kanvas</h3><p>"Fikrim" sayfanda bunun sadeleştirilmiş bir hâlini dolduracaksın: <em>Sorun, İnsanlar, Çözüm, Değer, Kaynaklar, İlk deneme.</em> Bu altı soru, dokuz bloğun özüdür.</p>',
          en: '<p>The <strong>Business Model Canvas</strong>, developed by Alexander Osterwalder and Yves Pigneur, shows <strong>on one page</strong> how an idea creates value. It helps you see the key parts of your idea before writing a long business plan.</p>'
            + '<h3>The nine blocks of the canvas</h3>'
            + ol(['<strong>Customer segments:</strong> who are you creating value for?', '<strong>Value proposition:</strong> which of their problems do you solve, which needs do you meet?',
              '<strong>Channels:</strong> how do you reach them?', '<strong>Customer relationships:</strong> what kind of relationship do you build with them?',
              '<strong>Revenue streams:</strong> how does the idea pay for itself?', '<strong>Key resources:</strong> what do you need? (people, space, tools, knowledge)',
              '<strong>Key activities:</strong> what are your most important tasks?', '<strong>Key partnerships:</strong> who do you work with?',
              '<strong>Cost structure:</strong> what are your biggest costs?'])
            + '<p>For social and green ventures, two blocks are often added: <strong>social/environmental impact</strong> and <strong>how you will measure it</strong>.</p>'
            + '<h3>The short canvas in this training</h3><p>On your "My idea" page you will fill in a simplified version: <em>Problem, People, Solution, Value, Resources, First test.</em> These six questions are the core of the nine blocks.</p>',
        },
      },
      {
        id: 'kanvas-video', tur: 'video', baslik: { tr: 'İş Modeli Kanvası', en: 'The Business Model Canvas' },
        youtube: 'QoAOzMTLP5s', sure: 140, kaynak: 'Strategyzer',
        not: { tr: 'Kanvasın yaratıcılarının kurduğu Strategyzer\'dan. İngilizce; CC ile altyazı açılabilir.', en: 'From Strategyzer, founded by the creators of the canvas. Subtitles via CC.' },
        sorular: [{
          sn: 125, tur: 'cs',
          soru: { tr: 'Bu videoda anlatılan aracın adı nedir?', en: 'What is the name of the tool explained in this video?' },
          secenekler: [{ tr: 'İş Modeli Kanvası', en: 'Business Model Canvas' }, { tr: 'Gantt şeması', en: 'Gantt chart' }, { tr: 'SWOT analizi', en: 'SWOT analysis' }],
          dogru: 0,
        }],
      },
      {
        id: 'mvp', tur: 'metin', baslik: { tr: 'Küçük başla: en küçük deneme', en: 'Start small: the smallest test' },
        govde: {
          tr: '<p>Bir fikri mükemmel hâle getirmek için aylarca beklemek yerine, onu <strong>en küçük hâliyle gerçek insanlarla denemek</strong> çok daha akıllıcadır. Buna <em>en küçük uygulanabilir ürün</em> (MVP — minimum viable product) denir.</p>'
            + '<h3>MVP örnekleri</h3>'
            + ul(['Uygulama yazmadan önce, fikri anlatan tek sayfalık bir site ve "ilgileniyorum" formu.', 'Tamir kafesi açmadan önce, bir cumartesi muhtarlık salonunda tek seferlik bir tamir buluşması.',
              'Ürün üretmeden önce, elle yapılmış 5 örneği arkadaşlara satmayı denemek.'])
            + '<h3>Ölç, öğren, karar ver</h3><p>Denemeden önce <strong>neyi öğrenmek istediğini</strong> ve <strong>başarının ölçüsünü</strong> yaz: "En az 10 kişi gelirse ikinci buluşmayı yaparım." Sonuçlar beklediğin gibi değilse bu başarısızlık değil, bilgidir: fikrini değiştirebilir (pivot) ya da başka bir müşteri grubunu deneyebilirsin.</p>'
            + '<h3>Bir dakikalık sunum</h3><p>Fikrini kısa ve net anlatabilmek de bir beceridir. Basit bir yapı: <em>Sorun → Kimin sorunu → Çözümüm → Neden işe yarar → Ne istiyorum (destek, ortak, deneme yeri).</em></p>',
          en: '<p>Rather than waiting months to perfect an idea, it is much smarter to <strong>test it in its smallest form with real people</strong>. This is called a <em>minimum viable product</em> (MVP).</p>'
            + '<h3>MVP examples</h3>'
            + ul(['Before building an app, a one-page website explaining the idea and an "I\'m interested" form.', 'Before opening a repair café, a one-off repair meeting in a community hall one Saturday.',
              'Before producing a product, trying to sell 5 handmade samples to friends.'])
            + '<h3>Measure, learn, decide</h3><p>Before the test, write down <strong>what you want to learn</strong> and <strong>what success looks like</strong>: "If at least 10 people come, I will hold a second meeting." If the results are not what you expected, that is not failure but information: you can change your idea (pivot) or try another customer group.</p>'
            + '<h3>A one-minute pitch</h3><p>Being able to explain your idea briefly and clearly is a skill too. A simple structure: <em>Problem → Whose problem → My solution → Why it works → What I am asking for (support, partners, a place to test).</em></p>',
        },
      },
      {
        id: 'fairphone', tur: 'ornek', baslik: { tr: 'Örnek: Fairphone', en: 'Case: Fairphone' },
        kurulus: 'Fairphone', yer: { tr: 'Hollanda · 2013', en: 'Netherlands · 2013' },
        govde: {
          tr: '<p>Fairphone, akıllı telefonlardaki madenlerin çıkarıldığı koşullara dikkat çeken bir farkındalık kampanyası olarak başladı ve 2013\'te bir sosyal işletmeye dönüştü. Amacı daha adil koşullarda üretilen ve <strong>kullanıcının kendisinin tamir edebileceği</strong> modüler telefonlar yapmaktır.</p><p>Fikir küçük başladı, insanların gerçekten böyle bir telefon isteyip istemediğini önce sınadı ve yeşil (onarım, uzun ömür) ile sosyal (adil üretim) amaçları tek bir üründe birleştirdi.</p>',
          en: '<p>Fairphone started as an awareness campaign about the conditions in which minerals for smartphones are mined, and became a social enterprise in 2013. Its aim is to make modular phones that are produced under fairer conditions and that <strong>users can repair themselves</strong>.</p><p>The idea started small, first tested whether people really wanted such a phone, and combined green (repair, long life) and social (fair production) goals in one product.</p>',
        },
        ders: { tr: 'Önce ilgiyi sına, sonra büyü. Yeşil, sosyal ve dijital amaçlar tek bir fikirde birleşebilir.', en: 'Test interest first, then grow. Green, social and digital goals can come together in one idea.' },
      },
      {
        id: 'inisiyatif-video', tur: 'video', baslik: { tr: 'İnisiyatif almak', en: 'Taking the initiative' },
        youtube: 'RHs3BriNBAY', sure: 84, kaynak: 'Joint Research Centre (JRC), European Commission',
        not: { tr: 'EntreComp serisinden. İngilizce; CC ile altyazı açılabilir.', en: 'From the EntreComp series. Subtitles via CC.' },
        sorular: [jrcSorusu(72, 'İnisiyatif almak', 'Taking the initiative')],
      },
      {
        id: 'fikir-sina', tur: 'sina', baslik: { tr: 'Bilgini sına', en: 'Check your knowledge' },
        sorular: [
          { soru: { tr: 'Bir mahalle uygulaması fikrin var. Hangisi iyi bir ilk denemedir (MVP)?', en: 'You have an idea for a neighbourhood app. Which is a good first test (MVP)?' },
            secenekler: [{ tr: 'Mesajlaşma grubu ve basit bir formla iki hafta boyunca hizmeti elle yürütmek', en: 'Running the service by hand for two weeks with a messaging group and a simple form' }, { tr: 'Bir yazılım şirketine tam uygulamayı yaptırmak', en: 'Having a software company build the full app' }, { tr: 'Uygulamanın logosunu tasarlatmak', en: 'Getting a logo designed for the app' }], dogru: 0,
            aciklama: { tr: 'Önce insanların gerçekten kullanıp kullanmadığını öğren; uygulamayı yazmak sonra gelir.', en: 'First learn whether people really use it; building the app comes later.' } },
          { soru: { tr: 'İş Modeli Kanvası\'nda "değer önerisi" neyi anlatır?', en: 'What does the "value proposition" describe in the Business Model Canvas?' },
            secenekler: [{ tr: 'Müşterinin hangi sorununu çözdüğünü, hangi ihtiyacını karşıladığını', en: 'Which customer problem you solve or which need you meet' }, { tr: 'Ofis kirasını', en: 'The office rent' }, { tr: 'Logonun rengini', en: 'The colour of the logo' }], dogru: 0,
            aciklama: { tr: 'Değer önerisi, insanların neden seni seçeceğinin cevabıdır.', en: 'The value proposition answers why people would choose you.' } },
          { soru: { tr: 'Denemenin sonucunda beklediğinden az ilgi gördün. En girişimci tutum hangisi?', en: 'Your test got less interest than expected. Which is the most entrepreneurial attitude?' },
            secenekler: [{ tr: 'Ne öğrendiğini yazıp fikri ya da hedef kitleyi değiştirerek yeniden denemek', en: 'Writing down what you learned and testing again with a changed idea or audience' }, { tr: 'Hemen vazgeçmek', en: 'Giving up immediately' }, { tr: 'Sonucu görmezden gelip büyük yatırım yapmak', en: 'Ignoring the result and investing big' }], dogru: 0,
            aciklama: { tr: 'Deneyimle öğrenmek EntreComp\'un yetkinliklerinden biridir: her deneme bir sonraki adımı daha akıllı yapar.', en: 'Learning through experience is one of the EntreComp competences: every test makes the next step smarter.' } },
        ],
      },
      {
        id: 'sunum', tur: 'etkinlik', baslik: { tr: 'Bir dakikalık sunumun', en: 'Your one-minute pitch' },
        soru: { tr: 'Fikrini bir dakikada anlatacak sunum metnini yaz: Sorun → Kimin sorunu → Çözümün → Neden işe yarar → Ne istiyorsun. Sonra "Fikrim" sayfasında kanvasını doldur ve planını PDF olarak indir.', en: 'Write the text of a one-minute pitch for your idea: Problem → Whose problem → Your solution → Why it works → What you are asking for. Then fill in your canvas on the "My idea" page and download your plan as PDF.' },
        ipucu: { tr: 'Sesli oku ve süre tut: 60 saniyeyi geçmesin.', en: 'Read it aloud and time it: no more than 60 seconds.' },
      },
    ],
  },
];
