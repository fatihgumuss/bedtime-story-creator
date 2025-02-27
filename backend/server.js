const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Gemini API with your API key - can be left empty for fallback functionality
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCwNWX1WJk44RLdKtqmqtffXbbEJG3kxLs';
let genAI;

// Only initialize Gemini if API key is provided
if (API_KEY && API_KEY !== '') {
    genAI = new GoogleGenerativeAI(API_KEY);
}

// Ensure data.json exists
const dataFilePath = path.join(__dirname, 'data.json');
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
}

// Helper function to load existing data
function loadData() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

// Helper function to save data
function saveData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Generate story using Gemini API with enhanced prompt
async function generateStoryWithGemini(promptData) {
    // If API key is not configured, use the dummy story generator right away
    if (!genAI) {
        console.log('No API key provided, using dummy story generator');
        return generateDummyStory(promptData);
    }

    try {
        // Configure the model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Determine language complexity based on age
        let languageComplexity = "";
        if (promptData.childAge <= 3) {
            languageComplexity = "Çok basit dil yapısı, kısa cümleler, temel kelimeler kullan. Tekrar eden ifadeler önemli.";
        } else if (promptData.childAge <= 6) {
            languageComplexity = "Basit ama tam cümleler, zenginleştirilmiş kelime hazinesi, ritimli anlatım önemli.";
        } else if (promptData.childAge <= 9) {
            languageComplexity = "Daha karmaşık cümle yapıları, zengin kelime hazinesi, basit mecazlar ve benzetmeler kullanılabilir.";
        } else {
            languageComplexity = "Zengin kelime hazinesi, çeşitli cümle yapıları, edebi ifadeler, mizah ve mecaz kullanımı uygun.";
        }

        // Create a detailed prompt for the story
        const prompt = `
        Sen, çocuk gelişimi uzmanlarıyla çalışan ve uyku öncesi hikaye anlatımında uzmanlaşmış ödüllü bir çocuk kitabı yazarısın. ${promptData.childAge} yaşındaki ${promptData.childName} için, ebeveynlerin kolayca sesli okuyabileceği, çocukların da keyifle dinleyebileceği özel bir uyku öncesi hikayesi yazmanı istiyorum.

        ROL VE HEDEF:
        - Ebeveynin rahatça okuyup canlandırabileceği bir anlatım tarzı kullan
        - Çocuğun hayal dünyasında kolayca canlandırabileceği sahneler oluştur
        - Ebeveyn-çocuk bağını güçlendirecek etkileşim fırsatları yarat
        - Dinleyici çocuğun kendisini hikayenin içinde hissetmesini sağla

        HİKAYE KİMLİĞİ:
        Ana Karakter: ${promptData.childName} (${promptData.childAge} yaşında)
        ${promptData.sideCharacters ? `Yardımcı Karakterler: ${promptData.sideCharacters}` : ''}
        Hikaye Evreni: ${promptData.topic}
        ${promptData.message ? `Verilecek Yaşam Dersi: ${promptData.message}` : ''}

        DİL VE ANLATIM:
        ${languageComplexity}
        1. Ses ve Ritim:
           - Sesli okunmaya uygun, akıcı cümleler
           - Tekrar eden, ritimli ifadeler
           - Ses efektleri ve onomatopeler (pat pat, fış fış, vb.)
           - Ebeveynin ses tonunu değiştirebileceği diyaloglar

        2. Kelime Seçimi:
           - Yaş grubuna uygun kelime hazinesi
           - Yeni kelimeler için bağlamsal ipuçları
           - Türkçe karakterlerin (ş, ı, ğ, ü, ö, ç) doğru kullanımı
           - Sıcak ve samimi bir anlatım dili

        3. Etkileşim Fırsatları:
           - Çocuğun tahmin yürütebileceği durumlar
           - Basit sorularla hikayeye katılım noktaları (ebeveynin çocuğa sorabileceği)
           - Taklit edilebilecek hareketler veya sesler
           - Ebeveynin çocukla göz teması kurabileceği anlar

        HİKAYE MİMARİSİ:
        1. Açılış:
           - Sıcak ve davetkar bir başlangıç
           - ${promptData.childName}'in günlük hayatından tanıdık detaylar
           - Büyülü dünyaya yumuşak bir geçiş
           - Karakterlerin sevimli ve dostça tanıtımı

        2. Serüven:
           - Merak uyandıran olaylar zinciri
           - Aşamalı zorluklarla karşılaşma
           - Problem çözme süreçleri
           - Karakter gelişimi fırsatları

        3. Doruk ve Çözüm:
           - Heyecan dozunu dengeli tutma
           - Yaratıcı problem çözümleri
           - Karakterlerin işbirliği
           - Öğrenilen derslerin doğal akışı

        4. Kapanış:
           - Rahatlatıcı ve huzurlu bir son
           - Uykuya geçişi kolaylaştıran sakin ton

        ÇOCUK GELİŞİMİ PRENSİPLERİ (${promptData.childAge} yaşa özgü):
        ${promptData.childAge <= 3 ? `
        - Tanıdık rutinler ve tekrarlar
        - Basit seçimler ve sonuçlar
        - Temel duyguların tanınması
        - Paylaşma ve işbirliğinin basit formları
        - Merak ve keşif duygularını teşvik
        - Güven ve güvenlik hissi oluşturma`
            : promptData.childAge <= 6 ? `
        - Hayal gücünü besleyen unsurlar
        - Arkadaşlık ve paylaşma kavramları
        - Basit problem çözme becerileri
        - Duygusal farkındalığın gelişimi
        - Özgüven ve bağımsızlık temaları
        - Doğal merak ve keşif arzularını destekleme`
                : promptData.childAge <= 9 ? `
        - Karmaşık sosyal etkileşimler
        - Empati ve başkalarının duygularını anlama
        - Mantıksal düşünme ve problem çözme
        - Sorumluluk ve sonuçları kavrama
        - Adalet ve doğruluk kavramları
        - Kendini ifade etme becerileri`
                    : `
        - Karmaşık ahlaki ikilemlerin çözümü
        - Eleştirel düşünme becerileri
        - Daha derin duygusal farkındalık
        - Sosyal ilişkilerin incelikleri
        - Kendini tanıma ve kimlik oluşturma
        - Değerler ve inançların sorgulanması`}

        GÜVENLIK VE HASSASIYETLER:
        - Korkutucu veya endişe verici ögelerden kaçınma
        - Şiddet veya çatışma içeren sahnelerden uzak durma
        - Ayrımcılık ve önyargıdan arındırılmış anlatım
        - Yaş grubuna uygun içerik seçimi

        TEKNIK DETAYLAR:
        - Hikayeyi mümkün olduğunca uzun yaz. Bu hikaye uyku öncesi okunacak ve detaylı olması önemli.
        - Her bölüm için yeterli detay ve derinlik sağla
        - Paragraflar arası yumuşak geçişler kullan
        - Diyalogların dengeli dağılımını sağla
        - Türkçe yazım kurallarına ve kelime kullanımına dikkat et
        - Dil ve zaman ekleri tutarlı olmalı
        
        ÇOK ÖNEMLİ:
        - Vereceğin çıktı sadece hikayeyi içermeli. 
        - Hiçbir ek açıklama, giriş cümlesi veya not ekleme.
        - Hikayenin bölümleri olan "Açılış", "Serüven" gibi başlıkları yazma, doğrudan hikayeyi anlat.
        - İlk cümlen hikayenin başlangıcı olmalı.
        - Hikayen bir başlık içermeli.
        `;

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        return text;
    } catch (error) {
        console.error('Error with Gemini API:', error);
        // Fallback to dummy story if API call fails
        return generateDummyStory(promptData);
    }
}

// Enhanced fallback function if API is unavailable
function generateDummyStory(promptData) {
    const { childName, childAge, topic, message, sideCharacters } = promptData;

    // Extract characters from side characters input or use defaults
    let characters = ['sevimli bir tavşan', 'bilge bir baykuş', 'cesur bir kedi'];
    if (sideCharacters && sideCharacters.trim()) {
        const extractedChars = sideCharacters.split(',').map(c => c.trim()).filter(c => c);
        if (extractedChars.length > 0) {
            characters = extractedChars;
        }
    }

    // Determine title
    const title = `${childName}'in ${topic} Dünyasındaki Büyük Macerası`;

    // Determine message/theme if not provided
    const finalMessage = message || (childAge <= 6 ? 'paylaşmanın güzelliği' : 'cesaret ve dostluğun önemi');

    // Build age-appropriate story
    let story = `${title}

Güneşin altın ışıkları ${childName}'in odasının perdeleri arasından süzülürken, uyku gözlerinden henüz uçup gitmişti. Yatağında doğruldu ve pencereden dışarı baktı. "Bugün çok özel bir gün olacak," diye fısıldadı kendi kendine, içinde kaynayan bir heyecanla.

${childName} kahvaltısını hızlıca bitirdi. Tam bahçeye çıkmaya hazırlanırken, pencerenin önünde parlak, renkli bir ışık huzmesi gördü. Işık, rüzgârla dans eden yaprakların arasından süzülüp, tam ${childName}'in ayaklarının önüne düştü. Pat pat pat! Minik adımlarla yaklaştı ışığa. Parmak ucuyla dokunduğunda, ışık aniden genişleyerek ${childName}'i içine aldı.

"Hoooooop!" Bir an için her şey dönmeye başladı. ${childName} gözlerini sıkıca kapattı. Vııızzzzz! Uçuyor gibiydi. Ve sonra, yumuşak bir "puf!" sesiyle bir yere kondu.

Gözlerini açtığında, kendini hiç bilmediği, hayal bile edemeyeceği bir dünyada buldu. Burası ${topic} dünyasıydı. Gökyüzü her zamankinden daha masmaviydi ve bulutlar pamuk şekerden yapılmış gibiydi. Ağaçların yaprakları gökkuşağının tüm renklerini taşıyor, çiçekler kendi aralarında şarkı söylüyordu.

"Merhaba ${childName}!" diye bir ses duyuldu yakınından. Dönüp baktığında ${characters[0]}'ı gördü. "Seni bekliyorduk! Hoş geldin!"

${childName}'in gözleri merakla açıldı. "Beni mi bekliyordunuz? Ama nasıl? Ben kimim ki?"

${characters[0]} güldü, neşeli bir kahkahayla. "Sen ${childName}'sin! Ve bizim dünyamızın ihtiyacı olan tam da senin gibi cesur, akıllı ve iyi kalpli bir çocuk. Benimle gelir misin?" diye sordu, nazikçe elini uzatarak.

${childName} biraz düşündü. Ne dersiniz, ${childName} bu daveti kabul etmeli mi? (Ebeveyn burada çocuğa sorabilir) Elbette kabul etti! Yeni arkadaşıyla birlikte renkli patikada ilerlemeye başladı.

Yolda, ${characters[1]} ile karşılaştılar. ${characters[1]} telaşlı görünüyordu. "Oh, sonunda! Tam zamanında geldiniz. ${topic} dünyamız büyük bir sorunla karşı karşıya!"

"Ne oldu?" diye sordu ${childName}, endişeyle.

${characters[1]} derin bir nefes aldı. "Gökyüzümüzdeki yıldızlar kaybolmaya başladı. Onlar kaybolunca, dünyamızdaki sihir de yavaş yavaş kayboluyor. Bu gidişle, ${topic} dünyası sonsuza dek karanlığa gömülebilir."

"Peki ne yapabiliriz?" diye sordu ${childName}, cesaretle.

Bu sırada yanlarına ${characters[2] || 'küçük bir sincap'} da katıldı. "Efsaneye göre," dedi ${characters[2] || 'sincap'}, "sadece saf bir kalbe sahip bir çocuğun şarkısı, yıldızları tekrar gökyüzüne çağırabilir." ${characters[2] || 'Sincap'} doğrudan ${childName}'e baktı. "Ve biz, o çocuğun sen olduğuna inanıyoruz."

${childName}, ${characters.join(', ')} ile birlikte Yankılanan Vadiler'den geçti. Vadilerde adımları attıkça, sesleri büyülü bir şekilde yankılanıyordu. ${childName} ayak seslerini taklit etmeye çalıştı. Pat, pat, pat! (Ebeveyn ve çocuk birlikte el çırparak sesleri taklit edebilir)

Ardından Fısıldayan Orman'ı geçtiler. Bu ormanda ağaçlar birbirleriyle fısıldaşıyordu. "Şşşşşt... Şşşşt..." Yaprakların arasından geçen rüzgârın sesini duydular. (Ebeveyn burada fısıldama sesleri çıkarabilir)

Sonunda Işık Dağı'na vardılar. Ama dağın tepesi karanlıktı. Eskiden burada parıldayan bir kristal varmış, ama o da sönmüştü. ${childName} ve arkadaşları dağın tepesine tırmanmaya başladılar.

Yol boyunca, ${childName} zorluklarla karşılaştı. Kocaman kayalar yollarını kapattı. Ama hep birlikte itince kayalar yürüdü! Üüüüf! (Ebeveyn ve çocuk itme hareketi yapabilir) Dar bir köprüden geçmeleri gerekti. Adım adım, dikkatle ilerlediler. Tıp tıp tıp! (Ebeveyn ve çocuk parmak uçlarında yürüyebilir)

Dağın tepesine vardıklarında, büyük kristali gördüler. Kristal artık parlamıyordu. ${characters[0]} ${childName}'e döndü. "İşte şimdi şarkını söyleme zamanı."

${childName} gergin hissetti. Ya başaramazsa? Ya yıldızlar geri gelmezse? Ama sonra içindeki cesareti hatırladı. (Ebeveyn çocuğa "Sen ne yapardın?" diye sorabilir)

${childName} gözlerini kapattı ve kalbinden gelen bir şarkı söylemeye başladı. Bu şarkı ${finalMessage} hakkındaydı. Şarkı söylerken, kristal hafifçe titreşmeye başladı. Önce hafif bir ışık, sonra daha parlak bir ışıltı... Ve birden, kristal göz kamaştırıcı bir parlaklıkla aydınlandı!

Kristalden çıkan ışık, gökyüzünde yükseldi ve binlerce yıldızı tekrar yerlerine çağırdı. Yıldızlar birer birer gökyüzünde belirmeye başladılar, her biri ${childName}'in şarkısının getirdiği ${finalMessage} duygusuyla parlıyordu.

${topic} dünyasının tüm sakinleri, ${childName}'i alkışlamak için toplandılar. "Yaşasın ${childName}!" diye bağırdılar. "Gökyüzümüze yıldızları geri getirdiğin için teşekkür ederiz!"

${childName} gururla gülümsedi. İçinde sıcacık bir his vardı. Birlikte çalıştıklarında, imkânsız görünen şeyleri başarabileceklerini öğrenmişti.

O gece, ${characters.join(' ve ')} ${childName}'i eve götürürken, gökyüzündeki en parlak yıldız onlara göz kırptı. "Bu yıldıza senin adını verdik," dedi ${characters[0]}. "${childName} Yıldızı. Ne zaman gökyüzüne baksan, bizi hatırla. Ve ${finalMessage} asla unutma."

${childName} gözlerini açtığında, kendi yatağındaydı. Pencereden dışarı baktı ve gökyüzünde her zamankinden daha parlak bir yıldız gördü. Ona göz kırptı mı? Belki de... ${childName} gülümsedi ve gözlerini kapattı. Bu gece en tatlı rüyalarında ${topic} dünyasına tekrar gideceğini biliyordu.

İyi uykular ${childName}. Yıldızlar hep seninle olsun.`;

    return story;
}

// Create story endpoint
app.post('/create-story', async (req, res) => {
    try {
        const promptData = req.body;

        // Validate required fields
        if (!promptData.childName || !promptData.childAge || !promptData.topic) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate story (using Gemini API or fallback dummy)
        const story = await generateStoryWithGemini(promptData);

        // Log request and response
        const existingData = loadData();
        const logEntry = {
            timestamp: new Date().toISOString(),
            request: promptData,
            story: story
        };
        existingData.push(logEntry);
        saveData(existingData);

        // Send response
        res.json({ success: true, story });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!API_KEY || API_KEY === '') {
        console.log('Warning: No Gemini API key provided. Using dummy story generator.');
    } else {
        console.log('Gemini API configured successfully.');
    }
});