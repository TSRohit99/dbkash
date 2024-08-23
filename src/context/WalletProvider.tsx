'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { connectWallet } from '../lib/web3/etherutiles';
import { UtilFuncsResponse } from '@/types/UtilFuncsResponse';
import { flushCookie } from '@/helpers/flushCookie';

interface WalletContextType {
  address: string | null;
  connect: () => Promise<UtilFuncsResponse | undefined>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem('walletAddress');
    }
    return null;
  });

  const connect = useCallback(async () => {
    const response: UtilFuncsResponse = await connectWallet();
    if (response.success && response.address) {
      const newAddress = response.address.toLowerCase();
      setAddress(newAddress);
      sessionStorage.setItem('walletAddress', newAddress);
    } else {
      console.error(response.error);
    }
    return response;
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    sessionStorage.removeItem('walletAddress');
    flushCookie();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      // Listener for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          flushCookie();
          sessionStorage.removeItem('walletAddress');
          const newAddress = accounts[0].toLowerCase();
          setAddress(newAddress);
          sessionStorage.setItem('walletAddress', newAddress);
        } else {
          disconnect(); // Handle when the user disconnects their wallet
        }
      });
    }
  }, [disconnect]);

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
