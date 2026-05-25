export const CITIES = {
    maria: {
        label: { en: 'Ave Maria' },
        short: { en: 'NFM' },
        coverImage: 'https://images.unsplash.com/photo-1582150050076-52baeeba4a74?w=2200&q=80&fit=crop',
        coverAlt: { en: 'Lake Como at sunset' },
        flag: '',
    },
};

export const DEFAULT_CITY = 'maria';

export const translations = {
    coverTagline: { en: 'A field guide to unforgettable places\naround the world.' },
    coverDesc: { en: 'The most romantic places Johnny took his friends,\nnow mapped for Matt to take Maria.' },
    openMagazine: { en: 'Discover' },
    enter: { en: 'Enter' },
    folioDate: { en: 'Evidence' },
    folioOf: { en: 'of' },
    folioCurated: { en: 'Romantic Evidence' },
    neighborhood: { en: 'Location' },
    dateType: { en: 'Date Type' },
    priceRange: { en: 'Price' },
    vibe: { en: 'Vibe' },
    openInMaps: { en: 'Open in Google Maps' },
    mariaProbability: { en: 'Probability Maria Would Love This' },
    googleRating: { en: 'Google average' },
    footerText: { en: 'AVE MARIA / ROMANTIC EVIDENCE' },
    kbHint: { en: 'Use arrow keys or scroll to navigate' },
    swipeHint: { en: 'Swipe to inspect evidence' },
    issueNo: { en: 'Case File No. 01' },
    season: { en: 'Spring 2026' },
    shareLocation: { en: 'Share this exhibit' },
    copied: { en: 'Link copied!' },
    filterTitle: { en: 'Filter Exhibits' },
    cityLabel: { en: 'City' },
    type: { en: 'Date Type' },
    any: { en: 'Any' },
    "romantic-dinner": { en: 'Romantic Dinner' },
    "casual-lunch": { en: 'Casual Lunch' },
    "cocktail-bar": { en: 'Cocktail Bar' },
    aperitivo: { en: 'Aperitivo' },
    "coffee-pastry": { en: 'Coffee & Pastry' },
    cultural: { en: 'Cultural' },
    outdoor: { en: 'Outdoor' },
    "live-music": { en: 'Live Music' },
    workout: { en: 'Workout' },
    vibeFilter: { en: 'Vibe' },
    romantic: { en: 'Romantic' },
    casual: { en: 'Casual' },
    festive: { en: 'Festive' },
    classic: { en: 'Classic' },
    priceFilter: { en: 'Price' },
    horoscope: { en: 'Verdict' },
    aries: { en: 'Bold' },
    taurus: { en: 'Luxurious' },
    gemini: { en: 'Suspicious' },
    cancer: { en: 'Sentimental' },
    leo: { en: 'Dramatic' },
    virgo: { en: 'Documented' },
    libra: { en: 'Romantic' },
    scorpio: { en: 'Incriminating' },
    sagittarius: { en: 'Adventurous' },
    capricorn: { en: 'Planned' },
    aquarius: { en: 'Unexpected' },
    pisces: { en: 'Dreamy' },
    reset: { en: 'Reset Filters' },
    noResults: { en: 'No exhibits match your filters.' },
};

let currentLang = 'en';
let currentCity = DEFAULT_CITY;

function interpolate(str, vars) {
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ''));
}

export function t(key, vars) {
    const entry = translations[key];
    if (!entry) return key;
    const raw = entry[currentLang] || entry.en || key;
    const city = CITIES[currentCity] || CITIES[DEFAULT_CITY];
    const base = {
        city: city.label[currentLang] || city.label.en,
        cityShort: city.short[currentLang] || city.short.en,
    };
    return interpolate(raw, { ...base, ...(vars || {}) });
}

export function getLang() { return currentLang; }

export function getCity() { return currentCity; }

export function setCity(city) {
    if (!CITIES[city]) return;
    currentCity = city;
    applyTranslations();
}

export function setLang(lang) {
    currentLang = lang || 'en';
    document.documentElement.lang = 'en';
    applyTranslations();
}

export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const text = t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.innerHTML = text.replace(/\n/g, '<br>');
        }
    });
}
