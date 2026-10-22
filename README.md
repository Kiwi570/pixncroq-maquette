# Pix’n Croq by Liz Leroy · maquette « Heure dorée »

Maquette statique (HTML, CSS, JavaScript, sans étape de construction), prête pour Vercel.

## Pages
- `index.html` : accueil (ouverture développée en WebGL, manifeste, salle des 11 séances, mini-séances, déroulé en diaphragme, zone et calcul des frais, Liz, avis, questions fréquentes, carte cadeau, réservation en 4 vues)
- `seances.html` : sommaire des 11 univers avec leurs tarifs d’appel
- `seances.html#mariage` : modèle unique pour les 11 univers (`#portraits`, `#anniversaire`, `#grossesse`, `#nouveau-ne`, `#grossesse-naissance`, `#boudoir`, `#mariage`, `#bapteme`, `#animaux`, `#restauration`, `#entreprises`)
- `boutique.html` : produits, fiche, voir au mur à l’échelle réelle, carte cadeau, panier simulé
- `mentions.html` : mentions légales reprises du site, éléments manquants signalés
- `404.html` : page introuvable

## Données
Toutes les données (univers, formules, prix, options, produits, communes) sont dans `assets/js/data.js`.
Les images et leurs réglages réels de prise de vue sont dans `assets/js/images.js`.

## Règles respectées
- Photos de Liz jamais recadrées dans la galerie, jamais filtrées ; les images générées ne montrent personne et sont signalées.
- Aucun envoi réel : formulaire, panier et paiement sont simulés.
- Mode calme (bouton dans l’en-tête) et respect de « réduire les animations ».
- Bouton « Masquer les notes de maquette » en pied de page pour montrer le site à Liz sans les repères « à compléter ».

## Version 2 (audit)
Polices en WOFF2, cache Vercel corrigé, ouverture plus courte, contrastes renforcés, galerie accessible au clavier, menu et fenêtres qui gardent le focus, barre de réservation sur téléphone, visionneuse qui montre la photo entière, aperçu « voir au mur » corrigé, boutique allégée, sommaire des séances, questions fréquentes, image de partage et page 404.
