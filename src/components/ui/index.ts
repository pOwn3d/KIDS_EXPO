// Box of Crayons UI Components
// Unified export file for all custom UI components

// Core interactive components
export { default as Button3D } from './Button3D';
export type { Button3DProps } from './Button3D';

export { default as AnimatedCard } from './AnimatedCard';
export type { AnimatedCardProps } from './AnimatedCard';

// Display components
export { default as Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { default as ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

// Re-export theme utilities for components
export {
  CrayonColors,
  ProfessionalColors,
  WorldThemes,
  GamificationColors,
} from '../../theme/colors';

export {
  Spacing,
  TouchTargets,
  BorderRadius,
} from '../../theme/spacing';

export {
  SignatureAnimations,
  AnimationDurations,
  EasingFunctions,
} from '../../theme/animations';

export {
  ProfessionalShadows,
  PlayfulShadows,
  Button3DShadows,
  CardShadows,
  GlowEffects,
} from '../../theme/shadows';