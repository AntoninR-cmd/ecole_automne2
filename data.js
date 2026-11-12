/*
 * Données de l'École d'automne Data Science — modifiez ce fichier pour mettre à jour le site.
 *
 * Dates : format ISO avec décalage horaire, par ex. '2026-11-26'.
 * Horaires : 'HH:MM' (heure de Paris).
 * Laisser null ce qui n'est pas confirmé : le site affiche alors « À confirmer ».
 * Les identifiants (id) servent aux favoris : ne pas les changer une fois le site publié.
 */
window.AUTUMN = {
  event: {
    edition: 4,
    year: 2026,
    date: '2026-11-20',
    start: '13:30',
    end: '16:30',
    room: { fr: 'Salle D4', en: 'Room D4' },
    building: { fr: 'Bâtiment 24', en: 'Building 24' },
    site: 'Institut Agro Rennes',
    address: '65 rue de Saint-Brieuc, 35000 Rennes',
    lat: 48.11349,
    lng: -1.70613,
    contact: null          // ex. 'ecole-automne@exemple.fr'
  },

  // Catégories du filtre thématique
  themes: {
    sante:         { fr: 'Santé',         en: 'Health' },
    environnement: { fr: 'Environnement', en: 'Environment' },
    agronomie:     { fr: 'Agronomie',     en: 'Agronomy' },
    chimie:        { fr: 'Chimie',        en: 'Chemistry' }
  },

  // shape : forme du nuage de points 3D associée à la conférence
  // (molecule, knee, bacteria, flame, fracture, seed, spectrogram, vessels)
  talks: [
    {
      id: 'spectre-masse',
      shape: 'molecule',
      theme: 'chimie',
      method: { fr: 'Spectrométrie de masse', en: 'Mass spectrometry' },
      title: {
        fr: 'Identifier des molécules inconnues à partir de leur spectre de masse : une approche par apprentissage automatique',
        en: 'Identifying unknown molecules from their mass spectra: a machine learning approach'
      },
      speakers: ['Fanny', 'Antonin', 'Inès'],
      summary: { fr: null, en: null },
      start: '13:30', end: '13:50'
    },
    {
      id: 'genou-coureur',
      shape: 'knee',
      theme: 'sante',
      method: { fr: 'Médecine du sport', en: 'Sports medicine' },
      title: {
        fr: 'Identification des blessures du genou les plus fréquentes chez le coureur',
        en: 'Identifying the most common knee injuries in runners'
      },
      speakers: ['Youri', 'Lilou', 'Charles'],
      summary: { fr: null, en: null },
      start: '13:50', end: '14:10'
    },
    {
      id: 'antibioresistance',
      shape: 'bacteria',
      theme: 'sante',
      method: { fr: 'Microbiologie', en: 'Microbiology' },
      title: {
        fr: 'Prédiction de la résistance aux antibiotiques',
        en: 'Predicting antibiotic resistance'
      },
      speakers: ['Baptiste', 'Alexandre', 'Benjamin'],
      summary: { fr: null, en: null },
      start: '14:10', end: '14:30'
    },
    {
      id: 'departs-de-feu',
      shape: 'flame',
      theme: 'environnement',
      method: { fr: 'Données hétérogènes', en: 'Heterogeneous data' },
      title: {
        fr: 'Comment croiser des données hétérogènes pour anticiper les départs de feu ?',
        en: 'How can heterogeneous data be combined to anticipate wildfire outbreaks?'
      },
      speakers: ['Jules', 'Pierre'],
      summary: { fr: null, en: null },
      start: '14:30', end: '14:50'
    },
    {
      id: 'fractures-yolo',
      shape: 'fracture',
      theme: 'sante',
      method: { fr: 'Vision par ordinateur · YOLO', en: 'Computer vision · YOLO' },
      title: {
        fr: 'Détection et localisation automatiques des fractures sur clichés radiographiques par approche YOLO',
        en: 'Automatic detection and localisation of fractures on X-ray images with a YOLO approach'
      },
      speakers: ['Chiara', 'Anatole', 'Augustin C.'],
      summary: { fr: null, en: null },
      start: '14:50', end: '15:10'
    },
    {
      id: 'graines',
      shape: 'seed',
      theme: 'agronomie',
      method: { fr: 'Vision par ordinateur', en: 'Computer vision' },
      title: {
        fr: 'Reconnaissance d’images de graines : jusqu’où un modèle peut-il généraliser ?',
        en: 'Seed image recognition: how far can a model generalise?'
      },
      speakers: ['Anton', 'Edgar', 'Augustin B.'],
      summary: { fr: null, en: null },
      start: '15:10', end: '15:30'
    },
    {
      id: 'chants-oiseaux',
      shape: 'spectrogram',
      theme: 'environnement',
      method: { fr: 'Traitement du signal audio', en: 'Audio signal processing' },
      title: {
        fr: 'Détection automatique de chants d’oiseaux dans des enregistrements audio',
        en: 'Automatic detection of birdsong in audio recordings'
      },
      speakers: ['Tao', 'Quentin', 'Clement'],
      summary: { fr: null, en: null },
      start: '15:30', end: '15:50'
    },
    {
      id: 'liver-wars',
      shape: 'vessels',
      theme: 'sante',
      method: { fr: 'Imagerie médicale', en: 'Medical imaging' },
      title: {
        fr: 'Liver Wars : à la recherche des vaisseaux perdus',
        en: 'Liver Wars: raiders of the lost vessels'
      },
      speakers: ['Hodé', 'Satine', 'Camille'],
      summary: { fr: null, en: null },
      start: '15:50', end: '16:10'
    }
  ]
};
