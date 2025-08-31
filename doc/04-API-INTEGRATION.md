# 🔌 Guide d'intégration API - Kids Points System

## 📍 Configuration Backend

### Localisation du backend
```bash
cd /Users/pOwn3d/Desktop/DEVELOPPEMENT/PERSO/Kids_HA_BACK
```

### Démarrage du serveur API
```bash
# Installation des dépendances
composer install

# Configuration de la base de données
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Chargement des données de test
php bin/console doctrine:fixtures:load

# Démarrage du serveur
symfony server:start --port=8000
```

### URLs d'accès
- **API**: http://localhost:8000/api
- **Documentation Swagger**: http://localhost:8000/api/docs
- **API Platform Admin**: http://localhost:8000/api

## 🔐 Authentification JWT

### 1. Login
```typescript
// POST /api/login_check
const loginResponse = await fetch('http://localhost:8000/api/login_check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'parent@example.com',
    password: 'password123'
  })
});

const { token, refresh_token } = await loginResponse.json();

// Stocker les tokens
await SecureStore.setItemAsync('jwt_token', token);
await SecureStore.setItemAsync('refresh_token', refresh_token);
```

### 2. Utilisation du token
```typescript
// Toutes les requêtes suivantes doivent inclure le token
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 3. Refresh token
```typescript
// POST /api/token/refresh
const refreshResponse = await fetch('http://localhost:8000/api/token/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    refresh_token: refreshToken
  })
});

const { token: newToken } = await refreshResponse.json();
```

## 📊 Format des réponses API Platform

### Format Hydra JSON-LD
```json
{
  "@context": "/api/contexts/Child",
  "@id": "/api/children",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/children/1",
      "@type": "Child",
      "id": 1,
      "name": "Emma",
      "avatar": "👧",
      "points": 250
    }
  ],
  "hydra:totalItems": 2
}
```

### Extraction des données dans le frontend
```typescript
// Service helper pour extraire les données Hydra
export const extractHydraData = (response: any) => {
  if (response['hydra:member']) {
    return response['hydra:member'];
  }
  return response;
};

// Utilisation
const children = extractHydraData(await response.json());
```

## 🎯 Endpoints principaux

### Gestion des enfants
```typescript
// GET /api/children
const getChildren = async () => {
  const response = await apiClient.get('/children');
  return extractHydraData(response.data);
};

// POST /api/children
const createChild = async (data: {
  name: string;
  birthDate: string;
  avatar: string;
}) => {
  const response = await apiClient.post('/children', data);
  return response.data;
};

// PATCH /api/children/{id}
const updateChild = async (id: number, data: Partial<Child>) => {
  const response = await apiClient.patch(`/children/${id}`, data);
  return response.data;
};
```

### Missions
```typescript
// GET /api/missions
const getMissions = async (filters?: {
  category?: string;
  active?: boolean;
  childId?: number;
}) => {
  const params = new URLSearchParams(filters);
  const response = await apiClient.get(`/missions?${params}`);
  return extractHydraData(response.data);
};

// POST /api/mission_completions
const completeMission = async (data: {
  mission: string; // IRI: /api/missions/1
  child: string;   // IRI: /api/children/1
  completedAt: string;
}) => {
  const response = await apiClient.post('/mission_completions', data);
  return response.data;
};

// POST /api/mission_validations
const validateMission = async (data: {
  missionCompletion: string; // IRI
  validated: boolean;
  validatedBy: string; // IRI user
}) => {
  const response = await apiClient.post('/mission_validations', data);
  return response.data;
};
```

### Points et récompenses
```typescript
// GET /api/points_histories?child=/api/children/1
const getPointsHistory = async (childId: number) => {
  const response = await apiClient.get(`/points_histories?child=/api/children/${childId}`);
  return extractHydraData(response.data);
};

// POST /api/points_histories
const addPoints = async (data: {
  child: string;
  points: number;
  reason: string;
  type: 'earned' | 'spent';
}) => {
  const response = await apiClient.post('/points_histories', data);
  return response.data;
};

// GET /api/rewards
const getRewards = async () => {
  const response = await apiClient.get('/rewards');
  return extractHydraData(response.data);
};

// POST /api/reward_claims
const claimReward = async (data: {
  reward: string;
  child: string;
  pointsSpent: number;
}) => {
  const response = await apiClient.post('/reward_claims', data);
  return response.data;
};
```

### Gamification avancée
```typescript
// Tournois
const getTournaments = async () => {
  const response = await apiClient.get('/tournaments?active=true');
  return extractHydraData(response.data);
};

const joinTournament = async (tournamentId: number, childId: number) => {
  const response = await apiClient.post('/tournament_participants', {
    tournament: `/api/tournaments/${tournamentId}`,
    child: `/api/children/${childId}`
  });
  return response.data;
};

// Pets
const getPets = async (childId: number) => {
  const response = await apiClient.get(`/pets?child=/api/children/${childId}`);
  return extractHydraData(response.data);
};

const feedPet = async (petId: number) => {
  const response = await apiClient.post(`/pets/${petId}/feed`, {});
  return response.data;
};

// Daily Wheel
const spinWheel = async (childId: number) => {
  const response = await apiClient.post('/daily_wheel_spins', {
    child: `/api/children/${childId}`,
    spunAt: new Date().toISOString()
  });
  return response.data;
};
```

## 🔄 Gestion des erreurs

```typescript
// Interceptor global pour les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expiré, tenter un refresh
          await refreshToken();
          break;
        case 403:
          // Accès refusé
          showError('Accès refusé');
          break;
        case 404:
          // Ressource non trouvée
          showError('Ressource non trouvée');
          break;
        case 422:
          // Erreur de validation
          const violations = error.response.data.violations;
          handleValidationErrors(violations);
          break;
        case 500:
          // Erreur serveur
          showError('Erreur serveur, veuillez réessayer');
          break;
      }
    }
    return Promise.reject(error);
  }
);
```

## 📡 WebSocket pour temps réel (optionnel)

```typescript
// Configuration Mercure pour les notifications temps réel
const eventSource = new EventSource('http://localhost:8000/.well-known/mercure?topic=/notifications/{userId}', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  handleNotification(notification);
};
```

## 🗂 Types TypeScript

```typescript
// types/api.types.ts

export interface Child {
  id: number;
  name: string;
  birthDate: string;
  avatar: string;
  points: number;
  level: number;
  streak: number;
  badges: Badge[];
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  assignedChildren: string[];
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  stock?: number;
  image?: string;
}

export interface Tournament {
  id: number;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  status: 'registration' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  participants: TournamentParticipant[];
}

export interface Pet {
  id: number;
  name: string;
  type: string;
  level: number;
  happiness: number;
  hunger: number;
  energy: number;
  child: string;
}

export interface ApiResponse<T> {
  '@context'?: string;
  '@id'?: string;
  '@type'?: string;
  'hydra:member'?: T[];
  'hydra:totalItems'?: number;
}
```

## 🚦 Statuts de réponse

| Status | Description |
|--------|-------------|
| 200 | OK - Succès |
| 201 | Created - Ressource créée |
| 204 | No Content - Suppression réussie |
| 400 | Bad Request - Requête invalide |
| 401 | Unauthorized - Non authentifié |
| 403 | Forbidden - Accès refusé |
| 404 | Not Found - Ressource non trouvée |
| 422 | Unprocessable Entity - Erreur de validation |
| 500 | Internal Server Error - Erreur serveur |

## 🧪 Tests de l'API

### Avec cURL
```bash
# Login
curl -X POST http://localhost:8000/api/login_check \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@example.com","password":"password"}'

# Get children (avec token)
curl -X GET http://localhost:8000/api/children \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Avec Postman
1. Importer la collection depuis `http://localhost:8000/api/docs.json`
2. Configurer l'environnement avec `base_url` et `token`
3. Tester tous les endpoints

## 📝 Notes importantes

1. **IRI (Internationalized Resource Identifier)**: API Platform utilise des IRI pour les relations. Ex: `/api/children/1` au lieu de `1`
2. **Content-Type**: Toujours utiliser `application/ld+json` ou `application/json`
3. **Pagination**: Par défaut 30 items par page, utiliser `?page=2` pour paginer
4. **Filtres**: Supporter les filtres comme `?category=education&active=true`
5. **Cache**: Implémenter un cache côté client pour les données peu changeantes