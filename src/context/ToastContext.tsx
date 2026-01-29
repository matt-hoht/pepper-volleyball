"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const [isMounted, setIsMounted] = useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {isMounted && createPortal(
                <div className={styles.toastContainer}>
                    {toasts.map(toast => (
                        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
                            {toast.message}
                        </div>
                    ))}
                </div>,
                document.body
            )}
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
