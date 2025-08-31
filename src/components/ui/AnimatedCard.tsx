import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
  Pressable,
} from 'react-native';
import { useTheme } from '../../hooks/useSimpleTheme';
import { usePlatform } from '../../hooks/usePlatform';
import { CardShadows } from '../../theme/shadows';
import { SignatureAnimations, Transform3D } from '../../theme/animations';

export interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  
  // Animation variants
  animation?: 'float' | 'hover' | 'bounce' | 'scale' | 'none';
  
  // 3D effects
  enable3D?: boolean;
  perspective?: number;
  
  // Child mode enhancements
  playful?: boolean;
  coloredShadow?: boolean;
  shadowColor?: string;
  
  // Layout
  padding?: number;
  margin?: number;
  borderRadius?: number;
  
  // Styling
  style?: ViewStyle;
  backgroundColor?: string;
  
  // Interaction
  pressable?: boolean;
  longPressable?: boolean;
  onLongPress?: () => void;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  animation = 'hover',
  enable3D = false,
  perspective = Transform3D.perspective.normal,
  playful = false,
  coloredShadow = false,
  shadowColor,
  padding,
  margin,
  borderRadius,
  style,
  backgroundColor,
  pressable = true,
  longPressable = false,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const theme = useTheme();
  const platform = usePlatform();
  
  // Animation values
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  
  // State
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine if we're in child mode
  const isChildMode = playful;

  // Start continuous animations
  useEffect(() => {
    if (animation === 'float') {
      const floatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );
      floatAnimation.start();
      return () => floatAnimation.stop();
    }
  }, [animation, animatedValue]);

  // Handle mouse events for web
  const handleMouseEnter = () => {
    if (Platform.OS === 'web') {
      setIsHovered(true);
      if (animation === 'hover') {
        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1.02,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  const handleMouseLeave = () => {
    if (Platform.OS === 'web') {
      setIsHovered(false);
      if (animation === 'hover') {
        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  // Handle press animations
  const handlePressIn = () => {
    setIsPressed(true);
    
    if (animation === 'bounce') {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    } else if (animation === 'scale') {
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    
    if (animation === 'bounce') {
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 300,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else if (animation === 'scale') {
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  };

  // 3D tilt effect for gesture
  const handleGesture = (event: any) => {
    if (!enable3D) return;
    
    const { translationX, translationY } = event.nativeEvent;
    const maxTilt = 15;
    
    const rotateYValue = (translationX / 200) * maxTilt;
    const rotateXValue = -(translationY / 200) * maxTilt;
    
    Animated.parallel([
      Animated.timing(rotateY, {
        toValue: rotateYValue,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateX, {
        toValue: rotateXValue,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGestureEnd = () => {
    if (!enable3D) return;
    
    Animated.parallel([
      Animated.spring(rotateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(rotateX, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Calculate shadow style
  const getShadowStyle = () => {
    if (coloredShadow && isChildMode) {
      const color = shadowColor || theme.colors.primary;
      return CardShadows.coloredCard(color);
    }
    
    if (isHovered || animation === 'hover') {
      return CardShadows.hovering;
    }
    
    return CardShadows.floating;
  };

  // Animated styles
  const getAnimatedStyle = () => {
    const baseTransforms: any[] = [
      { scale: scaleValue },
    ];

    // Add animation-specific transforms
    if (animation === 'float') {
      baseTransforms.push({
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      });
    }

    // Add 3D transforms
    if (enable3D) {
      baseTransforms.push(
        {
          perspective: perspective,
        } as any,
        {
          rotateY: rotateY.interpolate({
            inputRange: [-1, 1],
            outputRange: ['-15deg', '15deg'],
          }),
        } as any,
        {
          rotateX: rotateX.interpolate({
            inputRange: [-1, 1],
            outputRange: ['15deg', '-15deg'],
          }),
        } as any
      );
    }

    return {
      transform: baseTransforms,
    };
  };

  // Create styles
  const cardStyles = StyleSheet.create({
    container: {
      margin: margin || (isChildMode ? 16 : 8),
    },
    
    card: {
      backgroundColor: backgroundColor || theme.colors.background,
      borderRadius: borderRadius || (isChildMode ? 12 : 8),
      padding: padding || (isChildMode ? 24 : 16),
      
      // Shadow
      ...getShadowStyle(),
      
      // 3D preservation
      ...(enable3D && Transform3D.preserve3D),
      
      // Platform-specific properties handled separately
      
      // Border for child mode
      ...(isChildMode && {
        borderWidth: 2,
        borderColor: `${theme.colors.primary}20`,
      }),
    },
  });

  // Render the card
  const CardContent = (
    <Animated.View 
      style={[
        cardStyles.card, 
        getAnimatedStyle(),
        style
      ]}
      {...(Platform.OS === 'web' && {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      } as any)}
    >
      {children}
    </Animated.View>
  );

  // For 3D effects on mobile, we'll use simple press gestures
  // Full gesture handling would require react-native-gesture-handler installation

  // Standard pressable card
  return (
    <View style={cardStyles.container}>
      {pressable && onPress ? (
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={longPressable ? onLongPress : undefined}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
        >
          {CardContent}
        </Pressable>
      ) : (
        CardContent
      )}
    </View>
  );
};

export default AnimatedCard;