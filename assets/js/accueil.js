/* Pix'n Croq · page d'accueil */
(function () {
  'use strict';
  const PX = window.PX, D = window.PX_DATA, G = window.gsap, ST = window.ScrollTrigger;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const anime = !!G && !PX.calme;

  /* ---------- Salle d'exposition des séances (depuis data.js) ---------- */
  const piste = $('#piste');
  const visuel = (u) => u.photos[0] || u.ambiance;
  const prixDe = (u) => (u.devis ? 'Sur devis' : u.parPhoto ? PX.euros(u.parPhoto) + ' / photo' : 'dès ' + PX.euros(Math.min.apply(null, u.formules.map((f) => f.prix))));
  piste.innerHTML = D.univers.map((u, i) => {
    const k = visuel(u);
    const ambiance = !u.photos.length;
    return '<a class="oeuvre" href="seances.html#' + u.id + '" style="--ar:' + PX.ar(k).toFixed(3) + '" data-couleur="' + PX.couleur(k) + '" data-curseur="voir" data-curseur-texte="Tarifs">' +
      '<div class="oeuvre__cadre">' + PX.img(k, { sizes: '(min-width: 900px) 40vw, 80vw', alt: ambiance ? '' : undefined }) + (ambiance ? '<span class="ambiance-tag">Ambiance · photos à venir</span>' : '') + '<span class="oeuvre__reflet" aria-hidden="true"></span></div>' +
      '<div class="oeuvre__legende"><span class="oeuvre__num" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span><span class="oeuvre__nom">' + u.nom + '</span><span class="oeuvre__prix">' + prixDe(u) + '</span><span class="oeuvre__acc">' + u.accroche + '</span>' + (ambiance ? '' : PX.exif(k)) + '</div></a>';
  }).join('') + '<div class="salle__fin"><p>Une autre envie ? Photo professionnelle, gender reveal, voiture : parlons-en.</p><div><a class="btn" href="#reserver" data-magnet>Me contacter</a></div></div>';

  const salle = $('.salle');
  const papier = [246, 238, 227];
  const melange = (hex, t) => { const n = parseInt(hex.slice(1), 16); const c = [n >> 16 & 255, n >> 8 & 255, n & 255]; return 'rgb(' + c.map((v, i) => Math.round(papier[i] + (v - papier[i]) * t)).join(',') + ')'; };
  const oeuvres = $$('.oeuvre', piste);
  let couleurCourante = '';
  const teinter = () => {
    const cx = window.innerWidth / 2; let meilleur = null, d0 = Infinity;
    oeuvres.forEach((o) => { const r = o.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - cx); if (d < d0) { d0 = d; meilleur = o; } });
    if (meilleur && meilleur.dataset.couleur !== couleurCourante) {
      couleurCourante = meilleur.dataset.couleur;
      salle.style.backgroundColor = melange(couleurCourante, 0.22);
    }
  };
  /* progression « 03 / 11 » sous la piste */
  const salleNum = $('#salle-num'), salleBarre = $('#salle-barre'), aide = $('.salle__aide');
  const progression = (p) => {
    const n = Math.min(oeuvres.length, Math.max(1, Math.round(p * (oeuvres.length - 1)) + 1));
    if (salleNum) salleNum.textContent = String(n).padStart(2, '0') + ' / ' + String(oeuvres.length).padStart(2, '0');
    if (salleBarre) salleBarre.style.transform = 'scaleX(' + Math.max(0.04, p).toFixed(3) + ')';
    if (aide && p > 0.02) aide.hidden = true;
  };
  progression(0);
  const wrap = $('.salle__piste-wrap');
  if (anime && !PX.etroit()) {
    const largeur = () => piste.scrollWidth - window.innerWidth;
    /* la scène s'épingle juste sous l'en-tête, centrée dans l'espace restant */
    const haut = () => { const e = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--entete-h'), 10) || 64); const libre = window.innerHeight - e; const h = $('#salle-scene').offsetHeight; return 'top ' + Math.round(e + Math.max(0, (libre - h) / 2)) + 'px'; };
    const st = G.to(piste, { x: () => -largeur(), ease: 'none', scrollTrigger: { trigger: '#salle-scene', start: haut, end: () => '+=' + Math.round(largeur() * 0.8), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: (t) => { teinter(); progression(t.progress); } } }).scrollTrigger;
    /* clavier : une carte qui reçoit le focus est amenée à l'écran */
    piste.addEventListener('focusin', (e) => {
      const o = e.target.closest('.oeuvre, .salle__fin'); if (!o) return;
      const centre = o.offsetLeft + o.offsetWidth / 2 - window.innerWidth / 2;
      const p = Math.max(0, Math.min(1, centre / largeur()));
      const y = st.start + p * (st.end - st.start);
      if (PX.lenis) PX.lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
      wrap.scrollLeft = 0;
    });
    oeuvres.forEach((o, i) => {
      const cadre = $('.oeuvre__cadre', o), img = $('img', cadre);
      G.fromTo(img, { scale: 1.16 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '#salle-scene', start: haut, end: () => '+=' + Math.round(largeur() * 0.8), scrub: true } });
      const rx = G.quickTo(cadre, 'rotationY', { duration: 0.6 }), ry = G.quickTo(cadre, 'rotationX', { duration: 0.6 });
      cadre.addEventListener('pointermove', (e) => { const r = cadre.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height; rx((x - 0.5) * 9); ry((0.5 - y) * 7); cadre.style.setProperty('--rx', x * 100 + '%'); cadre.style.setProperty('--ry', y * 100 + '%'); });
      cadre.addEventListener('pointerleave', () => { rx(0); ry(0); });
      G.set(cadre, { transformPerspective: 900 });
    });
  } else {
    /* sans épinglage (téléphone ou mode calme) : piste qui défile au doigt ou à la molette */
    salle.classList.add('salle--libre');
    wrap.addEventListener('scroll', () => { teinter(); progression(wrap.scrollLeft / Math.max(1, wrap.scrollWidth - wrap.clientWidth)); }, { passive: true });
  }
  teinter();

  /* ---------- Manifeste : les mots s'allument au passage de la lumière ---------- */
  const texte = $('.manifeste__texte');
  const decouper = (noeud, chaud) => {
    Array.from(noeud.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((m) => {
          if (!m) return;
          if (/^\s+$/.test(m)) { frag.appendChild(document.createTextNode(m)); return; }
          const s = document.createElement('span'); s.className = 'mot' + (chaud ? ' chaud' : ''); s.textContent = m; frag.appendChild(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) decouper(n, chaud || n.tagName === 'EM');
    });
  };
  decouper(texte, false);
  const mots = $$('.mot', texte);
  if (anime) {
    ST.create({ trigger: texte, start: 'top 78%', end: 'bottom 42%', scrub: true, onUpdate: (s) => { const n = Math.round(s.progress * mots.length); mots.forEach((m, i) => m.classList.toggle('allume', i < n)); } });
    $$('.tirage').forEach((t) => {
      const v = parseFloat(t.dataset.flotte) || 0.1;
      G.fromTo(t, { y: () => v * -400 }, { y: () => v * 400, ease: 'none', scrollTrigger: { trigger: '.manifeste', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
  } else mots.forEach((m) => m.classList.add('allume'));

  /* ---------- Déroulé : diaphragme réel (rayon proportionnel à 1/N) ---------- */
  const lames = $('#lames'), trou = $('#trou-iris'), grad = $('#graduations');
  if (grad) {
    let g = '';
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; const l = i % 5 === 0 ? 5 : 2.5; g += '<line x1="' + (Math.cos(a) * 106).toFixed(2) + '" y1="' + (Math.sin(a) * 106).toFixed(2) + '" x2="' + (Math.cos(a) * (106 + l)).toFixed(2) + '" y2="' + (Math.sin(a) * (106 + l)).toFixed(2) + '"/>'; }
    grad.innerHTML = g;
  }
  const iris = { r: 0.11, rot: 0 };
  const dessinerDiaphragme = () => {
    const R = 100, r = R * iris.r, pts = [];
    for (let i = 0; i < 7; i++) { const a = iris.rot + i * Math.PI / 3.5; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    trou.setAttribute('points', pts.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' '));
    let l = '';
    for (let i = 0; i < 7; i++) { const a = pts[i], b = pts[(i + 1) % 7]; const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1; l += '<line x1="' + a[0].toFixed(2) + '" y1="' + a[1].toFixed(2) + '" x2="' + (a[0] + dx / n * 260).toFixed(2) + '" y2="' + (a[1] + dy / n * 260).toFixed(2) + '"/>'; }
    lames.innerHTML = l;
  };
  dessinerDiaphragme();
  const etapes = $$('.etape'), photosD = $$('.diaphragme__photo img'), valeurF = $('#valeur-f');
  let etapeActive = 0;
  const activer = (i) => {
    if (i === etapeActive) return; etapeActive = i;
    etapes.forEach((e, j) => e.classList.toggle('active', j === i));
    photosD.forEach((p, j) => p.classList.toggle('active', j === i));
    valeurF.textContent = etapes[i].dataset.f;
    const r = parseFloat(etapes[i].dataset.r);
    if (anime) G.to(iris, { r, rot: i * 0.42, duration: 1.1, ease: 'power3.inOut', onUpdate: dessinerDiaphragme });
    else { iris.r = r; dessinerDiaphragme(); }
  };
  if (G) etapes.forEach((e, i) => ST.create({ trigger: e, start: 'top 62%', end: 'bottom 38%', onToggle: (s) => { if (s.isActive) activer(i); } }));
  else activer(3);
  if (PX.calme) { iris.r = 0.98; dessinerDiaphragme(); valeurF.textContent = 'f/1.8'; }

  /* ---------- Zone : carte et calcul des frais ---------- */
  const O = D.origine, km = (a) => { const R = 6371, rad = Math.PI / 180; const dLat = (a.lat - O.lat) * rad, dLon = (a.lon - O.lon) * rad; const h = Math.sin(dLat / 2) ** 2 + Math.cos(O.lat * rad) * Math.cos(a.lat * rad) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const proj = (a) => [(a.lon - O.lon) * 111.32 * Math.cos(O.lat * Math.PI / 180), -(a.lat - O.lat) * 110.57];
  const villes = D.villes.map((v) => Object.assign({}, v, { d: km(v), p: proj(v) })).sort((a, b) => a.d - b.d);
  const carte = $('#carte');
  const decal = { 'Cons-la-Grandville': null, 'Mont-Saint-Martin': [1.4, -1.2], 'Longwy': [-1.3, -0.6, 'end'], 'Longuyon': [-1.3, 0.6, 'end'], 'Audun-le-Tiche': [1.4, 1.2], 'Villerupt': [-1.3, 2.7, 'end'], 'Audun-le-Roman': [-1.3, 0.6, 'end'], 'Esch-sur-Alzette (LU)': [1.4, -1.2] };
  let svg = '<g id="rayons" stroke="rgba(233,184,114,.25)" stroke-width=".15">';
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; svg += '<line x1="' + (Math.cos(a) * 3).toFixed(2) + '" y1="' + (Math.sin(a) * 3).toFixed(2) + '" x2="' + (Math.cos(a) * 15).toFixed(2) + '" y2="' + (Math.sin(a) * 15).toFixed(2) + '"/>'; }
  svg += '</g><circle id="cercle15" r="15" fill="rgba(233,184,114,.08)" stroke="#E9B872" stroke-width=".35" stroke-dasharray="1.2 .8"/><text x="0" y="-16.2" font-size="1.7" text-anchor="middle" fill="#E9B872" style="letter-spacing:.1em">15 KM INCLUS</text><path id="trajet" fill="none" stroke="#E9B872" stroke-width=".4" stroke-linecap="round"/>';
  villes.forEach((v) => {
    const o = decal[v.nom]; const x = v.p[0], y = v.p[1];
    svg += '<g class="ville" data-nom="' + v.nom + '"><circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r=".7" fill="' + (v.d <= 15 ? '#E9B872' : '#F2E4D0') + '"/>';
    if (o !== null) { const dx = o ? o[0] : 1.3, dy = o ? o[1] : 0.6, anc = o && o[2] ? o[2] : 'start'; svg += '<text x="' + (x + dx).toFixed(2) + '" y="' + (y + dy).toFixed(2) + '" font-size="1.65" text-anchor="' + anc + '" opacity=".85">' + v.nom + '</text>'; }
    svg += '</g>';
  });
  svg += '<circle r="1.3" fill="#C8794E" stroke="#F2E4D0" stroke-width=".3"/><text x="0" y="3.4" font-size="2.1" text-anchor="middle" font-weight="700">Ugny</text>';
  carte.innerHTML = svg;
  const select = $('#calc-ville'), libre = $('#calc-libre'), curseur = $('#calc-km'), curseurVal = $('#calc-km-val');
  select.innerHTML = villes.map((v, i) => '<option value="' + i + '">' + v.nom + ' (' + Math.round(v.d) + ' km)</option>').join('') + '<option value="autre">Autre commune : régler la distance</option>';
  select.value = String(villes.findIndex((v) => v.nom === 'Thionville'));
  const trajet = $('#trajet');
  const resultat = () => {
    const autre = select.value === 'autre';
    libre.hidden = !autre;
    const v = autre ? null : villes[+select.value];
    const d = autre ? +curseur.value : Math.round(v.d);
    curseurVal.textContent = curseur.value + ' km';
    const au = Math.max(0, d - D.deplacement.inclusKm);
    const frais = Math.round(au * 2 * D.deplacement.prixKm * 100) / 100;
    PX.compter($('#calc-dist'), d, { fmt: (n) => Math.round(n) + ' km', duree: 0.8 });
    if (frais === 0) $('#calc-frais').textContent = 'Inclus';
    else PX.compter($('#calc-frais'), frais, { fmt: (n) => PX.euros(Math.round(n)), duree: 0.8 });
    $('#calc-detail').textContent = frais === 0 ? 'Dans le rayon de 15 km : déplacement compris dans le tarif. Estimation à vol d’oiseau, confirmée à la réservation.' : Math.round(au) + ' km au-delà des 15 km × 2 (aller-retour) × 0,50 € = ' + PX.euros(frais) + '. Estimation à vol d’oiseau : la distance routière réelle est confirmée à la réservation.';
    $$('.ville', carte).forEach((g) => g.style.opacity = !v || g.dataset.nom === v.nom ? 1 : 0.5);
    if (v) {
      const [x, y] = v.p; const mx = x / 2 - y * 0.25, my = y / 2 + x * 0.25;
      trajet.setAttribute('d', 'M0,0 Q' + mx.toFixed(2) + ',' + my.toFixed(2) + ' ' + x.toFixed(2) + ',' + y.toFixed(2));
      if (anime) { const L = trajet.getTotalLength(); G.fromTo(trajet, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }); }
    } else trajet.setAttribute('d', '');
  };
  select.addEventListener('change', resultat);
  curseur.addEventListener('input', resultat);
  $('#calcul').addEventListener('submit', (e) => e.preventDefault());
  resultat();
  if (anime) {
    G.fromTo('#cercle15', { attr: { r: 0 } }, { attr: { r: 15 }, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: carte, start: 'top 80%', toggleActions: 'play none none none' }, onComplete: resultat });
    G.from('#rayons line', { scale: 0, transformOrigin: '0 0', duration: 1.2, stagger: 0.03, scrollTrigger: { trigger: carte, start: 'top 80%', toggleActions: 'play none none none' } });
    G.from('.ville', { opacity: 0, scale: 0, transformOrigin: 'center', duration: 0.6, stagger: 0.05, scrollTrigger: { trigger: carte, start: 'top 80%', toggleActions: 'play none none none' } });
  }

  /* ---------- Liz : fuite de lumière argentique ---------- */
  const fuite = $('.liz__portrait .fuite');
  if (anime && fuite) G.timeline({ scrollTrigger: { trigger: '.liz__portrait', start: 'top 70%', toggleActions: 'play none none none' } }).fromTo(fuite, { xPercent: -60, opacity: 0 }, { xPercent: 50, opacity: 0.9, duration: 1.4, ease: 'power2.in' }).to(fuite, { opacity: 0, duration: 1.2 }, '-=0.3');

  /* ---------- Avis : mise au point mot par mot ---------- */
  const avis = D.avis[0];
  const citation = $('#citation');
  citation.innerHTML = avis.texte.split(' ').map((m) => '<span class="mot">' + m + '</span>').join(' ');
  $('#citation-nom').textContent = avis.nom;
  if (anime) G.fromTo($$('.mot', citation), { filter: 'blur(6px)', opacity: 0.35 }, { filter: 'blur(0px)', opacity: 1, stagger: 0.025, duration: 0.6, ease: 'power2.out', clearProps: 'filter', scrollTrigger: { trigger: citation, start: 'top 85%', toggleActions: 'play none none none' } });

  /* ---------- Carte cadeau : feuille d'or et montants ---------- */
  const carteC = $('#carte-accueil');
  const incliner = (x, y) => { carteC.style.setProperty('--ry', ((x - 0.5) * 22).toFixed(2) + 'deg'); carteC.style.setProperty('--rx', ((0.5 - y) * 16).toFixed(2) + 'deg'); carteC.style.setProperty('--mx', x * 100 + '%'); carteC.style.setProperty('--my', y * 100 + '%'); };
  if (anime) {
    const scene = carteC.parentElement;
    scene.addEventListener('pointermove', (e) => { const r = carteC.getBoundingClientRect(); incliner((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
    scene.addEventListener('pointerleave', () => incliner(0.5, 0.5));
    ST.create({ trigger: '.cadeau', start: 'top bottom', end: 'bottom top', onUpdate: (s) => { if (!PX.souris) incliner(0.2 + s.progress * 0.6, 0.35 + Math.sin(s.progress * 6) * 0.15); } });
    /* le montant s'affiche une fois, sans boucle ni valeurs intermédiaires fantaisistes */
    const montantEl = $('#montant-accueil');
    let montantVu = false;
    ST.create({ trigger: '.cadeau', start: 'top 75%', onEnter: () => { if (montantVu) return; montantVu = true; G.fromTo(montantEl, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8 }); } });
  }

  /* ---------- Réservation en 4 vues ---------- */
  const form = $('#form-resa');
  const selU = $('#r-univers'), boiteF = $('#r-formules');
  selU.innerHTML = '<option value="">Choisir une prestation</option>' + D.univers.map((u) => '<option value="' + u.id + '">' + u.nom + '</option>').join('') + '<option value="mini">Mini-séance au home studio</option><option value="autre">Autre demande (photo pro, gender reveal, voiture…)</option>';
  const remplirFormules = (choix) => {
    const u = D.univers.find((x) => x.id === selU.value);
    if (!selU.value) { boiteF.innerHTML = '<p class="note-maquette">Choisissez d’abord une prestation.</p>'; return; }
    if (!u || !u.formules.length) { boiteF.innerHTML = '<p class="note-maquette">' + (selU.value === 'mini' ? 'Je vous réponds avec les prochaines dates, les thèmes et les tarifs des mini-séances.' : u && u.devis ? 'Prestation sur devis personnalisé.' : 'Précisez votre demande dans le message.') + '</p>'; return; }
    boiteF.innerHTML = u.formules.map((f, i) => '<label><input type="radio" name="formule" value="' + PX.echapper(f.nom) + '"' + ((choix ? f.nom === choix : i === 0) ? ' checked' : '') + '><b>' + f.nom + '</b><small>' + PX.euros(f.prix) + (f.unite ? ' ' + f.unite : '') + (f.photos ? ' · ' + f.photos + ' photos' : '') + '</small></label>').join('');
  };
  selU.addEventListener('change', () => remplirFormules());
  form.addEventListener('input', () => { erreur.hidden = true; });
  form.addEventListener('change', () => { erreur.hidden = true; });
  let pre = null; try { pre = JSON.parse(PX.store.get('prefill') || 'null'); } catch (e) { pre = null; }
  if (pre && pre.univers) { selU.value = pre.univers; remplirFormules(pre.formule); PX.store.del('prefill'); if (pre.message) $('#r-message').value = pre.message; }
  else remplirFormules();
  const vuesF = $$('.etape-form', form), puces = $$('.pellicule button', form);
  const prec = $('#r-prec'), suiv = $('#r-suiv'), envoyer = $('#r-envoyer'), erreur = $('#r-erreur');
  let vue = 0;
  const valider = (i) => {
    if (i === 0 && !selU.value) return 'Choisissez une prestation pour continuer.';
    if (i === 1 && !$('#r-date').value && !$('#r-flex').checked) return 'Indiquez une date, ou cochez « Mes dates sont flexibles ».';
    if (i === 3) {
      if (!$('#r-prenom').value.trim()) return 'Indiquez votre prénom.';
      const mail = $('#r-email').value.trim(), tel = $('#r-tel').value.trim();
      if (!mail && !tel) return 'Indiquez un e-mail ou un téléphone pour que je puisse vous répondre.';
      if (mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return 'L’adresse e-mail semble incomplète.';
    }
    return '';
  };
  const montrer = (i) => {
    vue = i;
    vuesF.forEach((v, j) => { v.hidden = j !== i; });
    puces.forEach((p, j) => { p.toggleAttribute('aria-current', j === i); if (j === i) p.setAttribute('aria-current', 'step'); p.classList.toggle('fait', j < i); });
    prec.hidden = i === 0; suiv.hidden = i === 3; envoyer.hidden = i !== 3; erreur.hidden = true;
    if (anime) G.fromTo(vuesF[i], { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 });
    if (form.contains(document.activeElement)) vuesF[i].focus({ preventScroll: true });
  };
  vuesF.forEach((v) => v.setAttribute('tabindex', '-1'));
  const auj = new Date(); $('#r-date').min = auj.getFullYear() + '-' + String(auj.getMonth() + 1).padStart(2, '0') + '-' + String(auj.getDate()).padStart(2, '0');
  /* liens qui pré-remplissent la demande (ex. mini-séances) */
  document.addEventListener('click', (e) => {
    const l = e.target.closest('[data-prefill]'); if (!l) return;
    selU.value = l.dataset.prefill; remplirFormules(); montrer(0);
  });
  const avancer = () => { const m = valider(vue); if (m) { erreur.textContent = m; erreur.hidden = false; return; } montrer(vue + 1); };
  suiv.addEventListener('click', avancer);
  prec.addEventListener('click', () => montrer(vue - 1));
  puces.forEach((p, j) => p.addEventListener('click', () => { for (let k = 0; k < j; k++) { const m = valider(k); if (m) { montrer(k); erreur.textContent = m; erreur.hidden = false; return; } } montrer(j); }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const m = valider(3); if (m) { erreur.textContent = m; erreur.hidden = false; return; }
    PX.croq();
    const u = D.univers.find((x) => x.id === selU.value);
    const f = form.querySelector('input[name="formule"]:checked');
    const lieu = form.querySelector('input[name="lieu"]:checked');
    const date = $('#r-date').value ? new Date($('#r-date').value + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'dates flexibles';
    $('#r-resume').textContent = 'Récapitulatif : ' + (u ? u.nom : selU.options[selU.selectedIndex].text) + (f ? ', formule ' + f.value : '') + ' · ' + date + ' · ' + (lieu ? lieu.value : '') + '.';
    vuesF.forEach((v) => { v.hidden = true; }); $('.pellicule', form).hidden = true; $('.form-nav', form).hidden = true; erreur.hidden = true;
    $('#r-merci').hidden = false;
    const t = $('#r-merci h3'); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
    PX.allerA(form);
  });
  $('#r-nouveau').addEventListener('click', () => { form.reset(); remplirFormules(); $('#r-merci').hidden = true; $('.pellicule', form).hidden = false; $('.form-nav', form).hidden = false; montrer(0); });
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && vue < 3) { e.preventDefault(); avancer(); } });

  /* ---------- Ouverture : texte alternatif selon la photo affichée ---------- */
  const photoOuv = $('.ouverture__photo img');
  const majAlt = () => { if (photoOuv && /portrait-automne-04/.test(photoOuv.currentSrc || '')) photoOuv.alt = (window.PX_IMG['portrait-automne-04'] || {}).alt || photoOuv.alt; };
  if (photoOuv) { if (photoOuv.complete) majAlt(); photoOuv.addEventListener('load', majAlt); }

  /* ---------- Ouverture orchestrée ---------- */
  const titre = $('.ouverture__titre');
  if (anime) {
    G.set($$('.ligne > span', titre), { yPercent: 110 });
    G.set(['.ouverture__sous', '.ouverture__actions', '.ouverture__exif'], { y: 20, autoAlpha: 0 });
  }
  PX.pret.then(() => {
    PX.quandGL((gl) => {
      const cadre = $('.ouverture__photo');
      if (gl) { gl.developper(cadre, { duree: 1.4, papier: '#1D1511' }); gl.soleil($('.ouverture__soleil')); }
    });
    if (anime) {
      const tl = G.timeline({ delay: 0.25 });
      tl.to($$('.ligne > span', titre), { yPercent: 0, duration: 1.3, stagger: 0.12 })
        .to('.ouverture__sous', { y: 0, autoAlpha: 1, duration: 0.9 }, '-=0.7')
        .to('.ouverture__actions', { y: 0, autoAlpha: 1, duration: 0.9 }, '-=0.7')
        .to('.ouverture__exif', { y: 0, autoAlpha: 1, duration: 0.9 }, '-=0.8');
      G.to('.ouverture__cadre', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.ouverture', start: 'top top', end: 'bottom top', scrub: true } });
      /* sur grand écran, le texte posé sur la photo s'efface avant de passer sous l'en-tête */
      if (G.matchMedia) G.matchMedia().add('(min-width: 1001px)', () => {
        const ouv = $('.ouverture'), texte = $('.ouverture__texte'), titre = $('.ouverture__titre'), ent = $('.entete');
        const course = () => Math.max(240, ouv.offsetTop + texte.offsetTop + titre.offsetTop - (ent ? ent.offsetHeight : 80) - 10);
        G.to(texte, { opacity: 0, y: -36, ease: 'power2.in', scrollTrigger: { trigger: ouv, start: 'top top', end: () => '+=' + course(), scrub: true, invalidateOnRefresh: true } });
        G.to('.ouverture__haut', { opacity: 0, ease: 'none', scrollTrigger: { trigger: ouv, start: 'top top', end: '+=140', scrub: true } });
      });
    }
    PX.reveler();
  });
})();

/* Questions fréquentes : ouverture en douceur */
(function () {
  const PX = window.PX, G = window.gsap;
  document.querySelectorAll('.faq__item').forEach((d) => {
    const rep = d.querySelector('.faq__rep');
    d.querySelector('summary').addEventListener('click', (e) => {
      if (!G || PX.calme) return;
      e.preventDefault();
      if (d.open) {
        G.to(rep, { height: 0, opacity: 0, duration: 0.4, ease: 'power2.inOut', onComplete: () => { d.open = false; G.set(rep, { clearProps: 'height,opacity' }); if (window.ScrollTrigger) window.ScrollTrigger.refresh(); } });
      } else {
        document.querySelectorAll('.faq__item[open]').forEach((o) => { if (o !== d) { const r = o.querySelector('.faq__rep'); G.to(r, { height: 0, opacity: 0, duration: 0.35, onComplete: () => { o.open = false; G.set(r, { clearProps: 'height,opacity' }); } }); } });
        d.open = true;
        G.fromTo(rep, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power2.out', onComplete: () => { G.set(rep, { clearProps: 'height' }); if (window.ScrollTrigger) window.ScrollTrigger.refresh(); } });
      }
    });
  });
})();
