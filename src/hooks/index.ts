// Redux hooks
export { useAppDispatch, useAppSelector } from './redux';

// Business domain hooks
export { useAuth } from './useAuth';
export { useChildren } from './useChildren';
export { useMissions } from './useMissions';
export { useRewards } from './useRewards';
export { usePunishments } from './usePunishments';
export { useDashboard } from './useDashboard';

// Existing hooks (keeping compatibility)
export { useTheme, useTheme as useSimpleTheme } from './useSimpleTheme';
export { usePinValidation } from './usePinValidation';