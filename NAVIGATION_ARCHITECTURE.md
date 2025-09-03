# Architecture de Navigation - Kids Points App

## 🎯 Vue d'ensemble
L'application a deux zones principales :
1. **Zone Enfant** - Accessible par tous (enfants et parents)
2. **Zone Parent** - Accessible uniquement avec authentification parent ou PIN

## 👨‍👩‍👧‍👦 Zone Parent
Accessible via :
- Connexion directe en tant que parent (ROLE = 'PARENT')
- Code PIN temporaire (session de 15 minutes pour les enfants)

### 📋 Menu Zone Parent
```
Zone Parent
├── 👶 Gestion des enfants
│   ├── Liste des enfants
│   ├── Ajouter un enfant
│   └── Modifier/Supprimer enfant
│
├── 🎯 Gestion des missions
│   ├── Créer une mission
│   ├── Liste des missions
│   └── ✅ Validation des missions soumises
│
├── 🎁 Gestion des récompenses  
│   ├── Créer une récompense
│   ├── Liste des récompenses
│   └── ✅ Validation des demandes de récompenses
│
├── ⚠️ Gestion des punitions
│   ├── Attribuer une punition
│   ├── Liste des punitions actives
│   └── Historique des punitions
│
└── ⚙️ Paramètres
    ├── Code PIN parent
    ├── Notifications
    └── Préférences générales
```

## 👶 Zone Enfant
Accessible par tous sans authentification spéciale.

### 📋 Menu Zone Enfant
```
Zone Enfant
├── 🎯 Mes missions
│   ├── Missions disponibles
│   ├── Missions en cours
│   ├── Demander une nouvelle mission
│   └── Historique des missions
│
├── 🛍️ Boutique de récompenses
│   ├── Catalogue des récompenses
│   ├── Mes points disponibles
│   ├── Demander une récompense
│   └── Historique des récompenses
│
├── 🎮 Activités
│   ├── Mini-jeux éducatifs
│   ├── Défis quotidiens
│   └── Activités bonus
│
├── 🏆 Classements
│   ├── Classement familial
│   ├── Classement par points
│   └── Classement par badges
│
└── 👤 Mon profil
    ├── Mes points et niveau
    ├── Mes badges
    ├── Mon historique
    ├── Mes statistiques
    └── Personnalisation avatar
```

## 🔐 Système d'accès

### Pour les Parents (ROLE = 'PARENT')
- Accès direct à toutes les zones
- Pas de demande de PIN
- Session permanente

### Pour les Enfants (ROLE = 'CHILD')
- Accès libre à la Zone Enfant
- PIN requis pour Zone Parent
- Session temporaire de 15 minutes après PIN
- Possibilité d'extension (+15 min)

## 📱 Adaptations par plateforme

### Mobile (iOS/Android)
- Navigation par onglets en bas
- Drawer menu pour options avancées
- Gestes de navigation natifs

### Tablette
- Split view avec menu latéral
- Vue master-detail pour les listes
- Optimisation paysage/portrait

### Web Desktop
- Sidebar permanente
- Navigation par breadcrumbs
- Raccourcis clavier

## 🎨 Règles UX

### Zone Parent
- Interface sobre et professionnelle
- Actions rapides et efficaces
- Dashboard avec métriques clés
- Notifications des demandes en attente

### Zone Enfant
- Interface ludique et colorée
- Animations et récompenses visuelles
- Gamification (badges, niveaux)
- Feedback immédiat sur les actions

## 🔄 Flux de navigation

### Connexion
```
Login → Détection rôle → 
  ├── PARENT → Dashboard Parent
  └── CHILD → Dashboard Enfant
```

### Accès Zone Parent (enfant)
```
Zone Enfant → Bouton Zone Parent → Modal PIN → 
  ├── PIN correct → Zone Parent (15 min)
  └── PIN incorrect → Reste Zone Enfant
```

### Session PIN expirée
```
Zone Parent (session active) → Timer 15 min → 
  ├── Extension → +15 min
  └── Expiration → Retour Zone Enfant
```

## 📊 États de navigation

1. **Non connecté** - Page de login
2. **Enfant connecté** - Zone Enfant uniquement
3. **Parent connecté** - Toutes zones accessibles
4. **Enfant + PIN actif** - Toutes zones (temporaire)

## 🚀 Implémentation

### Composants clés
- `ParentZone.tsx` - Wrapper pour protection PIN
- `useParentAccess.ts` - Hook de vérification d'accès
- `parentSessionService.ts` - Gestion session temporaire

### Navigation Guards
- Vérification rôle au routing
- Redirection automatique si pas d'accès
- Refresh des permissions toutes les 30s

### Persistance
- Session parent en AsyncStorage
- Refresh token pour connexion longue
- État Redux pour navigation temps réel