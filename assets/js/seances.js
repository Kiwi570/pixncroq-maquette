/* Pix'n Croq · page séances : un seul modèle, rempli par data.js pour les 11 univers. */
(function () {
  'use strict';
  const PX = window.PX, D = window.PX_DATA, G = window.gsap, ST = window.ScrollTrigger;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const anime = !!G && !PX.calme;
  const U = D.univers;
  const parId = (id) => U.find((u) => u.id === id);
  const idDepuisHash = () => { const h = (window.location.hash || '').slice(1); return parId(h) ? h : 'mariage'; };
  let u = parId(idDepuisHash());
  let etat = {};
  const villes = (() => {
    const O = D.origine, rad = Math.PI / 180;
    return D.villes.map((v) => { const dLat = (v.lat - O.lat) * rad, dLon = (v.lon - O.lon) * rad; const h = Math.sin(dLat / 2) ** 2 + Math.cos(O.lat * rad) * Math.cos(v.lat * rad) * Math.sin(dLon / 2) ** 2; return { nom: v.nom, d: 2 * 6371 * Math.asin(Math.sqrt(h)) }; }).sort((a, b) => a.d - b.d);
  })();
  const fraisKm = (d) => Math.max(0, Math.round(d) - D.deplacement.inclusKm) * 2 * D.deplacement.prixKm;

  /* ---------- Puces des univers ---------- */
  const puces = $('#u-puces');
  puces.innerHTML = U.map((x) => { const k = x.photos[0] || x.ambiance; return '<a href="#' + x.id + '" data-hash data-id="' + x.id + '">' + PX.img(k, { w: 160, sizes: '30px', alt: '' }) + x.nom + '</a>'; }).join('');

  /* ---------- Héros ---------- */
  function heros() {
    const k = u.photos[0] || u.ambiance;
    const ambiance = !u.photos.length;
    $('#u-groupe').textContent = u.groupe;
    const titre = $('#u-titre');
    const mots = u.nom.split(' ');
    titre.innerHTML = mots.length > 1 ? mots.slice(0, -1).join(' ') + ' <em>' + mots[mots.length - 1] + '</em>' : u.nom;
    $('#u-acc').textContent = u.accroche;
    $('#u-texte').textContent = u.texte;
    const des = $('#u-des'), lbl = $('#u-des-lbl');
    if (u.devis) { lbl.textContent = 'Tarif'; des.textContent = 'Sur devis'; }
    else if (u.parPhoto) { lbl.textContent = 'Tarif'; PX.compter(des, u.parPhoto, { fmt: (n) => PX.euros(Math.round(n)) + ' / photo' }); }
    else { lbl.textContent = 'À partir de'; PX.compter(des, Math.min.apply(null, u.formules.map((f) => f.prix)), { fmt: (n) => PX.euros(Math.round(n)) }); }
    const cadre = $('#u-photo');
    cadre.style.setProperty('--ar', PX.ar(k).toFixed(3));
    cadre.innerHTML = PX.img(k, { eager: true, sizes: '(min-width: 900px) 45vw, 100vw', alt: ambiance ? '' : undefined }) + (ambiance ? '<span class="ambiance-tag">Ambiance générée · photos de Liz à venir</span>' : '');
    $('#u-exif').innerHTML = ambiance ? '' : PX.exif(k);
    document.title = u.nom + ' · Pix’n Croq';
    $$('a', puces).forEach((a) => a.setAttribute('aria-current', a.dataset.id === u.id ? 'true' : 'false'));
    const actif = $('a[aria-current="true"]', puces);
    if (actif) puces.scrollTo({ left: actif.offsetLeft - 40, behavior: PX.calme ? 'auto' : 'smooth' });
    PX.quandGL((gl) => { if (gl) gl.developper(cadre, { duree: 2.1 }); });
  }

  /* ---------- Formules ---------- */
  function eventail(n, sources) {
    const taille = n <= 5 ? [46, 69] : n <= 15 ? [36, 54] : [26, 39];
    const A = Math.min(40, 4 + n * 2.3);
    let h = '<div class="eventail" aria-hidden="true">';
    for (let i = 0; i < n; i++) {
      const a = n === 1 ? 0 : -A + (2 * A * i) / (n - 1);
      const src = sources.length ? PX.url(sources[i % sources.length], 480) : '';
      h += '<i data-a="' + a.toFixed(2) + '" style="width:' + taille[0] + 'px;height:' + taille[1] + 'px;margin-left:-' + taille[0] / 2 + 'px;transform:rotate(' + a.toFixed(2) + 'deg);' + (src ? 'background-image:url(' + src + ')' : '') + '"></i>';
    }
    return h + '<span class="eventail__nb">' + n + ' tirages 10x15</span></div>';
  }
  function formules() {
    const liste = $('#f-liste'), intro = $('#f-intro'), note = $('#f-note');
    note.textContent = '';
    if (u.devis) {
      intro.textContent = 'Chaque demande étant unique, les prestations sont réalisées sur devis personnalisé.';
      liste.dataset.n = '1';
      liste.innerHTML = '<article class="formule vedette"><div class="formule__tete"><span class="formule__nom">Sur mesure</span></div><div class="formule__prix">Sur devis</div><ul>' + u.inclus.map((x) => '<li>' + x + '</li>').join('') + '</ul><div><a class="btn btn--clair" href="index.html#reserver" data-devis>Demander un devis</a></div></article>';
      return;
    }
    if (u.parPhoto) {
      intro.textContent = u.accroche + '.';
      liste.dataset.n = '1';
      liste.innerHTML = '<article class="formule vedette"><div class="formule__tete"><span class="formule__nom">Restauration</span><span class="formule__badge">Par photo</span></div><div class="formule__prix"><span data-prix="' + u.parPhoto + '">' + u.parPhoto + '</span>&#8239;€<small>par photo</small></div><ul>' + u.inclus.map((x) => '<li>' + x + '</li>').join('') + '</ul><p class="formule__lieu">' + u.note + '</p><div><a class="btn btn--clair" href="#composer" data-choisir="0">Estimer ma commande</a></div></article>';
      return;
    }
    intro.textContent = (u.inclus && u.inclus.length ? 'Inclus dans chaque formule : ' + u.inclus.join(' · ') + '.' : '');
    liste.dataset.n = String(u.formules.length);
    const vedette = u.formules.length > 1 ? 1 : 0;
    liste.innerHTML = u.formules.map((f, i) => {
      let corps = '';
      if (u.etapes) {
        corps = '<div class="couverture" style="--n:' + u.etapes.length + '" aria-label="Moments couverts">' + u.etapes.map((e, j) => '<span class="' + (f.couvre.indexOf(j) > -1 ? 'on' : '') + '">' + e + '</span>').join('') + '</div><ul>' + f.liste.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
      } else {
        const lignes = [f.lieu, f.photos + ' portraits sublimés' + (f.note ? ' ' + f.note : '')].concat(f.plus || []).concat((u.inclus || []).filter((x) => /10x15/.test(x)));
        corps = eventail(f.photos, u.photos) + '<ul>' + lignes.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
      }
      return '<article class="formule' + (i === vedette ? ' vedette' : '') + '"><div class="formule__tete"><span class="formule__nom">' + f.nom + '</span>' + (i === vedette ? '<span class="formule__badge">La plus choisie ?</span>' : '') + '</div><div class="formule__prix"><span data-prix="' + f.prix + '">' + f.prix + '</span>&#8239;€</div>' + corps + '<div><a class="btn ' + (i === vedette ? 'btn--clair' : 'btn--ligne') + ' btn--petit" href="#composer" data-choisir="' + i + '">Choisir ' + f.nom + '</a></div></article>';
    }).join('');
    const badge = $('.formule__badge', liste); if (badge) badge.outerHTML = '<span class="a-completer">formule à mettre en avant</span>';
    if (anime) {
      $$('.formule', liste).forEach((c, i) => {
        const prix = $('[data-prix]', c);
        const tl = G.timeline({ scrollTrigger: { trigger: c, start: 'top 85%', once: true } });
        tl.from(c, { y: 50, autoAlpha: 0, duration: 0.9, delay: i * 0.1 });
        tl.add(() => PX.compter(prix, +prix.dataset.prix, { duree: 1.1 }), 0.1);
        const tirs = $$('.eventail i', c);
        if (tirs.length) tl.fromTo(tirs, { rotation: 0, y: 20 }, { rotation: (k, el) => +el.dataset.a, y: 0, duration: 1.1, stagger: 0.025, ease: 'back.out(1.6)' }, 0.2);
        const segs = $$('.couverture span.on', c);
        if (segs.length) tl.from(segs, { opacity: 0.2, duration: 0.4, stagger: 0.12 }, 0.3);
      });
    }
  }

  /* ---------- Composeur ---------- */
  function composer() {
    const zone = $('#c-zone');
    etat = { formule: u.formules.length > 1 ? 1 : 0, options: {}, ville: villes.findIndex((v) => v.nom === 'Longwy'), nbPhotos: 1 };
    if (u.devis) {
      zone.innerHTML = '<div class="compo__options"><p class="u-hero__texte" style="color:var(--fumee);margin:0">Pour un projet sur mesure, décrivez votre idée : Liz vous propose un devis personnalisé selon vos envies, vos besoins et votre projet.</p></div><div class="recap"><span class="etiquette" style="color:var(--fumee-nuit)">Tarif</span><div class="recap__total">Sur devis</div><a class="btn btn--clair" href="index.html#reserver" data-devis>Demander un devis</a></div>';
      return;
    }
    let h = '<div class="compo__options">';
    if (u.parPhoto) {
      h += '<div class="compo__ligne"><span class="nom">Nombre de photos à restaurer</span><div class="pas"><button type="button" data-nb="-1" aria-label="Une photo de moins">−</button><output id="c-nb">1</output><button type="button" data-nb="1" aria-label="Une photo de plus">+</button></div></div>';
    } else {
      h += '<div class="ch"><span class="lbl" id="c-f-lbl">Formule</span><div class="choix" role="radiogroup" aria-labelledby="c-f-lbl">' + u.formules.map((f, i) => '<label><input type="radio" name="c-formule" value="' + i + '"' + (i === etat.formule ? ' checked' : '') + '><b>' + f.nom + '</b><small>' + PX.euros(f.prix) + (f.photos ? ' · ' + f.photos + ' photos' : '') + '</small></label>').join('') + '</div></div>';
      if (u.options.length) {
        h += '<div><span class="etiquette">Options du site</span>';
        u.options.forEach((o) => {
          if (o.choix) {
            h += '<div class="compo__ligne"><label for="c-o-' + o.id + '">' + o.nom + '</label><select class="champ" style="max-width:240px" id="c-o-' + o.id + '" data-option="' + o.id + '">' + o.choix.map((c, i) => '<option value="' + i + '">' + c.nom + (c.prix ? ' (+' + PX.euros(c.prix) + ')' : '') + '</option>').join('') + '</select></div>';
          } else if (o.qte) {
            h += '<div class="compo__ligne"><span class="nom">' + o.nom + ' <span class="px">+' + PX.euros(o.prix) + '</span></span><div class="pas"><button type="button" data-pas="' + o.id + '" data-d="-1" aria-label="Retirer">−</button><output id="c-q-' + o.id + '">0</output><button type="button" data-pas="' + o.id + '" data-d="1" aria-label="Ajouter">+</button></div></div>';
          } else {
            h += '<div class="compo__ligne"><label for="c-o-' + o.id + '">' + o.nom + ' <span class="px">+' + PX.euros(o.prix) + '</span></label><span class="interrupteur"><input type="checkbox" id="c-o-' + o.id + '" data-option="' + o.id + '"><span></span></span></div>';
          }
        });
        h += '</div>';
      }
      h += '<div class="ch"><label for="c-ville">Lieu de la séance</label><select class="champ" id="c-ville"><option value="-1">Home studio à Ugny ou dans les 15 km</option>' + villes.map((v, i) => '<option value="' + i + '"' + (i === etat.ville ? ' selected' : '') + '>' + v.nom + ' (' + Math.round(v.d) + ' km à vol d’oiseau)</option>').join('') + '</select></div>';
    }
    h += '</div><div class="recap" aria-live="polite"><span class="etiquette" style="color:var(--fumee-nuit)">Estimation</span><div class="recap__total" id="c-total">0 €</div><ul id="c-lignes"></ul><a class="btn btn--clair" href="index.html#reserver" id="c-reserver">Réserver cette formule <span class="fleche" aria-hidden="true">→</span></a><p class="note-maquette">Tarifs du site actuel. Frais de déplacement estimés à vol d’oiseau, confirmés à la réservation.</p></div>';
    zone.innerHTML = h;
    calculer(true);
  }
  let totalAffiche = 0;
  function calculer(instant) {
    const lignes = []; let total = 0;
    if (u.parPhoto) {
      total = u.parPhoto * etat.nbPhotos;
      lignes.push([etat.nbPhotos + ' photo' + (etat.nbPhotos > 1 ? 's' : '') + ' × ' + PX.euros(u.parPhoto), PX.euros(total)]);
    } else {
      const f = u.formules[etat.formule];
      total += f.prix; lignes.push(['Formule ' + f.nom, PX.euros(f.prix)]);
      u.options.forEach((o) => {
        const v = etat.options[o.id];
        if (o.choix) { const c = o.choix[v || 0]; if (c && c.prix) { total += c.prix; lignes.push([o.nom + ' : ' + c.nom, '+' + PX.euros(c.prix)]); } }
        else if (o.qte) { if (v) { total += o.prix * v; lignes.push([o.nom + ' × ' + v, '+' + PX.euros(o.prix * v)]); } }
        else if (v) { total += o.prix; lignes.push([o.nom, '+' + PX.euros(o.prix)]); }
      });
      const vi = etat.ville;
      if (vi >= 0) { const fr = fraisKm(villes[vi].d); total += fr; lignes.push(['Déplacement ' + villes[vi].nom, fr ? '+' + PX.euros(fr) : 'inclus']); }
      else lignes.push(['Déplacement', 'inclus']);
    }
    $('#c-lignes').innerHTML = lignes.map((l) => '<li><span>' + l[0] + '</span><span>' + l[1] + '</span></li>').join('');
    const el = $('#c-total');
    const dec = total % 1 !== 0;
    if (instant) el.textContent = PX.euros(total, dec); else PX.compter(el, total, { de: totalAffiche, duree: 0.7, fmt: (n) => PX.euros(dec ? n : Math.round(n), dec) });
    totalAffiche = total;
    etat.total = total;
  }
  document.addEventListener('change', (e) => {
    if (e.target.name === 'c-formule') { etat.formule = +e.target.value; calculer(); }
    else if (e.target.dataset.option) { etat.options[e.target.dataset.option] = e.target.type === 'checkbox' ? e.target.checked : +e.target.value; calculer(); }
    else if (e.target.id === 'c-ville') { etat.ville = +e.target.value; calculer(); }
  });
  document.addEventListener('click', (e) => {
    const p = e.target.closest('[data-pas]');
    if (p) { const id = p.dataset.pas; etat.options[id] = Math.max(0, Math.min(30, (etat.options[id] || 0) + +p.dataset.d)); $('#c-q-' + id).textContent = etat.options[id]; calculer(); return; }
    const nb = e.target.closest('[data-nb]');
    if (nb) { etat.nbPhotos = Math.max(1, Math.min(99, etat.nbPhotos + +nb.dataset.nb)); $('#c-nb').textContent = etat.nbPhotos; calculer(); return; }
    const ch = e.target.closest('[data-choisir]');
    if (ch && u.formules.length > 1) { etat.formule = +ch.dataset.choisir; const r = $('input[name="c-formule"][value="' + etat.formule + '"]'); if (r) r.checked = true; calculer(); }
    const res = e.target.closest('#c-reserver, [data-devis]');
    if (res) {
      const f = u.formules[etat.formule];
      const opts = $$('#c-lignes li').map((li) => Array.from(li.children).map((c) => c.textContent).join(' ')).slice(1).join(' ; ');
      PX.store.set('prefill', JSON.stringify({ univers: u.id, formule: f ? f.nom : '', message: u.devis ? '' : 'Estimation du site : ' + PX.euros(etat.total || 0, (etat.total || 0) % 1 !== 0) + (opts ? ' (' + opts + ')' : '') + '.' }));
    }
  });

  /* ---------- Galerie et visionneuse ---------- */
  let photos = [], indexV = 0;
  function galerie() {
    const g = $('#g-liste');
    photos = u.photos.slice();
    if (!photos.length) {
      $('#g-intro').textContent = 'Les photos de cet univers seront choisies par Liz parmi ses séances.';
      const k = u.ambiance;
      let droite = '<div style="display:grid;gap:1rem"><p style="font-family:var(--f-titre);font-size:var(--t-xl);line-height:1.2">En attendant, une image d’ambiance générée tient la place, sans personne et sans prétendre montrer une séance.</p><p><span class="a-completer">photos de séances à fournir</span></p></div>';
      if (u.id === 'restauration') {
        droite = '<div style="display:grid;gap:1rem"><div class="av-ap" id="av-ap" style="--pos:50%"><div class="av-ap__cote av-ap__avant"><span>Avant : photo d’origine de Liz</span></div><div class="av-ap__cote av-ap__apres"><span>Après : la même photo restaurée</span></div><div class="av-ap__poignee" aria-hidden="true"></div><input type="range" min="0" max="100" value="50" aria-label="Comparer avant et après"></div><p class="note-maquette">Comparateur prêt à recevoir un vrai exemple de restauration réalisé par Liz. <span class="a-completer">exemple avant / après à fournir</span></p></div>';
      }
      g.className = 'galerie--vide';
      g.innerHTML = '<figure style="margin:0;position:relative" data-revele="photo">' + PX.img(k, { sizes: '(min-width: 800px) 45vw, 100vw', alt: '' }) + '<span class="ambiance-tag">Ambiance générée</span></figure>' + droite;
      const av = $('#av-ap');
      if (av) { const inp = $('input', av); inp.addEventListener('input', () => av.style.setProperty('--pos', inp.value + '%')); }
      return;
    }
    $('#g-intro').textContent = 'Cliquez sur une photo pour l’ouvrir en grand, sans recadrage, avec la loupe.';
    g.className = 'galerie';
    g.innerHTML = photos.map((k, i) => '<figure data-revele="photo"><button type="button" data-voir="' + i + '" data-curseur="voir" aria-label="Agrandir : ' + PX.echapper((window.PX_IMG[k] || {}).alt || '') + '">' + PX.img(k, { sizes: '(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw' }) + '</button><figcaption>' + PX.exif(k) + '</figcaption></figure>').join('');
  }
  const vis = $('#visionneuse'), scene = $('#v-scene'), lentille = $('#v-lentille'), btnLoupe = $('#v-loupe');
  let dernierFocus = null, loupe = false;
  const afficher = (i) => {
    indexV = (i + photos.length) % photos.length;
    const k = photos[indexV];
    $$('img', scene).forEach((im) => im.remove());
    scene.insertAdjacentHTML('afterbegin', PX.img(k, { sizes: '100vw', w: 2400, eager: true }));
    $('#v-compte').textContent = 'Vue ' + String(indexV + 1).padStart(2, '0') + ' / ' + String(photos.length).padStart(2, '0') + ' · ' + u.nom;
    $('#v-exif').innerHTML = PX.exif(k);
    if (anime) G.fromTo($('img', scene), { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.5 });
  };
  const ouvrirV = (i) => { dernierFocus = document.activeElement; vis.hidden = false; afficher(i); if (PX.lenis) PX.lenis.stop(); $('#v-fermer').focus(); };
  const fermerV = () => { vis.hidden = true; if (PX.lenis) PX.lenis.start(); if (dernierFocus) dernierFocus.focus(); };
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-voir]'); if (b) ouvrirV(+b.dataset.voir); });
  $('#v-fermer').addEventListener('click', fermerV);
  $('#v-prec').addEventListener('click', () => afficher(indexV - 1));
  $('#v-suiv').addEventListener('click', () => afficher(indexV + 1));
  btnLoupe.addEventListener('click', () => { loupe = !loupe; btnLoupe.setAttribute('aria-pressed', String(loupe)); lentille.style.display = 'none'; });
  document.addEventListener('keydown', (e) => {
    if (vis.hidden) return;
    if (e.key === 'Escape') fermerV();
    else if (e.key === 'ArrowLeft') afficher(indexV - 1);
    else if (e.key === 'ArrowRight') afficher(indexV + 1);
    else if (e.key === 'Tab') { const f = $$('button', vis); if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });
  scene.addEventListener('pointermove', (e) => {
    const im = $('img', scene);
    if (!loupe || !im) { lentille.style.display = 'none'; return; }
    const r = im.getBoundingClientRect(), s = scene.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) { lentille.style.display = 'none'; return; }
    const z = 2.6;
    lentille.style.display = 'block';
    lentille.style.left = (e.clientX - s.left - 110) + 'px'; lentille.style.top = (e.clientY - s.top - 110) + 'px';
    lentille.style.backgroundImage = 'url(' + (im.currentSrc || im.src) + ')';
    lentille.style.backgroundSize = (r.width * z) + 'px ' + (r.height * z) + 'px';
    lentille.style.backgroundPosition = (-(x * z) + 110) + 'px ' + (-(y * z) + 110) + 'px';
  });
  scene.addEventListener('pointerleave', () => { lentille.style.display = 'none'; });

  /* ---------- Univers voisins ---------- */
  function voisins() {
    const i = U.indexOf(u);
    const pr = U[(i - 1 + U.length) % U.length], su = U[(i + 1) % U.length];
    const carte = (x, sens) => '<a href="#' + x.id + '" data-hash data-curseur="voir" data-curseur-texte="' + sens + '">' + PX.img(x.photos[0] || x.ambiance, { sizes: '(min-width: 700px) 50vw, 100vw', alt: '' }) + '<span class="etiquette" style="color:var(--fumee-nuit)">' + sens + '</span><b>' + x.nom + '</b></a>';
    $('#u-suivant').innerHTML = carte(pr, 'Précédent') + carte(su, 'Suivant');
  }

  function rendre() {
    heros(); formules(); composer(); galerie(); voisins();
    if (G) { ST.getAll().forEach((t) => { if (t.trigger && !document.body.contains(t.trigger)) t.kill(); }); PX.reveler(document.getElementById('contenu')); ST.refresh(); }
  }
  window.addEventListener('hashchange', () => {
    const id = idDepuisHash();
    if (id === u.id) return;
    u = parId(id);
    const go = () => { window.scrollTo(0, 0); if (PX.lenis) PX.lenis.scrollTo(0, { immediate: true }); rendre(); };
    if (anime) PX.iris('fermer', 0.45).then(() => { go(); PX.iris('ouvrir', 0.7); }); else go();
  });

  rendre();
  PX.pret.then(() => { PX.reveler(); });
})();
