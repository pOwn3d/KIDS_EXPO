import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { GlowEffects } from '../../theme/shadows';
import { CrayonColors, GamificationColors } from '../../theme/colors';
import { SignatureAnimations, AnimationDurations } from '../../theme/animations';

export interface BadgeProps {
  // Content
  title?: string;
  value?: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  
  // Badge type
  type?: 'achievement' | 'points' | 'level' | 'streak' | 'custom';
  
  // Visual variants
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'collectible';
  
  // Colors
  color?: keyof typeof CrayonColors | keyof typeof GamificationColors;
  backgroundColor?: string;
  textColor?: string;
  
  // Special effects
  glowing?: boolean;
  shiny?: boolean;
  animated?: boolean;
  newBadge?: boolean;
  
  // Layout
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const Badge: React.FC<BadgeProps> = ({
  title,
  value,
  icon,
  type = 'custom',
  variant = 'filled',
  size = 'medium',
  color,
  backgroundColor,
  textColor,
  glowing = false,
  shiny = false,
  animated = false,
  newBadge = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const theme = useTheme();
  const platform = usePlatform();
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Determine if we're in child mode
  const isChildMode = false; // Simple mode, no theme modes

  // Get type-based defaults
  const getTypeDefaults = () => {
    switch (type) {
      case 'achievement':
        return {
          color: 'achievement',
          icon: 'trophy' as const,
          glowing: true,
          shiny: true,
        };
      case 'points':
        return {
          color: 'points',
          icon: 'diamond' as const,
          animated: true,
        };
      case 'level':
        return {
          color: 'level',
          icon: 'trending-up' as const,
          glowing: true,
        };
      case 'streak':
        return {
          color: 'streak',
          icon: 'flame' as const,
          animated: true,
        };
      default:
        return {};
    }
  };

  const typeDefaults = getTypeDefaults();

  // Get effective colors
  const getEffectiveColors = () => {
    const effectiveColor = color || typeDefaults.color;
    let bgColor = backgroundColor;
    let txtColor = textColor;

    // Determine colors based on type and variant
    if (effectiveColor) {
      const colorValue = (CrayonColors as any)[effectiveColor] || (GamificationColors as any)[effectiveColor] || effectiveColor;
      
      switch (variant) {
        case 'filled':
          bgColor = bgColor || colorValue;
          txtColor = txtColor || '#FFFFFF';
          break;
        case 'outlined':
          bgColor = bgColor || 'transparent';
          txtColor = txtColor || colorValue;
          break;
        case 'ghost':
          bgColor = bgColor || `${colorValue}20`;
          txtColor = txtColor || colorValue;
          break;
      }
    }

    return {
      backgroundColor: bgColor || theme.colors.primary,
      textColor: txtColor || theme.colors.textInverse,
      borderColor: variant === 'outlined' ? (bgColor || theme.colors.primary) : 'transparent',
    };
  };

  // Get size-specific dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return {
          height: isChildMode ? 32 : 24,
          paddingHorizontal: 8,
          fontSize: theme.typography.sizes.xs,
          iconSize: 14,
          borderRadius: 12,
        };
      case 'medium':
        return {
          height: isChildMode ? 40 : 32,
          paddingHorizontal: 12,
          fontSize: theme.typography.sizes.sm,
          iconSize: 16,
          borderRadius: 16,
        };
      case 'large':
        return {
          height: isChildMode ? 48 : 40,
          paddingHorizontal: 16,
          fontSize: theme.typography.sizes.md,
          iconSize: 20,
          borderRadius: 20,
        };
      case 'collectible':
        // Large circular badge for achievements
        const badgeSize = isChildMode ? 80 : 64;
        return {
          height: badgeSize,
          width: badgeSize,
          paddingHorizontal: 0,
          fontSize: theme.typography.sizes.xs,
          iconSize: badgeSize * 0.4,
          borderRadius: badgeSize / 2,
        };
      default:
        return {
          height: 32,
          paddingHorizontal: 12,
          fontSize: theme.typography.sizes.sm,
          iconSize: 16,
          borderRadius: 16,
        };
    }
  };

  const colors = getEffectiveColors();
  const dimensions = getSizeDimensions();

  // Start animations
  useEffect(() => {
    // Pulse animation for new badges
    if (newBadge) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [newBadge, pulseAnim]);

  useEffect(() => {
    // Shine animation
    if (shiny || typeDefaults.shiny) {
      const shineAnimation = Animated.loop(
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: AnimationDurations.shine,
          useNativeDriver: true,
        })
      );
      shineAnimation.start();
      
      return () => shineAnimation.stop();
    }
  }, [shiny, typeDefaults.shiny, shineAnim]);

  useEffect(() => {
    // Bounce animation for animated badges
    if (animated || typeDefaults.animated) {
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      bounceAnimation.start();
      
      return () => bounceAnimation.stop();
    }
  }, [animated, typeDefaults.animated, bounceAnim]);

  // Get glow effect
  const getGlowStyle = () => {
    if (!glowing && !typeDefaults.glowing) return {};
    
    switch (type) {
      case 'achievement':
        return GlowEffects.achievement;
      case 'points':
        return GlowEffects.soft;
      default:
        return GlowEffects.soft;
    }
  };

  // Create styles
  const badgeStyles = StyleSheet.create({
    badge: {
      height: dimensions.height,
      width: dimensions.width || undefined,
      backgroundColor: colors.backgroundColor,
      borderRadius: dimensions.borderRadius,
      borderWidth: variant === 'outlined' ? 2 : 0,
      borderColor: colors.borderColor,
      paddingHorizontal: dimensions.paddingHorizontal,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: size === 'collectible' ? 4 : 6,
      
      // Glow effect
      ...getGlowStyle(),
      
      // Shine effect overlay
      ...(Platform.OS === 'web' && (shiny || typeDefaults.shiny) && {
        backgroundImage: `linear-gradient(45deg, ${colors.backgroundColor} 0%, rgba(255,255,255,0.3) 50%, ${colors.backgroundColor} 100%)`,
        backgroundSize: '200% 200%',
        animation: 'shine 2s infinite',
      }),
      
      // Minimum touch target for accessibility
      minWidth: size === 'small' ? 44 : dimensions.height,
    },
    
    content: {
      flexDirection: size === 'collectible' ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: size === 'collectible' ? 2 : 4,
    },
    
    text: {
      fontSize: dimensions.fontSize,
      fontFamily: isChildMode ? theme.typography.fontFamilies.bold : theme.typography.fontFamilies.medium,
      color: colors.textColor,
      textAlign: 'center' as const,
      
      // Text shadow for better readability
      ...Platform.select({
        web: {
          textShadow: variant === 'filled' ? '0 1px 2px rgba(0,0,0,0.2)' : undefined,
        },
      }),
    },
    
    value: {
      fontSize: size === 'collectible' ? dimensions.fontSize + 4 : dimensions.fontSize,
      fontFamily: theme.typography.fontFamilies.bold,
      color: colors.textColor,
    },
    
    newBadgeIndicator: {
      position: 'absolute' as const,
      top: -4,
      right: -4,
      width: 12,
      height: 12,
      backgroundColor: theme.colors.error,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
  });

  // Animated style
  const animatedStyle = {
    transform: [
      { scale: pulseAnim },
      {
        translateY: bounceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
    ...(shiny || typeDefaults.shiny ? {
      opacity: shineAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.8, 1, 0.8],
      }),
    } : {}),
  };

  // Render content
  const renderContent = () => {
    const effectiveIcon = icon || typeDefaults.icon;
    
    if (size === 'collectible') {
      return (
        <View style={badgeStyles.content}>
          {effectiveIcon && (
            <Ionicons name={effectiveIcon} size={dimensions.iconSize} color={colors.textColor} />
          )}
          {title && (
            <Text style={[badgeStyles.text, textStyle]} numberOfLines={2}>
              {title}
            </Text>
          )}
          {value && (
            <Text style={[badgeStyles.value, textStyle]}>
              {value}
            </Text>
          )}
        </View>
      );
    }
    
    return (
      <View style={badgeStyles.content}>
        {effectiveIcon && (
          <Ionicons name={effectiveIcon} size={dimensions.iconSize} color={colors.textColor} />
        )}
        {title && (
          <Text style={[badgeStyles.text, textStyle]} numberOfLines={1}>
            {title}
          </Text>
        )}
        {value && (
          <Text style={[badgeStyles.value, textStyle]}>
            {value}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Animated.View 
      style={[badgeStyles.badge, animatedStyle, style]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || `${title || ''} ${value || ''}`}
      accessibilityHint={accessibilityHint}
    >
      {renderContent()}
      {newBadge && <View style={badgeStyles.newBadgeIndicator} />}
    </Animated.View>
  );
};

export default Badge;