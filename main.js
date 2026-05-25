import spotsData from './data/spots.json';
import { t, getLang, setLang, getCity, setCity, CITIES, DEFAULT_CITY } from './i18n.js';

function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

let spots = shuffle(spotsData);
let currentSpread = 0;
let isTransitioning = false;
let magazineOpen = false;
let displayedSpots = [];

const loader = document.getElementById('loader');
const cover = document.getElementById('cover');
const magazine = document.getElementById('magazine');
const navPrev = document.getElementById('nav-prev');
const navNext = document.getElementById('nav-next');
const enterBtn = document.getElementById('enter-btn');
const kbHint = document.getElementById('kb-hint');
const toolbar = document.getElementById('toolbar');
const noResults = document.getElementById('no-results');

let filters = { dateType: 'any', vibe: 'any', priceRange: 'any', horoscope: 'any' };

const priceLabel = (n) => '\u20AC'.repeat(n);

const mariaScore = (rating) => Math.round((Number(rating || 0) / 5) * 100);

const horoscopePrefs = {
    aries:       { types: ['live-music', 'outdoor', 'cocktail-bar'], vibes: ['festive', 'casual'] },
    taurus:      { types: ['romantic-dinner', 'coffee-pastry', 'aperitivo'], vibes: ['romantic', 'classic'] },
    gemini:      { types: ['aperitivo', 'cultural', 'cocktail-bar'], vibes: ['festive', 'casual'] },
    cancer:      { types: ['romantic-dinner', 'coffee-pastry', 'outdoor'], vibes: ['romantic', 'casual'] },
    leo:         { types: ['cocktail-bar', 'romantic-dinner', 'live-music'], vibes: ['festive', 'classic'], minPrice: 3 },
    virgo:       { types: ['coffee-pastry', 'cultural', 'romantic-dinner'], vibes: ['classic', 'romantic'] },
    libra:       { types: ['aperitivo', 'cocktail-bar', 'romantic-dinner'], vibes: ['romantic', 'classic'] },
    scorpio:     { types: ['cocktail-bar', 'cultural', 'romantic-dinner'], vibes: ['romantic', 'classic'] },
    sagittarius: { types: ['outdoor', 'live-music', 'casual-lunch'], vibes: ['festive', 'casual'] },
    capricorn:   { types: ['romantic-dinner', 'cultural', 'cocktail-bar'], vibes: ['classic', 'romantic'] },
    aquarius:    { types: ['live-music', 'cultural', 'aperitivo'], vibes: ['festive', 'casual'] },
    pisces:      { types: ['aperitivo', 'outdoor', 'cocktail-bar'], vibes: ['romantic', 'casual'] },
};

function applyFilters() {
    const city = getCity();
    return spots.filter(s => {
        const spotCity = s.city || DEFAULT_CITY;
        if (spotCity !== city) return false;
        if (filters.dateType !== 'any' && s.dateType !== filters.dateType) return false;
        if (filters.vibe !== 'any' && s.vibe !== filters.vibe) return false;
        if (filters.priceRange !== 'any' && s.priceRange > parseInt(filters.priceRange)) return false;
        if (filters.horoscope !== 'any') {
            const prefs = horoscopePrefs[filters.horoscope];
            if (prefs) {
                if (!prefs.types.includes(s.dateType)) return false;
                if (!prefs.vibes.includes(s.vibe)) return false;
                if (prefs.minPrice && s.priceRange < prefs.minPrice) return false;
            }
        }
        return true;
    });
}

function buildSpread(spot, index, total) {
    const nameHtml = spot.name.replace(/\n/g, '<br>');
    const longestLine = Math.max(...spot.name.split('\n').map(l => l.length));
    const titleSizeClass = longestLine >= 15 ? ' t-tighter' : longestLine >= 13 ? ' t-tight' : '';
    const lang = getLang();
    const neighborhood = typeof spot.neighborhood === 'object'
        ? (spot.neighborhood[lang] || spot.neighborhood.en)
        : spot.neighborhood;
    const description = typeof spot.description === 'object'
        ? (spot.description[lang] || spot.description.en)
        : spot.description;
    const dateTypeLabel = t(spot.dateType);
    const vibeLabel = t(spot.vibe);
    const price = priceLabel(spot.priceRange || 1);
    const googleRating = Number(spot.googleRating || 0).toFixed(1);
    const probability = mariaScore(spot.googleRating);

    return `
    <div class="spread" data-index="${index}">
        <div class="page-left">
            <img src="${spot.heroImage}" alt="${spot.heroAlt || spot.name}" style="object-position: ${spot.heroPosition || 'center center'}" loading="lazy" decoding="async">
        </div>
        <div class="page-right">
            <header class="folio">
                <span>Ave Maria</span>
            </header>
            <div class="info-layout">
                <h1 class="destination-title${titleSizeClass}">
                    ${nameHtml}
                    <span>${neighborhood}</span>
                </h1>
                <p class="destination-description">${description}</p>
                <div class="info-cards">
                    <div class="info-card probability-card">
                        <div class="info-card-label">${t('mariaProbability')}</div>
                        <div class="info-card-value probability-value">${probability}%</div>
                        <div class="info-card-sub">${t('googleRating')} ${googleRating}/5</div>
                    </div>
                    <div class="info-card">
                        <div class="info-card-label">${t('dateType')}</div>
                        <div class="info-card-value">${dateTypeLabel}</div>
                        <div class="info-card-sub">${vibeLabel} \u00b7 ${price}</div>
                    </div>
                    <div class="info-card">
                        <a href="${spot.mapsUrl}" target="_blank" rel="noopener" class="maps-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>${t('openInMaps')}</span>
                        </a>
                    </div>
                </div>
            </div>
            <button class="share-dest-btn" data-dest-index="${index}" title="${t('shareLocation')}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                <span>${t('shareLocation')}</span>
            </button>
            <footer class="folio folio-footer">
                <span>${t('footerText')}</span>
            </footer>
        </div>
    </div>`;
}

function renderWindow(centerIndex) {
    const total = displayedSpots.length;
    if (total === 0) {
        magazine.innerHTML = '';
        noResults.classList.add('visible');
        return;
    }
    noResults.classList.remove('visible');

    const start = Math.max(0, centerIndex - 1);
    const end = Math.min(total - 1, centerIndex + 1);

    const existing = new Set();
    magazine.querySelectorAll('.spread').forEach(el => existing.add(el.dataset.index));

    const needed = new Set();
    for (let i = start; i <= end; i++) needed.add(String(i));

    magazine.querySelectorAll('.spread').forEach(el => {
        if (!needed.has(el.dataset.index)) el.remove();
    });

    for (let i = start; i <= end; i++) {
        if (!existing.has(String(i))) {
            const div = document.createElement('div');
            div.innerHTML = buildSpread(displayedSpots[i], i, total);
            magazine.appendChild(div.firstElementChild);
        }
    }

    magazine.querySelectorAll('.spread').forEach(el => el.classList.remove('active'));
    const activeEl = magazine.querySelector(`.spread[data-index="${centerIndex}"]`);
    if (activeEl) activeEl.classList.add('active');

    wireShareButtons();
}

function wireShareButtons() {
    magazine.querySelectorAll('.share-dest-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = parseInt(btn.dataset.destIndex);
            const spot = displayedSpots[idx];
            if (!spot) return;
            const name = spot.name.replace(/\n/g, ' ');
            const slug = spot.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const url = `${window.location.origin}/?spot=${slug}`;
            const text = `${name} \u2014 ${t('folioCurated')}`;

            if (navigator.share) {
                try { await navigator.share({ title: name, text, url }); } catch {}
            } else {
                try { await navigator.clipboard.writeText(`${text}\n${url}`); } catch {}
                const label = btn.querySelector('span');
                const orig = label.textContent;
                label.textContent = t('copied');
                btn.classList.add('copied');
                setTimeout(() => { label.textContent = orig; btn.classList.remove('copied'); }, 2000);
            }
        });
    });
}

function renderMagazine(list) {
    displayedSpots = list;
    currentSpread = 0;
    isTransitioning = false;
    magazine.innerHTML = '';

    if (list.length === 0) {
        noResults.classList.add('visible');
        return;
    }
    noResults.classList.remove('visible');
    renderWindow(0);
}

async function loadLiveSpots() {
    try {
        const res = await fetch('/api/spots', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            spots = shuffle(data);
            renderMagazine(applyFilters());
        }
    } catch {
        // Offline / static fallback is fine
    }
}

function applyCityToCover() {
    const city = CITIES[getCity()] || CITIES[DEFAULT_CITY];
    const lang = getLang();
    const img = document.querySelector('.cover-bg img');
    if (img) {
        img.src = city.coverImage;
        img.alt = city.coverAlt[lang] || city.coverAlt.en;
    }
    const loaderSub = document.querySelector('.loader-subtitle');
    if (loaderSub) loaderSub.textContent = t('folioCurated');
    document.title = 'Ave Maria | ' + t('folioCurated');
}

function updateCityButtons() {
    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.city === getCity());
    });
}

function init() {
    setLang(getLang());
    updateLangButtons();
    updateCityButtons();
    applyCityToCover();
    renderMagazine(applyFilters());

    // Deep link
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    if (cityParam && CITIES[cityParam] && cityParam !== getCity()) {
        setCity(cityParam);
        updateCityButtons();
        applyCityToCover();
        renderMagazine(applyFilters());
    }
    const spotSlug = params.get('spot');
    if (spotSlug) {
        // If the spot lives in a different city, switch to it
        const match = spots.find(s => (s.id || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) === spotSlug);
        if (match && match.city && match.city !== getCity()) {
            setCity(match.city);
            updateCityButtons();
            applyCityToCover();
            renderMagazine(applyFilters());
        }
        const idx = displayedSpots.findIndex(s => (s.id || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) === spotSlug);
        if (idx >= 0) {
            currentSpread = idx;
            setTimeout(() => { openMagazine(); renderWindow(idx); }, 800);
        }
    }

    // Loader
    let loaderDismissed = false;
    const dismissLoader = () => {
        if (loaderDismissed) return;
        loaderDismissed = true;
        document.querySelector('.loader-fill').style.width = '100%';
        setTimeout(() => loader.classList.add('hidden'), 600);
    };
    const coverImg = document.querySelector('.cover-bg img');
    if (coverImg && coverImg.complete && coverImg.naturalWidth > 0) dismissLoader();
    else if (coverImg) {
        coverImg.addEventListener('load', dismissLoader, { once: true });
        coverImg.addEventListener('error', dismissLoader, { once: true });
    }
    requestAnimationFrame(() => { document.querySelector('.loader-fill').style.width = '60%'; });
    setTimeout(dismissLoader, 3000);

    // Events
    enterBtn.addEventListener('click', openMagazine);
    document.addEventListener('keydown', handleKey);
    document.addEventListener('wheel', handleWheel, { passive: false });

    let touchStartX = 0, touchStartY = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', e => {
        if (!magazineOpen) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
            dx < 0 ? goNext() : goPrev();
        }
    }, { passive: true });

    navPrev.addEventListener('click', goPrev);
    navNext.addEventListener('click', goNext);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLang(btn.dataset.lang);
            updateLangButtons();
            applyCityToCover();
            renderMagazine(applyFilters());
            if (magazineOpen) renderWindow(currentSpread);
        });
    });

    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setCity(btn.dataset.city);
            updateCityButtons();
            applyCityToCover();
            currentSpread = 0;
            renderMagazine(applyFilters());
            if (magazineOpen) renderWindow(0);
        });
    });

    initMenu();
    initFilters();
    initShare();

    // Load fresh data from API in background (CMS updates)
    loadLiveSpots();
}

function initMenu() {
    const toggle = document.getElementById('menu-toggle');
    const popover = document.getElementById('menu-popover');
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (!popover.contains(e.target) && e.target !== toggle) popover.classList.remove('open');
    });
    popover.querySelectorAll('button.menu-item').forEach(btn => {
        btn.addEventListener('click', () => popover.classList.remove('open'));
    });
}

function updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === getLang());
    });
}

function initFilters() {
    const panel = document.getElementById('filter-panel');
    const backdrop = document.getElementById('filter-backdrop');
    const filterBtn = document.getElementById('filter-btn');
    const resetBtn = document.getElementById('reset-filters');

    filterBtn.addEventListener('click', () => {
        panel.classList.toggle('open');
        backdrop.classList.toggle('visible');
    });
    backdrop.addEventListener('click', () => {
        panel.classList.remove('open');
        backdrop.classList.remove('visible');
    });

    document.querySelectorAll('.pill-row').forEach(row => {
        row.addEventListener('click', e => {
            const pill = e.target.closest('.pill');
            if (!pill) return;
            row.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filters[row.dataset.filter] = pill.dataset.value;
            renderMagazine(applyFilters());
            if (magazineOpen) renderWindow(0);
            updateFilterIndicator();
        });
    });

    resetBtn.addEventListener('click', () => {
        filters = { dateType: 'any', vibe: 'any', priceRange: 'any', horoscope: 'any' };
        document.querySelectorAll('.pill-row').forEach(row => {
            row.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            row.querySelector('[data-value="any"]').classList.add('active');
        });
        renderMagazine(applyFilters());
        if (magazineOpen) renderWindow(0);
        updateFilterIndicator();
    });
}

function updateFilterIndicator() {
    const btn = document.getElementById('menu-toggle');
    const hasFilter = filters.dateType !== 'any' || filters.vibe !== 'any' || filters.priceRange !== 'any' || filters.horoscope !== 'any';
    btn.classList.toggle('has-filter', hasFilter);
}

function initShare() {
    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', async () => {
        const spot = displayedSpots[currentSpread];
        const name = spot ? spot.name.replace(/\n/g, ' ') : 'Ave Maria';
        const url = window.location.origin;
        const text = `${name} \u2014 ${t('folioCurated')}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Ave Maria', text, url }); } catch {}
        } else {
            try { await navigator.clipboard.writeText(`${text}\n${url}`); } catch {}
            shareBtn.title = 'Copied!';
            setTimeout(() => { shareBtn.title = 'Share'; }, 2000);
        }
    });
}

function openMagazine() {
    magazineOpen = true;
    cover.classList.add('hidden');
    magazine.classList.add('active');
    navPrev.classList.add('visible');
    navNext.classList.add('visible');
    toolbar.classList.add('visible');
    kbHint.classList.add('visible');
    renderWindow(currentSpread);
    setTimeout(() => kbHint.classList.remove('visible'), 4000);
}

function closeMagazine() {
    magazineOpen = false;
    cover.classList.remove('hidden');
    magazine.classList.remove('active');
    navPrev.classList.remove('visible');
    navNext.classList.remove('visible');
    toolbar.classList.remove('visible');
    kbHint.classList.remove('visible');
}

function handleKey(e) {
    if (!magazineOpen) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMagazine(); }
        return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goNext(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
    else if (e.key === 'Escape') closeMagazine();
}

function handleWheel(e) {
    if (!magazineOpen) return;
    if (window.innerWidth <= 1024) return;
    e.preventDefault();
    if (Math.abs(e.deltaY) > 30) { e.deltaY > 0 ? goNext() : goPrev(); }
}

function goTo(index) {
    if (isTransitioning || index === currentSpread) return;
    if (index < 0 || index >= displayedSpots.length) return;
    isTransitioning = true;
    currentSpread = index;
    renderWindow(index);
    setTimeout(() => { isTransitioning = false; }, 500);
}

function goNext() {
    const n = displayedSpots.length;
    if (n === 0) return;
    goTo((currentSpread + 1) % n);
}
function goPrev() {
    const n = displayedSpots.length;
    if (n === 0) return;
    goTo((currentSpread - 1 + n) % n);
}

init();
