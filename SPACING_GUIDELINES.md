# Guide des espacements et styles - Kids Points App

## 📐 Système d'espacement uniforme

Ce guide décrit le système d'espacement standardisé pour assurer une cohérence visuelle dans toute l'application.

### 🎯 Objectifs

- **Cohérence** : Même espacement sur tous les écrans
- **Maintenabilité** : Modifications centralisées 
- **Responsive** : Adaptation automatique web/mobile
- **Performance** : Réutilisation des styles

## 📂 Structure des fichiers

```
src/
├── constants/
│   └── spacing.ts          # Valeurs et styles constants
├── hooks/
│   └── useAppStyles.ts     # Hook pour styles avec thème
```

## 🔧 Usage

### Import des constantes

```typescript
import { AppSpacing, CommonStyles } from '../constants/spacing';
import { useAppStyles } from '../hooks/useAppStyles';
```

### Utilisation dans un composant

```typescript
const MyScreen = () => {
  const appStyles = useAppStyles();
  
  return (
    <SafeAreaView style={appStyles.container}>
      <View style={appStyles.header}>
        <Text style={appStyles.headerTitle}>Titre</Text>
      </View>
      <ScrollView style={appStyles.content}>
        <View style={appStyles.section}>
          <Text style={appStyles.sectionTitle}>Section</Text>
          <TextInput style={appStyles.textInput} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
```

## 📏 Valeurs d'espacement

### Base
- `xs`: 4px - Très petit espacement
- `sm`: 8px - Petit espacement  
- `md`: 16px - Espacement standard
- `lg`: 24px - Grand espacement
- `xl`: 32px - Très grand espacement
- `xxl`: 48px - Espacement maximum

### Containers
- **Horizontal** : 40px (web) / 20px (mobile)
- **Vertical** : 16px

### Sections
- **Vertical** : 16px entre sections
- **Horizontal** : 0px (suit le container)

## 🎨 Styles prédéfinis

### Headers
```typescript
// Header avec shadow et padding uniforme
style={appStyles.header}

// Titre centré avec marge
style={appStyles.headerTitle} 
```

### Contenus
```typescript
// Container principal
style={appStyles.container}

// Zone de contenu scrollable avec padding
style={appStyles.content}
```

### Sections
```typescript
// Section avec marge verticale
style={appStyles.section}

// Titre de section
style={appStyles.sectionTitle}

// Sous-titre de section  
style={appStyles.sectionSubtitle}
```

### Formulaires
```typescript
// Input standard avec padding et border
style={appStyles.textInput}

// Zone de texte multi-lignes
style={appStyles.textArea}

// Boutons avec différentes couleurs
style={appStyles.primaryButton}
style={appStyles.secondaryButton}  
style={appStyles.warningButton}
```

### Cartes enfants
```typescript
// Grille de cartes enfants
style={appStyles.childrenGrid}

// Carte enfant standard
style={appStyles.childCard}

// Carte enfant sélectionnée
style={appStyles.selectedChildCard}
```

## 🔄 Migration des écrans existants

### Étape 1: Import
```typescript
import { useAppStyles } from '../hooks/useAppStyles';
```

### Étape 2: Remplacer les styles
```typescript
// Avant
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, flexDirection: 'row' },
  // ...
});

// Après  
const MyScreen = () => {
  const appStyles = useAppStyles();
  
  return <View style={appStyles.container}>
  
const customStyles = StyleSheet.create({
  // Garder seulement les styles spécifiques
  categoryButton: {
    borderRadius: 20,
    // ...
  },
});
```

## 📱 Responsive

Le système gère automatiquement les différences mobile/web :

- **Padding horizontal** : 20px mobile → 40px web
- **Largeur des cartes** : 48% mobile → 200px fixe web  
- **Espacement grilles** : 2% mobile → 12px web

## ✅ Écrans déjà migrés

- ✅ `CreateMissionScreen`
- ✅ `CreateRewardScreen` 
- ✅ `CreatePunishmentScreen`
- ✅ `CreateActivityScreen`

## 📋 À migrer

- [ ] `ProfileScreen`
- [ ] `MissionsHomeScreen`
- [ ] `RewardsHomeScreen`
- [ ] `ActivitiesScreen`
- [ ] `LeaderboardScreen`
- [ ] `DashboardHomeScreen`
- [ ] `ResponsiveParentDashboard`

## 🎯 Bonnes pratiques

1. **Utiliser `useAppStyles()`** pour les styles courants
2. **Créer des styles custom** seulement pour les spécificités
3. **Éviter les valeurs en dur** dans les composants
4. **Tester sur mobile et web** après migration
5. **Utiliser les espacements définis** plutôt que des valeurs arbitraires

## 🔍 Exemple complet

```typescript
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppStyles } from '../hooks/useAppStyles';

const ExampleScreen = () => {
  const appStyles = useAppStyles();
  
  return (
    <View style={appStyles.container}>
      {/* Header */}
      <View style={appStyles.header}>
        <TouchableOpacity style={appStyles.backButton}>
          {/* Back icon */}
        </TouchableOpacity>
        <Text style={appStyles.headerTitle}>Exemple</Text>
        <TouchableOpacity style={appStyles.primaryButton}>
          <Text style={appStyles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <View style={appStyles.content}>
        <View style={appStyles.section}>
          <Text style={appStyles.sectionTitle}>Titre section</Text>
          <TextInput style={appStyles.textInput} />
        </View>
        
        {/* Custom styles pour spécificités */}
        <View style={customStyles.specialContainer}>
          {/* Contenu spécifique */}
        </View>
      </View>
    </View>
  );
};

const customStyles = StyleSheet.create({
  specialContainer: {
    // Styles spécifiques seulement
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
});
```