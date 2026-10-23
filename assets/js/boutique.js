/* Pix'n Croq · boutique : produits, fiche, voir au mur, carte cadeau. */
(function () {
  'use strict';
  const PX = window.PX, D = window.PX_DATA, G = window.gsap;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const anime = !!G && !PX.calme;
  const P = D.produits;

  /* Photo de Liz utilisée pour dessiner chaque produit */
  const photoDe = { toile: 'portrait-automne-04', alu: 'mariage-course-invites', acrylique: 'mariage-porte-chateau', prestige: 'mariage-couple-chateau', 'album-28': 'naissance-parents-nb', 'album-21x28': 'grossesse-couple-couleur', 'album-21x15': 'animaux-berger-heure-doree', 'album-19': 'bapteme-chaussons-chapelet', 'album-15': 'portrait-homme-verdure', coffret: 'coffret-bois-tirages', tirages: 'portrait-automne-02', 'tirages-enveloppe': 'mariage-alliances' };
  const im = (k, w) => PX.img(k, { w: w || 480, sizes: w ? '(max-width: 760px) 60vw, 28vw' : '(max-width: 560px) 32vw, (max-width: 900px) 40vw, 18vw', alt: '' });

  function rendu(p, grand) {
    const k = photoDe[p.id];
    const w = grand ? 960 : 480;
    switch (p.rendu) {
      case 'toile': return '<div class="rendu rendu--toile">' + im(k, w) + '</div>';
      case 'alu': return '<div class="rendu rendu--alu">' + im(k, w) + '</div>';
      case 'acrylique': return '<div class="rendu rendu--acrylique">' + im(k, w) + '</div>';
      case 'album': return '<div class="rendu rendu--album" style="--ar-album:' + (p.carre ? 1 : 1.33) + '"><div class="couv">' + im(k, w) + '</div><span class="titre-album">' + (p.id === 'prestige' ? 'Prestige' : 'Album') + '</span></div>';
      case 'coffret': return '<div class="rendu rendu--coffret">' + im(k, w) + '</div>';
      case 'tirages': return '<div class="rendu rendu--tirages"><i>' + im('animaux-beagle-automne', w) + '</i><i>' + im('naissance-bras-papa', w) + '</i><i>' + im(k, w) + '</i></div>';
      case 'enveloppe': return '<div class="rendu rendu--enveloppe"><div class="tir">' + im(k, w) + '</div></div>';
      default: return '';
    }
  }
  const carteMini = (montant) => '<div class="rendu rendu--cadeau"><div class="carte-cadeau" style="width:100%;box-shadow:none"><div class="carte-cadeau__or" style="background-image:url(' + PX.url('grok-feuille-or', 480) + ')"></div><div class="carte-cadeau__in"><div class="carte-cadeau__haut"><b>Pix’n <i>Croq</i></b><small>Carte cadeau</small></div><div class="carte-cadeau__montant" style="font-size:2.2rem">' + montant + '&#8239;€</div><div class="carte-cadeau__bas"><span>by Liz Leroy</span><span>1 an</span></div></div></div></div>';
  const besoinFiche = (p) => (p.formats && p.formats.length) || (p.finitions && p.finitions.length) || (p.options && p.options.length);

  /* ---------- Grille ---------- */
  const grille = $('#grille');
  grille.innerHTML = P.map((p) => '<article class="produit" data-cat="' + p.cat + '"><button class="produit__vitrine" type="button" data-fiche="' + p.id + '" aria-label="Voir le détail : ' + PX.echapper(p.nom) + '" data-curseur="voir" data-curseur-texte="Détails">' + rendu(p) + '</button><div class="produit__corps"><h3>' + p.nom + '</h3>' + (p.texte ? '<p>' + p.texte + '</p>' : '') + (p.acompleter ? '<p>' + p.acompleter.map((a) => '<span class="a-completer">' + a + ' à compléter</span>').join(' ') + '</p>' : '') + '<div class="produit__bas"><span class="produit__prix">' + (p.des ? '<small>dès</small>' : '') + PX.euros(p.prix) + '</span><button class="btn btn--petit ajouter" type="button" data-ajouter="' + p.id + '">' + (besoinFiche(p) ? 'Choisir' : 'Ajouter') + '</button></div></div></article>').join('') +
    '<article class="produit" data-cat="cadeau"><a class="produit__vitrine" href="#cadeau" tabindex="-1" aria-hidden="true">' + carteMini(50) + '</a><div class="produit__corps"><h3>Carte cadeau</h3><p>25, 50, 100, 150, 200 € ou le montant de votre choix. Valable 1 an à compter de la date d’achat.</p><div class="produit__bas"><span class="produit__prix"><small>dès</small>25&#8239;€</span><a class="btn btn--petit ajouter" href="#cadeau">Composer</a></div></div></article>';
  $$('.filtres button').forEach((b) => b.addEventListener('click', () => {
    $$('.filtres button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.filtre;
    const cartes = $$('.produit', grille);
    const appliquer = () => cartes.forEach((c) => { c.hidden = !(f === 'tout' || c.dataset.cat === f); });
    if (anime) G.to(cartes, { opacity: 0, y: 12, duration: 0.2, onComplete: () => { appliquer(); G.to(cartes.filter((c) => !c.hidden), { opacity: 1, y: 0, duration: 0.45, stagger: 0.04 }); if (window.ScrollTrigger) window.ScrollTrigger.refresh(); } });
    else appliquer();
  }));

  /* ---------- Fiche produit ---------- */
  const fiche = $('#fiche'), ficheCorps = $('#fiche-corps'), ficheVitrine = $('#fiche-vitrine');
  let produit = null, choix = {}, focusAvant = null;
  function prixFiche() {
    let total = produit.prix, aConfirmer = false;
    (produit.options || []).forEach((o, i) => { if (choix['o' + i]) total += o.prix; });
    if (produit.formats && produit.formats.length && choix.format > 0 && produit.cat !== 'albums') aConfirmer = true;
    if (produit.finitions && choix.finition > 0) aConfirmer = true;
    return { total, aConfirmer };
  }
  function majFiche() {
    const r = prixFiche();
    $('#fiche-prix').textContent = (produit.des && !r.aConfirmer ? 'dès ' : '') + PX.euros(r.total);
    $('#fiche-conf').hidden = !r.aConfirmer;
  }
  function ouvrirFiche(id) {
    produit = P.find((p) => p.id === id); if (!produit) return;
    choix = { format: 0, finition: 0 };
    focusAvant = document.activeElement;
    ficheVitrine.innerHTML = rendu(produit, true);
    let h = '<p class="etiquette">' + ({ tableaux: 'Tableau', albums: 'Album', tirages: 'Tirages et coffrets' })[produit.cat] + '</p><h3 id="fiche-titre">' + produit.nom + '</h3><div style="display:flex;gap:.6rem;align-items:baseline;flex-wrap:wrap"><b style="font-family:var(--f-titre);font-size:2.2rem;font-weight:340;font-variant-numeric:tabular-nums" id="fiche-prix"></b><span class="a-completer" id="fiche-conf" hidden>prix de ce choix à compléter</span></div>';
    if (produit.texte) h += '<p style="color:var(--fumee)">' + produit.texte + '</p>';
    if (produit.formats && produit.formats.length) h += '<div><span class="etiquette">' + (produit.cat === 'tableaux' ? 'Format' : 'Choix') + '</span><div class="puces-choix" style="margin-top:.5rem" data-groupe="format">' + produit.formats.map((f, i) => '<button type="button" data-v="' + i + '" aria-pressed="' + (i === 0) + '">' + f + '</button>').join('') + '</div></div>';
    if (produit.finitions && produit.finitions.length) h += '<div><span class="etiquette">Finition</span><div class="puces-choix" style="margin-top:.5rem" data-groupe="finition">' + produit.finitions.map((f, i) => '<button type="button" data-v="' + i + '" aria-pressed="' + (i === 0) + '">' + f + '</button>').join('') + '</div></div>';
    (produit.options || []).forEach((o, i) => { h += '<div class="compo__ligne"><label for="fo-' + i + '">' + o.nom + ' <span class="px">+' + PX.euros(o.prix) + '</span></label><span class="interrupteur"><input type="checkbox" id="fo-' + i + '" data-fo="' + i + '"><span></span></span></div>'; });
    if (produit.acompleter) h += '<p>' + produit.acompleter.map((a) => '<span class="a-completer">' + a + ' à compléter</span>').join(' ') + '</p>';
    h += '<ul class="liste-faits"><li>Retrait au home studio, contrôle qualité avant remise</li><li>Livraison à domicile : +' + PX.euros(produit.livraison) + '</li>' + (produit.prioritaire ? '<li>Traitement prioritaire : +' + PX.euros(produit.prioritaire) + '</li>' : '') + '<li>Personnalisation envoyée par e-mail après l’achat</li><li>Produit personnalisé : ni retour, ni échange, ni remboursement</li></ul>';
    h += '<div style="display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn" type="button" id="fiche-ajouter">Ajouter au panier</button>' + (produit.cat === 'tableaux' ? '<button class="btn btn--ligne" type="button" id="fiche-mur">Essayer au mur</button>' : '') + '</div>';
    ficheCorps.innerHTML = h;
    majFiche();
    fiche.hidden = false; if (PX.lenis) PX.lenis.stop(); libererFiche = PX.pieger(fiche);
    if (anime) { G.fromTo('.fiche__boite', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }); G.fromTo('#fiche-vitrine .rendu', { rotationY: -30, rotationX: 10, scale: 0.9 }, { rotationY: 0, rotationX: 0, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.6)' }); }
    $('#fiche-fermer').focus();
  }
  let libererFiche = null;
  function fermerFiche() { if (fiche.hidden) return; fiche.hidden = true; if (PX.lenis) PX.lenis.start(); if (libererFiche) { libererFiche(); libererFiche = null; } else if (focusAvant) focusAvant.focus(); }
  ficheCorps.addEventListener('click', (e) => {
    const b = e.target.closest('[data-groupe] button');
    if (b) { const g = b.parentElement.dataset.groupe; $$('button', b.parentElement).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); choix[g] = +b.dataset.v; majFiche(); return; }
    if (e.target.closest('#fiche-ajouter')) {
      const r = prixFiche();
      const details = [];
      if (produit.formats && produit.formats.length) details.push(produit.formats[choix.format]);
      if (produit.finitions && produit.finitions.length) details.push(produit.finitions[choix.finition]);
      (produit.options || []).forEach((o, i) => { if (choix['o' + i]) details.push(o.nom); });
      PX.panier.ajouter({ cle: produit.id + '|' + details.join('|'), id: produit.id, nom: produit.nom, detail: details.join(' · '), prix: r.total, img: photoDe[produit.id], aConfirmer: r.aConfirmer }, $('#fiche-vitrine .rendu') || e.target);
      fermerFiche();
      return;
    }
    if (e.target.closest('#fiche-mur')) {
      mur.support = produit.id; mur.format = choix.format; mur.finition = choix.finition; fermerFiche(); majMur(true); PX.allerA('#mur');
    }
  });
  ficheCorps.addEventListener('change', (e) => { if (e.target.dataset.fo !== undefined) { choix['o' + e.target.dataset.fo] = e.target.checked; majFiche(); } });
  $('#fiche-fermer').addEventListener('click', fermerFiche);
  fiche.addEventListener('click', (e) => { if (e.target === fiche) fermerFiche(); });
  document.addEventListener('keydown', (e) => { if (!fiche.hidden && e.key === 'Escape') fermerFiche(); });
  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fiche]'); if (f) { ouvrirFiche(f.dataset.fiche); return; }
    const a = e.target.closest('[data-ajouter]');
    if (a) { const p = P.find((x) => x.id === a.dataset.ajouter); if (besoinFiche(p)) ouvrirFiche(p.id); else PX.panier.ajouter({ cle: p.id, id: p.id, nom: p.nom, prix: p.prix, img: photoDe[p.id] }, a.closest('.produit').querySelector('.rendu') || a); }
  });

  /* ---------- Voir au mur ---------- */
  const pieces = [
    { id: 'salon', nom: 'Salon', img: 'grok-mur-salon-16x9', ar: 1168 / 784, wcm: 293.5, cx: 0.528, bas: 0.41, repere: 'Repère : canapé d’environ 2,10 m', mobile: { img: 'grok-mur-salon-9x16', ar: 784 / 1168, wcm: 175, cx: 0.5, bas: 0.61 } },
    { id: 'chambre', nom: 'Chambre', img: 'grok-mur-chambre', ar: 1168 / 784, wcm: 295, cx: 0.503, bas: 0.48, repere: 'Repère : tête de lit d’environ 1,70 m' },
    { id: 'bebe', nom: 'Chambre de bébé', img: 'grok-mur-chambre-bebe', ar: 1168 / 784, wcm: 256, cx: 0.497, bas: 0.377, repere: 'Repère : lit bébé d’environ 1,25 m' }
  ];
  const photosMur = ['mariage-couple-prairie', 'portrait-automne-04', 'naissance-parents-nb', 'animaux-berger-heure-doree', 'mariage-couple-chateau', 'grossesse-couple-couleur', 'bapteme-chaussons-chapelet', 'portrait-homme-verdure'];
  const supports = P.filter((p) => p.cat === 'tableaux');
  const caisses = { noire: '#1b1714', blanche: '#efeae2', chêne: '#b98b58', frêne: '#d9c6a6' };
  const mur = { piece: 'salon', photo: photosMur[0], support: 'toile', format: 2, finition: 0 };
  const piecesEl = $('#m-pieces'), photosEl = $('#m-photos'), supportsEl = $('#m-supports'), formatsEl = $('#m-formats'), finitionsEl = $('#m-finitions');
  piecesEl.innerHTML = pieces.map((p) => '<button type="button" data-piece="' + p.id + '">' + p.nom + '</button>').join('');
  photosEl.innerHTML = photosMur.map((k) => '<button type="button" data-photo="' + k + '" aria-label="' + PX.echapper(window.PX_IMG[k].alt) + '">' + PX.img(k, { w: 480, sizes: '90px', alt: '' }) + '</button>').join('');
  supportsEl.innerHTML = supports.map((s) => '<button type="button" data-support="' + s.id + '">' + s.nom.replace('Tableau sur ', '') + '</button>').join('');
  const cadre = $('#m-cadre'), pieceEl = $('#m-piece'), fond = $('#m-fond'), oeuvre = $('#m-oeuvre'), alerte = $('#m-alerte');
  function majMur(animer) {
    const s = supports.find((x) => x.id === mur.support);
    formatsEl.innerHTML = s.formats.map((f, i) => '<button type="button" data-format="' + i + '" aria-pressed="' + (i === mur.format) + '">' + f + '</button>').join('');
    finitionsEl.innerHTML = s.finitions.map((f, i) => '<button type="button" data-finition="' + i + '" aria-pressed="' + (i === mur.finition) + '">' + f.replace('Caisse américaine', 'Caisse') + '</button>').join('');
    $$('[data-piece]', piecesEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.piece === mur.piece)));
    $$('[data-photo]', photosEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.photo === mur.photo)));
    $$('[data-support]', supportsEl).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.support === mur.support)));
    let pc = pieces.find((p) => p.id === mur.piece);
    if (pc.mobile && window.matchMedia('(max-width: 640px)').matches) pc = Object.assign({}, pc, pc.mobile);
    pieceEl.style.aspectRatio = String(pc.ar);
    /* sur téléphone, l'aperçu tient dans la moitié de l'écran pour rester visible pendant les réglages */
    pieceEl.style.width = window.matchMedia('(max-width: 960px)').matches ? 'min(100%, calc(46svh * ' + pc.ar.toFixed(4) + '))' : '';
    const urlFond = PX.url(pc.img, 1168);
    if (fond.getAttribute('src') !== urlFond) fond.src = urlFond;
    if (oeuvre.dataset.k !== mur.photo) { oeuvre.innerHTML = PX.img(mur.photo, { w: 960, sizes: '40vw', alt: '' }); oeuvre.dataset.k = mur.photo; }
    const dims = s.formats[mur.format].match(/\d+/g).map(Number);
    const court = Math.min(dims[0], dims[1]), long = Math.max(dims[0], dims[1]);
    const paysage = PX.ar(mur.photo) >= 1;
    const wcm = paysage ? long : court, hcm = paysage ? court : long;
    const hauteurPiece = pc.wcm / pc.ar;
    const wp = wcm / pc.wcm * 100, hp = hcm / hauteurPiece * 100;
    cadre.style.width = wp + '%'; cadre.style.height = hp + '%';
    cadre.style.left = pc.cx * 100 + '%'; cadre.style.top = pc.bas * 100 + '%';
    cadre.dataset.support = mur.support;
    const fin = s.finitions[mur.finition] || '';
    const couleur = Object.keys(caisses).find((c) => fin.indexOf(c) > -1);
    const kpx = couleur ? 3.2 / pc.wcm * pieceEl.clientWidth : 0;
    cadre.style.setProperty('--k', kpx.toFixed(2) + 'px');
    cadre.style.setProperty('--caisse', couleur ? caisses[couleur] : 'transparent');
    $('#m-echelle').textContent = pieces.find((p) => p.id === mur.piece).repere + ' · tableau ' + wcm + ' × ' + hcm + ' cm';
    const trop = pc.bas * 100 - hp < 2 || wp > 96;
    alerte.hidden = !trop;
    if (trop) alerte.textContent = 'Ce format dépasse le mur visible : essayez une autre pièce ou un format plus petit.';
    $('#m-prix').textContent = 'dès ' + PX.euros(s.prix);
    if (animer && anime) G.fromTo(cadre.children, { y: -14 }, { y: 0, duration: 0.7, ease: 'back.out(2)', overwrite: 'auto' });
  }
  $('.mur__ctrl').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.piece) mur.piece = b.dataset.piece;
    else if (b.dataset.photo) mur.photo = b.dataset.photo;
    else if (b.dataset.support) { mur.support = b.dataset.support; mur.finition = 0; }
    else if (b.dataset.format !== undefined) mur.format = +b.dataset.format;
    else if (b.dataset.finition !== undefined) mur.finition = +b.dataset.finition;
    else if (b.id === 'm-ajouter') {
      const s = supports.find((x) => x.id === mur.support);
      const detail = s.formats[mur.format] + ' · ' + s.finitions[mur.finition] + ' · photo à choisir';
      PX.panier.ajouter({ cle: s.id + '|' + detail, id: s.id, nom: s.nom, detail, prix: s.prix, img: mur.photo, aConfirmer: true }, cadre);
      return;
    } else return;
    majMur(true);
  });
  pieceEl.addEventListener('pointermove', (e) => { const r = pieceEl.getBoundingClientRect(); cadre.style.setProperty('--angle', (100 + (e.clientX - r.left) / r.width * 40).toFixed(1) + 'deg'); });
  let tRes; window.addEventListener('resize', () => { clearTimeout(tRes); tRes = setTimeout(() => majMur(false), 150); });
  majMur(false);

  /* ---------- Carte cadeau ---------- */
  const ccMontants = $('#cc-montants'), ccVue = $('#cc-montant-vue'), ccLibre = $('#cc-libre'), ccAutre = $('#cc-autre');
  let montant = 50;
  ccMontants.innerHTML = D.carteCadeau.montants.map((m) => '<button type="button" data-m="' + m + '" aria-pressed="' + (m === montant) + '">' + m + ' €</button>').join('') + '<button type="button" data-m="autre" aria-pressed="false">Autre montant</button>';
  const majMontant = (v) => { const de = +ccVue.textContent || 0; montant = v; if (G) G.killTweensOf(ccVue); PX.compter(ccVue, v, { de, duree: 0.7 }); };
  ccMontants.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', ccMontants).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    ccLibre.hidden = b.dataset.m !== 'autre';
    majMontant(b.dataset.m === 'autre' ? Math.max(10, +ccAutre.value || 10) : +b.dataset.m);
  });
  ccAutre.addEventListener('input', () => { const v = Math.max(10, Math.round(+ccAutre.value || 0)); montant = v; if (G) G.killTweensOf(ccVue); ccVue.textContent = v; });
  ccAutre.addEventListener('change', () => { if ((+ccAutre.value || 0) < 10) { ccAutre.value = 10; PX.toast('Montant minimum : 10\u202f€'); } });
  $('#cc-pour').addEventListener('input', (e) => { $('#cc-pour-vue').textContent = e.target.value ? 'Pour ' + e.target.value : ''; });
  $('#cc-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pour = $('#cc-pour').value.trim(), de = $('#cc-de').value.trim();
    if (!ccLibre.hidden) { montant = Math.max(10, Math.round(+ccAutre.value || 0)); ccAutre.value = montant; if (G) G.killTweensOf(ccVue); ccVue.textContent = montant; }
    PX.panier.ajouter({ cle: 'cadeau|' + montant + '|' + pour + '|' + de, id: 'carte-cadeau', nom: 'Carte cadeau ' + PX.euros(montant), detail: [pour && 'Pour ' + pour, de && 'De ' + de].filter(Boolean).join(' · ') || 'Valable 1 an', prix: montant, img: 'grok-feuille-or' }, $('#cc-carte'));
  });
  const carteC = $('#cc-carte');
  const incliner = (x, y) => { carteC.style.setProperty('--ry', ((x - 0.5) * 22).toFixed(2) + 'deg'); carteC.style.setProperty('--rx', ((0.5 - y) * 16).toFixed(2) + 'deg'); carteC.style.setProperty('--mx', x * 100 + '%'); carteC.style.setProperty('--my', y * 100 + '%'); };
  if (anime) {
    const sc = carteC.parentElement;
    sc.addEventListener('pointermove', (e) => { const r = carteC.getBoundingClientRect(); incliner((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); });
    sc.addEventListener('pointerleave', () => incliner(0.5, 0.5));
  }

  /* ---------- Étal du héros ---------- */
  const etal = $('#etal');
  const pose = [
    ['toile', 'width:38%;left:4%;top:4%;--r:-5deg'],
    ['acrylique', 'width:52%;right:2%;top:10%;--r:4deg'],
    ['prestige', 'width:44%;left:20%;bottom:6%;--r:-2deg'],
    ['tirages', 'width:30%;right:8%;bottom:2%;--r:7deg']
  ];
  etal.innerHTML = pose.map((p) => '<div style="' + p[1] + ';display:grid;place-items:center;transform:rotate(var(--r))" class="etal__piece">' + rendu(P.find((x) => x.id === p[0]), true).replace('class="rendu ', 'style="width:100%" class="rendu ') + '</div>').join('');
  PX.pret.then(() => {
    if (anime) {
      G.from('.etal__piece', { y: -80, rotation: (i) => [-18, 14, -10, 20][i], autoAlpha: 0, duration: 1.3, stagger: 0.14, ease: 'back.out(1.4)' });
      $$('.etal__piece').forEach((el, i) => G.to(el, { yPercent: [-10, 6, -4, 12][i], ease: 'none', scrollTrigger: { trigger: '.b-hero', start: 'top top', end: 'bottom top', scrub: true } }));
    }
    PX.reveler();
  });
})();
