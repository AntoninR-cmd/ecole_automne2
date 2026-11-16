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
      summary: {
        fr: 'Identifier une molécule à partir de son spectre de masse est un défi central de la métabolomique : dans un extrait biologique, une grande partie des composés détectés reste inconnue. Dans le cadre de la compétition Kaggle Enveda CASMI 2026, notre projet cherche à prédire la structure chimique d’une molécule à partir de ses spectres MS/MS, c’est-à-dire de la liste des fragments obtenus en la cassant. Toute la difficulté vient du fait que les molécules à identifier sont absentes des données d’apprentissage : un modèle qui reconnaît seulement les molécules déjà vues ne peut donc pas les trouver. Notre approche consiste à apprendre à décrire la molécule par les motifs chimiques qu’elle contient, puis à rechercher, parmi des structures connues de même masse, celles qui correspondent le mieux à cette description.',
        en: 'Identifying a molecule from its mass spectrum is a central challenge in metabolomics: in a biological extract, a large share of the detected compounds remains unknown. As part of the Kaggle Enveda CASMI 2026 competition, our project aims to predict the chemical structure of a molecule from its MS/MS spectra, that is, the list of fragments obtained by breaking it apart. The main difficulty is that the molecules to be identified are absent from the training data: a model that only recognises molecules it has already seen cannot find them. Our approach is to learn to describe a molecule by the chemical motifs it contains, then to search among known structures of the same mass for those that best match this description.'
      },
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
      summary: {
        fr: 'La foulée trahit-elle un genou blessé ? Détecter les blessures du coureur par apprentissage automatique.\n\nLe genou est l’articulation la plus touchée chez le coureur. Ses deux blessures les plus fréquentes, le syndrome fémoro-patellaire (douleur autour de la rotule) et le syndrome de la bandelette ilio-tibiale (douleur sur la face externe du genou), sont des blessures de surutilisation. La douleur siège au genou, mais une partie de leur origine se trouve à la hanche et au bassin, pendant la phase d’appui.\n\nNous nous sommes demandé si la façon de courir suffit à reconnaître un coureur blessé. Nous avons travaillé sur 587 coureurs filmés en capture de mouvement sur tapis par la Running Injury Clinic de Calgary. Nous avons comparé des modèles d’apprentissage automatique classiques (régression logistique, forêt aléatoire) et des réseaux de neurones, puis regardé sur quelles articulations et quels moments de l’appui ils fondent leurs décisions.',
        en: 'Does a runner’s stride give away an injured knee? Detecting running injuries with machine learning.\n\nThe knee is the joint most often injured in runners. Its two most common injuries, patellofemoral pain syndrome (pain around the kneecap) and iliotibial band syndrome (pain on the outer side of the knee), are overuse injuries. The pain is felt in the knee, but part of their cause lies in the hip and pelvis during the stance phase.\n\nWe asked whether the way someone runs is enough to recognise an injured runner. We worked with 587 runners recorded with treadmill motion capture by the Running Injury Clinic in Calgary. We compared classical machine learning models (logistic regression, random forest) with neural networks, then looked at which joints and which moments of the stance phase they rely on to make their decisions.'
      },
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
      summary: {
        fr: 'La résistance aux antibiotiques progresse, et E. coli est l’une des bactéries pathogènes les plus concernées. Notre projet cherche à prédire, à partir du seul génome d’une souche, si elle est résistante ou sensible à un antibiotique. Chaque génome est décrit par la présence ou l’absence d’environ 20 000 gènes et par près de 200 mutations connues. Nous partons de la ciprofloxacine, étudiée en détail, puis étendons la démarche à d’autres antibiotiques.\n\nNous comparons des modèles d’apprentissage automatique (régression logistique, Lasso, forêt aléatoire, XGBoost) à un réseau de neurones. Au-delà du score, nous voulons un modèle interprétable et évalué honnêtement : les souches d’une même lignée, presque identiques, restent dans le même jeu de données, pour que le modèle apprenne la résistance au lieu de reconnaître des clones, et nous vérifions que les variables qu’il retient ont un sens biologique.',
        en: 'Antibiotic resistance is on the rise, and E. coli is one of the pathogenic bacteria most affected. Our project aims to predict, from a strain’s genome alone, whether it is resistant or susceptible to an antibiotic. Each genome is described by the presence or absence of about 20,000 genes and by nearly 200 known mutations. We start with ciprofloxacin, studied in detail, then extend the approach to other antibiotics.\n\nWe compare machine learning models (logistic regression, Lasso, random forest, XGBoost) with a neural network. Beyond the score, we want a model that is interpretable and honestly evaluated: strains from the same lineage, which are almost identical, are kept in the same dataset so that the model learns resistance rather than recognising clones, and we check that the variables it relies on make biological sense.'
      },
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
      summary: {
        fr: 'Ce projet est avant tout méthodologique : il vise à comprendre et expliquer comment faire de la détection d’objets sur des images, en prenant YOLO comme exemple et un jeu de radiographies de fractures du poignet comme cas d’illustration.\n\nNotre démarche s’articule d’abord autour de l’analyse des données d’entrée et de la maîtrise de l’architecture des modèles YOLO. Nous cherchons ensuite à optimiser les performances du modèle en faisant varier les hyper paramètres clefs.',
        en: 'This project is above all methodological: it aims to understand and explain how to perform object detection on images, using YOLO as an example and a dataset of wrist fracture X-rays as an illustrative case.\n\nOur approach starts with analysing the input data and getting to grips with the architecture of YOLO models. We then seek to optimise the model’s performance by varying its key hyperparameters.'
      },
      start: '14:50', end: '15:10'
    },
    {
      id: 'graines',
      shape: 'seed',
      theme: 'agronomie',
      method: { fr: 'Vision par ordinateur · VGG19', en: 'Computer vision · VGG19' },
      title: {
        fr: 'Reconnaissance d’images de graines : jusqu’où un modèle peut-il généraliser ?',
        en: 'Seed image recognition: how far can a model generalise?'
      },
      speakers: ['Anton', 'Edgar', 'Augustin B.'],
      summary: {
        fr: 'En archéobotanique, identifier les graines retrouvées sur les sites de fouille est long et demande une grande expertise. Les réseaux de neurones convolutifs reconnaissent très bien des images proches de celles qu’ils ont vues à l’entraînement, mais les graines archéologiques diffèrent souvent des collections de référence : carbonisées, fragmentées, photographiées dans d’autres conditions. Notre projet mesure comment les performances de prédiction d’un tel modèle évoluent à mesure que les images à classer s’éloignent de ses données d’entraînement, afin de savoir jusqu’où il reste fiable.',
        en: 'In archaeobotany, identifying the seeds recovered from excavation sites is slow work that requires considerable expertise. Convolutional neural networks are very good at recognising images close to those they saw during training, but archaeological seeds often differ from reference collections: charred, fragmented, photographed under different conditions. Our project measures how the predictive performance of such a model changes as the images to be classified move further away from its training data, in order to find out how far it remains reliable.'
      },
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
      summary: {
        fr: 'Notre projet porte sur le traitement de données audio, à travers la classification d’enregistrements audio portant sur la présence ou non de chants d’oiseaux. Nous allons donc montrer comment transformer des enregistrements audio en tableau de données classiques contenant des descripteurs auditifs et pouvoir traiter ces données via des méthodes classiques, régression logistique, SVM, forêts aléatoires, méthodes de boosting…',
        en: 'Our project deals with audio data processing, through the classification of audio recordings according to whether or not they contain birdsong. We will show how to turn audio recordings into a classic data table of auditory descriptors, and how to process these data with classical methods: logistic regression, SVM, random forests, boosting methods…'
      },
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
      summary: {
        fr: 'LIVERWARS, à la recherche des vaisseaux perdus.\nQuel modèle d’intelligence artificielle permet de détecter et localiser un vaisseau sanguin dans un élastogramme hépatique ? En collaboration avec  Echosens, notre projet explore l’apprentissage profond supervisé pour affirmer la présence de vaisseaux et estimer leur profondeur. L’objectif : proposer une aide à la lecture des élastogrammes, en apportant des repères complémentaires à l’interprétation humaine.\nDe la préparation des données à l’évaluation des prédictions sur des examens inconnus, cette démarche associe sciences du vivant, réseaux de neurones et validation statistique.',
        en: 'LIVERWARS, raiders of the lost vessels.\nWhich artificial intelligence model can detect and locate a blood vessel in a liver elastogram? In collaboration with Echosens, our project explores supervised deep learning to confirm the presence of vessels and estimate their depth. The goal: to offer support for reading elastograms, by providing additional landmarks to complement human interpretation.\nFrom data preparation to the evaluation of predictions on unseen examinations, this approach brings together life sciences, neural networks and statistical validation.'
      },
      start: '15:50', end: '16:10'
    }
  ]
};
