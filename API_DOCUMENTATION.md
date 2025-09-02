# 📚 Kids HA Backend - Documentation API Complète

## 🔐 Authentification

Toutes les API (sauf authentification) nécessitent un token JWT dans le header :
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. 🔑 AUTHENTIFICATION

### 1.1 Inscription
**POST** `/api/auth/register`

**Body:**
```json
{
  "email": "parent@example.com",
  "password": "Password123!",
  "name": "Jean Dupont"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Jean Dupont",
      "email": "parent@example.com",
      "role": "parent",
      "avatar": "https://example.com/avatar.jpg",
      "isActive": true,
      "createdAt": "2025-09-01T12:00:00Z"
    }
  }
}
```

### 1.2 Connexion
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "parent@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "parent@example.com",
      "name": "Jean Dupont",
      "roles": ["ROLE_USER"]
    },
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 Profil utilisateur
**GET** `/api/auth/me`
🔒 Authentification requise

**Response (200):**
```json
{
  "id": 1,
  "email": "parent@example.com",
  "name": "Jean Dupont",
  "roles": ["ROLE_USER"],
  "children": [1, 2, 3],
  "isActive": true,
  "createdAt": "2025-09-01T12:00:00Z"
}
```

### 1.4 Déconnexion
**POST** `/api/auth/logout`
🔒 Authentification requise

**Response (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

### 1.5 Rafraîchir le token
**POST** `/api/auth/refresh`
🔒 Authentification requise

**Body:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Response (200):**
```json
{
  "token": "new_jwt_token",
  "refresh_token": "new_refresh_token"
}
```

---

## 2. 👶 ENFANTS

### 2.1 Liste des enfants
**GET** `/api/children`
🔒 Authentification requise

**Query Parameters:**
- `page` (int): Numéro de page (défaut: 1)
- `itemsPerPage` (int): Nombre d'items par page (défaut: 20, max: 100)

**Response (200):**
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
      "name": "Sophie",
      "avatar": "avatar1.png",
      "currentPoints": 1250,
      "level": "gold",
      "totalPointsEarned": 5000,
      "parentId": 1,
      "isActive": true
    }
  ],
  "hydra:totalItems": 3,
  "hydra:view": {
    "@id": "/api/children?page=1",
    "@type": "hydra:PartialCollectionView",
    "hydra:first": "/api/children?page=1",
    "hydra:last": "/api/children?page=1",
    "hydra:next": "/api/children?page=2"
  }
}
```

### 2.2 Détails d'un enfant
**GET** `/api/children/{id}`
🔒 Authentification requise

**Response (200):**
```json
{
  "@context": "/api/contexts/Child",
  "@id": "/api/children/1",
  "@type": "Child",
  "id": 1,
  "name": "Sophie",
  "avatar": "avatar1.png",
  "currentPoints": 1250,
  "totalPointsEarned": 5000,
  "level": "gold",
  "parentId": 1,
  "missions": ["/api/missions/1", "/api/missions/2"],
  "badges": ["/api/badges/1"],
  "rewards": ["/api/rewards/1"],
  "pointsHistory": [
    {
      "id": 1,
      "points": 100,
      "type": "earned",
      "reason": "Mission complétée",
      "createdAt": "2025-09-01T10:00:00Z"
    }
  ],
  "isActive": true,
  "createdAt": "2025-08-01T12:00:00Z"
}
```

### 2.3 Créer un enfant
**POST** `/api/children`
🔒 Authentification requise (ROLE_PARENT)

**Body:**
```json
{
  "name": "Lucas",
  "avatar": "avatar2.png"
}
```

**Response (201):**
```json
{
  "@context": "/api/contexts/Child",
  "@id": "/api/children/2",
  "@type": "Child",
  "id": 2,
  "name": "Lucas",
  "avatar": "avatar2.png",
  "currentPoints": 0,
  "level": "bronze",
  "totalPointsEarned": 0,
  "parentId": 1,
  "isActive": true
}
```

### 2.4 Modifier un enfant
**PUT** `/api/children/{id}`
🔒 Authentification requise (ROLE_PARENT)

**Body:**
```json
{
  "name": "Lucas Martin",
  "avatar": "new_avatar.png"
}
```

### 2.5 Supprimer un enfant
**DELETE** `/api/children/{id}`
🔒 Authentification requise (ROLE_PARENT)

**Response (204):** No content

---

## 3. 🎯 MISSIONS

### 3.1 Liste des missions
**GET** `/api/missions`
🔒 Authentification requise

**Query Parameters:**
- `child` (int): Filtrer par enfant
- `status` (string): Filtrer par statut (pending, in_progress, completed, validated)
- `category` (string): Filtrer par catégorie

**Response (200):**
```json
{
  "@context": "/api/contexts/Mission",
  "@id": "/api/missions",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/missions/1",
      "@type": "Mission",
      "id": 1,
      "title": "Ranger sa chambre",
      "description": "Ranger et nettoyer complètement la chambre",
      "points": 50,
      "status": "pending",
      "category": "chores",
      "difficulty": "easy",
      "child": "/api/children/1",
      "dueDate": "2025-09-05T18:00:00Z",
      "createdAt": "2025-09-01T10:00:00Z"
    }
  ],
  "hydra:totalItems": 10
}
```

### 3.2 Créer une mission
**POST** `/api/missions`
🔒 Authentification requise (ROLE_PARENT)

**Body:**
```json
{
  "title": "Faire les devoirs",
  "description": "Terminer tous les devoirs pour demain",
  "points": 100,
  "category": "homework",
  "difficulty": "medium",
  "child": "/api/children/1",
  "dueDate": "2025-09-02T20:00:00Z"
}
```

### 3.3 Valider une mission
**PATCH** `/api/missions/{id}`
🔒 Authentification requise

**Body:**
```json
{
  "status": "completed"
}
```

---

## 4. 🏆 BADGES

### 4.1 Liste des badges
**GET** `/api/badges`
🔒 Authentification requise

**Response (200):**
```json
{
  "@context": "/api/contexts/Badge",
  "@id": "/api/badges",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/badges/1",
      "@type": "Badge",
      "id": 1,
      "name": "Super Rangeur",
      "description": "Ranger sa chambre 10 fois",
      "icon": "🏆",
      "criteria": "Complete 10 cleaning missions",
      "points": 500
    }
  ],
  "hydra:totalItems": 20
}
```

### 4.2 Créer un badge
**POST** `/api/badges`
🔒 Authentification requise (ROLE_PARENT)

**Body:**
```json
{
  "name": "Mathématicien",
  "description": "Résoudre 50 exercices de maths",
  "icon": "🧮",
  "criteria": "Complete 50 math exercises",
  "points": 1000
}
```

---

## 5. 🎁 RÉCOMPENSES

### 5.1 Liste des récompenses
**GET** `/api/rewards`
🔒 Authentification requise

**Query Parameters:**
- `child` (int): Filtrer par enfant
- `available` (bool): Filtrer par disponibilité

**Response (200):**
```json
{
  "@context": "/api/contexts/Reward",
  "@id": "/api/rewards",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/rewards/1",
      "@type": "Reward",
      "id": 1,
      "name": "Sortie au cinéma",
      "description": "Une séance de cinéma au choix",
      "pointsCost": 1000,
      "category": "sortie",
      "available": true,
      "child": "/api/children/1",
      "imageUrl": "cinema.jpg"
    }
  ],
  "hydra:totalItems": 15
}
```

### 5.2 Créer une récompense
**POST** `/api/rewards`
🔒 Authentification requise (ROLE_PARENT)

**Body:**
```json
{
  "name": "Nouveau jeu vidéo",
  "description": "Un jeu vidéo de ton choix",
  "pointsCost": 2000,
  "category": "jeu",
  "child": "/api/children/1"
}
```

### 5.3 Réclamer une récompense
**POST** `/api/reward_claims`
🔒 Authentification requise

**Body:**
```json
{
  "reward": "/api/rewards/1",
  "child": "/api/children/1"
}
```

---

## 6. 📊 ACTIVITÉS

### 6.1 Liste des activités
**GET** `/api/activities`
🔒 Authentification requise

**Query Parameters:**
- `child` (int): Filtrer par enfant
- `type` (string): Filtrer par type d'activité
- `from` (datetime): Date de début
- `to` (datetime): Date de fin

**Response (200):**
```json
{
  "@context": "/api/contexts/Activity",
  "@id": "/api/activities",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/activities/1",
      "@type": "Activity",
      "id": 1,
      "type": "mission_completed",
      "description": "Mission 'Ranger sa chambre' complétée",
      "points": 50,
      "child": "/api/children/1",
      "createdAt": "2025-09-01T15:30:00Z"
    }
  ],
  "hydra:totalItems": 50
}
```

### 6.2 Activités récentes
**GET** `/api/activities/recent`
🔒 Authentification requise

**Query Parameters:**
- `limit` (int): Nombre d'activités (défaut: 10)

---

## 7. 🔔 NOTIFICATIONS

### 7.1 Liste des notifications
**GET** `/api/notifications`
🔒 Authentification requise

**Query Parameters:**
- `isRead` (bool): Filtrer par statut de lecture
- `type` (string): Filtrer par type

**Response (200):**
```json
{
  "@context": "/api/contexts/Notification",
  "@id": "/api/notifications",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/notifications/1",
      "@type": "Notification",
      "id": 1,
      "type": "mission_completed",
      "title": "Mission accomplie !",
      "message": "Sophie a terminé la mission 'Ranger sa chambre'",
      "isRead": false,
      "user": "/api/users/1",
      "data": {
        "childId": 1,
        "missionId": 1,
        "points": 50
      },
      "createdAt": "2025-09-01T15:30:00Z"
    }
  ],
  "hydra:totalItems": 12
}
```

### 7.2 Marquer comme lu
**PATCH** `/api/notifications/{id}`
🔒 Authentification requise

**Body:**
```json
{
  "isRead": true
}
```

---

## 8. 🏅 TOURNOIS

### 8.1 Liste des tournois
**GET** `/api/tournaments`
🔒 Authentification requise

**Query Parameters:**
- `status` (string): Filtrer par statut (pending, active, completed)

**Response (200):**
```json
{
  "@context": "/api/contexts/Tournament",
  "@id": "/api/tournaments",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/tournaments/1",
      "@type": "Tournament",
      "id": 1,
      "name": "Tournoi de rentrée",
      "description": "Grand tournoi de septembre",
      "startDate": "2025-09-01T00:00:00Z",
      "endDate": "2025-09-30T23:59:59Z",
      "status": "active",
      "prizes": [
        {
          "rank": 1,
          "reward": "Console de jeu",
          "points": 5000
        }
      ]
    }
  ],
  "hydra:totalItems": 3
}
```

---

## 9. ⚔️ GUILDES

### 9.1 Liste des guildes
**GET** `/api/guilds`
🔒 Authentification requise

**Response (200):**
```json
{
  "@context": "/api/contexts/Guild",
  "@id": "/api/guilds",
  "@type": "hydra:Collection",
  "hydra:member": [
    {
      "@id": "/api/guilds/1",
      "@type": "Guild",
      "id": 1,
      "name": "Les Champions",
      "description": "Guilde des meilleurs",
      "level": 5,
      "experiencePoints": 12500,
      "memberCount": 8,
      "maxMembers": 10
    }
  ],
  "hydra:totalItems": 5
}
```

---

## 10. ⚙️ PARAMÈTRES

### 10.1 Liste des paramètres
**GET** `/api/settings`
🔒 Authentification requise (ROLE_ADMIN)

**Response (403):** Access Denied pour les utilisateurs non-admin

---

## 📝 CODES D'ERREUR

| Code | Description |
|------|------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 204 | Succès sans contenu |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Ressource non trouvée |
| 409 | Conflit (ex: email déjà existant) |
| 422 | Entité non traitable (validation échouée) |
| 500 | Erreur serveur |

## 🔄 PAGINATION

Tous les endpoints de liste supportent la pagination avec :
- `page`: Numéro de page (commence à 1)
- `itemsPerPage`: Nombre d'items par page (max: 100)

## 🎨 FORMATS DE RÉPONSE

Les API supportent plusieurs formats via le header `Accept`:
- `application/ld+json` (format par défaut, JSON-LD avec contexte Hydra)
- `application/json` (JSON simple)
- `application/vnd.api+json` (JSON API)

## 🚀 EXEMPLES D'UTILISATION

### Exemple complet : Créer et suivre une mission

```javascript
// 1. Connexion
const loginResponse = await fetch('https://api.kids-ha.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'parent@example.com',
    password: 'Password123!'
  })
});
const { data: { token } } = await loginResponse.json();

// 2. Récupérer la liste des enfants
const childrenResponse = await fetch('https://api.kids-ha.com/api/children', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});
const children = await childrenResponse.json();

// 3. Créer une mission pour le premier enfant
const missionResponse = await fetch('https://api.kids-ha.com/api/missions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Faire les devoirs',
    description: 'Mathématiques et français',
    points: 100,
    category: 'homework',
    child: `/api/children/${children['hydra:member'][0].id}`
  })
});
const mission = await missionResponse.json();

// 4. Marquer la mission comme complétée
await fetch(`https://api.kids-ha.com/api/missions/${mission.id}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'completed'
  })
});
```

## 📱 INTÉGRATION MOBILE

Pour les applications mobiles, utilisez les endpoints avec `Accept: application/json` pour des réponses simplifiées sans métadonnées Hydra.

## 🔒 SÉCURITÉ

- Tous les endpoints nécessitent HTTPS en production
- Les tokens JWT expirent après 24 heures
- Rate limiting : 60 requêtes par minute par IP
- CORS configuré pour les domaines autorisés

## 📞 SUPPORT

Pour toute question sur l'API :
- Email : support@kids-ha.com
- Documentation interactive : https://api.kids-ha.com/api/doc

---

*Dernière mise à jour : 01/09/2025*