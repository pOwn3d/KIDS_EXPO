import React, { useState, useCallback } from 'react';
import PinValidationModal from '../components/modals/PinValidationModal';

interface UsePinValidationOptions {
  title?: string;
  message?: string;
  action?: string;
}

export const usePinValidation = (options?: UsePinValidationOptions) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);

  const validateWithPin = useCallback((action: () => void | Promise<void>) => {
    setPendingAction(() => action);
    setIsModalVisible(true);
  }, []);

  const handleSuccess = useCallback(async () => {
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleClose = useCallback(() => {
    setIsModalVisible(false);
    setPendingAction(null);
  }, []);

  const PinModal = useCallback(() => (
    <PinValidationModal
      visible={isModalVisible}
      onClose={handleClose}
      onSuccess={handleSuccess}
      title={options?.title}
      message={options?.message}
      action={options?.action}
    />
  ), [isModalVisible, handleClose, handleSuccess, options]);

  return {
    validateWithPin,
    PinModal,
  };
};