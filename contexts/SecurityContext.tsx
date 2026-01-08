import * as React from 'react';
import { createContext, useContext, useState, ReactNode } from 'react';
import { SecurityModal, SecurityEventType } from '../components/SecurityModal';
import { useNavigate } from 'react-router-dom';

interface SecurityContextType {
    handleError: (error: any) => void;
    checkDepositRequirement: (currentDeposit: number) => boolean;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: SecurityEventType;
        message: string;
        description?: string;
        actionLabel?: string;
        actionGoal?: string; // Route to navigate
    } | null>(null);

    const handleError = (error: any) => {
        const msg = error.message || JSON.stringify(error);

        console.error("Security Intercept:", msg);

        if (msg.includes('DEPOSIT_REQUIRED')) {
            setModalState({
                isOpen: true,
                type: 'DEPOSIT_REQUIRED',
                message: 'Mandatory Security Clearance',
                description: 'To activate your connection to the global datastream, a verified on-chain deposit of at least $10 is required.',
                actionLabel: 'INITIALIZE GATEWAY',
                actionGoal: '/deposit'
            });
            return;
        }

        if (msg.includes('SUSPICIOUS_ACTIVITY')) {
            setModalState({
                isOpen: true,
                type: 'SUSPENDED',
                message: 'Account Suspended',
                description: 'Our security systems detected unusual betting patterns or automated behavior. Your account has been temporarily locked.',
                actionLabel: 'CONTACT SUPPORT',
                actionGoal: '/support'
            });
            return;
        }

        if (msg.includes('ACCOUNT_LOCKED')) {
            setModalState({
                isOpen: true,
                type: 'LOCK',
                message: 'Temporary Lockout',
                description: msg.split('ACCOUNT_LOCKED:')[1] || 'Your account is in a cooldown period.',
                actionLabel: 'VIEW STATUS',
                actionGoal: '/profile'
            });
            return;
        }

        if (msg.includes('INSUFFICIENT_FUNDS')) {
            setModalState({
                isOpen: true,
                type: 'WARNING',
                message: 'Insufficient Credits',
                description: 'Your Real Balance is too low for this wager. Connection terminated.',
                actionLabel: 'DEPOSIT NOW',
                actionGoal: '/deposit'
            });
            return;
        }

        // Generic fallback for other critical errors if needed
    };

    const checkDepositRequirement = (currentDeposit: number): boolean => {
        if (currentDeposit < 10) {
            setModalState({
                isOpen: true,
                type: 'DEPOSIT_REQUIRED',
                message: 'Security Activation Required',
                description: 'To confirm your node integrity and unlock gameplay, please deposit at least $10 USDT verified on-chain.',
                actionLabel: 'GO TO GATEWAY',
                actionGoal: '/deposit'
            });
            return false;
        }
        return true;
    };

    const closeModal = () => {
        setModalState(null);
    };

    const handleAction = () => {
        if (modalState?.actionGoal) {
            navigate(modalState.actionGoal);
            closeModal();
        }
    };

    return (
        <SecurityContext.Provider value={{ handleError, checkDepositRequirement }}>
            {children}
            {modalState && modalState.isOpen && (
                <SecurityModal
                    type={modalState.type}
                    message={modalState.message}
                    description={modalState.description}
                    actionLabel={modalState.actionLabel}
                    onAcknowledge={closeModal}
                    onAction={modalState.actionGoal ? handleAction : undefined}
                />
            )}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (!context) {
        throw new Error('useSecurity must be used within a SecurityProvider');
    }
    return context;
};
