// 🔎 Arama butonunu DOM'dan alır
const searchBtn = document.getElementById('searchBtn');

// 🌍 Ülke adının girildiği input alanı
const countryInput = document.getElementById('countryInput');

// 📦 Sonuçların yazdırılacağı ana container
const result = document.getElementById('result');

// 🌙 Tema değiştirme butonu
const themeToggle = document.getElementById('themeToggle');

// ⏱️ Saat güncellemesi için timer referansı
let timer;

/* ============================================================
   🌍 Dil Çeviri Sözlüğü
   REST Countries API'den gelen İngilizce dil adlarını
   Türkçeye çevirmek için kullanılır
============================================================ */
const languageTR = {
    Turkish: "Türkçe",
    English: "İngilizce",
    German: "Almanca",
    French: "Fransızca",
    Spanish: "İspanyolca",
    Italian: "İtalyanca",
    Arabic: "Arapça",
    Russian: "Rusça",
    Chinese: "Çince",
    Japanese: "Japonca",
    Korean: "Korece",
    Portuguese: "Portekizce",
    Dutch: "Felemenkçe",
    Greek: "Yunanca",
    Swedish: "İsveççe",
    Norwegian: "Norveççe",
    Finnish: "Fince",
    Danish: "Danca",
    Polish: "Lehçe",
    Ukrainian: "Ukraynaca",
    Persian: "Farsça",
    Hindi: "Hintçe"
};

/* ============================================================
   🌙 Tema Değiştirme
   Dark / Light tema geçişini sağlar
============================================================ */
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');

    // Tema ikonunu değiştirir
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

/* ============================================================
   🌍 Ülke Bilgilerini Getirme Fonksiyonu
   REST Countries API üzerinden ülke verilerini çeker
============================================================ */
async function getCountry(name) {
    if (!name) return;

    // Yükleniyor animasyonu
    result.innerHTML = `<div class="loader"></div>`;

    try {
        // Ülkeyi çeviri adına göre API'den getirir
        const res = await fetch(`https://restcountries.com/v3.1/translation/${name}?fullText=true`);
        if (!res.ok) throw new Error("Ülke bulunamadı");

        // Gelen verinin ilk elemanını alır
        const [data] = await res.json();

        // Ülke kartını ekrana basar
        renderCard(data, name);

    } catch (err) {
        // Hata durumunda mesaj gösterir
        result.innerHTML = `<div class="error-box">${err.message}</div>`;
    }
}

/* ============================================================
   🧠 Ülke Kartını Oluşturma
   API'den gelen verileri HTML olarak render eder
============================================================ */
function renderCard(data, input) {

    // Girilen kelimenin Türkçe karakter içerip içermediğini kontrol eder
    const isTurkish = /[ğüşıöçĞÜŞİÖÇ]/.test(input);

    // Türkçe ve İngilizce ülke adları
    const nTR = data.translations.tur.common;
    const nEN = data.name.common;

    // Para birimi bilgisi
    const currency = Object.values(data.currencies || {})[0]?.name || "Bilinmiyor";

    // Dil bilgisini İngilizceden Türkçeye çevirir
    const langEN = Object.values(data.languages || {})[0];
    const langTR = languageTR[langEN] || langEN;

    // Zaman dilimi farkını hesaplar
    const offsetStr = data.timezones[0].replace('UTC', '').replace(':', '.');
    const offset = parseFloat(offsetStr) || 0;

    // Ülke kartının HTML çıktısı
    result.innerHTML = `
        <div class="country-card">
            <div class="flag-box">
                <img src="${data.flags.svg}" alt="${nEN} bayrağı">
            </div>

            <div class="card-content">
                <div class="card-header">
                    <div>
                        <h2>${isTurkish ? `${nTR} (${nEN})` : `${nEN} (${nTR})`}</h2>
                        <p>${data.capital?.[0] || "-"} — ${data.region}</p>
                    </div>

                    <div class="action-tools">
                        <!-- Sesli okuma butonu -->
                        <button class="icon-btn" onclick="speak('${nTR}', '${data.capital?.[0] || ""}')">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>

                        <!-- Google Maps yönlendirme -->
                        <a class="icon-btn" target="_blank"
                           href="https://www.google.com/maps?q=${data.latlng[0]},${data.latlng[1]}">
                            <i class="fa-solid fa-location-arrow"></i>
                        </a>
                    </div>
                </div>

                <!-- İstatistikler -->
                <div class="stats-grid">
                    <div class="stat-card"><small>NÜFUS</small><strong>${data.population.toLocaleString()}</strong></div>
                    <div class="stat-card"><small>PARA BİRİMİ</small><strong>${currency}</strong></div>
                    <div class="stat-card"><small>DİL</small><strong>${langTR}</strong></div>
                    <div class="stat-card"><small>STATÜ</small><strong>${data.independent ? 'Bağımsız' : 'Bölge'}</strong></div>
                </div>

                <!-- Canlı saat alanı -->
                <div class="time-box">
                    <small>ÜLKE YEREL SAATİ</small>
                    <div id="liveTime" class="time-value"></div>
                </div>
            </div>
        </div>
    `;

    // Saat fonksiyonunu başlatır
    startClock(offset);
}

/* ============================================================
   ⏰ Canlı Saat Fonksiyonu
   Seçilen ülkenin yerel saatini saniyede bir günceller
============================================================ */
function startClock(offset) {
    clearInterval(timer);

    timer = setInterval(() => {
        const now = new Date();

        // Saat farkını hesaplar
        const local = new Date(
            now.getTime() +
            now.getTimezoneOffset() * 60000 +
            offset * 3600000
        );

        // Saat bilgisini ekrana yazar
        document.getElementById('liveTime').textContent =
            local.toLocaleTimeString('tr-TR');
    }, 1000);
}

/* ============================================================
   🔊 Sesli Okuma Fonksiyonu
   Ülke ve başkent bilgisini Türkçe seslendirir
============================================================ */
function speak(country, capital) {
    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(
        `Ülke: ${country}. Başkent: ${capital}.`
    );

    msg.lang = 'tr-TR';
    window.speechSynthesis.speak(msg);
}

/* ============================================================
   🎯 Event Listener'lar
   Buton tıklama ve Enter tuşu ile arama işlemi
============================================================ */

// Arama butonuna tıklanınca
searchBtn.addEventListener('click', () =>
    getCountry(countryInput.value)
);

// Enter tuşu ile arama
countryInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') getCountry(countryInput.value);
});
