// Box of Crayons Animation System
import { Platform } from 'react-native';

// Animation durations in milliseconds
export const AnimationDurations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  bounce: 750,
  float: 3000,
  wiggle: 500,
  confetti: 1500,
  shine: 2000,
} as const;

// Easing functions (compatible with React Native and Web)
export const EasingFunctions = {
  linear: Platform.select({
    web: 'linear',
    default: 'linear',
  }),
  ease: Platform.select({
    web: 'ease',
    default: 'ease',
  }),
  easeIn: Platform.select({
    web: 'ease-in',
    default: 'easeIn',
  }),
  easeOut: Platform.select({
    web: 'ease-out',
    default: 'easeOut',
  }),
  easeInOut: Platform.select({
    web: 'ease-in-out',
    default: 'easeInOut',
  }),
  // Custom bezier curves for playful animations
  bounce: Platform.select({
    web: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    default: 'easeOut', // Fallback for React Native
  }),
  elastic: Platform.select({
    web: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    default: 'easeInOut',
  }),
  spring: Platform.select({
    web: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    default: 'easeOut',
  }),
} as const;

// Signature animation presets
export const SignatureAnimations = {
  // Bounce animation for buttons and interactive elements
  bounce: {
    duration: AnimationDurations.bounce,
    easing: EasingFunctions.bounce,
    keyframes: Platform.select({
      web: `
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -30px, 0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -15px, 0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }
      `,
      default: null, // Will use Animated API
    }),
  },

  // Float animation for floating elements
  float: {
    duration: AnimationDurations.float,
    easing: EasingFunctions.easeInOut,
    keyframes: Platform.select({
      web: `
        @keyframes float {
          0% {
            box-shadow: 0 5px 15px 0px rgba(0,0,0,0.6);
            transform: translateY(0px);
          }
          50% {
            box-shadow: 0 25px 15px 0px rgba(0,0,0,0.2);
            transform: translateY(-20px);
          }
          100% {
            box-shadow: 0 5px 15px 0px rgba(0,0,0,0.6);
            transform: translateY(0px);
          }
        }
      `,
      default: null,
    }),
  },

  // Wiggle animation for fun interactions
  wiggle: {
    duration: AnimationDurations.wiggle,
    easing: EasingFunctions.ease,
    keyframes: Platform.select({
      web: `
        @keyframes wiggle {
          0%, 7% { transform: rotateZ(0); }
          15% { transform: rotateZ(-15deg); }
          20% { transform: rotateZ(10deg); }
          25% { transform: rotateZ(-10deg); }
          30% { transform: rotateZ(6deg); }
          35% { transform: rotateZ(-4deg); }
          40%, 100% { transform: rotateZ(0); }
        }
      `,
      default: null,
    }),
  },

  // Pulse animation for attention
  pulse: {
    duration: AnimationDurations.normal,
    easing: EasingFunctions.easeInOut,
    keyframes: Platform.select({
      web: `
        @keyframes pulse {
          0% {
            transform: scale3d(1, 1, 1);
          }
          50% {
            transform: scale3d(1.05, 1.05, 1.05);
          }
          100% {
            transform: scale3d(1, 1, 1);
          }
        }
      `,
      default: null,
    }),
  },

  // Shake animation for errors
  shake: {
    duration: AnimationDurations.slow,
    easing: EasingFunctions.ease,
    keyframes: Platform.select({
      web: `
        @keyframes shake {
          10%, 90% {
            transform: translate3d(-1px, 0, 0);
          }
          20%, 80% {
            transform: translate3d(2px, 0, 0);
          }
          30%, 50%, 70% {
            transform: translate3d(-4px, 0, 0);
          }
          40%, 60% {
            transform: translate3d(4px, 0, 0);
          }
        }
      `,
      default: null,
    }),
  },

  // Shine animation for badges and rewards
  shine: {
    duration: AnimationDurations.shine,
    easing: EasingFunctions.linear,
    keyframes: Platform.select({
      web: `
        @keyframes shine {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
      `,
      default: null,
    }),
  },

  // Scale in animation for modals and popups
  scaleIn: {
    duration: AnimationDurations.normal,
    easing: EasingFunctions.bounce,
    keyframes: Platform.select({
      web: `
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale3d(0.3, 0.3, 0.3);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale3d(1, 1, 1);
          }
        }
      `,
      default: null,
    }),
  },

  // Slide up animation for panels
  slideUp: {
    duration: AnimationDurations.normal,
    easing: EasingFunctions.easeOut,
    keyframes: Platform.select({
      web: `
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 100%, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `,
      default: null,
    }),
  },

  // Confetti celebration animation
  confetti: {
    duration: AnimationDurations.confetti,
    easing: EasingFunctions.easeOut,
    keyframes: Platform.select({
      web: `
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `,
      default: null,
    }),
  },
};

// 3D Transform utilities
export const Transform3D = {
  // Preserve 3D for parent containers
  preserve3D: Platform.select({
    web: {
      transformStyle: 'preserve-3d' as const,
    },
    default: {},
  }),

  // Perspective values
  perspective: {
    close: 500,
    normal: 1000,
    far: 1500,
  },

  // Common 3D transforms
  rotateX: (degrees: number) => `rotateX(${degrees}deg)`,
  rotateY: (degrees: number) => `rotateY(${degrees}deg)`,
  rotateZ: (degrees: number) => `rotateZ(${degrees}deg)`,
  translateZ: (pixels: number) => `translateZ(${pixels}px)`,
  scale3d: (x: number, y: number, z: number) => `scale3d(${x}, ${y}, ${z})`,
};

// GPU acceleration utilities
export const GPUAcceleration = {
  // Force GPU acceleration
  willChange: Platform.select({
    web: 'transform, opacity',
    default: undefined,
  }),
  
  // Transform properties for hardware acceleration
  transform: [{ translateZ: 0 }], // React Native style
  
  // Backface visibility
  backfaceVisibility: 'hidden' as const,
};

// Animation utilities
export const AnimationUtils = {
  // Create a delay for staggered animations
  createDelay: (index: number, baseDelay = 50): number => {
    return baseDelay * index;
  },

  // Get random animation duration for organic feel
  getRandomDuration: (min = 200, max = 800): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Create spring configuration for React Native Animated
  springConfig: {
    tension: 120,
    friction: 7,
  },

  // Create timing configuration
  timingConfig: {
    duration: AnimationDurations.normal,
    useNativeDriver: true,
  },
};

// Reduced motion support for accessibility
export const ReducedMotionSettings = {
  // Disable animations for users who prefer reduced motion
  respectsReducedMotion: true,
  
  // Fallback durations for reduced motion
  reducedDurations: {
    instant: 0,
    fast: 0,
    normal: 0,
    slow: 0,
  },
  
  // Check if reduced motion is preferred (Web only)
  prefersReducedMotion: Platform.select({
    web: '(prefers-reduced-motion: reduce)',
    default: false,
  }),
};