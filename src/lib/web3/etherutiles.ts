import { UtilFuncsResponse } from '@/types/UtilFuncsResponse';
import { ethers } from 'ethers';
import { checkIfTheyNew } from '../checkIfTheyNew';
import { authVerifier } from '../authVerifier';



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

export const connectWallet = async (): Promise<UtilFuncsResponse> => {
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
      const address = (await signer.getAddress()).toLowerCase();
      const msg = "Hello Anon! Welcoming you to dBKash.";
      const signature = await signer.signMessage(msg);
      const token = await authVerifier(signature, address);
      await checkIfTheyNew();
      return { success: true, token, address };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return { success: false, error: 'Failed to connect wallet, check your metamask and approve!' };
    }
  } else {
    return { success: false, error: 'MetaMask not detected' };
  }
};


export const switchToArbitrumSepolia = async (): Promise<UtilFuncsResponse> => {
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
      return { success: false, error: 'Failed to switch network. Add the following RPC https://chainlist.org/chain/421614.' };
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

export const fetchGasPrice = async (): Promise<any> => {
  const provider = getProvider();
  const gasPrice = await provider.getGasPrice();

  // Convert gas price from wei to gwei
  const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 'gwei');

  // Estimate gas for a standard transaction (21000 gas)
  const standardGasLimit = ethers.BigNumber.from(21000);

  // Calculate estimated gas fee in wei
  const estimatedGasFeeWei = gasPrice.mul(standardGasLimit);

  // Convert estimated gas fee from wei to ether for a more readable format
  const estimatedGasFeeEther = ethers.utils.formatUnits(estimatedGasFeeWei, 'ether');

  return {
    gasPriceGwei,
    estimatedGasFee: estimatedGasFeeEther
  };
};

export const sendMoney = async (toAddress: string, amount: string): Promise<UtilFuncsResponse> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = getProvider();
      const signer = provider.getSigner();
      
      // Convert the amount from ETH to Wei
      const amountWei = ethers.utils.parseEther(amount);
      
      // Create the transaction object
      const tx = {
        to: toAddress,
        value: amountWei
      };
      
      // Send the transaction
      const transaction = await signer.sendTransaction(tx);
      
      // Wait for the transaction to be mined
      await transaction.wait();
      
      return { 
        success: true, 
        txnHash: transaction.hash 
      };
    } catch (error) {
      console.error('Failed to send money:', error);
      return { 
        success: false, 
        error: 'Failed to send money. Please check your balance and try again.' 
      };
    }
  } else {
    return { success: false, error: 'MetaMask not detected' };
  }
};
