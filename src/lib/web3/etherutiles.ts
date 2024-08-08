import { ConnectResponse } from '@/types/ConnectResponse';
import { ethers } from 'ethers';



const ARBITRUM_SEPOLIA_RPC = "https://arbitrum-sepolia.blockpi.network/v1/rpc/public";

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    return new ethers.providers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC);
  }
};

export const getCurrentNetwork = async (): Promise<string | null> => {
  if (typeof window !== 'undefined' && window.ethereum?.request) {
    try {
      const { chainId } = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId;
    } catch (error) {
      console.error('Failed to get current network:', error);
      return null;
    }
  } else {
    return null;
  }
};

export const connectWallet = async (): Promise<ConnectResponse> => {
  if (typeof window !== 'undefined' && window.ethereum?.request) {
    try {
      const currentNetwork = await getCurrentNetwork(); // Fetch current network
      const sepoliaChainId = '0x66eee'; // Chain ID for Arbitrum Sepolia

      if (currentNetwork !== sepoliaChainId) {
        // If not on Sepolia, switch to it
        const switchResponse = await switchToArbitrumSepolia();
        if (!switchResponse.success) {
          return { success: false, error: switchResponse.error };
        }
      }

      // Proceed with connecting the wallet
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = getProvider();
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const msg = "Hello Anon! Welcoming you to dBKash.";
      const signature = await signer.signMessage(msg);

      return { success: true, address };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return { success: false, error: 'Failed to connect wallet, check your metamask' };
    }
  } else {
    return { success: false, error: 'MetaMask not detected' };
  }
};


export const switchToArbitrumSepolia = async (): Promise<ConnectResponse> => {
  const chainId = '0x66eee'; // Chain ID for Arbitrum Sepolia
  if (typeof window !== 'undefined' && window.ethereum?.request) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      return { success: true };
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId,
                chainName: 'Arbitrum Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [ARBITRUM_SEPOLIA_RPC],
                blockExplorerUrls: ['https://sepolia-explorer.arbitrum.io'],
              },
            ],
          });
          return { success: true };
        } catch (addError) {
          console.error('Failed to add Arbitrum Sepolia network:', addError);
          return { success: false, error: 'Failed to add Arbitrum Sepolia network' };
        }
      }
      console.error('Failed to switch to Arbitrum Sepolia:', error);
      return { success: false, error: 'Failed to switch network' };
    }
  } else {
    return { success: false, error: 'MetaMask not detected' };
  }
};

export const getBalance = async (address: string): Promise<string | null> => {
  const provider = getProvider();
  try {
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Failed to get balance:', error);
    return null;
  }
};
