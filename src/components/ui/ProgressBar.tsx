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
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { CrayonColors, GamificationColors } from '../../theme/colors';
import { AnimationDurations } from '../../theme/animations';

export interface ProgressBarProps {
  // Progress values
  value: number; // 0-100
  max?: number;
  
  // Labels
  label?: string;
  showValue?: boolean;
  showPercentage?: boolean;
  unit?: string;
  
  // Visual style
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  
  // Progress colors
  color?: keyof typeof CrayonColors | keyof typeof GamificationColors | string;
  gradient?: boolean;
  striped?: boolean;
  
  // Animation
  animated?: boolean;
  shiny?: boolean;
  duration?: number;
  
  // Child mode enhancements
  playful?: boolean;
  gamified?: boolean;
  
  // Layout
  style?: ViewStyle;
  labelStyle?: TextStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  showPercentage = false,
  unit = '',
  height,
  borderRadius,
  backgroundColor,
  color,
  gradient = false,
  striped = false,
  animated = true,
  shiny = false,
  duration = 1000,
  playful = false,
  gamified = false,
  style,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const theme = useTheme();
  const platform = usePlatform();
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Determine if we're in child mode
  const isChildMode = playful || gamified;

  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Get effective colors
  const getProgressColor = () => {
    if (color) {
      // Check if it's a predefined color
      const predefinedColor = (CrayonColors as any)[color] || (GamificationColors as any)[color];
      if (predefinedColor) return predefinedColor;
      
      // Use as direct color value
      if (typeof color === 'string') return color;
    }

    // Default colors based on progress value (gamified)
    if (isChildMode || gamified) {
      if (percentage >= 80) return CrayonColors.successGreen;
      if (percentage >= 60) return CrayonColors.sunYellow;
      if (percentage >= 40) return CrayonColors.vitaminOrange;
      return CrayonColors.red;
    }

    return theme.colors.primary;
  };

  const progressColor = getProgressColor();

  // Get gradient colors
  const getGradientColors = () => {
    if (!gradient) return [progressColor, progressColor];
    
    if (isChildMode || gamified) {
      return [progressColor, `${progressColor}80`]; // Lighter version
    }
    
    return [progressColor, theme.colors.secondary];
  };

  const gradientColors = getGradientColors();

  // Get dimensions
  const getEffectiveHeight = () => {
    if (height) return height;
    
    if (isChildMode) return 24;
    return 16;
  };

  const effectiveHeight = getEffectiveHeight();
  const effectiveBorderRadius = borderRadius ?? (isChildMode ? effectiveHeight / 2 : 8);

  // Animate progress on mount and value changes
  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: duration,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(percentage);
    }
  }, [percentage, animated, duration, progressAnim]);

  // Shine animation
  useEffect(() => {
    if (shiny || isChildMode) {
      const shineAnimation = Animated.loop(
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: AnimationDurations.shine,
          useNativeDriver: false,
        })
      );
      shineAnimation.start();
      
      return () => shineAnimation.stop();
    }
  }, [shiny, isChildMode, shineAnim]);

  // Bounce animation for completion
  useEffect(() => {
    if (percentage >= 100 && (isChildMode || gamified)) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [percentage, isChildMode, gamified, bounceAnim]);

  // Create styles
  const progressStyles = StyleSheet.create({
    container: {
      width: '100%',
    },
    
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    
    label: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: isChildMode ? theme.typography.fontFamilies.medium : theme.typography.fontFamilies.regular,
      color: theme.colors.text,
    },
    
    valueText: {
      fontSize: theme.typography.sizes.sm,
      fontFamily: theme.typography.fontFamilies.bold,
      color: theme.colors.textSecondary,
    },
    
    track: {
      height: effectiveHeight,
      backgroundColor: backgroundColor || theme.colors.surface,
      borderRadius: effectiveBorderRadius,
      overflow: 'hidden',
      
      // Child mode enhancements
      ...(isChildMode && {
        borderWidth: 2,
        borderColor: `${progressColor}30`,
      }),
      
      // Striped pattern (Web only)
      ...(Platform.OS === 'web' && striped && {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
      }),
    },
    
    fill: {
      height: '100%',
      borderRadius: effectiveBorderRadius,
      
      // Solid color fallback
      backgroundColor: progressColor,
      
      // Position for shine effect
      position: 'relative' as const,
      overflow: 'hidden',
    },
    
    shine: {
      position: 'absolute' as const,
      top: 0,
      left: -100,
      height: '100%',
      width: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      
      ...(Platform.OS === 'web' && {
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      }),
    },
  });

  // Animated styles
  const fillAnimatedStyle = {
    width: progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    }),
  };

  const shineAnimatedStyle = {
    transform: [
      {
        translateX: shineAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 400], // Move across the progress bar
        }),
      },
    ],
  };

  const containerAnimatedStyle = {
    transform: [{ scale: bounceAnim }],
  };

  // Format display value
  const getDisplayValue = () => {
    if (showPercentage) {
      return `${Math.round(percentage)}%`;
    }
    if (showValue) {
      return `${value}${unit ? ` ${unit}` : ''}${max !== 100 ? ` / ${max}${unit ? ` ${unit}` : ''}` : ''}`;
    }
    return null;
  };

  const displayValue = getDisplayValue();

  // Render gradient fill (Web only)
  const renderGradientFill = () => {
    if (Platform.OS !== 'web' || !gradient) {
      return null;
    }

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '100%',
          background: `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]})`,
          borderRadius: effectiveBorderRadius,
        }}
      />
    );
  };

  return (
    <Animated.View 
      style={[progressStyles.container, containerAnimatedStyle, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityValue={{
        min: 0,
        max: max,
        now: value,
      }}
    >
      {/* Label and value */}
      {(label || displayValue) && (
        <View style={progressStyles.labelContainer}>
          {label && (
            <Text style={[progressStyles.label, labelStyle]}>
              {label}
            </Text>
          )}
          {displayValue && (
            <Text style={[progressStyles.valueText, labelStyle]}>
              {displayValue}
            </Text>
          )}
        </View>
      )}
      
      {/* Progress track */}
      <View style={progressStyles.track}>
        {/* Progress fill */}
        <Animated.View 
          style={[
            progressStyles.fill,
            fillAnimatedStyle,
          ]}
        >
          {/* Shine effect */}
          {(shiny || isChildMode) && (
            <Animated.View 
              style={[
                progressStyles.shine,
                shineAnimatedStyle,
              ]}
            />
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default ProgressBar;