# 🔧 Architecture Backend - Kids Points System

## 📍 Localisation
```
/Users/pOwn3d/Desktop/DEVELOPPEMENT/PERSO/Kids_HA_BACK
```

## 🏗 Stack technique

### Framework principal
- **Symfony 7.2 LTS** - Framework PHP moderne
- **API Platform 3.x** - Framework REST/GraphQL
- **PHP 8.2+** - Version minimale requise

### Base de données
- **PostgreSQL 15** - Base de données principale
- **Doctrine ORM** - Mapping objet-relationnel
- **Migrations** - Gestion des schémas

### Authentification et sécurité
- **LexikJWTAuthenticationBundle** - JWT tokens
- **Refresh tokens** - Renouvellement automatique
- **PIN parental** - Protection supplémentaire
- **Rate limiting** - Protection contre les abus

## 📂 Structure du projet

```
Kids_HA_BACK/
├── src/
│   ├── Entity/              # Entités Doctrine
│   ├── Repository/          # Repositories
│   ├── Controller/          # Controllers API
│   ├── Service/            # Services métier
│   ├── Security/           # Authentification
│   ├── EventListener/      # Event listeners
│   ├── Command/            # Commandes console
│   └── DataFixtures/       # Fixtures de test
├── config/
│   ├── packages/           # Configuration bundles
│   ├── routes/             # Routes API
│   └── jwt/               # Clés JWT (privée/publique)
├── migrations/             # Migrations DB
├── public/                # Point d'entrée
├── var/                   # Cache et logs
└── DOC/                   # Documentation existante
```

## 🗄 Entités principales

### Users & Authentication
- **User** - Utilisateurs (parents)
- **UserSettings** - Paramètres utilisateur
- **InvitationToken** - Tokens d'invitation

### Children & Profiles
- **Child** - Profils enfants
- **Avatar** - Avatars personnalisés
- **Badge** - Badges débloqués
- **ChildBadge** - Association enfant-badge

### Missions & Tasks
- **Mission** - Missions assignables
- **MissionCompletion** - Complétions
- **MissionValidation** - Validations parentales
- **DailyMission** - Missions quotidiennes
- **AdaptiveMission** - Missions adaptatives IA

### Points & Rewards
- **PointsHistory** - Historique des points
- **Reward** - Récompenses disponibles
- **RewardClaim** - Réclamations de récompenses
- **RewardMarketplace** - Marketplace

### Gamification avancée
- **Tournament** - Tournois
- **TournamentParticipant** - Participants
- **Guild** - Guildes/équipes
- **GuildMember** - Membres de guilde
- **Pet** - Compagnons virtuels
- **PetEvolution** - Évolutions
- **DailyWheelSpin** - Roue quotidienne
- **Skill** - Compétences
- **SkillTree** - Arbres de compétences

### IA & Personnalisation
- **SparkyConversation** - Historique IA
- **MissionPerformance** - Analyse performance
- **Theme** - Thèmes personnalisés

## 🔌 Endpoints API principaux

### Authentication
```
POST /api/login_check     # Login avec JWT
POST /api/token/refresh   # Refresh token
POST /api/register        # Inscription
GET  /api/auth/me        # Profil utilisateur
```

### Children Management
```
GET    /api/children      # Liste des enfants
POST   /api/children      # Créer un enfant
GET    /api/children/{id} # Détails enfant
PUT    /api/children/{id} # Modifier enfant
DELETE /api/children/{id} # Supprimer enfant
```

### Missions
```
GET  /api/missions        # Liste des missions
POST /api/missions        # Créer mission
POST /api/missions/{id}/complete   # Compléter
POST /api/missions/{id}/validate   # Valider (parent)
```

### Rewards
```
GET  /api/rewards         # Liste récompenses
POST /api/rewards/{id}/claim  # Réclamer
POST /api/rewards/claims/{id}/validate # Valider
```

### Gamification
```
GET  /api/tournaments     # Tournois actifs
POST /api/tournaments/{id}/join  # Rejoindre
GET  /api/guilds         # Guildes disponibles
POST /api/pets/{id}/feed # Nourrir compagnon
POST /api/daily-wheel/spin # Tour de roue
```

## 🔐 Sécurité

### JWT Configuration
```yaml
# config/packages/lexik_jwt_authentication.yaml
secret_key: '%env(resolve:JWT_SECRET_KEY)%'
public_key: '%env(resolve:JWT_PUBLIC_KEY)%'
pass_phrase: '%env(JWT_PASSPHRASE)%'
token_ttl: 3600        # 1 heure
refresh_token_ttl: 2592000  # 30 jours
```

### Rate Limiting
- 100 requêtes/minute pour les utilisateurs authentifiés
- 20 requêtes/minute pour les endpoints publics
- 5 tentatives de login par minute

### PIN Parental
- Requis pour : validations, paramètres, suppression
- Hash bcrypt stocké en base
- Timeout après 3 échecs

## 🗂 Services métier

### Core Services
- **ChildService** - Gestion des enfants
- **MissionService** - Logique missions
- **PointsService** - Calcul des points
- **RewardService** - Gestion récompenses

### Gamification Services
- **TournamentService** - Gestion tournois
- **GuildService** - Système de guildes
- **PetService** - Compagnons virtuels
- **BadgeService** - Déblocage badges

### Support Services
- **NotificationService** - Notifications
- **AnalyticsService** - Statistiques
- **CacheService** - Mise en cache
- **ValidationService** - Validation données

## 📊 Base de données

### Configuration
```env
DATABASE_URL="postgresql://postgres:password@193.108.54.154:5432/kids_points?serverVersion=15&charset=utf8"
```

### Tables principales
- `users` - Utilisateurs parents
- `children` - Profils enfants
- `missions` - Missions disponibles
- `mission_completions` - Complétions
- `rewards` - Récompenses
- `points_history` - Historique points
- `tournaments` - Tournois
- `guilds` - Guildes
- `pets` - Compagnons

## 🚀 Commandes utiles

### Développement
```bash
# Démarrer le serveur
symfony server:start --port=8000

# Créer la base de données
php bin/console doctrine:database:create

# Exécuter les migrations
php bin/console doctrine:migrations:migrate

# Charger les fixtures
php bin/console doctrine:fixtures:load

# Créer un admin
php bin/console app:create-admin email@example.com password
```

### Tests
```bash
# Lancer les tests
php bin/phpunit

# Analyse statique
vendor/bin/phpstan analyse

# Code style
vendor/bin/php-cs-fixer fix
```

### Production
```bash
# Clear cache
php bin/console cache:clear --env=prod

# Warmup cache
php bin/console cache:warmup --env=prod

# Optimiser autoloader
composer dump-autoload --optimize
```

## 🔄 API Platform Features

### Documentation automatique
- Swagger UI : http://localhost:8000/api/docs
- ReDoc : http://localhost:8000/api/docs.html
- OpenAPI JSON : http://localhost:8000/api/docs.json

### Formats supportés
- JSON-LD (par défaut)
- JSON
- HAL
- CSV (export)

### Filtres disponibles
- SearchFilter : Recherche textuelle
- OrderFilter : Tri
- DateFilter : Filtrage par date
- RangeFilter : Filtrage numérique
- BooleanFilter : Filtrage booléen

## 📝 Notes importantes

1. **JWT obligatoire** pour tous les endpoints sauf login/register
2. **Validation côté serveur** systématique
3. **Soft delete** sur les entités critiques
4. **Audit trail** sur toutes les modifications
5. **Cache Redis** recommandé en production

## 🐛 Debugging

### Logs
```bash
# Logs Symfony
tail -f var/log/dev.log
tail -f var/log/prod.log

# Logs JWT
tail -f var/log/jwt_debug.log

# Logs sécurité
tail -f var/log/security_debug.log
```

### Profiler
- Disponible en dev : http://localhost:8000/_profiler
- Analyse des requêtes SQL
- Timeline d'exécution
- Événements déclenchés