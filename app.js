/* École d'automne Data Science — scripts du site
 * 1. Textes FR/EN      2. Rendu du contenu     3. Vol (vidéo pilotée par le défilement)
 * 4. Nuage de points 3D dessiné 5. Programme (recherche, favoris, calendrier, en cours)  6. Démarrage
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
      footerCredit: 'Campus en 3D dessiné à partir des données © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">contributeurs OpenStreetMap</a>.',
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
      footerCredit: '3D campus drawn from © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> data.',
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
        <span class="snap-point" aria-hidden="true"></span>
        <div class="card-stick">
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
        </div>
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
    if (window.CampusFlight) window.CampusFlight.setLang(lang);
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

  /* ================= 3. Vol : la maquette 3D suit le défilement ================= */
  // La scène est dessinée par js/campus3d.js (module) ; ici on calcule l'avancement,
  // on affiche les textes et on transmet un avancement lissé à window.CampusFlight.
  function initFlight() {
    const section = $('#vol');
    const beats = $$('.beat', section).map(el => ({ el, from: +el.dataset.from, to: +el.dataset.to }));
    const hint = $('#scrollHint');
    const bar = $('#flightBar');
    const sticky = $('.flight-sticky', section);

    let target = 0, current = -1, visible = true, raf = 0;
    const HOLD = 0.16;   // derniers 16 % du défilement : on reste sur le bâtiment 24 (résistance)

    function rawProgress() {
      const total = section.offsetHeight - sticky.offsetHeight;
      return clamp(-section.getBoundingClientRect().top / Math.max(1, total), 0, 1);
    }
    const progress = () => Math.min(1, rawProgress() / (1 - HOLD));
    function paint(p) {
      for (const b of beats) {
        const fade = 0.028;
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
      hint.style.opacity = clamp(1 - p * 14, 0, 1);
      bar.style.transform = `scaleX(${rawProgress().toFixed(4)})`;
    }
    function tick() {
      raf = 0;
      const p = progress();
      paint(p);
      target = p;
      const flight = window.CampusFlight;
      if (current < 0 || !flight) current = target;
      else {
        const d = target - current;
        current = Math.abs(d) < 0.0004 ? target : current + d * (reduceMotion ? 1 : 0.14);
      }
      if (flight) flight.render(current);
      if (flight && current !== target) loop();
    }
    function loop() { if (!raf && visible) raf = requestAnimationFrame(tick); }
    window.addEventListener('scroll', loop, { passive: true });
    window.addEventListener('resize', loop);
    document.addEventListener('campus:ready', loop);
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) loop(); }).observe(section);
    tick();
  }

  /* ================= 4. Nuage de points 3D, dessiné à la main ================= */
  // Un « nuage de points » de carnet : boîte d'axes tracée à main levée, marqueurs manuscrits
  // (● ○ × + △ ·) par classe, légende, annotations fléchées. Les points se réarrangent
  // pour dessiner le sujet de chaque conférence.
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

  // Marqueurs : 0 point plein, 1 rond, 2 croix, 3 plus, 4 triangle, 5 petit point · encres : 0 encre, 1 vert d'eau, 2 orange
  const INKS = ['#1d2027', '#167a6c', '#e8590c'];
  const DIMS = { fr: ['dim. 1', 'dim. 2', 'dim. 3'], en: ['dim 1', 'dim 2', 'dim 3'] };
  const clusterCenter = i => { const a = i / 8 * Math.PI * 2 + 0.35; return [Math.cos(a) * 0.8, Math.sin(a * 2) * 0.32 + (i % 2 ? 0.3 : -0.3), Math.sin(a) * 0.8]; };

  // Une figure = classes (marqueur, encre, légende) + parties [poids, classe, générateur] + annotations
  const FIGS = {
    clusters: {
      fig: { fr: 'huit projets, quatre thèmes', en: 'eight projects, four themes' },
      classes: [
        { m: 0, c: 2, fr: 'santé', en: 'health' }, { m: 1, c: 1, fr: 'environnement', en: 'environment' },
        { m: 2, c: 0, fr: 'agronomie', en: 'agronomy' }, { m: 4, c: 0, fr: 'chimie', en: 'chemistry' }
      ],
      parts(G) {
        const themes = Object.keys(DATA.themes);
        return DATA.talks.map((k, i) => {
          const c = clusterCenter(i);
          return [1, Math.max(0, themes.indexOf(k.theme)), () => [c[0] + G.gauss() * 0.12, c[1] + G.gauss() * 0.12, c[2] + G.gauss() * 0.12]];
        });
      },
      notes: () => DATA.talks.map((k, i) => ({ at: clusterCenter(i), plain: pad(i + 1) }))
    },
    molecule: {
      fig: { fr: 'molécule inconnue', en: 'unknown molecule' },
      classes: [{ m: 0, c: 2, fr: 'atome du cycle', en: 'ring atom' }, { m: 1, c: 1, fr: 'substituant', en: 'substituent' }, { m: 5, c: 0, fr: 'liaison', en: 'bond' }],
      parts(G) {
        const ring = [...Array(6)].map((_, i) => { const a = i * Math.PI / 3 + Math.PI / 6; return [Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0]; });
        const out = [0, 2, 4].map(i => [ring[i][0] * 1.75, ring[i][1] * 1.75, (i - 2) * 0.12]);
        const tail = [out[0][0] + 0.38, out[0][1] + 0.3, 0.25];
        const tail2 = [out[2][0] - 0.05, out[2][1] - 0.42, -0.3];
        const list = ring.map(c => [0.5, 0, () => G.sphere(c, 0.15)]);
        out.forEach(c => list.push([0.37, 1, () => G.sphere(c, 0.13)]));
        list.push([0.27, 1, () => G.sphere(tail, 0.11)], [0.22, 1, () => G.sphere(tail2, 0.1)]);
        const bonds = [];
        for (let i = 0; i < 6; i++) bonds.push([ring[i], ring[(i + 1) % 6]]);
        [0, 2, 4].forEach((ri, j) => bonds.push([ring[ri], out[j]]));
        bonds.push([out[0], tail], [out[2], tail2]);
        bonds.forEach(([a, b]) => list.push([0.1, 2, () => G.tube(a, b, 0.02, 0.02)]));
        return list;
      },
      notes: [{ at: [0, 0, 0], fr: 'cycle aromatique', en: 'aromatic ring', o: [-150, -96] },
        { at: [1.1, 0.72, 0.25], fr: 'masse inconnue ?', en: 'unknown mass?', o: [26, -88] }]
    },
    knee: {
      fig: { fr: 'genou du coureur', en: 'a runner’s knee' },
      classes: [{ m: 1, c: 0, fr: 'os', en: 'bone' }, { m: 2, c: 1, fr: 'ménisque', en: 'meniscus' }, { m: 0, c: 2, fr: 'rotule et tendon', en: 'kneecap and tendon' }],
      parts(G) {
        return [
          [1.2, 0, () => G.tube([0, 1.15, 0], [0, 0.32, 0], 0.15, 0.2)],
          [0.5, 0, () => G.sphere([-0.14, 0.18, -0.02], 0.17)],
          [0.5, 0, () => G.sphere([0.14, 0.18, -0.02], 0.17)],
          [0.55, 1, () => G.ellipsoid([0, -0.08, 0], [0.33, 0.06, 0.24])],
          [1.0, 0, () => G.tube([0, -0.14, 0], [0, -1.12, 0], 0.2, 0.13)],
          [0.25, 0, () => G.tube([0.28, -0.24, -0.05], [0.25, -1.05, -0.05], 0.05, 0.045)],
          [0.32, 2, () => G.ellipsoid([0, 0.2, 0.26], [0.1, 0.13, 0.05])],
          [0.28, 2, () => G.curve(u => [0, 0.08 - u * 0.5, 0.25 - u * 0.06], 0.03)]
        ];
      },
      notes: [{ at: [0, 0.2, 0.3], fr: 'rotule', en: 'kneecap', o: [40, -96] },
        { at: [-0.3, -0.08, 0.05], fr: 'ménisque', en: 'meniscus', o: [-150, 50] }]
    },
    bacteria: {
      fig: { fr: 'bactérie résistante', en: 'resistant bacterium' },
      classes: [{ m: 1, c: 1, fr: 'membrane', en: 'membrane' }, { m: 5, c: 0, fr: 'ADN', en: 'DNA' }, { m: 2, c: 0, fr: 'flagelle', en: 'flagellum' }, { m: 0, c: 2, fr: 'plasmide de résistance', en: 'resistance plasmid' }],
      parts(G, R) {
        const capsule = () => {
          const L = 0.62, r = 0.33;
          if (R() < 0.62) return G.tube([-L, 0, 0], [L, 0, 0], r, r);
          const p = G.unit(), side = p[0] < 0 ? -1 : 1;
          return [side * L + p[0] * r, p[1] * r, p[2] * r];
        };
        const flag = k => u => { const x = 0.9 + u * 0.95, ph = k * 1.6; return [x, Math.sin(u * 9 + ph) * 0.12 * u + (k - 1.5) * 0.11, Math.cos(u * 9 + ph) * 0.12 * u]; };
        const plasmid = () => { const a = R() * Math.PI * 2; return [-0.3 + Math.cos(a) * 0.1 + G.gauss() * 0.012, 0.06 + Math.sin(a) * 0.1, 0.08 + G.gauss() * 0.012]; };
        return [
          [1.6, 0, capsule],
          [0.32, 1, () => G.curve(u => [-0.5 + u * 1.0, Math.sin(u * 14) * 0.1, Math.cos(u * 11) * 0.1], 0.03)],
          ...[0, 1, 2, 3].map(k => [0.11, 2, () => G.curve(flag(k), 0.01)]),
          [0.2, 3, plasmid]
        ];
      },
      notes: [{ at: [-0.3, 0.06, 0.08], fr: 'plasmide de résistance', en: 'resistance plasmid', o: [-170, -100] },
        { at: [1.7, 0.1, 0], fr: 'flagelle', en: 'flagellum', o: [-40, 70] }]
    },
    flame: {
      fig: { fr: 'départ de feu', en: 'fire outbreak' },
      classes: [{ m: 0, c: 2, fr: 'flamme', en: 'flame' }, { m: 1, c: 0, fr: 'végétation sèche', en: 'dry vegetation' }, { m: 2, c: 2, fr: 'braises', en: 'embers' }],
      parts(G, R) {
        const prof = s => 0.6 * Math.pow(s, 0.38) * Math.pow(1 - s, 0.9) * 2.05;
        const surf = (scale, y0) => () => { const s = R(), a = R() * Math.PI * 2, r = prof(s) * scale; return [Math.cos(a) * r, y0 + s * 2.0 * scale, Math.sin(a) * r]; };
        return [
          [1.3, 0, surf(1, -1)],
          [0.5, 0, surf(0.6, -0.95)],
          [0.36, 1, () => { const a = R() * Math.PI * 2, r = 0.25 + Math.sqrt(R()) * 0.75; return [Math.cos(a) * r, -1.04 + R() * 0.05, Math.sin(a) * r]; }],
          [0.16, 2, () => [(R() - .5) * 1.0, -0.2 + R() * 1.5, (R() - .5) * 1.0]]
        ];
      },
      notes: [{ at: [0.62, -1.02, 0.25], fr: 'végétation sèche', en: 'dry vegetation', o: [30, 64] },
        { at: [0.28, 0.55, 0.3], fr: 'braises', en: 'embers', o: [60, -70] }]
    },
    fracture: {
      fig: { fr: 'fracture détectée', en: 'detected fracture' },
      classes: [{ m: 1, c: 0, fr: 'os', en: 'bone' }, { m: 0, c: 2, fr: 'trait de fracture', en: 'fracture line' }, { m: 5, c: 2, fr: 'boîte YOLO', en: 'YOLO box' }],
      parts(G, R) {
        return [
          [0.9, 0, () => G.tube([-1.0, -0.05, 0], [-0.09, 0, 0], 0.12, 0.12)],
          [0.9, 0, () => G.tube([0.09, 0.02, 0], [1.0, 0.1, 0], 0.12, 0.12)],
          [0.35, 0, () => G.ellipsoid([-1.06, -0.06, 0], [0.12, 0.24, 0.2])],
          [0.35, 0, () => G.ellipsoid([1.06, 0.11, 0], [0.12, 0.24, 0.2])],
          [0.26, 1, () => { const a = R() * Math.PI * 2, side = R() < .5 ? -1 : 1; return [side * (0.05 + R() * 0.05) + Math.sin(a * 3) * 0.03, Math.cos(a) * 0.12, Math.sin(a) * 0.12]; }],
          [0.8, 2, () => G.boxEdges([0, 0.02, 0], [0.34, 0.36, 0.3])]
        ];
      },
      notes: [{ at: [-0.34, 0.38, 0.3], tag: { fr: 'fracture 0,94', en: 'fracture 0.94' } },
        { at: [0.05, -0.12, 0.1], fr: 'trait de fracture', en: 'fracture line', o: [70, 80] }]
    },
    seed: {
      fig: { fr: 'graines', en: 'seeds' },
      classes: [{ m: 1, c: 0, fr: 'graine connue', en: 'known seed' }, { m: 0, c: 2, fr: 'sillon', en: 'crease' }, { m: 2, c: 1, fr: 'autre variété', en: 'other variety' }],
      parts(G, R) {
        const seedShape = (c, s, rot) => () => {
          const p = G.unit();
          let x = p[0] * 0.42, y = p[1] * 0.85, z = p[2] * 0.34;
          if (z > 0 && Math.abs(x) < 0.07) z *= 0.78;
          y *= 1 - 0.18 * Math.abs(x);
          const cr = Math.cos(rot), sr = Math.sin(rot);
          return [c[0] + (x * cr - y * sr) * s, c[1] + (x * sr + y * cr) * s, c[2] + z * s];
        };
        return [
          [1.5, 0, seedShape([0, 0, 0], 1, 0.35)],
          [0.3, 1, () => { const v = R() * 1.9 - 0.95, y = v * 0.85, z = 0.34 * Math.sqrt(1 - v * v) * 0.8 + 0.01, cr = Math.cos(0.35), sr = Math.sin(0.35); return [-y * sr, y * cr, z]; }],
          [0.22, 2, seedShape([0.95, 0.62, -0.2], 0.3, -0.6)],
          [0.22, 2, seedShape([-0.9, -0.55, 0.15], 0.34, 1.1)],
          [0.16, 2, seedShape([0.85, -0.72, 0.3], 0.24, 2.2)]
        ];
      },
      notes: [{ at: [-0.1, 0.25, 0.3], fr: 'sillon', en: 'crease', o: [-120, -80] },
        { at: [0.85, -0.72, 0.36], fr: 'hors distribution ?', en: 'out of distribution?', o: [10, 70] }]
    },
    spectrogram: {
      fig: { fr: 'spectrogramme d’un chant', en: 'birdsong spectrogram' },
      axes: { fr: ['temps', 'énergie', 'fréquence'], en: ['time', 'energy', 'frequency'] },
      classes: [{ m: 5, c: 1, fr: 'bruit de fond', en: 'background noise' }, { m: 0, c: 2, fr: 'chant détecté', en: 'detected song' }],
      parts(G, R) {
        // grille régulière temps × fréquence, comme les cases d'un spectrogramme
        const cols = 46, rows = 26; let k = 0;
        return [[1, 0, () => { const i = k++, c = i % cols, r = Math.floor(i / cols) % rows; return [-1.15 + c / (cols - 1) * 2.3, 0, -0.75 + r / (rows - 1) * 1.5]; }]];
      },
      notes: [{ at: [0.15, 0.1, -0.15], fr: 'chant ?', en: 'song?', o: [40, -96] }]
    },
    vessels: {
      fig: { fr: 'vaisseaux du foie', en: 'liver vessels' },
      classes: [{ m: 0, c: 2, fr: 'vaisseau', en: 'vessel' }, { m: 5, c: 1, fr: 'capillaire', en: 'capillary' }, { m: 1, c: 0, fr: 'contour du foie', en: 'liver outline' }],
      parts(G, R, meta) {
        const Rv = rng(7), segs = [];
        (function branch(a, dir, len, r, depth) {
          const b = [a[0] + dir[0] * len, a[1] + dir[1] * len, a[2] + dir[2] * len];
          segs.push([a, b, r]);
          if (depth >= 6) return;
          const n = depth < 2 ? 2 : (Rv() < 0.7 ? 2 : 3);
          for (let i = 0; i < n; i++) {
            const nd = [dir[0] + (Rv() - .5) * 1.3, dir[1] + (Rv() - .5) * 0.9, dir[2] + (Rv() - .5) * 1.3];
            const l = Math.hypot(...nd);
            branch(b, nd.map(v => v / l), len * (0.68 + Rv() * 0.12), r * 0.7, depth + 1);
          }
        })([0, -1.0, 0], [0, 1, 0], 0.55, 0.07, 0);
        meta.lost = segs.filter(s => s[2] < 0.012).reduce((best, s) => (!best || s[1][0] > best[0] ? s[1] : best), null) || segs[segs.length - 1][1];
        const list = segs.map(([a, b, r]) => {
          const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
          return [l * (r + 0.02) * 9, r > 0.03 ? 0 : 1, () => G.tube(a, b, r, r * 0.85)];
        });
        list.push([0.85, 2, () => { const p = G.unit(); return [p[0] * 1.15, p[1] * 0.62 + 0.15, p[2] * 0.55]; }]);
        return list;
      },
      notes: meta => [{ at: meta.lost, fr: 'vaisseau perdu ?', en: 'lost vessel?', o: [36, -84] },
        { at: [-1.12, 0.3, 0.1], fr: 'foie', en: 'liver', o: [-90, -60] }]
    }
  };

  // Animations propres à certaines formes
  const ANIM = {
    flame(x, y, z, time, i) {
      const h = (y + 1) / 2;
      return [x + Math.sin(time * 3.1 + y * 4 + i * 0.01) * 0.06 * h, y + Math.sin(time * 5 + i) * 0.015, z + Math.cos(time * 2.7 + y * 3) * 0.05 * h];
    },
    spectrogram(x, y, z, time) {
      const tt = x + time * 0.35;
      const w = ((tt % 1.2) + 1.2) % 1.2;
      const chirp = -0.35 + Math.sin(w * 5.2) * 0.32 + w * 0.25;
      const call = Math.exp(-Math.pow((z - chirp) / 0.09, 2)) * (w < 0.85 ? 1 : 0) * 0.85;
      const harm = Math.exp(-Math.pow((z - chirp - 0.38) / 0.07, 2)) * (w < 0.85 ? 0.5 : 0) * 0.5;
      const noise = (Math.sin(x * 13 + z * 7 + time) * 0.5 + 0.5) * 0.04;
      return [x, -0.55 + call + harm + noise, z];
    }
  };

  function buildShape(name, N, seed) {
    const R = rng(seed);
    const G = makeGen(R);
    const fig = FIGS[name], meta = {};
    const parts = fig.parts(G, R, meta);
    const total = parts.reduce((s, p) => s + p[0], 0);
    const pos = new Float32Array(N * 3), cls = new Uint8Array(N);
    let k = 0;
    parts.forEach(([w, c, gen], j) => {
      const n = j === parts.length - 1 ? N - k : Math.round(N * w / total);
      for (let i = 0; i < n && k < N; i++, k++) { const p = gen(); pos[k * 3] = p[0]; pos[k * 3 + 1] = p[1]; pos[k * 3 + 2] = p[2]; cls[k] = c; }
    });
    for (; k < N; k++) { pos.set(G.sphere([0, 0, 0], 1), k * 3); cls[k] = 0; }
    // recadrage : la forme tient dans la boîte d'axes, centrée
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < N; i++) for (let a = 0; a < 3; a++) { const v = pos[i * 3 + a]; if (v < lo[a]) lo[a] = v; if (v > hi[a]) hi[a] = v; }
    const mid = lo.map((v, a) => (v + hi[a]) / 2);
    const fit = 1.08 / Math.max(0.5, ...hi.map((v, a) => (v - lo[a]) / 2));
    const tf = q => q.map((v, a) => (v - mid[a]) * fit);
    for (let i = 0; i < N * 3; i++) pos[i] = (pos[i] - mid[i % 3]) * fit;
    // mélange : les points changent de place pendant les transitions
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(R() * (i + 1));
      for (let a = 0; a < 3; a++) { const tmp = pos[i * 3 + a]; pos[i * 3 + a] = pos[j * 3 + a]; pos[j * 3 + a] = tmp; }
      const tc = cls[i]; cls[i] = cls[j]; cls[j] = tc;
    }
    const sprite = new Uint8Array(N);
    for (let i = 0; i < N; i++) { const c = fig.classes[cls[i]]; sprite[i] = c.m * 3 + c.c; }
    const notes = (typeof fig.notes === 'function' ? fig.notes(meta) : (fig.notes || [])).map(n => Object.assign({}, n, { at: tf(n.at) }));
    return { name, pos, cls, sprite, notes, fig, fit, mid };
  }

  // Marqueurs dessinés à la main (4 variantes par type et par encre)
  function makeSprites(px) {
    const S = Math.ceil(px * 2.2), out = [];
    for (let m = 0; m < 6; m++) for (let c = 0; c < 3; c++) {
      const vars = [];
      for (let v = 0; v < 4; v++) {
        const R = rng(m * 97 + c * 13 + v * 7 + 1);
        const cv = document.createElement('canvas'); cv.width = cv.height = S;
        const g = cv.getContext('2d');
        const j = a => (R() - 0.5) * a * S;
        g.strokeStyle = g.fillStyle = INKS[c];
        g.lineCap = g.lineJoin = 'round';
        g.lineWidth = S * 0.1;
        g.translate(S / 2, S / 2);
        g.rotate((R() - 0.5) * 0.6);
        g.beginPath();
        if (m === 0 || m === 5) {
          const r = S * (m === 0 ? 0.25 : 0.13);
          for (let k = 0; k <= 9; k++) { const a = k / 9 * Math.PI * 2, rr = r * (0.88 + R() * 0.24); g[k ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
          g.closePath(); g.fill();
        } else if (m === 1) {
          const r = S * 0.27, a0 = R() * 6, sweep = Math.PI * 2 * (0.92 + R() * 0.14);
          for (let k = 0; k <= 14; k++) { const a = a0 + k / 14 * sweep, rr = r * (0.9 + R() * 0.16); g[k ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr); }
          g.stroke();
        } else if (m === 2 || m === 3) {
          const L = S * 0.3, base = m === 2 ? Math.PI / 4 : 0;
          for (const a of [base, base + Math.PI / 2]) {
            const ca = Math.cos(a), sa = Math.sin(a);
            g.moveTo(-ca * L + j(0.05), -sa * L + j(0.05));
            g.quadraticCurveTo(j(0.1), j(0.1), ca * L + j(0.05), sa * L + j(0.05));
          }
          g.stroke();
        } else {
          const r = S * 0.3;
          for (let k = 0; k <= 3; k++) { const a = -Math.PI / 2 + k / 3 * Math.PI * 2; g[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r + j(0.06), Math.sin(a) * r + j(0.06)); }
          g.stroke();
        }
        vars.push(cv);
      }
      out.push(vars);
    }
    return { list: out, S };
  }

  let cloud = null;
  let activeIndex = -1;
  let motionPaused = reduceMotion;

  function initCloud() {
    const canvas = $('#cloud');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const small = window.innerWidth < 760;
    const N = small ? 760 : 1250;
    const shapes = {};
    let seedN = 0;
    const getShape = name => shapes[name] || (shapes[name] = buildShape(name, N, 11 + (seedN++) * 101));

    // état des points : départ → arrivée, avec un léger arc pendant le trajet
    const from = new Float32Array(N * 3), to = new Float32Array(N * 3), arc = new Float32Array(N * 3);
    const spFrom = new Uint8Array(N), spTo = new Uint8Array(N), delay = new Float32Array(N);
    const sx = new Float32Array(N), sy = new Float32Array(N), sz = new Float32Array(N), sp = new Uint8Array(N);
    const order = new Uint16Array(N).map((_, i) => i);
    const R0 = rng(3);
    const g0 = getShape('clusters');
    for (let i = 0; i < N; i++) {           // arrivée depuis l'extérieur de la boîte
      const p = makeGen(R0).unit();
      from[i * 3] = p[0] * 3; from[i * 3 + 1] = p[1] * 3; from[i * 3 + 2] = p[2] * 3;
      delay[i] = R0() * 0.35;
    }
    to.set(g0.pos); spFrom.set(g0.sprite); spTo.set(g0.sprite);
    let target = g0, tStart = performance.now(), dur = 1100;

    // boîte d'axes : arêtes tremblées (fixées une fois pour toutes)
    const B = 1.25, Rb = rng(21);
    const wob = (a, b, n, amp) => { const pts = []; for (let k = 0; k <= n; k++) { const u = k / n, e = Math.sin(u * Math.PI); pts.push([a[0] + (b[0] - a[0]) * u + (Rb() - .5) * amp * e, a[1] + (b[1] - a[1]) * u + (Rb() - .5) * amp * e, a[2] + (b[2] - a[2]) * u + (Rb() - .5) * amp * e]); } return pts; };

    let W = 0, H = 0, dpr = 1, sprites = null, rotY = 0.7, rotX = -0.26, tiltX = 0, tiltY = 0;
    const ptr = { x: -9999, y: -9999, tx: 0, ty: 0 };
    let visible = false, raf = 0, time = 0, last = performance.now();
    let figNum = 0, view = { cx: 0, cy: 0, s: 1, mobile: false };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      const mobile = W < 760;
      view = {
        mobile,
        top: 104,
        cx: mobile ? W * 0.5 : W * 0.72,
        cy: mobile ? H * 0.34 : H * 0.5,
        s: mobile ? Math.min(W * 0.24, H * 0.135) : Math.min(W * 0.13, H * 0.23)
      };
      sprites = makeSprites((mobile ? 4.6 : 5.4) * dpr);
      draw(0);
    }

    function setShape(name) {
      const s = getShape(name);
      if (s === target) return;
      const now = performance.now();
      // repartir de la position affichée
      for (let i = 0; i < N; i++) {
        const e = ease(clamp((now - tStart - delay[i] * 1000) / dur, 0, 1));
        for (let a = 0; a < 3; a++) from[i * 3 + a] = from[i * 3 + a] + (to[i * 3 + a] - from[i * 3 + a]) * e + arc[i * 3 + a] * Math.sin(Math.PI * e);
        spFrom[i] = e < 0.5 ? spFrom[i] : spTo[i];
        delay[i] = Math.random() * 0.3;
        arc[i * 3] = (Math.random() - .5) * 0.5; arc[i * 3 + 1] = Math.random() * 0.45; arc[i * 3 + 2] = (Math.random() - .5) * 0.5;
      }
      to.set(s.pos); spTo.set(s.sprite);
      target = s; tStart = now;
      kick();
    }
    const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // projection : rotation (lacet puis tangage) et légère perspective
    let cY = 1, sY = 0, cX = 1, sX = 0;
    function proj(x, y, z, out) {
      const x1 = x * cY - z * sY, z1 = x * sY + z * cY;
      const y2 = y * cX - z1 * sX, z2 = y * sX + z1 * cX;
      const f = 9 / (9 + z2);
      out[0] = view.cx + x1 * view.s * f; out[1] = view.cy - y2 * view.s * f; out[2] = z2;
      return out;
    }
    const P = [0, 0, 0], Q = [0, 0, 0];

    function handLine(pts, width, color, alpha) {
      ctx.beginPath();
      pts.forEach((p, k) => { proj(p[0], p[1], p[2], P); ctx[k ? 'lineTo' : 'moveTo'](P[0] * dpr, P[1] * dpr); });
      ctx.lineWidth = width * dpr; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.stroke();
    }
    function noteText(txt, x, y, size, color, align) {
      ctx.font = `700 ${size * dpr}px Caveat, "Segoe Print", cursive`;
      ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = 5 * dpr; ctx.strokeStyle = 'rgba(246,243,236,.92)';
      ctx.strokeText(txt, x * dpr, y * dpr);
      ctx.fillStyle = color; ctx.fillText(txt, x * dpr, y * dpr);
    }
    function arrow(x0, y0, x1, y1, color) {
      const mx = (x0 + x1) / 2 + (y1 - y0) * 0.22, my = (y0 + y1) / 2 - (x1 - x0) * 0.22;
      ctx.beginPath(); ctx.moveTo(x0 * dpr, y0 * dpr); ctx.quadraticCurveTo(mx * dpr, my * dpr, x1 * dpr, y1 * dpr);
      ctx.strokeStyle = color; ctx.lineWidth = 1.8 * dpr; ctx.lineCap = 'round'; ctx.stroke();
      const a = Math.atan2(y1 - my, x1 - mx), h = 9;
      ctx.beginPath();
      ctx.moveTo((x1 - Math.cos(a - 0.45) * h) * dpr, (y1 - Math.sin(a - 0.45) * h) * dpr);
      ctx.lineTo(x1 * dpr, y1 * dpr);
      ctx.lineTo((x1 - Math.cos(a + 0.5) * h) * dpr, (y1 - Math.sin(a + 0.5) * h) * dpr);
      ctx.stroke();
    }

    // les trois faces du fond (comme un graphique 3D), graduations et noms des axes
    const paneCache = {};
    function drawAxes(alpha) {
      const faces = [[0, -1], [0, 1], [1, -1], [1, 1], [2, -1], [2, 1]];
      const back = [];
      for (const [ax, sg] of faces) {
        const n = [0, 0, 0]; n[ax] = sg;
        proj(n[0], n[1], n[2], P); proj(0, 0, 0, Q);
        if (P[2] > Q[2] + 1e-4) back.push([ax, sg]);
      }
      ctx.save();
      for (const [ax, sg] of back) {
        const key = ax + '' + sg;
        if (!paneCache[key]) {
          const u = (ax + 1) % 3, v = (ax + 2) % 3, lines = [];
          for (let k = -2; k <= 2; k++) {
            const a = [0, 0, 0], b = [0, 0, 0];
            a[ax] = b[ax] = sg * B; a[u] = b[u] = k * B / 2; a[v] = -B; b[v] = B; lines.push(wob(a, b, 8, k % 2 ? 0.012 : 0.02));
            const c = [0, 0, 0], d = [0, 0, 0];
            c[ax] = d[ax] = sg * B; c[v] = d[v] = k * B / 2; c[u] = -B; d[u] = B; lines.push(wob(c, d, 8, k % 2 ? 0.012 : 0.02));
          }
          paneCache[key] = lines;
        }
        paneCache[key].forEach((pts, k) => {
          const edge = k === 0 || k === 1 || k === 8 || k === 9;
          handLine(pts, edge ? 1.5 : 1, edge ? '#1d2027' : '#1f9d8b', alpha * (edge ? 0.5 : 0.2));
        });
      }
      // graduations sur les arêtes avant du sol et sur l'arête verticale du fond
      const floorBack = back.find(f => f[0] === 1);
      const xs = back.find(f => f[0] === 0), zs = back.find(f => f[0] === 2);
      if (floorBack && xs && zs) {
        const fy = floorBack[1] * B;
        const names = (target.fig.axes || DIMS)[lang] || DIMS.fr;
        // axe vertical : arête de silhouette des faces du fond, du côté droit
        const v1 = [xs[1] * B, -zs[1] * B], v2 = [-xs[1] * B, zs[1] * B];
        const vx = proj(v1[0], 0, v1[1], P)[0] > proj(v2[0], 0, v2[1], Q)[0] ? v1 : v2;
        proj(0, 0, 0, Q); const ccx = Q[0], ccy = Q[1];
        const axisEdges = [
          { from: [-B, fy, -zs[1] * B], to: [B, fy, -zs[1] * B], ax: 0, name: names[0] },
          { from: [-xs[1] * B, fy, -B], to: [-xs[1] * B, fy, B], ax: 2, name: names[2] },
          { from: [vx[0], -B, vx[1]], to: [vx[0], B, vx[1]], ax: 1, name: names[1] }
        ];
        ctx.lineCap = 'round';
        for (const e of axisEdges) {
          for (let k = -1; k <= 1; k++) {
            const p = e.from.slice(); p[e.ax] = k;
            proj(p[0], p[1], p[2], P);
            let dx = P[0] - ccx, dy = P[1] - ccy; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
            ctx.beginPath(); ctx.moveTo(P[0] * dpr, P[1] * dpr); ctx.lineTo((P[0] + dx * 7) * dpr, (P[1] + dy * 7) * dpr);
            ctx.strokeStyle = '#1d2027'; ctx.globalAlpha = alpha * 0.6; ctx.lineWidth = 1.4 * dpr; ctx.stroke();
            ctx.globalAlpha = alpha * 0.75;
            noteText(k < 0 ? '−1' : String(k), P[0] + dx * 18, P[1] + dy * 16, 15, '#5c6270', 'center');
          }
          const m = e.from.map((v, i) => (v + e.to[i]) / 2);
          proj(m[0], m[1], m[2], P);
          let dx = P[0] - ccx, dy = P[1] - ccy; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
          ctx.globalAlpha = alpha * 0.9;
          ctx.font = `700 ${19 * dpr}px Caveat, "Segoe Print", cursive`;
          const hw = ctx.measureText(e.name).width / dpr / 2 + 6;
          noteText(e.name, clamp(P[0] + dx * 40, hw, W - hw), clamp(P[1] + dy * 34, 70, H - 14), 19, '#167a6c', 'center');
        }
      }
      ctx.restore();
    }

    function draw(dt) {
      if (!sprites) return 0;
      const now = performance.now();
      if (!motionPaused) { rotY += dt * 0.16; time += dt; }
      tiltX += ((ptr.ty * 0.3) - tiltX) * 0.06;
      tiltY += ((ptr.tx * 0.55) - tiltY) * 0.06;
      const ay = rotY + tiltY, ax = rotX + tiltX;
      cY = Math.cos(ay); sY = Math.sin(ay); cX = Math.cos(ax); sX = Math.sin(ax);
      const anim = ANIM[target.name];
      let moving = 0, minE = 1;
      const pxr = 80, push = 22;
      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        const e = reduceMotion ? 1 : ease(clamp((now - tStart - delay[i] * 1000) / dur, 0, 1));
        if (e < 1) moving++;
        if (e < minE) minE = e;
        const b = Math.sin(Math.PI * e);
        let x = from[i3] + (to[i3] - from[i3]) * e + arc[i3] * b;
        let y = from[i3 + 1] + (to[i3 + 1] - from[i3 + 1]) * e + arc[i3 + 1] * b;
        let z = from[i3 + 2] + (to[i3 + 2] - from[i3 + 2]) * e + arc[i3 + 2] * b;
        let spr = e < 0.5 ? spFrom[i] : spTo[i];
        if (anim && e > 0) {
          const ft = target.fit, md = target.mid;
          const a = anim(x / ft + md[0], y / ft + md[1], z / ft + md[2], time, i);
          a[0] = (a[0] - md[0]) * ft; a[1] = (a[1] - md[1]) * ft; a[2] = (a[2] - md[2]) * ft;
          x += (a[0] - x) * e; y += (a[1] - y) * e; z += (a[2] - z) * e;
          if (target.name === 'spectrogram' && e >= 0.5) spr = a[1] > (-0.28 - md[1]) * ft ? 0 * 3 + 2 : 5 * 3 + 1;
        }
        proj(x, y, z, P);
        let px = P[0], py = P[1];
        const ddx = px - ptr.x, ddy = py - ptr.y, d2 = ddx * ddx + ddy * ddy;
        if (d2 < pxr * pxr) { const d = Math.sqrt(d2) || 1, k = (1 - d / pxr) * push; px += ddx / d * k; py += ddy / d * k; }
        sx[i] = px; sy[i] = py; sz[i] = P[2]; sp[i] = spr;
      }
      order.sort((a, b) => sz[b] - sz[a]);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAxes(1);
      const S = sprites.S, list = sprites.list;
      for (let k = 0; k < N; k++) {
        const i = order[k];
        const depth = clamp((1.6 - sz[i]) / 3.2, 0, 1);          // 1 = devant
        const f = 9 / (9 + sz[i]);
        const size = S * f * (0.7 + depth * 0.45);
        ctx.globalAlpha = 0.38 + depth * 0.62;
        ctx.drawImage(list[sp[i]][i & 3], sx[i] * dpr - size / 2, sy[i] * dpr - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      drawNotes(minE);
      drawLegend(minE);
      return moving;
    }

    // annotations fléchées accrochées à la figure
    function drawNotes(e) {
      const a = clamp((e - 0.75) / 0.25, 0, 1);
      if (a <= 0 || !target.notes.length) return;
      ctx.save();
      for (const n of target.notes) {
        proj(n.at[0], n.at[1], n.at[2], P);
        const back = clamp((P[2] + 0.1) / 0.6, 0, 0.6);
        ctx.globalAlpha = a * (1 - back);
        if (n.plain) { noteText(n.plain, P[0] + 14, P[1] - 14, 19, '#1d2027', 'left'); continue; }
        if (n.tag) {
          const txt = L(n.tag);
          ctx.font = `700 ${18 * dpr}px Caveat, "Segoe Print", cursive`;
          const w = ctx.measureText(txt).width / dpr + 14;
          ctx.fillStyle = '#e8590c';
          ctx.fillRect(P[0] * dpr, (P[1] - 22) * dpr, w * dpr, 22 * dpr);
          ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(txt, (P[0] + 7) * dpr, (P[1] - 11) * dpr);
          continue;
        }
        let ox = n.o[0], oy = n.o[1];
        if (view.mobile) { ox *= 0.7; oy *= 0.7; }
        const tx = P[0] + ox, ty = P[1] + oy, txt = L(n);
        ctx.font = `700 ${20 * dpr}px Caveat, "Segoe Print", cursive`;
        const w = ctx.measureText(txt).width / dpr;
        const right = ox < 0;                                   // texte à gauche : on part de son bord droit
        const ax0 = right ? tx + w + 4 : tx - 4, ay0 = ty + (oy < 0 ? 8 : -8);
        const len = Math.hypot(P[0] - ax0, P[1] - ay0) || 1;
        arrow(ax0, ay0, P[0] - (P[0] - ax0) / len * 6, P[1] - (P[1] - ay0) / len * 6, 'rgba(29,32,39,.8)');
        noteText(txt, tx, ty, 20, '#1d2027', 'left');
      }
      ctx.restore();
    }

    // légende façon graphique, encadrée à main levée
    function drawLegend(e) {
      const cls = target.fig.classes;
      if (view.mobile) { drawLegendRow(cls, e); return; }
      const fs = 18, rowH = fs + 5, pad = 10;
      ctx.save();
      ctx.font = `700 ${fs * dpr}px Caveat, "Segoe Print", cursive`;
      const w = Math.max(...cls.map(c => ctx.measureText(L(c)).width / dpr)) + 34 + pad * 2;
      const h = cls.length * rowH + pad * 2 - 4;
      const r = view.s * B;
      let x = view.mobile ? 16 : Math.min(W - w - 18, view.cx + r * 1.15);
      let y = view.mobile ? view.cy + r * 1.65 : view.cy - r * 1.75;
      if (!view.mobile) { x = Math.min(x, W - w - 18); y = Math.max(y, 84); }
      ctx.globalAlpha = 0.35 + 0.65 * clamp(e * 2 - 1, 0, 1);
      ctx.fillStyle = 'rgba(255,253,248,.88)';
      ctx.fillRect(x * dpr, y * dpr, w * dpr, h * dpr);
      const Rl = rng(5);
      ctx.beginPath();
      const c4 = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
      c4.forEach((p, k) => { const jx = (Rl() - .5) * 3, jy = (Rl() - .5) * 3; ctx[k ? 'lineTo' : 'moveTo']((p[0] + jx) * dpr, (p[1] + jy) * dpr); });
      ctx.strokeStyle = '#1d2027'; ctx.lineWidth = 1.5 * dpr; ctx.stroke();
      cls.forEach((c, k) => {
        const yy = y + pad + k * rowH + rowH / 2 - 2;
        const S = sprites.S * 0.9;
        ctx.drawImage(sprites.list[c.m * 3 + c.c][k & 3], (x + pad + 10) * dpr - S / 2, yy * dpr - S / 2, S, S);
        ctx.fillStyle = '#1d2027'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(L(c), (x + pad + 26) * dpr, yy * dpr);
      });
      // légende « fig. » sous la figure
      if (!view.mobile) {
        const label = `fig. ${pad2(figNum)} — ${L(target.fig.fig)}`;
        ctx.globalAlpha = 1;
        ctx.font = `700 ${27 * dpr}px Caveat, "Segoe Print", cursive`;
        const lx = view.cx - r * 0.95, ly = Math.min(view.cy + r * 1.75, H - 64);
        ctx.translate(lx * dpr, ly * dpr);
        ctx.rotate(-0.03);
        ctx.fillStyle = 'rgba(29,32,39,.85)';
        ctx.fillText(label, 0, 0);
        const lw = ctx.measureText(label).width;
        ctx.strokeStyle = 'rgba(232,89,12,.75)'; ctx.lineWidth = 2.2 * dpr; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 14 * dpr); ctx.quadraticCurveTo(lw * 0.5, 19 * dpr, lw, 11 * dpr); ctx.stroke();
      }
      ctx.restore();
    }
    const pad2 = n => String(n).padStart(2, '0');
    function drawLegendRow(cls, e) {
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.65 * clamp(e * 2 - 1, 0, 1);
      ctx.font = `700 ${15 * dpr}px Caveat, "Segoe Print", cursive`;
      ctx.fillStyle = '#1d2027'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const S = sprites.S * 0.8;
      let x = 20, y = view.top;
      for (const [k, c] of cls.entries()) {
        const w = ctx.measureText(L(c)).width / dpr + 30;
        if (x + w > W - 12 && x > 20) { x = 20; y += 20; }
        ctx.drawImage(sprites.list[c.m * 3 + c.c][k & 3], (x + 6) * dpr - S / 2, y * dpr - S / 2, S, S);
        ctx.fillText(L(c), (x + 16) * dpr, y * dpr);
        x += w;
      }
      ctx.restore();
    }

    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const moving = draw(dt);
      const pointerActive = ptr.x > -999;
      if (visible && (!motionPaused || moving > 0 || pointerActive || Math.abs(tiltX - ptr.ty * 0.3) > 0.001)) raf = requestAnimationFrame(frame);
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
    let intro = true;
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && intro) { intro = false; if (target === g0) tStart = performance.now(); }
      if (visible) kick();
    }, { rootMargin: '10% 0px' }).observe(section);
    window.addEventListener('resize', resize);
    resize();

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw(0));
    return {
      setShape,
      kick,
      setLabel(i) {
        figNum = i < 0 ? 0 : i + 1;
        draw(0);
        const el = $('#stageLabel');
        if (i < 0) { el.innerHTML = `<b>${pad(DATA.talks.length)}</b> · ${esc(t('stageIntro'))}`; return; }
        const k = DATA.talks[i];
        el.innerHTML = `<b>${pad(i + 1)} / ${pad(DATA.talks.length)}</b> · ` +
          (window.innerWidth < 760 ? `fig. ${esc(L(FIGS[k.shape].fig))}` : esc(L(DATA.themes[k.theme])));
      },
      stage
    };
  }

  let cardObserver;
  function setActive(i) {
    if (i === activeIndex) return;
    activeIndex = i;
    $$('.talk-card').forEach(c => c.classList.toggle('active', +c.dataset.index === i));
    if (cloud) { cloud.setShape(i < 0 ? 'clusters' : DATA.talks[i].shape); cloud.setLabel(i); }
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
  // Logo manquant : on affiche le nom de l'établissement (sans gestionnaire en ligne, compatible CSP)
  function watchLogos() {
    const missing = img => {
      if (img.classList.contains('brand-logo')) { img.style.display = 'none'; return; }
      const li = img.parentNode;
      li.classList.add('missing');
      li.dataset.name = img.alt;
      img.style.display = 'none';
    };
    $$('.brand-logo, .logos img').forEach(img => {
      if (img.complete && !img.naturalWidth) missing(img);
      else img.addEventListener('error', () => missing(img), { once: true });
    });
  }

  function start() {
    watchLogos();
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
