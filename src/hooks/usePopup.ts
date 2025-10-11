import { useState, useCallback } from 'react';

export interface PopupState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showButtons: boolean;
}

export const usePopup = () => {
  const [popupState, setPopupState] = useState<PopupState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showButtons: false
  });

  const showPopup = useCallback((
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    options?: {
      onConfirm?: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
      showButtons?: boolean;
    }
  ) => {
    setPopupState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
      confirmText: options?.confirmText || 'Confirmar',
      cancelText: options?.cancelText || 'Cancelar',
      showButtons: options?.showButtons || false
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopupState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
      type?: 'success' | 'error' | 'warning' | 'info';
    }
  ) => {
    showPopup(title, message, options?.type || 'warning', {
      onConfirm,
      onCancel: options?.onCancel,
      confirmText: options?.confirmText || 'Confirmar',
      cancelText: options?.cancelText || 'Cancelar',
      showButtons: true
    });
  }, [showPopup]);

  const showAlert = useCallback((
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    showPopup(title, message, type, { showButtons: false });
  }, [showPopup]);

  return {
    popupState,
    showPopup,
    hidePopup,
    showConfirm,
    showAlert
  };
};
