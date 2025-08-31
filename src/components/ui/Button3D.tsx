import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
  PlatformColor,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { Button3DShadows } from '../../theme/shadows';
import { AnimationDurations } from '../../theme/animations';

export interface Button3DProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  
  // Visual variants
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  
  // Child mode variants
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'teal';
  playful?: boolean;
  
  // Icon support
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  
  // Advanced styling
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const Button3D: React.FC<Button3DProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  color,
  playful = false,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const theme = useTheme();
  const platform = usePlatform();
  const [isPressed, setIsPressed] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Determine if we're in child mode for playful styling
  const isChildMode = playful;

  // Get theme-appropriate colors
  const getButtonColors = () => {
    if (disabled) {
      return {
        background: theme.colors.disabled,
        text: theme.colors.textLight,
        shadow: '#999999',
      };
    }

    // Custom color for child mode
    if (color && isChildMode) {
      const customColor = theme.colors.kids[color as keyof typeof theme.colors.kids] || theme.colors.primary;
      return {
        background: customColor,
        text: '#FFFFFF',
        shadow: customColor,
      };
    }

    // Variant-based colors
    switch (variant) {
      case 'primary':
        return {
          background: theme.colors.primary,
          text: theme.colors.textInverse,
          shadow: theme.colors.primary,
        };
      case 'secondary':
        return {
          background: theme.colors.secondary,
          text: theme.colors.textInverse,
          shadow: theme.colors.secondary,
        };
      case 'success':
        return {
          background: theme.colors.success,
          text: theme.colors.textInverse,
          shadow: theme.colors.success,
        };
      case 'warning':
        return {
          background: theme.colors.warning,
          text: theme.colors.textInverse,
          shadow: theme.colors.warning,
        };
      case 'error':
        return {
          background: theme.colors.error,
          text: theme.colors.textInverse,
          shadow: theme.colors.error,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: theme.colors.primary,
          shadow: 'transparent',
        };
      default:
        return {
          background: theme.colors.primary,
          text: theme.colors.textInverse,
          shadow: theme.colors.primary,
        };
    }
  };

  // Get size-specific dimensions
  const getSizeDimensions = () => {
    const isChild = isChildMode;
    
    switch (size) {
      case 'small':
        return {
          height: isChild ? 44 * 0.8 : 40,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 16,
        };
      case 'medium':
        return {
          height: isChild ? 44 : 48,
          paddingHorizontal: 20,
          fontSize: 16,
          iconSize: 20,
        };
      case 'large':
        return {
          height: isChild ? 56 : 56,
          paddingHorizontal: 24,
          fontSize: 18,
          iconSize: 24,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: 20,
          fontSize: 16,
          iconSize: 20,
        };
    }
  };

  const colors = getButtonColors();
  const dimensions = getSizeDimensions();

  // Handle press animations
  const handlePressIn = () => {
    if (disabled || loading) return;
    
    setIsPressed(true);
    
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // Animated styles
  const animatedStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2], // Subtle press effect
        }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.98], // Slight scale down
        }),
      },
    ],
  };

  // Create styles
  const buttonStyles = StyleSheet.create({
    container: {
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    },
    
    button: {
      height: dimensions.height,
      backgroundColor: colors.background,
      borderRadius: isChildMode ? 12 : 8,
      paddingHorizontal: iconOnly ? 0 : dimensions.paddingHorizontal,
      width: iconOnly ? dimensions.height : undefined,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      
      // 3D Shadow effect
      ...Platform.select({
        ios: isPressed 
          ? Button3DShadows.pressedColored(colors.shadow)
          : Button3DShadows.raisedColored(colors.shadow),
        android: {
          elevation: isPressed ? 2 : 6,
        },
        web: isPressed
          ? Button3DShadows.pressedColored(colors.shadow)
          : Button3DShadows.raisedColored(colors.shadow),
      }),
      
      // Disabled state
      opacity: disabled ? 0.6 : 1,
      
      // Ghost variant
      borderWidth: variant === 'ghost' ? 2 : 0,
      borderColor: variant === 'ghost' ? colors.text : 'transparent',
    },
    
    text: {
      fontSize: dimensions.fontSize,
      fontFamily: isChildMode ? theme.typography.fontFamilies.bold : theme.typography.fontFamilies.medium,
      color: colors.text,
      textAlign: 'center' as const,
      
      // Text shadow for better readability
      ...Platform.select({
        web: {
          textShadow: variant !== 'ghost' ? '0 1px 2px rgba(0,0,0,0.2)' : undefined,
        },
      }),
    },
    
    loadingText: {
      opacity: 0.7,
    },
  });

  // Render icon if provided
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Ionicons 
        name={icon} 
        size={dimensions.iconSize} 
        color={colors.text} 
      />
    );
  };

  // Render content
  const renderContent = () => {
    if (iconOnly) {
      return renderIcon();
    }
    
    if (loading) {
      return (
        <Text style={[buttonStyles.text, buttonStyles.loadingText, textStyle]}>
          {loading ? 'Loading...' : title}
        </Text>
      );
    }
    
    return (
      <>
        {icon && iconPosition === 'left' && renderIcon()}
        <Text style={[buttonStyles.text, textStyle]}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  return (
    <Animated.View style={[buttonStyles.container, animatedStyle, style]}>
      <TouchableOpacity
        style={buttonStyles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Button3D;