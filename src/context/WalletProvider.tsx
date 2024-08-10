'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { connectWallet, switchToArbitrumSepolia } from '../lib/web3/etherutiles';
import { UtilFuncsResponse } from '@/types/UtilFuncsResponse';

interface WalletContextType {
  address: string | null;
  connect: () => Promise<UtilFuncsResponse | undefined>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    // Retrieve address from localStorage if it exists
    if (typeof window !== "undefined") {
      return localStorage.getItem('walletAddress');
    }
    return null;
  });

  const connect = useCallback(async () => {
    const response: UtilFuncsResponse = await connectWallet();
    if (response.success && response.address) {
      setAddress(response.address);
      sessionStorage.setItem('walletAddress', response.address); // Save address to localStorage
    } else {
      console.error(response.error);
    }
    return response;
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    sessionStorage.removeItem('walletAddress'); // Remove address from localStorage
    // Add MetaMask disconnect logic here if applicable
  }, []);


  return (
    <WalletContext.Provider
      value={{
        address,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
