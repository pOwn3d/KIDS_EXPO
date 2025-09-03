import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/store';
import { parentSessionService } from '../services/parentSession.service';

/**
 * Hook pour vérifier l'accès parent
 * Retourne true si l'utilisateur est parent OU a une session PIN active
 */
export const useParentAccess = () => {
  const userRole = useSelector(selectUserRole);
  const [hasParentAccess, setHasParentAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    checkParentAccess();
    
    // Vérifier régulièrement si la session est toujours active
    const interval = setInterval(() => {
      checkParentAccess();
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [userRole]);

  const checkParentAccess = async () => {
    setIsCheckingAccess(true);
    
    // Si l'utilisateur est parent, accès direct
    if (userRole === 'PARENT') {
      setHasParentAccess(true);
      setIsCheckingAccess(false);
      return;
    }

    // Sinon, vérifier la session PIN
    try {
      const isSessionActive = await parentSessionService.isSessionActive();
      setHasParentAccess(isSessionActive);
    } catch (error) {
      console.error('[useParentAccess] Error checking session:', error);
      setHasParentAccess(false);
    }
    
    setIsCheckingAccess(false);
  };

  const refreshAccess = async () => {
    await checkParentAccess();
  };

  return {
    hasParentAccess,
    isCheckingAccess,
    userRole,
    isParent: userRole === 'PARENT',
    hasTemporaryAccess: hasParentAccess && userRole !== 'PARENT',
    refreshAccess,
  };
};

export default useParentAccess;