import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

// Import our Box of Crayons components and themes
import { 
  Button3D, 
  AnimatedCard, 
  Badge, 
  ProgressBar,
  CrayonColors,
  GamificationColors,
  WorldThemes
} from '../../components/ui';

import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';

const ThemeShowcaseScreen: React.FC = () => {
  const { theme, userRole, setUserRole } = useTheme();
  const platform = usePlatform();
  
  const [currentWorld, setCurrentWorld] = useState<keyof typeof WorldThemes>('aqua');
  
  const isChildMode = userRole === 'child';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 32,
      fontFamily: theme.typography.fontFamilies.extraBold,
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    section: {
      marginBottom: 40,
    },
    sectionTitle: {
      fontSize: 24,
      fontFamily: theme.typography.fontFamilies.bold,
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 20,
    },
    demoCard: {
      margin: 8,
      minWidth: 200,
    },
    colorPalette: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
      marginBottom: 20,
    },
    colorSwatch: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginBottom: 5,
    },
    colorLabel: {
      fontSize: 12,
      textAlign: 'center',
      color: theme.colors.textSecondary,
    },
    progressContainer: {
      marginVertical: 10,
      paddingHorizontal: 20,
    },
  });

  // Color palette display
  const renderColorPalette = () => {
    const colors = isChildMode ? CrayonColors : {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      success: theme.colors.success,
      warning: theme.colors.warning,
      error: theme.colors.error,
    };

    return (
      <View style={styles.colorPalette}>
        {Object.entries(colors).map(([name, color]) => (
          <View key={name} style={{ alignItems: 'center' }}>
            <View style={[styles.colorSwatch, { backgroundColor: color }]} />
            <Text style={styles.colorLabel}>{name}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            🎨 Box of Crayons Demo
          </Text>
          <Text style={styles.subtitle}>
            Current Mode: {isChildMode ? '👶 Child Mode' : '👨‍👩‍👧‍👦 Parent Mode'}
          </Text>
          
          {/* Mode Toggle */}
          <Button3D
            title={`Switch to ${isChildMode ? 'Parent' : 'Child'} Mode`}
            icon="swap-horizontal"
            onPress={() => setUserRole(isChildMode ? 'parent' : 'child')}
            size="large"
            playful={isChildMode}
            color={isChildMode ? 'electricBlue' : undefined}
          />
        </View>

        {/* Color Palette */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Color Palette</Text>
          {renderColorPalette()}
        </View>

        {/* Buttons Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔘 3D Buttons</Text>
          <View style={styles.row}>
            <Button3D
              title="Primary"
              variant="primary"
              size="medium"
              playful={isChildMode}
              onPress={() => {}}
            />
            <Button3D
              title="Success"
              variant="success"
              size="medium"
              playful={isChildMode}
              onPress={() => {}}
            />
            <Button3D
              title="Warning"
              variant="warning"
              size="medium"
              playful={isChildMode}
              onPress={() => {}}
            />
            <Button3D
              title="Red"
              color="red"
              size="medium"
              playful={isChildMode}
              onPress={() => {}}
            />
          </View>
          
          <View style={styles.row}>
            <Button3D
              title="With Icon"
              icon="heart"
              color="candyPink"
              size="large"
              playful={isChildMode}
              onPress={() => {}}
            />
            <Button3D
              title="Icon Only"
              icon="star"
              iconOnly
              color="sunYellow"
              size="large"
              playful={isChildMode}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Badges Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Badges & Rewards</Text>
          <View style={styles.row}>
            <Badge
              type="points"
              value="1,234"
              size="large"
              glowing={isChildMode}
              shiny={isChildMode}
            />
            <Badge
              type="level"
              title="Level 7"
              size="collectible"
              glowing={isChildMode}
              shiny={isChildMode}
              newBadge
            />
            <Badge
              type="achievement"
              title="Math Master"
              size="large"
              glowing={isChildMode}
              animated={isChildMode}
            />
            <Badge
              type="streak"
              value="5"
              title="Day Streak"
              size="medium"
              animated={isChildMode}
            />
          </View>
        </View>

        {/* Progress Bars Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Progress Bars</Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              label="Experience Points"
              value={750}
              max={1000}
              color="experience"
              gradient
              shiny={isChildMode}
              playful={isChildMode}
              showValue
            />
          </View>
          <View style={styles.progressContainer}>
            <ProgressBar
              label="Daily Goals"
              value={60}
              color="successGreen"
              gradient
              shiny={isChildMode}
              playful={isChildMode}
              showPercentage
            />
          </View>
          <View style={styles.progressContainer}>
            <ProgressBar
              label="Weekly Challenge"
              value={85}
              color="sunYellow"
              gradient
              striped
              shiny={isChildMode}
              playful={isChildMode}
              showPercentage
            />
          </View>
        </View>

        {/* Animated Cards Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🃏 Animated Cards</Text>
          <View style={styles.row}>
            <AnimatedCard
              animation="float"
              coloredShadow={isChildMode}
              shadowColor={CrayonColors.electricBlue}
              style={styles.demoCard}
              playful={isChildMode}
            >
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Badge
                  icon="trophy"
                  type="achievement"
                  size="large"
                  glowing={isChildMode}
                />
                <Text style={{
                  fontSize: 18,
                  fontFamily: theme.typography.fontFamilies.bold,
                  color: theme.colors.text,
                  marginTop: 10,
                  textAlign: 'center',
                }}>
                  Achievement Card
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 5,
                }}>
                  With floating animation
                </Text>
              </View>
            </AnimatedCard>

            <AnimatedCard
              animation="bounce"
              coloredShadow={isChildMode}
              shadowColor={CrayonColors.candyPink}
              style={styles.demoCard}
              playful={isChildMode}
            >
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Badge
                  icon="heart"
                  color="candyPink"
                  size="large"
                  shiny={isChildMode}
                />
                <Text style={{
                  fontSize: 18,
                  fontFamily: theme.typography.fontFamilies.bold,
                  color: theme.colors.text,
                  marginTop: 10,
                  textAlign: 'center',
                }}>
                  Bouncy Card
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 5,
                }}>
                  Interactive animations
                </Text>
              </View>
            </AnimatedCard>
          </View>
        </View>

        {/* World Themes Preview */}
        {isChildMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌍 World Themes</Text>
            <View style={styles.row}>
              {Object.keys(WorldThemes).slice(0, 4).map((world) => (
                <Button3D
                  key={world}
                  title={world.charAt(0).toUpperCase() + world.slice(1)}
                  size="medium"
                  color="electricBlue"
                  playful
                  onPress={() => setCurrentWorld(world as any)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Final Demo Message */}
        <AnimatedCard
          animation="pulse"
          coloredShadow={isChildMode}
          shadowColor={theme.colors.primary}
          style={{ margin: 20 }}
        >
          <View style={{ alignItems: 'center', padding: 30 }}>
            <Text style={{
              fontSize: 24,
              fontFamily: theme.typography.fontFamilies.extraBold,
              color: theme.colors.primary,
              textAlign: 'center',
              marginBottom: 10,
            }}>
              🎉 Box of Crayons is Ready!
            </Text>
            <Text style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              The theme system adapts between playful child mode and professional parent mode, 
              with 8 immersive world themes, signature animations, and gamified components.
            </Text>
          </View>
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ThemeShowcaseScreen;