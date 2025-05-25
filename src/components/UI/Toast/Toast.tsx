import React, { createContext, useContext, ReactNode } from 'react';
import { toast, ToastContainer, TypeOptions } from 'react-toastify';

interface ToastContextType {
  showToast: (message: string, type?: TypeOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const showToast = (message: string, type: TypeOptions = 'info') => {
    toast(message, {
      type,
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};