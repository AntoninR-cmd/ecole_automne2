/* École d'automne Data Science — scripts du site
 * 1. Textes FR/EN      2. Rendu du contenu     3. Vol (vidéo pilotée par le défilement)
 * 4. Nuage de points 3D 5. Programme (recherche, favoris, calendrier, en cours)  6. Démarrage
 */
(function () {
  'use strict';

  const DATA = window.AUTUMN;
  const EV = DATA.event;
  const TZ = 'Europe/Paris';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };

  /* ================= 1. Textes ================= */
  const T = {
    fr: {
      docTitle: 'École d’automne Data Science — Institut Agro Rennes',
      skip: 'Aller au programme',
      brand: 'École d’automne Data Science',
      brandSub: '4ᵉ édition · 2026',
      navProjects: 'Projets', navProgramme: 'Programme', navInfo: 'Infos pratiques', navAbout: 'À propos',
      motionPause: 'Mettre les animations en pause', motionPlay: 'Relancer les animations',
      langSwitch: 'Switch to English',
      heroKicker: '4ᵉ édition · Institut Agro Rennes',
      heroTitleA: 'École d’automne',
      beat2: 'Huit projets étudiants de <em>Machine Learning</em> appliqués au vivant.',
      beat3Kicker: 'Un après-midi de conférences',
      beat4: 'Rendez-vous ici.',
      beat4Cta: 'Découvrir les projets',
      scrollHint: 'Faites défiler',
      projectsKicker: 'Au programme',
      projectsTitle: 'Des projets étudiants en <em>Machine Learning</em>',
      noteProjects: '8 projets · 20 min chacun', noteFav: '☆ pour garder vos conférences',
      projectsLead: 'Chaque groupe présente le problème étudié, les données utilisées et les modèles qu’il a construits. Les questions sont comprises dans le temps de passage.',
      programmeKicker: 'Programme',
      programmeTitle: 'L’après-midi <em>en détail</em>',
      programmeNotice: 'Les résumés des projets seront publiés prochainement.',
      mapAlt: 'Plan du campus de Rennes de l’Institut Agro, avec le bâtiment 24 signalé',
      mapTag: 'c’est ici ! Bât. 24 · Salle D4', mapConf: 'Conférences', mapConfWhere: 'bâtiment 24, salle D4', mapEntry: 'Entrée',
      searchLabel: 'Rechercher', searchPlaceholder: 'Sujet, intervenant, thème…',
      themeLabel: 'Thème', allThemes: 'Tous les thèmes',
      favFilter: 'Mes favoris',
      print: 'Imprimer / PDF', calendar: 'Ajouter au calendrier',
      calendarDisabled: 'Disponible dès que la date sera confirmée',
      empty: 'Aucune conférence ne correspond à cette recherche.',
      count: n => n > 1 ? `${n} conférences` : `${n} conférence`,
      fav: 'Favori', favAdd: 'Ajouter aux favoris', favRemove: 'Retirer des favoris',
      favAdded: 'Ajouté à vos favoris', favRemoved: 'Retiré de vos favoris',
      summary: 'Résumé', summaryPending: 'Résumé à venir.',
      timePending: 'Horaire à confirmer',
      live: 'En cours',
      liveEvent: room => `L’école d’automne a lieu en ce moment · ${room}`,
      liveTalk: (title, room) => `En ce moment · ${title} · ${room}`,
      infoKicker: 'Infos pratiques', infoTitle: 'Venir à l’<em>Institut Agro</em>',
      factDate: 'Date', factTime: 'Horaires', factPlace: 'Lieu', factEntry: 'Entrée',
      toConfirm: 'À confirmer',
      entry: 'Libre', entrySub: 'Ouvert à tous, sans inscription',
      gmaps: 'Itinéraire Google Maps', waze: 'Itinéraire Waze',
      aboutKicker: 'À propos', aboutTitle: 'Le cadre de l’<em>école d’automne</em>',
      about1: 'L’école d’automne s’inscrit dans les enseignements de Machine Learning et de Computer Science for Big Data Approaches. Les étudiants de Master 2 et les élèves ingénieurs en spécialisation Sciences des données y présentent les projets menés en groupe.',
      about2: 'Les sujets portent sur des données issues des sciences du vivant : santé, environnement, agronomie et chimie. Chaque présentation expose la question posée, les données, les modèles et leurs limites.',
      about3: 'Les conférences sont ouvertes à tous, sans inscription.',
      footerFrame: 'Master 2 et spécialisation ingénieur Sciences des données',
      footerFav: 'Vos favoris sont conservés uniquement dans ce navigateur.',
      footerCredit: 'Vol aérien réalisé avec Google Earth Studio.',
      stageIntro: 'Huit projets',
      and: 'et'
    },
    en: {
      docTitle: 'Data Science Autumn School — Institut Agro Rennes',
      skip: 'Skip to programme',
      brand: 'Data Science Autumn School',
      brandSub: '4th edition · 2026',
      navProjects: 'Projects', navProgramme: 'Programme', navInfo: 'Practical info', navAbout: 'About',
      motionPause: 'Pause animations', motionPlay: 'Resume animations',
      langSwitch: 'Passer en français',
      heroKicker: '4th edition · Institut Agro Rennes',
      heroTitleA: 'Autumn School',
      beat2: 'Eight student projects applying <em>machine learning</em> to the life sciences.',
      beat3Kicker: 'An afternoon of talks',
      beat4: 'See you here.',
      beat4Cta: 'Discover the projects',
      scrollHint: 'Scroll',
      projectsKicker: 'On the programme',
      projectsTitle: 'Student projects in <em>machine learning</em>',
      noteProjects: '8 projects · 20 min each', noteFav: '☆ to keep your talks',
      projectsLead: 'Each group presents the problem it studied, the data it used and the models it built. Questions are included in each slot.',
      programmeKicker: 'Programme',
      programmeTitle: 'The afternoon <em>in detail</em>',
      programmeNotice: 'Project abstracts will be published soon.',
      mapAlt: 'Map of the Institut Agro Rennes campus, with building 24 highlighted',
      mapTag: 'it’s here! Bldg 24 · Room D4', mapConf: 'Talks', mapConfWhere: 'building 24, room D4', mapEntry: 'Entrance',
      searchLabel: 'Search', searchPlaceholder: 'Topic, speaker, theme…',
      themeLabel: 'Theme', allThemes: 'All themes',
      favFilter: 'My favourites',
      print: 'Print / PDF', calendar: 'Add to calendar',
      calendarDisabled: 'Available once the date is confirmed',
      empty: 'No talk matches this search.',
      count: n => n > 1 ? `${n} talks` : `${n} talk`,
      fav: 'Favourite', favAdd: 'Add to favourites', favRemove: 'Remove from favourites',
      favAdded: 'Added to your favourites', favRemoved: 'Removed from your favourites',
      summary: 'Abstract', summaryPending: 'Abstract coming soon.',
      timePending: 'Time to be confirmed',
      live: 'Live',
      liveEvent: room => `The autumn school is happening now · ${room}`,
      liveTalk: (title, room) => `Now · ${title} · ${room}`,
      infoKicker: 'Practical info', infoTitle: 'Getting to <em>Institut Agro</em>',
      factDate: 'Date', factTime: 'Time', factPlace: 'Venue', factEntry: 'Admission',
      toConfirm: 'To be confirmed',
      entry: 'Free', entrySub: 'Open to all, no registration',
      gmaps: 'Directions in Google Maps', waze: 'Directions in Waze',
      aboutKicker: 'About', aboutTitle: 'About the <em>autumn school</em>',
      about1: 'The autumn school is part of the Machine Learning and Computer Science for Big Data Approaches courses. Second-year master’s students and engineering students specialising in data science present their group projects.',
      about2: 'The topics use data from the life sciences: health, environment, agronomy and chemistry. Each talk covers the question, the data, the models and their limits.',
      about3: 'The talks are open to everyone, with no registration.',
      footerFrame: 'Master’s degree (year 2) and data science engineering specialisation',
      footerFav: 'Your favourites are only stored in this browser.',
      footerCredit: 'Aerial flight made with Google Earth Studio.',
      stageIntro: 'Eight projects',
      and: 'and'
    }
  };

  let lang = store.get('autumn-language', null) || ((navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en');
  if (!T[lang]) lang = 'fr';
  const t = key => T[lang][key] ?? T.fr[key] ?? key;
  const L = obj => typeof obj === 'string' ? obj : (obj && (obj[lang] || obj.fr)) || '';

  function applyStaticTexts() {
    document.documentElement.lang = lang;
    document.title = t('docTitle');
    $('#printTitle').textContent = t('docTitle');
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    $$('[data-i18n-alt]').forEach(el => { el.alt = t(el.dataset.i18nAlt); });
    const lb = $('#langToggle');
    lb.textContent = lang === 'fr' ? 'EN' : 'FR';
    lb.setAttribute('aria-label', t('langSwitch'));
    updateMotionButton();
  }

  /* ================= Dates et heures (heure de Paris) ================= */
  function tzOffset(ms) {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(new Date(ms)).reduce((o, x) => (o[x.type] = x.value, o), {});
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms;
  }
  function parisDate(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const [Y, M, D] = dateStr.split('-').map(Number);
    const [h, mi] = timeStr.split(':').map(Number);
    const guess = Date.UTC(Y, M - 1, D, h, mi);
    return new Date(guess - tzOffset(guess));
  }
  function talkDate(v) {
    if (!v) return null;
    if (v.includes('T')) { const d = new Date(v); return isNaN(d) ? null : d; }
    return parisDate(EV.date, v);
  }
  function fmtTime(hhmm) {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':').map(Number);
    if (lang === 'fr') return `${h}h${m ? String(m).padStart(2, '0') : ''}`;
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''}`;
  }
  function fmtRange(a, b) {
    if (!a || !b) return '';
    if (lang === 'fr') return `${fmtTime(a)} – ${fmtTime(b)}`;
    const pm = h => (+h.split(':')[0] >= 12 ? 'pm' : 'am');
    return `${fmtTime(a)} ${pm(a) === pm(b) ? '' : pm(a) + ' '}– ${fmtTime(b)} ${pm(b)}`.replace('  ', ' ');
  }
  function fmtDateLong(dateStr) {
    if (!dateStr) return null;
    const d = parisDate(dateStr, '12:00');
    const s = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function hhmmOf(date) {
    return new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(date);
  }

  /* ================= 2. Rendu ================= */
  const ICON_STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const speakersText = list => {
    if (!list || !list.length) return '';
    if (list.length === 1) return list[0];
    return list.slice(0, -1).join(', ') + ' ' + t('and') + ' ' + list[list.length - 1];
  };
  const roomLabel = () => [L(EV.room), L(EV.building)].filter(Boolean).join(', ');

  let favorites = new Set(store.get('autumn-favorites', []));

  function favButton(id, compact) {
    const on = favorites.has(id);
    return `<button class="fav-btn" type="button" data-fav="${esc(id)}" aria-pressed="${on}" aria-label="${esc(on ? t('favRemove') : t('favAdd'))}">${ICON_STAR}${compact ? '' : `<span>${esc(t('fav'))}</span>`}</button>`;
  }

  function talkTime(k) {
    const s = talkDate(k.start), e = talkDate(k.end);
    return s && e ? fmtRange(hhmmOf(s), hhmmOf(e)) : '';
  }

  function renderCards() {
    $('#talkCards').innerHTML = DATA.talks.map((k, i) => `
      <li class="talk-card" data-index="${i}" id="projet-${esc(k.id)}">
        <article class="card-inner">
          <div class="card-top">
            <span class="card-num">${pad(i + 1)}</span>
            <span class="tag">${esc(L(DATA.themes[k.theme]))}</span>
          </div>
          <h3>${esc(L(k.title))}</h3>
          <p class="card-meta">${talkTime(k) ? `<span class="card-time">${esc(talkTime(k))}</span>` : ''}<span class="card-method">${esc(L(k.method))}</span></p>
          <p class="speakers">${esc(speakersText(k.speakers))}</p>
          <div class="card-foot">
            <p class="pending">${esc(L(k.summary) || t('summaryPending'))}</p>
            ${favButton(k.id)}
          </div>
        </article>
      </li>`).join('');
    observeCards();
  }

  function renderInfo() {
    const dateTxt = fmtDateLong(EV.date);
    const facts = [
      [t('factDate'), dateTxt || t('toConfirm'), ''],
      [t('factTime'), fmtRange(EV.start, EV.end) || t('toConfirm'), ''],
      [t('factPlace'), roomLabel() || t('toConfirm'), EV.site],
      [t('factEntry'), t('entry'), t('entrySub')]
    ];
    $('#facts').innerHTML = facts.map(([k, v, s]) => `<div class="fact"><dt>${esc(k)}</dt><dd>${esc(v)}${s ? `<small>${esc(s)}</small>` : ''}</dd></div>`).join('');
    $('#address').textContent = `${EV.site} · ${EV.address}`;
    $('#gmapsLink').href = `https://www.google.com/maps/dir/?api=1&destination=${EV.lat},${EV.lng}`;
    $('#wazeLink').href = `https://waze.com/ul?ll=${EV.lat},${EV.lng}&navigate=yes`;
    const parts = [];
    if (dateTxt) parts.push(new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { timeZone: TZ, day: 'numeric', month: 'long' }).format(parisDate(EV.date, '12:00')));
    parts.push(fmtRange(EV.start, EV.end), L(EV.room));
    $('#beat3Line').textContent = parts.filter(Boolean).join(' · ');
    const ics = $('#icsBtn');
    const ok = !!(EV.date && EV.start && EV.end);
    ics.disabled = !ok;
    ics.title = ok ? '' : t('calendarDisabled');
  }

  function renderThemeOptions() {
    const sel = $('#themeFilter');
    const cur = sel.value;
    const used = [...new Set(DATA.talks.map(k => k.theme))];
    sel.innerHTML = `<option value="">${esc(t('allThemes'))}</option>` +
      used.map(id => `<option value="${esc(id)}">${esc(L(DATA.themes[id]))}</option>`).join('');
    sel.value = used.includes(cur) ? cur : '';
  }

  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const filters = { q: '', theme: '', fav: false };
  let printing = false;

  function matches(k) {
    if (printing) return true;
    if (filters.theme && k.theme !== filters.theme) return false;
    if (filters.fav && !favorites.has(k.id)) return false;
    if (filters.q) {
      const hay = norm([k.title.fr, k.title.en, k.summary.fr, k.summary.en, k.speakers.join(' '),
        DATA.themes[k.theme].fr, DATA.themes[k.theme].en, k.method.fr, k.method.en].join(' '));
      return norm(filters.q).split(/\s+/).filter(Boolean).every(w => hay.includes(w));
    }
    return true;
  }

  function renderList() {
    const now = new Date();
    const rows = DATA.talks.map((k, i) => ({ k, i })).filter(({ k }) => matches(k));
    $('#talkList').innerHTML = rows.map(({ k, i }) => {
      const s = talkDate(k.start), e = talkDate(k.end);
      const live = s && e && now >= s && now < e;
      const time = talkTime(k) || t('timePending');
      const sum = L(k.summary);
      return `
      <li class="talk-row${live ? ' is-live' : ''}">
        <div class="row-grid">
          <span class="row-num">${pad(i + 1)}</span>
          <span class="row-time">${esc(time)}</span>
          <div class="row-main">
            <h3>${esc(L(k.title))}</h3>
            <div class="row-meta">
              ${live ? `<span class="live-pill">${esc(t('live'))}</span>` : ''}
              <span>${esc(speakersText(k.speakers))}</span>
              <span class="tag">${esc(L(DATA.themes[k.theme]))}</span>
            </div>
            ${sum ? `<details><summary>${esc(t('summary'))}</summary><p>${esc(sum)}</p></details>`
                  : `<p class="pending" style="margin-top:8px">${esc(t('summaryPending'))}</p>`}
          </div>
          ${favButton(k.id, true)}
        </div>
      </li>`;
    }).join('');
    $('#emptyState').hidden = rows.length > 0;
    $('#resultCount').textContent = T[lang].count(rows.length);
    const anyPending = DATA.talks.some(k => !L(k.summary));
    $('#programmeNotice').hidden = !anyPending;
    updateLive();
  }

  function renderAll() {
    applyStaticTexts();
    renderCards();
    renderInfo();
    renderThemeOptions();
    renderList();
    cloud && cloud.setLabel(activeIndex);
  }

  /* ================= 5. Programme : favoris, filtres, calendrier, en cours ================= */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    const id = b.dataset.fav;
    if (favorites.has(id)) { favorites.delete(id); toast(t('favRemoved')); } else { favorites.add(id); toast(t('favAdded')); }
    store.set('autumn-favorites', [...favorites]);
    $$(`[data-fav="${CSS.escape(id)}"]`).forEach(x => {
      const on = favorites.has(id);
      x.setAttribute('aria-pressed', on);
      x.setAttribute('aria-label', on ? t('favRemove') : t('favAdd'));
    });
    if (filters.fav) renderList();
  });

  function bindProgramme() {
    $('#search').addEventListener('input', e => { filters.q = e.target.value; renderList(); });
    $('#themeFilter').addEventListener('change', e => { filters.theme = e.target.value; renderList(); });
    $('#favFilter').addEventListener('click', e => {
      filters.fav = !filters.fav;
      e.currentTarget.setAttribute('aria-pressed', filters.fav);
      renderList();
    });
    $('#printBtn').addEventListener('click', () => window.print());
    window.addEventListener('beforeprint', () => { printing = true; renderList(); $$('#talkList details').forEach(d => d.open = true); });
    window.addEventListener('afterprint', () => { printing = false; renderList(); });
    $('#icsBtn').addEventListener('click', downloadICS);
    setInterval(() => { renderListIfLiveChanged(); }, 30000);
  }

  let lastLiveKey = '';
  function liveState() {
    const now = new Date();
    const s = parisDate(EV.date, EV.start), e = parisDate(EV.date, EV.end);
    const eventLive = s && e && now >= s && now < e;
    const talk = DATA.talks.find(k => { const a = talkDate(k.start), b = talkDate(k.end); return a && b && now >= a && now < b; });
    return { eventLive, talk };
  }
  function updateLive() {
    const { eventLive, talk } = liveState();
    const el = $('#liveBanner');
    if (talk) { el.hidden = false; el.textContent = T[lang].liveTalk(L(talk.title), roomLabel()); }
    else if (eventLive) { el.hidden = false; el.textContent = T[lang].liveEvent(roomLabel()); }
    else el.hidden = true;
    lastLiveKey = `${eventLive}|${talk ? talk.id : ''}`;
  }
  function renderListIfLiveChanged() {
    const { eventLive, talk } = liveState();
    if (`${eventLive}|${talk ? talk.id : ''}` !== lastLiveKey) renderList();
  }

  function downloadICS() {
    const s = parisDate(EV.date, EV.start), e = parisDate(EV.date, EV.end);
    if (!s || !e) return;
    const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const escI = v => String(v).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    const desc = DATA.talks.map(k => `${talkTime(k) ? talkTime(k) + ' · ' : ''}${L(k.title)} (${speakersText(k.speakers)})`).join('\n');
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Institut Agro Rennes//Ecole automne Data Science//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:ecole-automne-ds-${EV.year}@institut-agro-rennes`,
      `DTSTAMP:${f(new Date())}`,
      `DTSTART:${f(s)}`, `DTEND:${f(e)}`,
      `SUMMARY:${escI(t('brand') + ' — ' + EV.site)}`,
      `LOCATION:${escI(roomLabel() + ', ' + EV.site + ', ' + EV.address)}`,
      `GEO:${EV.lat};${EV.lng}`,
      `DESCRIPTION:${escI(desc)}`,
      'END:VEVENT', 'END:VCALENDAR'
    ];
    // Repli des lignes longues (RFC 5545 : 75 octets maximum)
    const fold = line => { const out = []; let cur = '', bytes = 0; for (const ch of line) { const b = new TextEncoder().encode(ch).length; if (bytes + b > 73) { out.push(cur); cur = ' '; bytes = 1; } cur += ch; bytes += b; } out.push(cur); return out.join('\r\n'); };
    const blob = new Blob([lines.map(fold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ecole-automne-data-science.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ================= 3. Vol : la vidéo suit le défilement ================= */
  // Courbe temps(défilement) calculée sur le mouvement réel de la vidéo :
  // chaque portion de défilement produit à peu près le même changement visuel.
  const CURVE = [0, .061, .123, .184, .244, .303, .361, .418, .473, .528, .583, .638, .693, .748, .803, .858, .911, .964, 1.018, 1.071,
    1.124, 1.18, 1.235, 1.292, 1.351, 1.411, 1.471, 1.533, 1.596, 1.664, 1.761, 1.881, 1.984, 2.112, 2.217, 2.308, 2.389, 2.463, 2.531, 2.598,
    2.664, 2.727, 2.786, 2.843, 2.897, 2.95, 2.998, 3.044, 3.178, 3.411, 3.643, 3.875, 4.108, 4.34, 4.572, 4.805, 5.037, 5.27, 5.502, 5.734, 5.94];
  const curveAt = p => { const x = clamp(p, 0, 1) * (CURVE.length - 1); const i = Math.floor(x); const f = x - i; return CURVE[i] + (CURVE[Math.min(i + 1, CURVE.length - 1)] - CURVE[i]) * f; };

  function initFlight() {
    const section = $('#vol');
    const video = $('#flightVideo');
    const poster = $('#flightPoster');
    const beats = $$('.beat', section).map(el => ({ el, from: +el.dataset.from, to: +el.dataset.to }));
    const hint = $('#scrollHint');
    const bar = $('#flightBar');
    const sticky = $('.flight-sticky', section);

    const portrait = window.innerHeight > window.innerWidth * 1.15;
    const small = Math.max(window.innerWidth, window.innerHeight) <= 1100 || (navigator.connection && navigator.connection.saveData);
    const src = portrait ? 'assets/video/vol-portrait.mp4' : small ? 'assets/video/vol-720.mp4' : 'assets/video/vol-1080.mp4';
    if (portrait) poster.src = 'assets/video/poster-debut-portrait.jpg';

    let ready = false, target = 0, current = 0, visible = true, raf = 0;

    const attach = url => {
      video.src = url;
      video.load();
    };
    video.addEventListener('loadeddata', () => {
      ready = true;
      video.pause();
      video.currentTime = current;
      video.classList.add('ready');
      loop();
    });
    // Charger la vidéo en mémoire (blob) rend les déplacements dans la vidéo beaucoup plus fiables.
    if (location.protocol.startsWith('http') && window.fetch) {
      fetch(src).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(b => attach(URL.createObjectURL(b)))
        .catch(() => attach(src));
    } else attach(src);

    // Débloque la vidéo sur certains mobiles (iOS) au premier contact
    const unlock = () => { if (ready) video.play().then(() => video.pause()).catch(() => {}); window.removeEventListener('touchstart', unlock); };
    window.addEventListener('touchstart', unlock, { passive: true });

    function progress() {
      const total = section.offsetHeight - sticky.offsetHeight;
      return clamp(-section.getBoundingClientRect().top / Math.max(1, total), 0, 1);
    }
    function paint(p) {
      for (const b of beats) {
        const fade = 0.045;
        let o;
        if (p < b.from) o = b.from === 0 ? 1 : clamp(1 - (b.from - p) / fade, 0, 1);
        else if (p > b.to) o = b.to >= 1 ? 1 : clamp(1 - (p - b.to) / fade, 0, 1);
        else o = 1;
        if (b.from > 0 && p < b.from - fade) o = 0;
        if (b.to < 1 && p > b.to + fade) o = 0;
        b.el.style.opacity = o.toFixed(3);
        b.el.style.transform = `translateY(${((1 - o) * (p < b.from ? 24 : -24)).toFixed(1)}px)`;
        b.el.classList.toggle('on', o > 0.5);
      }
      sticky.style.setProperty('--dim', (clamp((p - 0.6) / 0.3, 0, 1) * 0.3).toFixed(3));
      hint.style.opacity = clamp(1 - p * 14, 0, 1);
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
    }
    function tick() {
      raf = 0;
      const p = progress();
      paint(p);
      target = curveAt(p);
      if (ready) {
        const d = target - current;
        current = Math.abs(d) < 0.002 ? target : current + d * (reduceMotion ? 1 : 0.2);
        if (!video.seeking && Math.abs(video.currentTime - current) > 0.012) {
          try { video.currentTime = current; } catch (e) { /* ignore */ }
        }
        if (Math.abs(target - current) > 0.002 || video.seeking) loop();
      } else current = target;
    }
    function loop() { if (!raf && visible) raf = requestAnimationFrame(tick); }
    window.addEventListener('scroll', loop, { passive: true });
    window.addEventListener('resize', loop);
    video.addEventListener('seeked', loop);
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }).observe(section);
    tick();
  }

  /* ================= 4. Nuage de points 3D ================= */
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }

  // Primitives : chacune renvoie un point [x, y, z] (surface ou volume)
  function makeGen(R) {
    const gauss = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const unit = () => { const z = R() * 2 - 1, a = R() * Math.PI * 2, r = Math.sqrt(1 - z * z); return [r * Math.cos(a), z, r * Math.sin(a)]; };
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const norm3 = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    function tube(a, b, r0, r1) {
      const u = R(), axis = sub(b, a), dir = norm3(axis);
      const ref = Math.abs(dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      const n1 = norm3(cross(dir, ref)), n2 = cross(dir, n1);
      const ang = R() * Math.PI * 2, r = r0 + (r1 - r0) * u;
      return [0, 1, 2].map(k => a[k] + axis[k] * u + (n1[k] * Math.cos(ang) + n2[k] * Math.sin(ang)) * r);
    }
    return {
      gauss, unit, tube,
      sphere(c, r) { const p = unit(); return [c[0] + p[0] * r, c[1] + p[1] * r, c[2] + p[2] * r]; },
      ellipsoid(c, r) { const p = unit(); return [c[0] + p[0] * r[0], c[1] + p[1] * r[1], c[2] + p[2] * r[2]]; },
      ball(c, r) { const p = unit(), k = Math.cbrt(R()) * r; return [c[0] + p[0] * k, c[1] + p[1] * k, c[2] + p[2] * k]; },
      curve(fn, r) { const u = R(), p = fn(u), q = unit(); return [p[0] + q[0] * r, p[1] + q[1] * r, p[2] + q[2] * r]; },
      boxEdges(c, s) {
        const e = Math.floor(R() * 12), u = R() * 2 - 1, sg = [R() < .5 ? -1 : 1, R() < .5 ? -1 : 1];
        const ax = e % 3; const p = [0, 0, 0]; p[ax] = u; p[(ax + 1) % 3] = sg[0]; p[(ax + 2) % 3] = sg[1];
        return [c[0] + p[0] * s[0], c[1] + p[1] * s[1], c[2] + p[2] * s[2]];
      }
    };
  }

  // Une forme = liste de [poids, couleur, générateur]. Couleurs : 0 jaune, 1 jaune clair, 2 blanc.
  const SHAPES = {
    globe(G) {
      return [[1, 0, () => G.sphere([0, 0, 0], 1)], [0.25, 2, () => G.ball([0, 0, 0], 0.55)]];
    },
    molecule(G) {
      const ring = [...Array(6)].map((_, i) => { const a = i * Math.PI / 3 + Math.PI / 6; return [Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0]; });
      const out = [0, 2, 4].map(i => [ring[i][0] * 1.75, ring[i][1] * 1.75, (i - 2) * 0.12]);
      const tail = [out[0][0] + 0.38, out[0][1] + 0.3, 0.25];
      const tail2 = [out[2][0] - 0.05, out[2][1] - 0.42, -0.3];
      const atoms = [...ring.map(p => [p, 0.15, 0]), ...out.map(p => [p, 0.13, 1]), [tail, 0.11, 2], [tail2, 0.1, 2]];
      const bonds = [];
      for (let i = 0; i < 6; i++) bonds.push([ring[i], ring[(i + 1) % 6]]);
      [0, 2, 4].forEach((ri, j) => bonds.push([ring[ri], out[j]]));
      bonds.push([out[0], tail], [out[2], tail2]);
      const list = atoms.map(([c, r, col]) => [r * r * 22, col, () => G.sphere(c, r)]);
      bonds.forEach(([a, b]) => list.push([0.12, 1, () => G.tube(a, b, 0.025, 0.025)]));
      return list;
    },
    knee(G) {
      return [
        [1.2, 0, () => G.tube([0, 1.15, 0], [0, 0.32, 0], 0.15, 0.2)],
        [0.5, 0, () => G.sphere([-0.14, 0.18, -0.02], 0.17)],
        [0.5, 0, () => G.sphere([0.14, 0.18, -0.02], 0.17)],
        [0.5, 1, () => G.ellipsoid([0, -0.08, 0], [0.33, 0.06, 0.24])],
        [1.0, 0, () => G.tube([0, -0.14, 0], [0, -1.12, 0], 0.2, 0.13)],
        [0.25, 0, () => G.tube([0.28, -0.24, -0.05], [0.25, -1.05, -0.05], 0.05, 0.045)],
        [0.3, 2, () => G.ellipsoid([0, 0.2, 0.26], [0.1, 0.13, 0.05])],
        [0.3, 2, () => G.curve(u => { const a = u * Math.PI * 1.7 + 0.7; return [Math.cos(a) * 0.24, 0.0, Math.sin(a) * 0.17]; }, 0.025)]
      ];
    },
    bacteria(G) {
      const capsule = () => {
        const L = 0.62, r = 0.33;
        if (Math.random() < 0.62) return G.tube([-L, 0, 0], [L, 0, 0], r, r);
        const p = G.unit(), side = p[0] < 0 ? -1 : 1;     // demi-sphères aux deux bouts
        return [side * L + p[0] * r, p[1] * r, p[2] * r];
      };
      const flag = k => u => { const x = 0.9 + u * 1.0; const ph = k * 1.6; return [x, Math.sin(u * 9 + ph) * 0.12 * u + (k - 1.5) * 0.12, Math.cos(u * 9 + ph) * 0.12 * u]; };
      return [
        [1.6, 0, capsule],
        [0.25, 2, () => G.ball([0, 0, 0], 0.18)],
        ...[0, 1, 2, 3].map(k => [0.12, 1, () => G.curve(flag(k), 0.012)]),
        [0.2, 1, () => { const p = G.unit(); return [p[0] * 0.7, p[1] * 0.36, p[2] * 0.36].map(v => v * 1.18); }]
      ];
    },
    flame(G) {
      const prof = s => 0.6 * Math.pow(s, 0.38) * Math.pow(1 - s, 0.9) * 2.05;
      const flameSurf = (scale, y0) => () => { const s = Math.random(); const a = Math.random() * Math.PI * 2; const r = prof(s) * scale; return [Math.cos(a) * r, y0 + s * 2.0 * scale, Math.sin(a) * r]; };
      return [
        [1.4, 0, flameSurf(1, -1)],
        [0.6, 1, flameSurf(0.6, -0.95)],
        [0.25, 2, () => { const a = Math.random() * Math.PI * 2, r = 0.2 + Math.random() * 0.6; return [Math.cos(a) * r, -1.04, Math.sin(a) * r]; }],
        [0.18, 1, () => [(Math.random() - .5) * 0.9, -0.2 + Math.random() * 1.4, (Math.random() - .5) * 0.9]]
      ];
    },
    fracture(G) {
      return [
        [0.9, 0, () => G.tube([-1.0, -0.05, 0], [-0.09, 0, 0], 0.12, 0.12)],
        [0.9, 0, () => G.tube([0.09, 0.02, 0], [1.0, 0.1, 0], 0.12, 0.12)],
        [0.35, 0, () => G.ellipsoid([-1.06, -0.06, 0], [0.12, 0.24, 0.2])],
        [0.35, 0, () => G.ellipsoid([1.06, 0.11, 0], [0.12, 0.24, 0.2])],
        [0.22, 1, () => { const a = Math.random() * Math.PI * 2, side = Math.random() < .5 ? -1 : 1; return [side * (0.06 + Math.random() * 0.06) + Math.sin(a * 3) * 0.03, Math.cos(a) * 0.12, Math.sin(a) * 0.12]; }],
        [0.85, 2, () => G.boxEdges([0, 0.02, 0], [0.34, 0.36, 0.3])],
        [0.12, 0, () => { const u = Math.random(); return [-0.34 + u * 0.26, 0.42, 0.3]; }]
      ];
    },
    seed(G) {
      const seedShape = (c, s, rot) => () => {
        const p = G.unit();
        let x = p[0] * 0.42, y = p[1] * 0.85, z = p[2] * 0.34;
        if (z > 0 && Math.abs(x) < 0.07) z *= 0.78;
        y *= 1 - 0.18 * Math.abs(x);
        const cr = Math.cos(rot), sr = Math.sin(rot);
        return [c[0] + (x * cr - y * sr) * s, c[1] + (x * sr + y * cr) * s, c[2] + z * s];
      };
      return [
        [1.6, 0, seedShape([0, 0, 0], 1, 0.35)],
        [0.25, 2, () => {                                   // sillon de la graine
          const v = Math.random() * 1.9 - 0.95, y = v * 0.85, z = 0.34 * Math.sqrt(1 - v * v) * 0.8 + 0.01;
          const cr = Math.cos(0.35), sr = Math.sin(0.35);
          return [-y * sr, y * cr, z];
        }],
        [0.2, 1, seedShape([0.95, 0.62, -0.2], 0.3, -0.6)],
        [0.2, 1, seedShape([-0.9, -0.55, 0.15], 0.34, 1.1)],
        [0.16, 2, seedShape([0.85, -0.72, 0.3], 0.24, 2.2)]
      ];
    },
    spectrogram(G) {
      // Grille temps × fréquence ; la hauteur est animée (voir ANIM)
      return [
        [1.9, 0, () => [Math.random() * 2.4 - 1.2, 0, Math.random() * 1.5 - 0.75]],
        [0.25, 2, () => { const u = Math.random(); return [u * 2.4 - 1.2, -0.42, (Math.random() < .5 ? -1 : 1) * 0.75]; }]
      ];
    },
    vessels(G) {
      const R = rng(7);
      const segs = [];
      (function branch(a, dir, len, r, depth) {
        const b = [a[0] + dir[0] * len, a[1] + dir[1] * len, a[2] + dir[2] * len];
        segs.push([a, b, r]);
        if (depth >= 6) return;
        const n = depth < 2 ? 2 : (R() < 0.7 ? 2 : 3);
        for (let i = 0; i < n; i++) {
          const nd = [dir[0] + (R() - .5) * 1.3, dir[1] + (R() - .5) * 0.9, dir[2] + (R() - .5) * 1.3];
          const l = Math.hypot(...nd);
          branch(b, nd.map(v => v / l), len * (0.68 + R() * 0.12), r * 0.7, depth + 1);
        }
      })([0, -1.0, 0], [0, 1, 0], 0.55, 0.07, 0);
      const list = segs.map(([a, b, r]) => {
        const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        return [l * (r + 0.02) * 9, r > 0.03 ? 0 : 1, () => G.tube(a, b, r, r * 0.85)];
      });
      list.push([0.35, 2, () => { const p = G.unit(); return [p[0] * 1.15, p[1] * 0.62 + 0.15, p[2] * 0.55]; }]);
      return list;
    }
  };

  // Animations propres à certaines formes (appliquées à l'affichage)
  const ANIM = {
    flame(x, y, z, time, i) {
      const h = (y + 1) / 2;
      return [x + Math.sin(time * 3.1 + y * 4 + i * 0.01) * 0.06 * h, y + Math.sin(time * 5 + i) * 0.015, z + Math.cos(time * 2.7 + y * 3) * 0.05 * h];
    },
    spectrogram(x, y, z, time, i) {
      if (y < -0.3) return [x, y, z];
      const tt = x + time * 0.35;
      const w = ((tt % 1.2) + 1.2) % 1.2;            // motif de chant toutes les 1,2 unités
      const chirp = -0.35 + Math.sin(w * 5.2) * 0.32 + w * 0.25;
      const call = Math.exp(-Math.pow((z - chirp) / 0.08, 2)) * (w < 0.85 ? 1 : 0) * 0.55;
      const harm = Math.exp(-Math.pow((z - chirp - 0.38) / 0.06, 2)) * (w < 0.85 ? 0.5 : 0) * 0.3;
      const noise = (Math.sin(x * 13 + z * 7 + time) * 0.5 + 0.5) * 0.04;
      return [x, -0.4 + call + harm + noise, z];
    }
  };

  // Couleurs propres à certaines formes (0 encre, 1 vert d'eau, 2 orange)
  const COLOR_MAP = { flame: [2, 2, 0], fracture: [0, 2, 2], spectrogram: [1, 1, 0], vessels: [2, 2, 1] };
  const FIG = {
    globe: { fr: 'le réseau des huit projets', en: 'the eight projects' },
    molecule: { fr: 'molécule inconnue', en: 'unknown molecule' },
    knee: { fr: 'genou du coureur', en: 'a runner’s knee' },
    bacteria: { fr: 'bactérie résistante', en: 'resistant bacterium' },
    flame: { fr: 'départ de feu', en: 'fire outbreak' },
    fracture: { fr: 'fracture détectée', en: 'detected fracture' },
    seed: { fr: 'graines', en: 'seeds' },
    spectrogram: { fr: 'spectrogramme d’un chant', en: 'birdsong spectrogram' },
    vessels: { fr: 'vaisseaux du foie', en: 'liver vessels' }
  };

  function buildShape(name, N, seed) {
    const R = rng(seed);
    const saved = Math.random; Math.random = R;      // formes reproductibles
    const G = makeGen(R);
    const parts = SHAPES[name](G);
    const total = parts.reduce((s, p) => s + p[0], 0);
    const pos = new Float32Array(N * 3), col = new Uint8Array(N);
    let k = 0;
    parts.forEach(([w, c, gen], j) => {
      const n = j === parts.length - 1 ? N - k : Math.round(N * w / total);
      const cm = COLOR_MAP[name];
      for (let i = 0; i < n && k < N; i++, k++) { const p = gen(); pos[k * 3] = p[0]; pos[k * 3 + 1] = p[1]; pos[k * 3 + 2] = p[2]; col[k] = cm ? cm[c] : c; }
    });
    for (; k < N; k++) { const p = G.sphere([0, 0, 0], 1); pos.set(p, k * 3); col[k] = 0; }
    // Mélange : les points changent de place pendant les transitions
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      for (let a = 0; a < 3; a++) { const tmp = pos[i * 3 + a]; pos[i * 3 + a] = pos[j * 3 + a]; pos[j * 3 + a] = tmp; }
      const tc = col[i]; col[i] = col[j]; col[j] = tc;
    }
    Math.random = saved;
    return { name, pos, col };
  }

  let cloud = null;
  let activeIndex = -1;
  let motionPaused = reduceMotion;

  function initCloud() {
    const canvas = $('#cloud');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const small = window.innerWidth < 760;
    const N = small ? 1500 : 2800;
    const shapes = {};
    const getShape = name => shapes[name] || (shapes[name] = buildShape(name, N, 11 + Object.keys(shapes).length * 101));

    const cur = new Float32Array(N * 3);
    const g0 = getShape('globe');
    cur.set(g0.pos);
    for (let i = 0; i < N * 3; i++) cur[i] *= 3 + Math.random() * 2;    // arrivée depuis l'extérieur
    let target = g0, colors = new Uint8Array(g0.col);
    const speed = new Float32Array(N).map(() => 0.035 + Math.random() * 0.05);
    const COLORS = [[29, 32, 39], [31, 157, 139], [232, 89, 12]];   // encre, vert d'eau, orange
    const LEVELS = 8;
    const styles = COLORS.map(c => [...Array(LEVELS)].map((_, l) => `rgba(${c[0]},${c[1]},${c[2]},${(0.12 + 0.82 * (l + 1) / LEVELS).toFixed(3)})`));
    const buckets = [...Array(3 * LEVELS)].map(() => ({ xs: new Float32Array(N), ys: new Float32Array(N), ss: new Float32Array(N), n: 0 }));

    let W = 0, H = 0, dpr = 1, rotY = 0.6, rotX = -0.18, tiltX = 0, tiltY = 0, ptr = { x: -9999, y: -9999, tx: 0, ty: 0 };
    let visible = false, raf = 0, time = 0, last = performance.now(), settle = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      draw(0);
    }

    function setShape(name) {
      const s = getShape(name);
      if (s === target) return;
      target = s;
      colors = new Uint8Array(s.col);
      settle = 1;
      kick();
    }

    function draw(dt) {
      const mobile = W < 760;
      const cx = mobile ? W * 0.5 : W * 0.68;
      const cy = mobile ? H * 0.31 : H * 0.52;
      const scale = mobile ? Math.min(W * 0.33, H * 0.18) : Math.min(W * 0.24, H * 0.34);
      if (!motionPaused) { rotY += dt * 0.22; time += dt; }
      tiltX += ((ptr.ty * 0.35) - tiltX) * 0.06;
      tiltY += ((ptr.tx * 0.6) - tiltY) * 0.06;
      const ay = rotY + tiltY, ax = rotX + tiltX;
      const cyR = Math.cos(ay), syR = Math.sin(ay), cxR = Math.cos(ax), sxR = Math.sin(ax);
      const anim = ANIM[target.name];
      const tp = target.pos;
      let moving = 0;
      for (const b of buckets) b.n = 0;
      const pxr = 90 * dpr, pxr2 = pxr * pxr;
      const px = ptr.x * dpr, py = ptr.y * dpr;
      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        const k = reduceMotion ? 1 : speed[i];
        const dx = tp[i3] - cur[i3], dy = tp[i3 + 1] - cur[i3 + 1], dz = tp[i3 + 2] - cur[i3 + 2];
        if (dx * dx + dy * dy + dz * dz > 1e-6) { moving++; cur[i3] += dx * k; cur[i3 + 1] += dy * k; cur[i3 + 2] += dz * k; }
        let x = cur[i3], y = cur[i3 + 1], z = cur[i3 + 2];
        if (anim) { const a = anim(x, y, z, time, i); x = a[0]; y = a[1]; z = a[2]; }
        // rotation
        const x1 = x * cyR - z * syR, z1 = x * syR + z * cyR;
        const y2 = y * cxR - z1 * sxR, z2 = y * sxR + z1 * cxR;
        const f = 3.2 / (3.2 + z2);
        let sx = (cx + x1 * scale * f) * dpr, sy = (cy - y2 * scale * f) * dpr;
        // le pointeur écarte les points
        const ddx = sx - px, ddy = sy - py, d2 = ddx * ddx + ddy * ddy;
        if (d2 < pxr2) { const d = Math.sqrt(d2) || 1, push = (1 - d / pxr) * 26 * dpr; sx += ddx / d * push; sy += ddy / d * push; }
        const depth = clamp((1.4 - z2) / 2.8, 0, 0.999);
        const lvl = Math.floor(depth * LEVELS);
        const bk = buckets[colors[i] * LEVELS + lvl];
        bk.xs[bk.n] = sx; bk.ys[bk.n] = sy; bk.ss[bk.n] = (0.7 + depth * 1.9) * dpr * f; bk.n++;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFigure(cx * dpr, cy * dpr, scale * dpr, mobile);
      for (let c = 0; c < 3; c++) for (let l = 0; l < LEVELS; l++) {
        const b = buckets[c * LEVELS + l];
        if (!b.n) continue;
        ctx.fillStyle = styles[c][l];
        for (let j = 0; j < b.n; j++) { const s = b.ss[j]; ctx.fillRect(b.xs[j] - s / 2, b.ys[j] - s / 2, s, s); }
      }
      return moving;
    }

    // Habillage façon croquis : cercle de construction, axes, graduations, légende « fig. »
    let figNum = 0, figName = 'globe';
    function drawFigure(x, y, s, mobile) {
      const r = s * 1.38;
      ctx.save();
      ctx.strokeStyle = 'rgba(29,32,39,.28)';
      ctx.lineWidth = 1.3 * dpr;
      ctx.setLineDash([7 * dpr, 9 * dpr]);
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.97, -0.05, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(31,157,139,.35)';
      ctx.beginPath();
      ctx.moveTo(x - r * 1.12, y); ctx.lineTo(x + r * 1.12, y);
      ctx.moveTo(x, y - r * 1.1); ctx.lineTo(x, y + r * 1.1);
      for (let k = -4; k <= 4; k++) { if (!k) continue; const d = k * r / 4; ctx.moveTo(x + d, y - 5 * dpr); ctx.lineTo(x + d, y + 5 * dpr); }
      ctx.stroke();
      if (!mobile) {
        const label = `fig. ${pad(figNum)} — ${L(FIG[figName])}`;
        ctx.font = `700 ${27 * dpr}px Caveat, "Segoe Print", cursive`;
        ctx.fillStyle = 'rgba(29,32,39,.82)';
        ctx.translate(x - r * 0.7, y + r + 44 * dpr);
        ctx.rotate(-0.035);
        ctx.fillText(label, 0, 0);
        const w = ctx.measureText(label).width;
        ctx.strokeStyle = 'rgba(232,89,12,.75)'; ctx.lineWidth = 2.2 * dpr; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 9 * dpr); ctx.quadraticCurveTo(w * 0.5, 14 * dpr, w, 6 * dpr); ctx.stroke();
      }
      ctx.restore();
    }

    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const moving = draw(dt);
      const pointerActive = ptr.x > -999;
      if (visible && (!motionPaused || moving > 0 || pointerActive || Math.abs(tiltX - ptr.ty * 0.35) > 0.001)) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    const stage = $('.projects-stage');
    const section = $('#projets');
    section.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
      ptr.tx = (ptr.x / r.width - 0.5); ptr.ty = (ptr.y / r.height - 0.5);
      kick();
    }, { passive: true });
    section.addEventListener('pointerleave', () => { ptr.x = ptr.y = -9999; ptr.tx = ptr.ty = 0; kick(); });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }, { rootMargin: '10% 0px' }).observe(section);
    window.addEventListener('resize', resize);
    resize();

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw(0));
    return {
      setShape,
      kick,
      setLabel(i) {
        figNum = i < 0 ? 0 : i + 1;
        figName = i < 0 ? 'globe' : DATA.talks[i].shape;
        draw(0);
        const el = $('#stageLabel');
        if (i < 0) { el.innerHTML = `<b>${pad(DATA.talks.length)}</b> · ${esc(t('stageIntro'))}`; return; }
        const k = DATA.talks[i];
        el.innerHTML = `<b>${pad(i + 1)} / ${pad(DATA.talks.length)}</b> · ` +
          (window.innerWidth < 760 ? `fig. ${esc(L(FIG[k.shape]))}` : esc(L(DATA.themes[k.theme])));
      },
      stage
    };
  }

  let cardObserver;
  function setActive(i) {
    if (i === activeIndex) return;
    activeIndex = i;
    $$('.talk-card').forEach(c => c.classList.toggle('active', +c.dataset.index === i));
    if (cloud) { cloud.setShape(i < 0 ? 'globe' : DATA.talks[i].shape); cloud.setLabel(i); }
  }
  function observeCards() {
    if (cardObserver) cardObserver.disconnect();
    cardObserver = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const i = +en.target.dataset.index;
        if (en.isIntersecting) setActive(i);
        else if (i === 0 && en.boundingClientRect.top > 0 && activeIndex === 0) setActive(-1);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    $$('.talk-card').forEach(c => cardObserver.observe(c));
    const keep = activeIndex; activeIndex = -2; setActive(keep < -1 ? -1 : keep);
  }

  /* ================= Interface générale ================= */
  function updateMotionButton() {
    const b = $('#motionToggle');
    if (!b) return;
    b.setAttribute('aria-pressed', motionPaused);
    const label = motionPaused ? t('motionPlay') : t('motionPause');
    b.title = label; b.setAttribute('aria-label', label);
  }

  function bindUI() {
    $('#langToggle').addEventListener('click', () => {
      lang = lang === 'fr' ? 'en' : 'fr';
      store.set('autumn-language', lang);
      renderAll();
    });
    $('#motionToggle').addEventListener('click', () => {
      motionPaused = !motionPaused;
      updateMotionButton();
      cloud && cloud.kick();
    });
    const header = $('.site-header');
    const flight = $('#vol');
    const onScroll = () => header.classList.toggle('solid', window.scrollY > flight.offsetHeight - window.innerHeight - 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const links = $$('.nav a');
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    ['vol', 'projets', 'programme', 'infos', 'apropos'].forEach(id => {
      const el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });
  }

  /* ================= 6. Démarrage ================= */
  function start() {
    try { cloud = initCloud(); } catch (e) { console.warn('Nuage de points indisponible', e); }
    renderAll();
    bindProgramme();
    bindUI();
    initFlight();
    const mf = $('#mapFrame');
    const centerMap = () => { if (mf.scrollWidth > mf.clientWidth) mf.scrollLeft = mf.scrollWidth * 0.761 - mf.clientWidth / 2; };
    centerMap(); window.addEventListener('resize', centerMap);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
