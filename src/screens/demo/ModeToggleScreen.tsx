import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Box of Crayons components
import { 
  Button3D, 
  AnimatedCard, 
  Badge,
  CrayonColors,
  WorldThemes 
} from '../../components/ui';

// Types and hooks
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { useResponsive } from '../../hooks/usePlatform';

interface ModeToggleScreenProps {
  navigation: any;
}

const ModeToggleScreen: React.FC<ModeToggleScreenProps> = ({ navigation }) => {
  const { theme, setTheme } = useTheme();
  const platform = usePlatform();
  
  const containerPadding = useResponsive({
    mobile: 20,
    tablet: 32,
    desktop: 48,
  });

  const isChildMode = theme.mode === 'child';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: containerPadding,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: platform.isDesktop ? 32 : 28,
      fontFamily: theme.typography.fontFamilies.extraBold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontFamily: theme.typography.fontFamilies.medium,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 22,
      fontFamily: theme.typography.fontFamilies.bold,
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    modeGrid: {
      gap: 16,
    },
    worldThemeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'center',
    },
    currentModeIndicator: {
      alignItems: 'center',
      marginVertical: 20,
    },
    currentModeText: {
      fontSize: 16,
      fontFamily: theme.typography.fontFamilies.medium,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    demoActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'center',
    },
  });

  const handleSwitchToParent = () => {
    // Switch to parent theme
    setTheme('parent');
  };

  const handleSwitchToChild = (age: 'young' | 'teen' = 'teen', worldTheme?: keyof typeof WorldThemes) => {
    // Switch to child theme with optional world theme
    setTheme('child', { age, worldTheme });
  };

  const worldThemeOptions = Object.keys(WorldThemes) as (keyof typeof WorldThemes)[];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎨 Box of Crayons Demo</Text>
          <Text style={styles.subtitle}>
            Testez facilement les différents modes et thèmes
          </Text>
        </View>

        {/* Current Mode Indicator */}
        <View style={styles.currentModeIndicator}>
          <Badge
            type={isChildMode ? "level" : "custom"}
            size="collectible"
            title={isChildMode ? "Mode Enfant" : "Mode Parent"}
            icon={isChildMode ? "happy" : "person-circle"}
            glowing={isChildMode}
            shiny={isChildMode}
            color={isChildMode ? "candyPink" : "professionalBlue"}
          />
          <Text style={styles.currentModeText}>
            {isChildMode 
              ? `Mode Enfant Actif${theme.worldTheme ? ` - Thème ${theme.worldTheme}` : ''}`
              : "Mode Parent Professionnel Actif"
            }
          </Text>
        </View>

        {/* Mode Switch Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Changer de Mode</Text>
          <AnimatedCard 
            animation={isChildMode ? "float" : "hover"}
            style={styles.modeGrid}
          >
            <Button3D
              title="Mode Parent"
              subtitle="Interface professionnelle"
              icon="person-circle"
              color={CrayonColors.electricBlue}
              size="large"
              onPress={handleSwitchToParent}
              disabled={!isChildMode}
            />
            
            <Button3D
              title="Mode Enfant (Ado)"
              subtitle="Interface ludique pour adolescents"
              icon="happy"
              color={CrayonColors.candyPink}
              size="large"
              playful
              onPress={() => handleSwitchToChild('teen')}
              disabled={isChildMode && theme.userAge === 'teen'}
            />
            
            <Button3D
              title="Mode Enfant (Jeune)"
              subtitle="Interface extra-ludique pour les petits"
              icon="heart"
              color={CrayonColors.sunYellow}
              size="large"
              playful
              onPress={() => handleSwitchToChild('young')}
              disabled={isChildMode && theme.userAge === 'young'}
            />
          </AnimatedCard>
        </View>

        {/* World Themes Section (Child Mode Only) */}
        {isChildMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌍 Thèmes d'Univers</Text>
            <AnimatedCard animation="float">
              <View style={styles.worldThemeGrid}>
                {worldThemeOptions.map((worldTheme) => (
                  <Button3D
                    key={worldTheme}
                    title={worldTheme.charAt(0).toUpperCase() + worldTheme.slice(1)}
                    icon={worldTheme === 'aqua' ? 'water' : 
                          worldTheme === 'fantasy' ? 'diamond' :
                          worldTheme === 'space' ? 'planet' :
                          worldTheme === 'jungle' ? 'leaf' :
                          worldTheme === 'candy' ? 'heart' :
                          worldTheme === 'volcano' ? 'flame' :
                          worldTheme === 'ice' ? 'snow' :
                          'rainbow' as any}
                    color={(WorldThemes[worldTheme] as any).primary}
                    size="medium"
                    playful
                    onPress={() => handleSwitchToChild(theme.userAge as any, worldTheme)}
                    disabled={theme.worldTheme === worldTheme}
                  />
                ))}
                
                {/* Reset to default theme */}
                <Button3D
                  title="Défaut"
                  icon="refresh"
                  color={CrayonColors.electricBlue}
                  size="medium"
                  playful
                  onPress={() => handleSwitchToChild(theme.userAge as any)}
                  disabled={!theme.worldTheme}
                />
              </View>
            </AnimatedCard>
          </View>
        )}

        {/* Demo Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Navigation de Démo</Text>
          <AnimatedCard 
            animation={isChildMode ? "float" : "hover"}
            playful={isChildMode}
          >
            <View style={styles.demoActionsGrid}>
              <Button3D
                title="Dashboard"
                icon="home"
                color={CrayonColors.successGreen}
                size={isChildMode ? "large" : "medium"}
                playful={isChildMode}
                onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}
              />
              
              <Button3D
                title="Profil"
                icon="person"
                color={CrayonColors.vitaminOrange}
                size={isChildMode ? "large" : "medium"}
                playful={isChildMode}
                onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
              />
              
              <Button3D
                title="Missions"
                icon="list"
                color={CrayonColors.magicPurple}
                size={isChildMode ? "large" : "medium"}
                playful={isChildMode}
                onPress={() => navigation.navigate('Main', { screen: 'Tasks' })}
              />
              
              <Button3D
                title="Retour Auth"
                icon="log-out"
                color={theme.colors.textSecondary}
                size={isChildMode ? "large" : "medium"}
                playful={isChildMode}
                onPress={() => navigation.navigate('Auth')}
              />
            </View>
          </AnimatedCard>
        </View>

        {/* Theme Info */}
        <AnimatedCard 
          animation={isChildMode ? "float" : "hover"}
          style={{ marginTop: 20 }}
        >
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Badge
              icon="information-circle"
              title="Box of Crayons"
              color="info"
              size="medium"
              glowing={isChildMode}
            />
            <Text style={[styles.currentModeText, { marginTop: 12, textAlign: 'center' }]}>
              Système de design adaptatif avec{'\n'}
              personnalités duales et thèmes immersifs
            </Text>
          </View>
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModeToggleScreen;