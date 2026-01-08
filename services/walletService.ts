// Wallet Service - Handles wallet detection and connection
import { ethers } from 'ethers';

export type WalletType = 'metamask' | 'tronlink' | 'walletconnect' | 'local' | null;

export interface WalletInfo {
  address: string;
  walletType: WalletType;
  connected: boolean;
}

// Detect available wallet providers
export const detectWallet = (): WalletType => {
  const wallets = getAvailableWallets();
  return wallets.length > 0 ? wallets[0] : null;
};

// Get all available wallets
export const getAvailableWallets = (): WalletType[] => {
  if (typeof window === 'undefined') return [];
  const wallets: WalletType[] = [];

  // Check for MetaMask (Ethereum)
  if (window.ethereum && window.ethereum.isMetaMask) {
    wallets.push('metamask');
  }

  // Check for TronLink (TRON)
  if (window.tronWeb || (window as any).tronLink) {
    wallets.push('tronlink');
  }

  // Check for local wallet
  if (localStorage.getItem('local_private_key')) {
    wallets.push('local');
  }

  return wallets;
};

// Create a local burner wallet
export const createLocalWallet = (): WalletInfo => {
  const wallet = ethers.Wallet.createRandom();
  localStorage.setItem('local_private_key', wallet.privateKey);
  localStorage.setItem('wallet_address', wallet.address); // Sync with app logic
  return {
    address: wallet.address,
    walletType: 'local',
    connected: true
  };
};

// Request wallet connection
export const connectWallet = async (walletType: WalletType): Promise<WalletInfo | null> => {
  if (!walletType) {
    throw new Error('No wallet detected');
  }

  try {
    if (walletType === 'metamask') {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install it to continue.');
      }
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        return {
          address: accounts[0],
          walletType: 'metamask',
          connected: true
        };
      }
    } else if (walletType === 'tronlink') {
      // TronLink connection
      if (!window.tronWeb && !(window as any).tronLink) {
        throw new Error('TronLink is not installed. Please install it to continue.');
      }

      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        return {
          address: window.tronWeb.defaultAddress.base58,
          walletType: 'tronlink',
          connected: true
        };
      } else if ((window as any).tronLink) {
        // Request connection
        await (window as any).tronLink.request({ method: 'tron_requestAccounts' });
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
          return {
            address: window.tronWeb.defaultAddress.base58,
            walletType: 'tronlink',
            connected: true
          };
        }
      }
    } else if (walletType === 'local') {
      const pk = localStorage.getItem('local_private_key');
      if (pk) {
        const wallet = new ethers.Wallet(pk);
        return {
          address: wallet.address,
          walletType: 'local',
          connected: true
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

// Request message signature (for authentication)
export const signMessage = async (
  walletType: WalletType,
  address: string,
  message: string
): Promise<string | null> => {
  if (!walletType || !address) {
    throw new Error('Wallet not connected');
  }

  try {
    if (walletType === 'metamask') {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });
      return signature;
    } else if (walletType === 'tronlink') {
      // TronLink message signing
      if (window.tronWeb && window.tronWeb.trx) {
        const signature = await window.tronWeb.trx.signMessageV2(message);
        return signature;
      }
    } else if (walletType === 'local') {
      const pk = localStorage.getItem('local_private_key');
      if (pk) {
        const wallet = new ethers.Wallet(pk);
        return await wallet.signMessage(message);
      }
    }

    return null;
  } catch (error) {
    console.error('Signature error:', error);
    throw error;
  }
};

// Extended Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
    tronWeb?: {
      defaultAddress: {
        base58: string;
      };
      trx: {
        signMessageV2: (message: string) => Promise<string>;
      };
    };
    tronLink?: {
      request: (args: { method: string }) => Promise<void>;
    };
  }
}

