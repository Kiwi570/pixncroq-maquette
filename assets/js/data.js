/* Pix'n Croq by Liz Leroy : toutes les données de la maquette dans un seul fichier.
   Textes, prix et options repris du site actuel (pixncroqbylizleroy.com, relevé du 20 octobre 2026).
   Ce qui n'existe pas sur le site est marqué acompleter: true et s'affiche « à compléter ». */
window.PX_DATA = {
  contact: {
    nom: "Pix’n Croq by Liz Leroy",
    photographe: "Liz Leroy",
    telephone: "06 47 52 32 37",
    email: "croqnpix@gmail.com",
    adresse: "9 rue de Fontigny, 54870 Ugny",
    ville: "Ugny, près de Longwy (54)",
    siret: "988 136 925 00019",
    statut: "Entreprise individuelle (EI)",
    instagram: "https://www.instagram.com/pix.n.croq_/",
    facebook: "https://www.facebook.com/share/195W3ZWMXJ/",
    tiktok: "https://www.tiktok.com/@pix.n.croq_",
    avisGoogle: "https://g.page/r/CSLnjXo36XrMEAE/review"
  },

  deplacement: { inclusKm: 15, prixKm: 0.5 },

  /* Communes proches : coordonnées publiques, distance calculée à vol d'oiseau depuis Ugny. */
  origine: { nom: "Ugny", lat: 49.4714, lon: 5.6986 },
  villes: [
    { nom: "Cons-la-Grandville", lat: 49.4839, lon: 5.6997 },
    { nom: "Longuyon", lat: 49.4428, lon: 5.6050 },
    { nom: "Longwy", lat: 49.5197, lon: 5.7667 },
    { nom: "Mont-Saint-Martin", lat: 49.5419, lon: 5.7814 },
    { nom: "Villerupt", lat: 49.4672, lon: 5.9289 },
    { nom: "Audun-le-Tiche", lat: 49.4722, lon: 5.9553 },
    { nom: "Esch-sur-Alzette (LU)", lat: 49.4958, lon: 5.9806 },
    { nom: "Virton (BE)", lat: 49.5675, lon: 5.5325 },
    { nom: "Arlon (BE)", lat: 49.6833, lon: 5.8167 },
    { nom: "Montmédy", lat: 49.5208, lon: 5.3683 },
    { nom: "Audun-le-Roman", lat: 49.3692, lon: 5.8933 },
    { nom: "Val de Briey", lat: 49.2494, lon: 5.9392 },
    { nom: "Luxembourg (LU)", lat: 49.6116, lon: 6.1319 },
    { nom: "Thionville", lat: 49.3579, lon: 6.1683 },
    { nom: "Verdun", lat: 49.1597, lon: 5.3844 },
    { nom: "Metz", lat: 49.1193, lon: 6.1757 }
  ],

  /* Les 11 univers de séance, dans l'ordre du site actuel. */
  univers: [
    {
      id: "portraits", nom: "Portraits", groupe: "Portraits",
      accroche: "Solo, duo, en famille ou entre amis",
      texte: "Une séance personnalisée, en intérieur, en extérieur ou les deux selon la formule choisie.",
      inclus: ["Jusqu’à 4 personnes", "1 lieu : intérieur ou extérieur", "Impressions de la séance en 10x15"],
      photos: ["portrait-automne-04", "portrait-homme-verdure", "portrait-automne-02", "portrait-homme-mur-pierre", "portrait-automne-01", "portrait-clair-obscur", "portrait-automne-03", "portrait-homme-mur-pierre-nb"],
      formules: [
        { nom: "Essentielle", prix: 80, photos: 3, lieu: "En extérieur ou intérieur" },
        { nom: "Signature", prix: 110, photos: 5, lieu: "En extérieur ou intérieur" },
        { nom: "Exception", prix: 150, photos: 10, lieu: "En extérieur et intérieur" }
      ],
      options: [
        { id: "personne", nom: "Personne supplémentaire", prix: 50, qte: true },
        { id: "photo", nom: "Photo supplémentaire", prix: 13, qte: true }
      ]
    },
    {
      id: "anniversaire", nom: "Anniversaire", groupe: "Portraits",
      accroche: "De 1 à 3 ans, voire plus",
      texte: "Une séance pleine de douceur pour immortaliser une nouvelle année. Décor personnalisé, jolies photos et, pour la formule complète, un adorable moment smash cake à partager et à savourer !",
      inclus: ["Décor personnalisé", "Impressions de la séance en 10x15"],
      photos: [], ambiance: "grok-anniversaire-confettis",
      formules: [
        { nom: "Mini", prix: 90, photos: 3, lieu: "En extérieur ou intérieur" },
        { nom: "Happy", prix: 130, photos: 5, lieu: "En extérieur ou intérieur" },
        { nom: "Smash cake", prix: 190, photos: 10, lieu: "En extérieur ou intérieur", plus: ["Smash cake"] }
      ],
      options: [
        { id: "smash", nom: "Smash cake", prix: 60 },
        { id: "photo", nom: "Photo supplémentaire", prix: 13, qte: true }
      ]
    },
    {
      id: "grossesse", nom: "Grossesse", groupe: "Portraits",
      accroche: "Immortalisez votre grossesse, un souvenir précieux",
      texte: "Immortalisez la douceur de votre grossesse, votre ventre rond et les premiers liens avec votre bébé, lors d’une séance naturelle et pleine d’émotions, seule, en couple ou en famille.",
      inclus: ["Seule, en couple ou en famille", "Impressions de la séance en 10x15"],
      photos: ["grossesse-couple-couleur", "grossesse-couple-nb", "grossesse-ventre-nb"],
      formules: [
        { nom: "Douceur", prix: 160, photos: 5, lieu: "En extérieur ou intérieur" },
        { nom: "Émotion", prix: 230, photos: 10, lieu: "En extérieur ou intérieur" },
        { nom: "Héritage", prix: 310, photos: 15, lieu: "En extérieur et intérieur" }
      ],
      options: [{ id: "photo", nom: "Photo supplémentaire", prix: 13, qte: true }]
    },
    {
      id: "nouveau-ne", nom: "Nouveau-né", groupe: "Portraits",
      accroche: "Capturez les premiers instants de bébé et ses petits détails",
      texte: "Immortalisez la douceur de votre nouveau-né, ses petits détails et ses premiers jours de vie à travers une séance, pour conserver à jamais ces précieux souvenirs.",
      inclus: ["Séance en intérieur", "Impression de la séance en 10x15"],
      photos: ["naissance-parents-nb", "naissance-bras-papa", "naissance-baillement-nb", "naissance-bras-papa-nb"],
      formules: [
        { nom: "Éveil", prix: 160, photos: 5, lieu: "En intérieur" },
        { nom: "Câlin", prix: 230, photos: 10, lieu: "En intérieur" },
        { nom: "Trésor", prix: 310, photos: 15, lieu: "En intérieur" }
      ],
      options: [{ id: "photo", nom: "Photo supplémentaire", prix: 13, qte: true }]
    },
    {
      id: "grossesse-naissance", nom: "Grossesse + nouveau-né", groupe: "Portraits",
      accroche: "De l’attente aux premiers instants",
      texte: "Immortalisez votre histoire, de la douceur de votre grossesse aux premiers jours de votre bébé. Deux séances complémentaires pour préserver ces souvenirs précieux et raconter les débuts de votre vie ensemble.",
      inclus: ["1 séance grossesse", "1 séance nouveau-né", "Impression de la séance en 10x15 au total"],
      photos: ["grossesse-couple-nb", "naissance-parents-nb", "grossesse-ventre-nb", "naissance-baillement-nb"],
      formules: [
        { nom: "Amour", prix: 300, photos: 10, lieu: "En extérieur ou intérieur", note: "au total" },
        { nom: "Bonheur", prix: 440, photos: 20, lieu: "En extérieur ou intérieur", note: "au total" },
        { nom: "Merveille", prix: 620, photos: 30, lieu: "En extérieur ou intérieur", note: "au total" }
      ],
      options: [{ id: "photo", nom: "Photo supplémentaire", prix: 13, qte: true }]
    },
    {
      id: "boudoir", nom: "Boudoir", groupe: "Portraits",
      accroche: "Une parenthèse rien qu’à vous, pour révéler votre beauté et votre confiance",
      texte: "Une séance boudoir douce et élégante, en solo ou en duo, pour révéler votre beauté, votre confiance et votre personnalité à travers des images qui vous ressemblent.",
      inclus: ["En solo ou en duo", "À votre domicile ou dans un Airbnb (en option)", "Impressions de la séance en 10x15"],
      photos: [], ambiance: "grok-boudoir-drap-soie",
      formules: [
        { nom: "Charme", prix: 130, photos: 5, lieu: "À votre domicile ou dans un Airbnb (en option)" },
        { nom: "Désir", prix: 170, photos: 10, lieu: "À votre domicile ou dans un Airbnb (en option)" },
        { nom: "Passion", prix: 210, photos: 15, lieu: "À votre domicile ou dans un Airbnb (en option)" }
      ],
      options: [
        { id: "airbnb", nom: "Lieu Airbnb", choix: [{ nom: "Aucun (à votre domicile)", prix: 0 }, { nom: "Écrin de douceur", prix: 110 }, { nom: "Passion rouge", prix: 130 }, { nom: "Prestige", prix: 210 }] },
        { id: "personne", nom: "Personne supplémentaire", prix: 50, qte: true },
        { id: "photo", nom: "Photo supplémentaire", prix: 13, qte: true }
      ]
    },
    {
      id: "mariage", nom: "Mariage", groupe: "Cérémonies",
      accroche: "Le début d’une histoire",
      texte: "Immortalisez votre mariage à travers des images naturelles, authentiques et remplies d’émotion. Des préparatifs à l’échange des vœux, jusqu’aux instants de joie partagés avec vos proches, chaque moment de cette journée unique mérite de traverser le temps.",
      inclus: ["Galerie en ligne HD", "Clé USB en bois gravée"],
      photos: ["mariage-couple-prairie", "mariage-couple-chateau", "mariage-course-invites", "mariage-alliances", "mariage-baiser-bouquet-nb", "mariage-porte-chateau", "mariage-noeud-papillon-nb", "mariage-details-nb"],
      etapes: ["Préparatifs", "Cérémonie", "Couple & groupe", "Vin d’honneur", "Pièce montée"],
      formules: [
        { nom: "Jack & Rose", prix: 600, couvre: [1, 2], liste: ["Cérémonie civile ou religieuse", "Photos de couple & groupe", "Galerie en ligne HD", "Clé USB en bois gravée"] },
        { nom: "Roméo & Juliette", prix: 900, couvre: [0, 1, 2, 3], liste: ["Préparatifs de la mariée ou du marié", "Cérémonie civile ou religieuse", "Reportage jusqu’au vin d’honneur", "Photos de couple & groupe", "Galerie en ligne HD", "Clé USB en bois gravée"] },
        { nom: "Bonnie & Clyde", prix: 1200, couvre: [0, 1, 2, 3, 4], liste: ["Préparatifs de la mariée ou du marié", "Cérémonie civile et/ou religieuse", "Reportage jusqu’à la pièce montée", "Photos de couple & groupe", "Galerie en ligne HD", "Clé USB en bois gravée", "Album photo imprimé 21x15 cm"] }
      ],
      options: [
        { id: "engagement", nom: "Séance engagement", prix: 100 },
        { id: "couple", nom: "Séance couple après mariage", prix: 150 },
        { id: "vin", nom: "Reportage vin d’honneur – pièce montée", prix: 300 },
        { id: "heure", nom: "Heure supplémentaire", prix: 80, qte: true },
        { id: "photo", nom: "Photo supplémentaire", prix: 13, qte: true }
      ]
    },
    {
      id: "bapteme", nom: "Baptême", groupe: "Cérémonies",
      accroche: "Un jour précieux, des souvenirs précieux",
      texte: "Immortalisez le baptême de votre enfant ou le vôtre à travers des images pleines d’émotion et d’authenticité. Des moments de partage avec vos proches, chaque instant mérite d’être conservé pour revivre cette belle journée au fil des années.",
      inclus: ["Clé USB en bois gravée", "Galerie en ligne HD"],
      photos: ["bapteme-chaussons-chapelet", "bapteme-robes"],
      etapes: ["Cérémonie", "Groupe & famille", "Coffret de tirages"],
      formules: [
        { nom: "Première Lumière", prix: 290, couvre: [0, 1], liste: ["Reportage cérémonie (église)", "Photos de groupe, individuelles, en famille…", "Clé USB en bois gravée + galerie en ligne HD"] },
        { nom: "Jour Sacré", prix: 390, couvre: [0, 1, 2], liste: ["Reportage cérémonie (église)", "Photos de groupe, individuelles, en famille…", "Clé USB en bois gravée + galerie en ligne HD", "Coffret en bois gravé avec 60/70 tirages en 10x15 cm"] }
      ],
      options: [
        { id: "famille", nom: "Séance famille après baptême", prix: 100 },
        { id: "journee", nom: "Reportage journée (apéritif, repas…)", prix: 250 },
        { id: "heure", nom: "Heure supplémentaire", prix: 80, qte: true },
        { id: "photo", nom: "Photo supplémentaire", prix: 13, qte: true }
      ]
    },
    {
      id: "animaux", nom: "Animaux", groupe: "Animaux",
      accroche: "Immortalisons les liens qui vous unissent",
      texte: "Une séance personnalisée, en intérieur, en extérieur ou les deux selon la formule choisie, pour garder une trace de leur personnalité, de leur douceur et de tous ces petits moments qui vous rendent inséparables.",
      inclus: ["Jusqu’à 4 animaux", "1 lieu : intérieur ou extérieur", "Impressions de la séance en 10x15"],
      photos: ["animaux-berger-heure-doree", "animaux-beagle-automne", "animaux-berger-prairie", "animaux-beagle-allonge"],
      formules: [
        { nom: "Patounes", prix: 80, photos: 3, lieu: "En extérieur ou intérieur" },
        { nom: "Canaille", prix: 110, photos: 5, lieu: "En extérieur ou intérieur" },
        { nom: "Poilue", prix: 150, photos: 10, lieu: "En extérieur et intérieur" }
      ],
      options: [
        { id: "animal", nom: "Animal supplémentaire", prix: 50, qte: true },
        { id: "photo", nom: "Photo supplémentaire", prix: 13, qte: true },
        { id: "artistique", nom: "Touche artistique (paillettes ou poudre colorée)", prix: 30 }
      ]
    },
    {
      id: "restauration", nom: "Restauration de photos", groupe: "Restauration",
      accroche: "Vos souvenirs méritent de traverser le temps",
      texte: "Redonnez une nouvelle vie à vos photos anciennes, abîmées ou oubliées. Il s’agit d’une restauration visuelle, pas d’une re-création complète : l’objectif est de sublimer l’existant, pas de réinventer l’image.",
      inclus: ["Correction des couleurs (déjaunissement, équilibre des tons)", "Suppression de poussières, taches, plis ou rayures", "Reconstitution de petites zones manquantes", "Amélioration globale de la netteté et du contraste"],
      note: "Certaines dégradations trop importantes ou parties totalement effacées ne peuvent pas être récupérées avec précision. La photo doit être en état d’être scannée ou fournie en haute définition.",
      photos: [], ambiance: "grok-restauration-tirages-anciens", parPhoto: 25,
      formules: [{ nom: "Restauration", prix: 25, unite: "par photo" }],
      options: []
    },
    {
      id: "entreprises", nom: "Entreprises & projets", groupe: "Sur mesure",
      accroche: "Mettons en lumière ce qui vous rend unique",
      texte: "Vous êtes un professionnel et souhaitez mettre en valeur votre entreprise, vos collaborateurs ou faire couvrir un événement ? Vous êtes une association ou une commune et recherchez une photographe pour un reportage ? Vous avez un projet personnel en tête, comme une séance automobile ou un gender reveal ? Chaque demande étant unique, les prestations sont réalisées sur devis personnalisé.",
      inclus: ["Portraits professionnels", "Mise en valeur du savoir-faire", "Reportage d’événement", "Séance automobile, gender reveal et autres envies"],
      photos: ["pro-portrait-costume"], ambiance: "grok-atelier-savoir-faire", devis: true,
      formules: [],
      options: []
    }
  ],

  /* Boutique : prix et descriptions du site actuel. */
  produits: [
    { id: "toile", cat: "tableaux", nom: "Tableau sur toile", prix: 80, des: true, rendu: "toile",
      texte: "Un rendu doux et chaleureux, toile tendue à la main sur châssis bois d’environ 2 cm, bords imprimés, prête à accrocher.",
      formats: ["20 × 30 cm", "30 × 40 cm", "40 × 60 cm", "60 × 80 cm", "80 × 120 cm"],
      finitions: ["Suspension professionnelle", "Caisse américaine noire", "Caisse américaine blanche", "Caisse américaine chêne", "Caisse américaine frêne"],
      livraison: 25, prioritaire: 20, prixFormats: false },
    { id: "alu", cat: "tableaux", nom: "Tableau sur aluminium", prix: 90, des: true, rendu: "alu",
      texte: "Un rendu contemporain aux couleurs nettes, rigide et fin, avec profilé aluminium et système de suspension.",
      formats: ["20 × 30 cm", "30 × 40 cm", "40 × 60 cm", "60 × 80 cm", "80 × 120 cm"],
      finitions: ["Profilé aluminium", "Caisse américaine noire", "Caisse américaine blanche", "Caisse américaine chêne", "Caisse américaine frêne"],
      livraison: 25, prioritaire: 20, prixFormats: false },
    { id: "acrylique", cat: "tableaux", nom: "Tableau sur verre acrylique", prix: 140, des: true, rendu: "acrylique",
      texte: "Un rendu brillant et lumineux qui donne de la profondeur aux couleurs et met en valeur les détails.",
      formats: ["20 × 30 cm", "30 × 40 cm", "40 × 60 cm", "60 × 80 cm", "80 × 120 cm"],
      finitions: ["Suspension professionnelle", "Caisse américaine noire", "Caisse américaine blanche", "Caisse américaine chêne", "Caisse américaine frêne"],
      livraison: 25, prioritaire: 20, prixFormats: false },
    { id: "prestige", cat: "albums", nom: "Collection Albums Prestige", prix: 160, des: true, rendu: "album",
      texte: "Album Professional Line, 26 pages en papier mat, couverture rigide, personnalisable selon le modèle.",
      options: [{ nom: "Coffret simili-cuir ou lin naturel", prix: 50 }, { nom: "Coffret avec verre acrylique", prix: 80 }],
      formats: [], acompleter: ["Dimensions disponibles"], livraison: 20 },
    { id: "album-28", cat: "albums", nom: "Album 28 × 28 cm", prix: 115, rendu: "album", carre: true,
      texte: "Album carré grand format, 26 pages en papier mat, couverture rigide.",
      options: [{ nom: "Écriture or, or rose ou argent (couverture mate ou brillante)", prix: 20 }, { nom: "Coffret cadeau", prix: 75 }, { nom: "Coffret cadeau verre acrylique", prix: 130 }],
      livraison: 20 },
    { id: "album-21x28", cat: "albums", nom: "Album 21 × 28 cm", prix: 105, rendu: "album", acompleter: ["Détails et options"], livraison: 20 },
    { id: "album-21x15", cat: "albums", nom: "Album 21 × 15 cm", prix: 90, rendu: "album", acompleter: ["Détails et options"], livraison: 20 },
    { id: "album-19", cat: "albums", nom: "Album 19 × 19 cm", prix: 85, rendu: "album", carre: true, acompleter: ["Détails et options"], livraison: 20 },
    { id: "album-15", cat: "albums", nom: "Album 15 × 15 cm", prix: 75, rendu: "album", carre: true, acompleter: ["Détails et options"], livraison: 20 },
    { id: "coffret", cat: "tirages", nom: "Coffret artisanal en bois rustique 10 × 15 cm", prix: 50, rendu: "coffret",
      texte: "Bois rustique foncé, mousse protectrice et ficelle naturelle pour vos tirages 10x15. Gravure des prénoms, d’une date ou d’un petit message.",
      formats: ["Boîte seule", "Boîte + clé USB 16 Go", "Boîte + clé USB 32 Go", "Boîte + clé USB 64 Go"],
      acompleter: ["Prix des options clé USB et gravure"], livraison: 10 },
    { id: "tirages", cat: "tirages", nom: "Lot de tirages photos", prix: 20, des: true, rendu: "tirages",
      texte: "5 ou 10 tirages au format de votre choix sur papier de qualité supérieure, marge blanche ou noire offerte.",
      formats: ["Lot de 5", "Lot de 10"], acompleter: ["Formats et prix par lot"], livraison: 20, prioritaire: 10 },
    { id: "tirages-enveloppe", cat: "tirages", nom: "Lot de tirages avec enveloppe simili cuir", prix: 30, rendu: "enveloppe",
      acompleter: ["Détails du produit"], livraison: 20 }
  ],

  carteCadeau: { montants: [25, 50, 100, 150, 200], validite: "Valable 1 an à compter de la date d’achat" },

  avis: [
    { nom: "Célia", texte: "J’ai eu la chance de faire un shooting photo avec mes grands-parents et ça a été un moment vraiment magique. On a passé un super moment tous ensemble. Les photos sont magnifiques, naturelles et pleines de souvenirs précieux. Un immense merci pour ce beau travail, ces images resteront gravées pour toujours." }
  ]
};
