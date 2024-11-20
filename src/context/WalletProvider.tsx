'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { connectWallet, fetchFee, fetchTxns, getBalances } from '../lib/web3/etherutiles';
import { UtilFuncsResponse } from '@/types/UtilFuncsResponse';
import { flushCookie } from '@/helpers/flushCookie';
import toast from 'react-hot-toast';
import { Transaction } from '@/types/TxnHistoryTypes';
import getTokenPriceInUSD from '@/helpers/getPriceInUsd';

interface WalletContextType {
  address: string | null;
  usdPrice : number;
  swapFee : string | null;
  ethBal : string | null;
  bdtBal : string | null;
  usdBal : string | null;
  walletBalance : string | null;
  txns?: Array<Transaction> | [];
  connect: () => Promise<UtilFuncsResponse | undefined>;
  disconnect: () => void;
  setBdtBal: React.Dispatch<React.SetStateAction<string | null>>;
  setUsdBal: React.Dispatch<React.SetStateAction<string | null>>;
  setEthBal: React.Dispatch<React.SetStateAction<string | null>>;
  setWalletBalance: React.Dispatch<React.SetStateAction<string | null>>;

}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const usdPrice = 120;
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('walletAddress');
    }
    return null;
  });

  const [walletBalance, setWalletBalance] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('walletBalance');
    }
    return null;
  });

  const [swapFee, setSwapFee] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('swapFee');
    }
    return null;
  });

  const [bdtBal, setBdtBal] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('bdtBal');
    }
    return null;
  });
  const [usdBal, setUsdBal] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('usdBal');
    }
    return null;
  });
  const [ethBal, setEthBal] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('ethBal');
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
      await fetchBalance(newAddress);
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

  const fetchSwapFee = useCallback(async () => {
    const response: string | null = await fetchFee();
    if (response) {
      setSwapFee(response);
      sessionStorage.setItem('swapFee', JSON.stringify(response));
    } 
  }, []);

  const fetchBalance = useCallback(async (newAddress : string) => {
    if (newAddress) {
      try {
        const balanceValue: any = await getBalances(newAddress);
        setBdtBal(parseFloat(balanceValue?.BDT).toString());
        setUsdBal(parseFloat(balanceValue?.USD).toString());
        setEthBal(parseFloat(balanceValue?.ETH).toString());
        const res = await getTokenPriceInUSD("ethereum");
        const ethToBDT = parseFloat(balanceValue?.ETH)*res.price*usdPrice;
        const totalBal = (parseFloat(balanceValue?.BDT) + parseFloat(balanceValue?.USD)*usdPrice + ethToBDT );
        setWalletBalance(totalBal.toFixed(2));
      } catch (error) {
        console.error("Error Fetching Balance: ", error);
      }
    }
  },[]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setTxns([]); // Clear the transactions
    sessionStorage.removeItem('walletAddress');
    sessionStorage.removeItem('txns'); // Clear stored transactions
    flushCookie();
  }, []);

  useEffect(() => {
    if (address) {
      fetchBalance(address).catch((error) => {
        console.error("Error fetching balance:", error);
      });

      fetchSwapFee().catch((error) => {
        console.error("Error fetching SwapFee:", error);
      });
    }
  }, [address]);

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
        usdPrice,
        swapFee,
        ethBal,
        bdtBal,
        usdBal,
        setBdtBal,
        setEthBal,
        setUsdBal,
        walletBalance,
        setWalletBalance,
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
