'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { connectWallet, fetchTxns } from '../lib/web3/etherutiles';
import { UtilFuncsResponse } from '@/types/UtilFuncsResponse';
import { flushCookie } from '@/helpers/flushCookie';
import toast from 'react-hot-toast';
import { Transaction } from '@/types/TxnHistoryTypes';

interface WalletContextType {
  address: string | null;
  txns?: Array<Transaction> | [];
  connect: () => Promise<UtilFuncsResponse | undefined>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('walletAddress');
    }
    return null;
  });

  const [txns, setTxns] = useState<Array<Transaction>>(() => {
    if (typeof window !== 'undefined') {
      const storedTxns = sessionStorage.getItem('txns');
      return storedTxns ? JSON.parse(storedTxns) : [];
    }
    return [];
  });

  const connect = useCallback(async () => {
    const response: UtilFuncsResponse = await connectWallet();
    if (response.success && response.address) {
      const newAddress = response.address.toLowerCase();
      setAddress(newAddress);
      sessionStorage.setItem('walletAddress', newAddress);
      await fetchTransactions(newAddress); // Fetch and store transactions
    } else {
      console.error(response.error);
    }
    return response;
  }, []);

  const fetchTransactions = useCallback(async (address: string) => {
    const response: UtilFuncsResponse = await fetchTxns(address);
    if (response.success && response.txns) {
      setTxns(response.txns);
      sessionStorage.setItem('txns', JSON.stringify(response.txns)); // Persist transactions in sessionStorage
      return response.txns; // Return the fetched transactions
    } else {
      console.error(response.error);
      return []; // Return an empty array in case of error
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setTxns([]); // Clear the transactions
    sessionStorage.removeItem('walletAddress');
    sessionStorage.removeItem('txns'); // Clear stored transactions
    flushCookie();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (address) {
          if (accounts.length > 0) {
            const newAddress = accounts[0].toLowerCase();
            if (newAddress !== address) {
              toast.error('Account changed! Please log in with this address.');
              disconnect();
            }
          } else {
            disconnect();
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [address, disconnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        connect,
        disconnect,
        txns,
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
