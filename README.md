<!-- Header Banner -->
<div align="center">

  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=Kids+Points+System;Gamification+for+Children;Cross-Platform+App" alt="Typing SVG" />
  </a>

  <br><br>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Expo-53-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/React_Native-0.79-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License">

  <br><br>

  <img src="https://img.shields.io/github/stars/pOwn3d/KIDS_EXPO?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/pOwn3d/KIDS_EXPO?style=social" alt="Forks">

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

## About

> **Kids Points System** - Une application de gamification pour enfants permettant aux parents de gerer un systeme de points, missions et recompenses.

<table>
  <tr>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/color/96/trophy.png" width="50"/><br>
      <b>Points & Badges</b><br>
      <sub>Systeme de gamification complet</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/color/96/task.png" width="50"/><br>
      <b>Missions</b><br>
      <sub>Defis quotidiens et hebdomadaires</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/color/96/gift.png" width="50"/><br>
      <b>Recompenses</b><br>
      <sub>Echangez vos points contre des prix</sub>
    </td>
    <td align="center" width="25%">
      <img src="https://img.icons8.com/color/96/family.png" width="50"/><br>
      <b>Multi-enfants</b><br>
      <sub>Gerez plusieurs profils</sub>
    </td>
  </tr>
</table>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

## Tech Stack

<div align="center">

### Frontend
<img src="https://skillicons.dev/icons?i=react,typescript,redux&theme=dark" alt="Frontend Stack"/>

### Backend
<img src="https://skillicons.dev/icons?i=symfony,php,postgres&theme=dark" alt="Backend Stack"/>

### Tools
<img src="https://skillicons.dev/icons?i=docker,git,figma&theme=dark" alt="Tools"/>

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Expo)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Mobile    │  │   Tablet    │  │   Desktop   │     │
│  │  iOS/Android│  │   iPadOS    │  │   Web/PWA   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS/JWT
┌─────────────────────────▼───────────────────────────────┐
│                  Backend API (Symfony)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │            API Platform / REST API                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                 Database (PostgreSQL)                    │
└──────────────────────────────────────────────────────────┘
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

## Features

### Parents
- Gestion des enfants
- Creation de missions
- Validation des completions
- Gestion des recompenses
- Acces aux statistiques

### Enfants
- Profil personnalise
- Completion de missions
- Echange de recompenses
- Participation aux tournois
- Interaction avec pets virtuels

### Gamification
- **Badges** - Debloquez des reussites
- **Niveaux** - Progressez dans le jeu
- **Guildes** - Jouez en equipe
- **Tournois** - Competez entre amis
- **Pets** - Compagnons virtuels evolutifs

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

## Platforms

| Platform | Status | Navigation | Layout |
|:--------:|:------:|:----------:|:------:|
| iOS | ✅ | Bottom Tabs | Single Column |
| Android | ✅ | Bottom Tabs | Single Column |
| iPad | ✅ | Bottom Tabs | Multi Column |
| Web Desktop | ✅ | Sidebar | Multi Column |
| PWA | ✅ | Adaptive | Responsive |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

## Quick Start

```bash
# Clone
git clone https://github.com/pOwn3d/KIDS_EXPO.git
cd KIDS_EXPO

# Install
npm install

# Run
npx expo start
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

## Documentation

| Document | Description |
|----------|-------------|
| [Project Overview](doc/01-PROJECT-OVERVIEW.md) | Vue d'ensemble complete |
| [Backend Architecture](doc/02-BACKEND-ARCHITECTURE.md) | Stack Symfony & API |
| [Frontend Architecture](doc/03-FRONTEND-ARCHITECTURE.md) | Expo & React Native |
| [API Integration](doc/04-API-INTEGRATION.md) | Guide d'integration |
| [Gamification](doc/05-GAMIFICATION-FEATURES.md) | Systeme de jeu |
| [Development Guide](doc/06-DEVELOPMENT-GUIDE.md) | Guide developpeur |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

## Roadmap

| Status | Milestone | Date |
|:------:|-----------|------|
| ✅ | Backend API | Q1 2025 |
| ✅ | Database Schema | Q1 2025 |
| ✅ | Authentication | Q1 2025 |
| 🔄 | Frontend MVP | Q1 2025 |
| 📅 | Complete UI/UX | Q2 2025 |
| 📅 | Testing Suite | Q2 2025 |
| 📅 | Production Launch | Q3 2025 |
| 📅 | App Store Release | Q3 2025 |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

## Security

- JWT Authentication
- Refresh Tokens
- PIN Parental
- Rate Limiting
- CORS Protection
- Input Validation

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line">

<div align="center">

### Author

**Made with passion by [Christophe Lopez](https://github.com/pOwn3d)**

<a href="https://www.linkedin.com/in/christophe-lopez/">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
</a>
<a href="https://github.com/pOwn3d">
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
</a>

<br><br>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

</div>

<!-- Update 2025-12-30 -->
