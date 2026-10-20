/* Pix'n Croq · socle commun : défilement, curseur, iris, déclencheur, panier, révélations. */
(function () {
  'use strict';
  const PX = window.PX = window.PX || {};
  const IMG = window.PX_IMG || {};
  const D = window.PX_DATA || {};
  const html = document.documentElement;
  html.classList.add('js');

  /* ---------- Stockage local, toujours facultatif ---------- */
  const fabrique = (type) => ({
    get(k) { try { return window[type].getItem('px-' + k); } catch (e) { return null; } },
    set(k, v) { try { window[type].setItem('px-' + k, v); } catch (e) { /* stockage indisponible */ } },
    del(k) { try { window[type].removeItem('px-' + k); } catch (e) { /* idem */ } }
  });
  PX.store = fabrique('localStorage');
  PX.sess = fabrique('sessionStorage');

  PX.reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  PX.calme = PX.reduit || PX.store.get('calme') === '1';
  if (PX.calme) html.classList.add('calme');
  PX.souris = window.matchMedia('(pointer: fine)').matches;
  PX.etroit = () => window.matchMedia('(max-width: 900px)').matches;
  PX.son = PX.store.get('son') === '1';

  /* ---------- Images ---------- */
  PX.url = (key, w) => {
    const m = IMG[key]; if (!m) return '';
    const s = m.sizes.find((x) => x >= (w || 960)) || m.sizes[m.sizes.length - 1];
    return 'assets/img/' + m.dir + '/' + key + '-' + s + '.webp';
  };
  PX.srcset = (key) => {
    const m = IMG[key]; if (!m) return '';
    return m.sizes.map((s) => 'assets/img/' + m.dir + '/' + key + '-' + s + '.webp ' + s + 'w').join(', ');
  };
  PX.img = (key, o) => {
    o = o || {}; const m = IMG[key]; if (!m) return '';
    const alt = o.alt !== undefined ? o.alt : m.alt;
    return '<img src="' + PX.url(key, o.w || 960) + '" srcset="' + PX.srcset(key) + '" sizes="' + (o.sizes || '(min-width: 900px) 50vw, 100vw') + '" width="' + m.w + '" height="' + m.h + '" alt="' + alt.replace(/"/g, '&quot;') + '"' + (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async"' + (o.cls ? ' class="' + o.cls + '"' : '') + ' data-px="' + key + '">';
  };
  PX.ar = (key) => (IMG[key] ? IMG[key].w / IMG[key].h : 1);
  PX.couleur = (key) => (IMG[key] ? IMG[key].color : '#c9b49b');
  PX.exif = (key) => {
    const e = IMG[key] && IMG[key].exif; if (!e) return '';
    return '<span class="exif" aria-label="Réglages de prise de vue"><span>' + e.f + '</span><span>' + e.v + '</span><span>' + e.iso + '</span><span>' + e.mm + '</span></span>';
  };
  PX.euros = (n, dec) => n.toLocaleString('fr-FR', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }) + ' €';
  PX.echapper = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- GSAP + Lenis ---------- */
  const G = window.gsap;
  PX.G = G;
  if (G) {
    G.registerPlugin(window.ScrollTrigger);
    if (window.SplitText) G.registerPlugin(window.SplitText);
    if (window.CustomEase) { G.registerPlugin(window.CustomEase); window.CustomEase.create('px', '0.22,0.8,0.2,1'); }
    G.defaults({ ease: window.CustomEase ? 'px' : 'power3.out' });
    window.ScrollTrigger.config({ ignoreMobileResize: true });
  }
  if (G && !PX.calme && window.Lenis) {
    const lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: false });
    PX.lenis = lenis;
    lenis.on('scroll', window.ScrollTrigger.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  PX.allerA = (cible) => {
    const el = typeof cible === 'string' ? document.querySelector(cible) : cible;
    if (!el) return;
    const decalage = -(parseInt(getComputedStyle(html).getPropertyValue('--entete-h'), 10) || 64) - 8;
    if (PX.lenis) PX.lenis.scrollTo(el, { offset: decalage, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + decalage, behavior: PX.calme ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2 || a.hasAttribute('data-hash')) return;
    const el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    fermerMenu();
    PX.allerA(el);
  });

  /* ---------- Toast ---------- */
  let toastEl, toastT;
  PX.toast = (msg) => {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('visible');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('visible'), 2800);
  };

  /* ---------- Déclencheur : son d'obturateur synthétisé, un seul flash ---------- */
  let actx = null;
  PX.declic = () => {
    if (!PX.son) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      const souffle = (debut, duree, freq, gain) => {
        const n = Math.floor(actx.sampleRate * duree);
        const buf = actx.createBuffer(1, n, actx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
        const src = actx.createBufferSource(); src.buffer = buf;
        const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.9;
        const g = actx.createGain(); g.gain.value = gain;
        src.connect(f); f.connect(g); g.connect(actx.destination); src.start(debut);
      };
      souffle(t, 0.04, 3400, 0.8);
      souffle(t + 0.075, 0.055, 1900, 0.55);
      const o = actx.createOscillator(); const g2 = actx.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.05);
      g2.gain.setValueAtTime(0.12, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.connect(g2); g2.connect(actx.destination); o.start(t); o.stop(t + 0.08);
    } catch (e) { /* audio indisponible */ }
  };
  let dernierFlash = 0;
  PX.croq = () => {
    PX.declic();
    const maintenant = performance.now();
    if (maintenant - dernierFlash < 700) return; /* jamais plus d'un flash toutes les 0,7 s */
    dernierFlash = maintenant;
    avancerCompteur(1);
    if (PX.calme || !G) return;
    const f = document.querySelector('.flash');
    if (f) G.fromTo(f, { opacity: 0.8 }, { opacity: 0, duration: 0.5, ease: 'power2.out' });
  };
  document.addEventListener('click', (e) => { if (e.target.closest('[data-croq]')) PX.croq(); });

  /* ---------- En-tête : fond, compteur de vues, outils ---------- */
  const entete = document.querySelector('.entete');
  const solideDesLeDebut = document.body.dataset.entete === 'solide';
  const majEntete = () => {
    if (!entete) return;
    const ref = document.querySelector('[data-sous-entete]');
    const seuil = ref ? ref.offsetHeight - 90 : 40;
    entete.classList.toggle('solide', solideDesLeDebut || window.scrollY > seuil);
  };
  majEntete();
  window.addEventListener('scroll', majEntete, { passive: true });

  const vues = Array.from(document.querySelectorAll('[data-vue]'));
  const compteurNum = document.querySelector('.compteur__num');
  const compteurNom = document.querySelector('.compteur__nom');
  let vueActive = 0, bonus = 0;
  const ecrireCompteur = (n, nom) => {
    if (!compteurNum) return;
    const txt = String(Math.min(36, n)).padStart(2, '0');
    if (G && !PX.calme && compteurNum.textContent !== txt) {
      const s = document.createElement('span'); s.textContent = txt;
      const ancien = compteurNum.firstElementChild;
      compteurNum.appendChild(s);
      G.fromTo(s, { yPercent: 110 }, { yPercent: 0, duration: 0.5 });
      if (ancien) G.to(ancien, { yPercent: -110, duration: 0.5, onComplete: () => ancien.remove() });
    } else compteurNum.innerHTML = '<span>' + txt + '</span>';
    if (compteurNom && nom) compteurNom.textContent = nom;
  };
  function avancerCompteur(d) { bonus += d; ecrireCompteur(vueActive + 1 + bonus, null); }
  if (vues.length && G) {
    vues.forEach((v, i) => {
      window.ScrollTrigger.create({ trigger: v, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => { if (s.isActive) { vueActive = i; ecrireCompteur(i + 1 + bonus, v.dataset.vue); } } });
    });
  }
  ecrireCompteur(1, vues[0] ? vues[0].dataset.vue : '');

  const btnCalme = document.getElementById('btn-calme');
  if (btnCalme) {
    btnCalme.setAttribute('aria-pressed', PX.calme ? 'true' : 'false');
    if (PX.reduit) btnCalme.title = 'Votre appareil demande déjà de réduire les animations';
    btnCalme.addEventListener('click', () => {
      const actif = !(PX.store.get('calme') === '1' || PX.reduit);
      if (PX.reduit && !actif) { PX.toast('Les animations restent réduites selon le réglage de votre appareil.'); return; }
      PX.store.set('calme', actif ? '1' : '0');
      PX.sess.set('defile', String(window.scrollY));
      window.location.reload();
    });
  }
  const btnSon = document.getElementById('btn-son');
  if (btnSon) {
    btnSon.setAttribute('aria-pressed', PX.son ? 'true' : 'false');
    btnSon.addEventListener('click', () => {
      PX.son = !PX.son; PX.store.set('son', PX.son ? '1' : '0');
      btnSon.setAttribute('aria-pressed', PX.son ? 'true' : 'false');
      if (PX.son) PX.declic();
      PX.toast(PX.son ? 'Son du déclencheur activé' : 'Son coupé');
    });
  }
  const defile = PX.sess.get('defile');
  if (defile) { PX.sess.del('defile'); window.addEventListener('load', () => window.scrollTo(0, +defile)); }

  /* ---------- Menu mobile ---------- */
  const menu = document.querySelector('.menu');
  const menuBtn = document.querySelector('.menu-btn');
  function fermerMenu() { if (menu && menu.classList.contains('ouvert')) { menu.classList.remove('ouvert'); menuBtn && menuBtn.setAttribute('aria-expanded', 'false'); if (PX.lenis) PX.lenis.start(); } }
  if (menu && menuBtn) {
    menuBtn.addEventListener('click', () => { menu.classList.add('ouvert'); menuBtn.setAttribute('aria-expanded', 'true'); if (PX.lenis) PX.lenis.stop(); const f = menu.querySelector('a'); f && f.focus(); });
    menu.querySelector('.menu-fermer').addEventListener('click', () => { fermerMenu(); menuBtn.focus(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerMenu(); });
  }

  /* ---------- Curseur et boutons magnétiques ---------- */
  if (PX.souris && !PX.calme && G) {
    html.classList.add('a-souris');
    const point = document.createElement('div'); point.className = 'curseur';
    const anneau = document.createElement('div'); anneau.className = 'curseur-anneau';
    anneau.innerHTML = '<span class="vf"><i></i><i></i><i></i><i></i></span><span class="lbl"></span>';
    document.body.append(point, anneau);
    const lbl = anneau.querySelector('.lbl');
    const px = G.quickTo(point, 'x', { duration: 0.12, ease: 'power3.out' }), py = G.quickTo(point, 'y', { duration: 0.12, ease: 'power3.out' });
    const ax = G.quickTo(anneau, 'x', { duration: 0.45, ease: 'power3.out' }), ay = G.quickTo(anneau, 'y', { duration: 0.45, ease: 'power3.out' });
    G.set([point, anneau], { left: 0, top: 0, x: -120, y: -120 });
    window.addEventListener('pointermove', (e) => { px(e.clientX); py(e.clientY); ax(e.clientX); ay(e.clientY); PX.pointeur = { x: e.clientX, y: e.clientY }; }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const c = e.target.closest('[data-curseur]');
      anneau.classList.remove('voir', 'glisser', 'lien-survol');
      if (c) { anneau.classList.add(c.dataset.curseur); lbl.textContent = c.dataset.curseurTexte || (c.dataset.curseur === 'voir' ? 'Voir' : 'Glisser'); }
      else if (e.target.closest('a, button, label, select, input[type="range"]')) anneau.classList.add('lien-survol');
    });
    document.querySelectorAll('[data-magnet]').forEach((el) => {
      const qx = G.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      const qy = G.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.28); qy((e.clientY - r.top - r.height / 2) * 0.35); });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }

  /* ---------- Iris : transitions de page en diaphragme ---------- */
  const iris = document.createElement('canvas'); iris.className = 'iris'; iris.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iris);
  const ictx = iris.getContext('2d');
  function dessinerIris(ouverture, rot) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = window.innerWidth, h = window.innerHeight;
    if (iris.width !== Math.round(w * dpr)) { iris.width = Math.round(w * dpr); iris.height = Math.round(h * dpr); }
    ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = w / 2, cy = h / 2, R = Math.hypot(w, h) / 2 * 1.12, r = R * ouverture;
    ictx.globalCompositeOperation = 'source-over';
    ictx.clearRect(0, 0, w, h);
    ictx.fillStyle = '#1D1511'; ictx.fillRect(0, 0, w, h);
    const pts = [];
    for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    if (r > 0.5) {
      ictx.globalCompositeOperation = 'destination-out';
      ictx.beginPath(); pts.forEach((p, i) => (i ? ictx.lineTo(p[0], p[1]) : ictx.moveTo(p[0], p[1]))); ictx.closePath(); ictx.fill();
      ictx.globalCompositeOperation = 'source-over';
    }
    ictx.strokeStyle = 'rgba(233, 184, 114, .32)'; ictx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = pts[i], b = pts[(i + 1) % 6]; const dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1;
      ictx.beginPath(); ictx.moveTo(a[0], a[1]); ictx.lineTo(a[0] + dx / l * (l + R * 2), a[1] + dy / l * (l + R * 2)); ictx.stroke();
    }
  }
  PX.iris = (sens, duree) => new Promise((ok) => {
    if (!G || PX.calme) { ok(); return; }
    const etat = { o: sens === 'ouvrir' ? 0 : 1, r: sens === 'ouvrir' ? -0.5 : 0 };
    iris.classList.add('actif');
    dessinerIris(etat.o, etat.r);
    G.to(etat, { o: sens === 'ouvrir' ? 1 : 0, r: sens === 'ouvrir' ? 0 : 0.6, duration: duree || 0.8, ease: sens === 'ouvrir' ? 'power3.inOut' : 'power3.in', onUpdate: () => dessinerIris(etat.o, etat.r), onComplete: () => { if (sens === 'ouvrir') iris.classList.remove('actif'); ok(); } });
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(mailto|tel|sms|javascript):/i.test(href)) return;
    let url; try { url = new URL(href, window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return; /* même page : laissé au script de page */
    if (PX.calme || !G) return;
    e.preventDefault();
    PX.sess.set('iris', '1');
    PX.iris('fermer', 0.65).then(() => { window.location.href = url.href; });
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) iris.classList.remove('actif'); });

  /* ---------- Ouverture de page : chargement (accueil) ou iris ---------- */
  let resoudre; PX.pret = new Promise((ok) => { resoudre = ok; });
  const chargement = document.querySelector('.chargement');
  function demarrer() {
    if (chargement && !PX.sess.get('vu') && G && !PX.calme) {
      PX.sess.set('vu', '1');
      const tl = G.timeline();
      const barre = chargement.querySelector('.chargement__barre i');
      chargement.querySelectorAll('[data-expo]').forEach((el) => {
        const vals = el.dataset.expo.split('|'); const o = { i: 0 };
        tl.to(o, { i: vals.length - 1, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { el.textContent = vals[Math.round(o.i)]; } }, 0);
      });
      tl.fromTo(chargement.querySelector('.chargement__marque'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8 }, 0);
      tl.to(barre, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0);
      tl.add(() => { PX.declic(); }, 1.62);
      tl.add(() => {
        iris.classList.add('actif'); dessinerIris(0, -0.5); chargement.remove();
        PX.iris('ouvrir', 0.85); setTimeout(resoudre, 250);
      }, 1.7);
    } else {
      if (chargement) chargement.remove();
      if (PX.sess.get('iris') === '1' && G && !PX.calme) { PX.sess.del('iris'); PX.iris('ouvrir', 0.8); setTimeout(resoudre, 200); }
      else resoudre();
    }
  }

  /* ---------- Révélations : chaque élément part d'un état visible ou masqué derrière une ligne ---------- */
  PX.reveler = (racine) => {
    racine = racine || document;
    if (!G || PX.calme) return;
    const ST = window.ScrollTrigger;
    racine.querySelectorAll('[data-titre]').forEach((el) => {
      if (el.dataset.fait) return; el.dataset.fait = '1';
      let lignes;
      if (window.SplitText) { const s = window.SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ligne-split' }); lignes = s.lines; }
      if (!lignes || !lignes.length) return;
      G.from(lignes, { yPercent: 108, duration: 1.1, stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    racine.querySelectorAll('[data-revele="photo"]').forEach((el) => {
      if (el.dataset.fait) return; el.dataset.fait = '1';
      const img = el.querySelector('img');
      const tl = G.timeline({ scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      tl.fromTo(el, { clipPath: 'inset(12% 9% 12% 9%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4 });
      if (img) tl.fromTo(img, { scale: 1.22 }, { scale: 1, duration: 1.8 }, 0);
    });
    racine.querySelectorAll('[data-revele="monte"]').forEach((el) => {
      if (el.dataset.fait) return; el.dataset.fait = '1';
      G.from(el.children.length && el.dataset.enfants !== undefined ? el.children : el, { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    racine.querySelectorAll('[data-focus]').forEach((el) => {
      if (el.dataset.fait) return; el.dataset.fait = '1';
      G.fromTo(el, { filter: 'blur(14px)', scale: 1.04, letterSpacing: '0.04em' }, { filter: 'blur(0px)', scale: 1, letterSpacing: '', duration: 1.4, ease: 'power2.out', clearProps: 'filter,letterSpacing', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    racine.querySelectorAll('[data-parallaxe]').forEach((el) => {
      if (el.dataset.fait) return; el.dataset.fait = '1';
      const v = parseFloat(el.dataset.parallaxe) || 0.15;
      G.fromTo(el, { yPercent: -v * 50 }, { yPercent: v * 50, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    ST.refresh();
  };

  PX.compter = (el, vers, o) => {
    o = o || {}; const fmt = o.fmt || ((n) => Math.round(n));
    if (!G || PX.calme) { el.textContent = fmt(vers); return; }
    const etat = { v: o.de !== undefined ? o.de : 0 };
    G.to(etat, { v: vers, duration: o.duree || 1.2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(etat.v); } });
  };

  /* ---------- Copier ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copier]'); if (!b) return;
    const texte = b.dataset.copier;
    const repli = () => { const cible = b.parentElement.querySelector('span'); if (cible) { const r = document.createRange(); r.selectNodeContents(cible); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } PX.toast('Texte sélectionné, copiez-le avec votre clavier'); };
    try { navigator.clipboard.writeText(texte).then(() => PX.toast('Copié : ' + texte), repli); } catch (err) { repli(); }
  });

  /* ---------- Panier en tiroir ---------- */
  const panierCle = 'panier';
  let lignes = [];
  try { lignes = JSON.parse(PX.store.get(panierCle) || '[]') || []; } catch (e) { lignes = []; }
  const tiroir = document.createElement('aside');
  tiroir.className = 'panier'; tiroir.setAttribute('aria-label', 'Panier'); tiroir.setAttribute('aria-hidden', 'true'); tiroir.inert = true;
  tiroir.innerHTML = '<div class="panier__tete"><h2>Panier</h2><button class="outil" type="button" data-fermer-panier aria-label="Fermer le panier"><span>Fermer</span></button></div><div class="panier__liste" data-lenis-prevent></div><div class="panier__pied"></div>';
  const voile = document.createElement('div'); voile.className = 'panier-voile';
  document.body.append(voile, tiroir);
  const listeEl = tiroir.querySelector('.panier__liste'), piedEl = tiroir.querySelector('.panier__pied');
  let etapePanier = 'liste', retrait = 'studio';
  const produitDe = (id) => (D.produits || []).find((p) => p.id === id);
  const sauver = () => PX.store.set(panierCle, JSON.stringify(lignes));
  const nb = () => lignes.reduce((s, l) => s + l.qte, 0);
  const sousTotal = () => lignes.reduce((s, l) => s + l.prix * l.qte, 0);
  const supplement = () => lignes.reduce((m, l) => Math.max(m, (produitDe(l.id) || {}).livraison || 0), 0);
  function majBoutons() {
    document.querySelectorAll('.panier-btn .nb').forEach((n) => { n.textContent = nb(); });
  }
  function rendrePanier() {
    majBoutons();
    if (!lignes.length && etapePanier !== 'fin') etapePanier = 'liste';
    if (etapePanier === 'fin') {
      listeEl.innerHTML = '<div class="panier__vide"><b style="font-family:var(--f-titre);font-size:1.8rem;font-weight:340">Commande simulée</b><p>Aucun paiement n’a été effectué : c’est une maquette. Sur le vrai site, Liz vous demande ensuite par e-mail les détails de personnalisation (photos, écritures, gravure).</p></div>';
      piedEl.innerHTML = '<button class="btn" type="button" data-fermer-panier>Continuer la visite</button>';
      return;
    }
    if (!lignes.length) {
      listeEl.innerHTML = '<div class="panier__vide"><p>Votre panier est vide.</p><a class="btn btn--ligne btn--petit" href="boutique.html">Voir la boutique</a></div>';
      piedEl.innerHTML = '';
      return;
    }
    listeEl.innerHTML = lignes.map((l, i) => '<div class="ligne-panier"><div class="vis">' + (l.img ? PX.img(l.img, { w: 160, sizes: '64px', alt: '' }) : '') + '</div><div><b>' + PX.echapper(l.nom) + '</b>' + (l.detail ? '<small>' + PX.echapper(l.detail) + '</small>' : '') + (l.aConfirmer ? '<small class="a-completer" style="margin-top:.3rem">prix du format à compléter</small>' : '') + '<div class="pas" style="margin-top:.5rem"><button type="button" data-qte="' + i + '" data-d="-1" aria-label="Retirer un">−</button><output>' + l.qte + '</output><button type="button" data-qte="' + i + '" data-d="1" aria-label="Ajouter un">+</button></div></div><div class="px">' + PX.euros(l.prix * l.qte) + '<button class="retirer" type="button" data-retirer="' + i + '">Retirer</button></div></div>').join('');
    const sup = supplement();
    const total = sousTotal() + (retrait === 'livraison' ? sup : 0);
    if (etapePanier === 'liste') {
      piedEl.innerHTML = '<div class="ch"><label for="panier-retrait">Réception</label><select id="panier-retrait"><option value="studio"' + (retrait === 'studio' ? ' selected' : '') + '>Retrait au home studio à Ugny, contrôle qualité avant remise</option><option value="livraison"' + (retrait === 'livraison' ? ' selected' : '') + '>Livraison à domicile par Liz (+ ' + PX.euros(sup) + ')</option></select></div><div class="panier__total"><span>Total</span><b>' + PX.euros(total) + '</b></div><button class="btn" type="button" data-commander>Commander</button><p class="note-maquette">Produits personnalisés : aucun retour, échange ni remboursement après validation de la commande.</p>';
    } else {
      piedEl.innerHTML = '<div class="panier__total"><span>À payer</span><b>' + PX.euros(total) + '</b></div><div><span class="etiquette">Moyens de paiement</span><div class="paiements" style="margin-top:.5rem"><span class="a-completer">moyens de paiement de la boutique actuelle à compléter</span></div></div><p class="note-maquette">Paiement simulé : rien n’est débité dans cette maquette.</p><div class="form-nav" style="margin-top:0"><button class="btn btn--ligne btn--petit" type="button" data-retour-panier>Retour</button><button class="btn" type="button" data-payer data-croq>Payer (simulation)</button></div>';
    }
  }
  PX.panier = {
    ajouter(article, depuis) {
      const ex = lignes.find((l) => l.cle === article.cle);
      if (ex) ex.qte += 1; else lignes.push(Object.assign({ qte: 1 }, article));
      sauver(); etapePanier = 'liste';
      if (depuis && G && !PX.calme && article.img) PX.vol(depuis, article.img).then(rendrePanier);
      else rendrePanier();
      PX.toast(article.nom + ' ajouté au panier');
    },
    ouvrir() { rendrePanier(); tiroir.classList.add('ouvert'); voile.classList.add('ouvert'); tiroir.setAttribute('aria-hidden', 'false'); tiroir.inert = false; if (PX.lenis) PX.lenis.stop(); setTimeout(() => tiroir.querySelector('[data-fermer-panier]').focus(), 50); },
    fermer() { tiroir.classList.remove('ouvert'); voile.classList.remove('ouvert'); tiroir.setAttribute('aria-hidden', 'true'); tiroir.inert = true; if (PX.lenis) PX.lenis.start(); if (etapePanier === 'fin') { etapePanier = 'liste'; rendrePanier(); } }
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('.panier-btn')) { PX.panier.ouvrir(); return; }
    if (e.target.closest('[data-fermer-panier]') || e.target === voile) { PX.panier.fermer(); return; }
    const q = e.target.closest('[data-qte]');
    if (q) { const l = lignes[+q.dataset.qte]; l.qte = Math.max(0, l.qte + +q.dataset.d); if (!l.qte) lignes.splice(+q.dataset.qte, 1); sauver(); rendrePanier(); return; }
    const r = e.target.closest('[data-retirer]');
    if (r) { lignes.splice(+r.dataset.retirer, 1); sauver(); rendrePanier(); return; }
    if (e.target.closest('[data-commander]')) { etapePanier = 'paiement'; rendrePanier(); return; }
    if (e.target.closest('[data-retour-panier]')) { etapePanier = 'liste'; rendrePanier(); return; }
    if (e.target.closest('[data-payer]')) { lignes = []; sauver(); etapePanier = 'fin'; rendrePanier(); }
  });
  tiroir.addEventListener('change', (e) => { if (e.target.id === 'panier-retrait') { retrait = e.target.value; rendrePanier(); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && tiroir.classList.contains('ouvert')) PX.panier.fermer(); });
  majBoutons();

  PX.vol = (depuis, key) => new Promise((ok) => {
    const cible = Array.from(document.querySelectorAll('.panier-btn')).find((b) => b.offsetParent !== null);
    if (!cible) { ok(); return; }
    const a = depuis.getBoundingClientRect(), b = cible.getBoundingClientRect();
    const v = document.createElement('div'); v.className = 'vol'; v.innerHTML = PX.img(key, { w: 160, sizes: '64px', alt: '' });
    document.body.appendChild(v);
    G.set(v, { x: a.left + a.width / 2 - 32, y: a.top + a.height / 2 - 32, scale: 1.4, rotation: -6 });
    const tl = G.timeline({ onComplete: () => { v.remove(); G.fromTo(cible, { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }); ok(); } });
    tl.to(v, { x: b.left + b.width / 2 - 32, duration: 0.8, ease: 'power1.inOut' }, 0)
      .to(v, { y: Math.min(a.top, b.top) - 120, duration: 0.38, ease: 'power2.out' }, 0)
      .to(v, { y: b.top + b.height / 2 - 32, duration: 0.42, ease: 'power2.in' }, 0.38)
      .to(v, { scale: 0.25, rotation: 12, opacity: 0.4, duration: 0.8, ease: 'power1.in' }, 0);
  });

  /* ---------- Pied de page : signature tracée ---------- */
  const signature = document.querySelector('.pied__marque text');
  const ajusterSignature = () => { if (!signature) return; try { const b = signature.getBBox(); if (b.width) signature.ownerSVGElement.setAttribute('viewBox', [b.x - 2, b.y - 2, b.width + 4, b.height + 4].map((n) => n.toFixed(1)).join(' ')); } catch (e) { /* rien */ } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajusterSignature); else ajusterSignature();
  if (signature && G && !PX.calme) {
    G.fromTo(signature, { strokeDasharray: 1600, strokeDashoffset: 1600 }, { strokeDashoffset: 0, duration: 3.2, ease: 'power2.inOut', scrollTrigger: { trigger: signature, start: 'top 95%', once: true } });
  }

  /* ---------- GL : attente du module ---------- */
  PX.quandGL = (cb) => {
    if (PX.gl) { cb(PX.gl); return; }
    let fait = false;
    const go = () => { if (fait) return; fait = true; cb(PX.gl || null); };
    window.addEventListener('px:gl', go, { once: true });
    setTimeout(go, 1500);
  };

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });
  window.addEventListener('load', () => { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });
  demarrer();
})();
