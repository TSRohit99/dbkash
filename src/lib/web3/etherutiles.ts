import axios from 'axios';
import { UtilFuncsResponse } from "@/types/UtilFuncsResponse";
import { ethers } from "ethers";
import { checkIfTheyNew } from "../checkIfTheyNew";
import { authVerifier } from "../authVerifier";
import { TokenInfo, TokenType } from "@/types/TokenInfo";
import { ERC20_ABI } from "./ERC20Abi";
import { Transaction, TransactionType } from "@/types/TxnHistoryTypes";

const ARBITRUM_SEPOLIA_RPC = "https://sepolia-rollup.arbitrum.io/rpc";
const BDT_ADDRESS = "0xf327e19106F172eE87Fb65896ACfc0757069BA3A";
const USD_ADDRESS = "0x127490E895Cc21eAC9e247eeF157021db78F9061";

export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  } else {
    return new ethers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC);
  }
};

export const getCurrentNetwork = async (): Promise<string | null> => {
  const provider = getProvider();
  try {
    const network = await provider.getNetwork();
    return network.chainId.toString();
  } catch (error) {
    console.error("Failed to get current network:", error);
    return null;
  }
};

export const connectWallet = async (): Promise<UtilFuncsResponse> => {
  if (typeof window !== "undefined" && window.ethereum?.request) {
    try {
      const currentNetwork = await getCurrentNetwork();
      const sepoliaChainId = "0x66eee"; // Chain ID for Arbitrum Sepolia

      if (currentNetwork !== sepoliaChainId) {
        const switchResponse = await switchToArbitrumSepolia();
        if (!switchResponse.success) {
          return { success: false, error: switchResponse.error };
        }
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = getProvider();
      const signer = await provider.getSigner();
      const address = (await signer.getAddress()).toLowerCase();
      const msg = "Hello Anon! Welcoming you to dBKash.";
      const signature = await signer.signMessage(msg);
      const token = await authVerifier(signature, address);
      await checkIfTheyNew();
      return { success: true, token, address };
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      return {
        success: false,
        error: "Failed to connect wallet, check your metamask and approve!",
      };
    }
  } else {
    return { success: false, error: "MetaMask not detected" };
  }
};


export const switchToArbitrumSepolia = async (): Promise<UtilFuncsResponse> => {
  const provider = getProvider();
  if (provider instanceof ethers.BrowserProvider) {
    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0x66eee" }]);
      return { success: true };
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: "0x66eee",
              chainName: "Arbitrum Sepolia",
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [ARBITRUM_SEPOLIA_RPC],
              blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
            },
          ]);
          return { success: true };
        } catch (addError) {
          console.error("Failed to add Arbitrum Sepolia network:", addError);
          return {
            success: false,
            error: "Failed to add Arbitrum Sepolia network",
          };
        }
      }
      console.error("Failed to switch to Arbitrum Sepolia:", error);
      return {
        success: false,
        error:
          "Failed to switch network. Add the following RPC https://chainlist.org/chain/421614.",
      };
    }
  } else {
    return { success: false, error: "Browser provider not available" };
  }
};


export const getBalances = async (
  address: string
): Promise<{
  ETH: string;
  BDT: string;
  USD: string;
} | null> => {
  const provider = getProvider();
  try {
    // Get ETH balance
    const ethBalance = await provider.getBalance(address);

    // Get BDT balance
    const bdtContract = new ethers.Contract(BDT_ADDRESS, ERC20_ABI, provider);
    const bdtBalance = await bdtContract.balanceOf(address);

    // Get USD balance
    const usdContract = new ethers.Contract(USD_ADDRESS, ERC20_ABI, provider);
    const usdBalance = await usdContract.balanceOf(address);

    return {
      ETH: ethers.formatEther(ethBalance),
      BDT: ethers.formatUnits(bdtBalance, 18),
      USD: ethers.formatUnits(usdBalance, 18),
    };
  } catch (error) {
    console.error("Failed to get balances:", error);
    return null;
  }
};

const TOKEN_INFO: Record<TokenType, TokenInfo> = {
  ETH: { address: "", decimals: 18 },
  BDT: { address: BDT_ADDRESS, decimals: 18 },
  USD: { address: USD_ADDRESS, decimals: 18 },
};

export const sendMoney = async (
  toAddress: string,
  amount: string,
  tokenType: TokenType
): Promise<UtilFuncsResponse> => {
  const provider = getProvider();
  if (provider instanceof ethers.BrowserProvider) {
    try {
      const signer = await provider.getSigner();
      const tokenInfo = TOKEN_INFO[tokenType];

      if (tokenType === "ETH") {
        // Handle ETH transfer
        const amountWei = ethers.parseEther(amount);
        const tx = { to: toAddress, value: amountWei };
        const transaction = await signer.sendTransaction(tx);
        await transaction.wait();
        return { success: true, txnHash: transaction.hash };
      } else {
        // Handle ERC20 token transfer
        const tokenContract = new ethers.Contract(
          tokenInfo.address,
          ERC20_ABI,
          signer
        );
        const decimals = tokenInfo.decimals;
        const amountInSmallestUnit = ethers.parseUnits(amount, decimals);
        // const gasLimit = BigInt("50000");
        const gasLimit = await tokenContract.transfer.estimateGas(toAddress, amountInSmallestUnit);

        const transaction = await tokenContract.transfer(
          toAddress,
          amountInSmallestUnit,
          {
            gasLimit: gasLimit,
          }
        );
        await transaction.wait();
        return { success: true, txnHash: transaction.hash };
      }
    } catch (error) {
      console.error("Failed to send money:", error);
      return {
        success: false,
        error: "Failed to send money. Please check your balance and try again.",
      };
    }
  } else {
    return { success: false, error: "Browser provider not available" };
  }
};

const ARBISCAN_API_KEY = 'U9HBDK4QYE6A46UK4RWPWB6PKY1HVMRAD1'; // Replace with your actual Arbiscan API key
const ARBISCAN_API_URL = 'https://api-sepolia.arbiscan.io/api';

interface ArbiscanTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string;
  tokenDecimal: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
}

export const fetchTxns = async (address: string): Promise<UtilFuncsResponse> => {
  console.log("Started fetching Arbitrum txns", address);

  try {
    const response = await axios.get<{ status: string; message: string; result: ArbiscanTx[] }>(ARBISCAN_API_URL, {
      params: {
        module: 'account',
        action: 'tokentx',
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: ARBISCAN_API_KEY
      }
    });

    if (response.data.status !== '1') {
      throw new Error(`Arbiscan API error: ${response.data.message}`);
    }

    const transactions: any = response.data.result.map((tx: ArbiscanTx) => {
      const date = new Date(Number(tx.timeStamp) * 1000);
      return {
        id: tx.hash,
        type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
        amount: ethers.formatUnits(tx.value, parseInt(tx.tokenDecimal)),
        tokenType: tx.tokenSymbol,
        from: tx.from,
        to: tx.to,
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().split(' ')[0],
        gasFee: ethers.formatEther(
          ethers.getBigInt(tx.gasPrice) * ethers.getBigInt(tx.gasUsed)
        ),
      };
    });

    return {
      success: true,
      txns: transactions,
    };
  } catch (error) {
    console.error("Error fetching Arbitrum transactions:", error);
    return {
      success: false,
      txns: [],
    };
  }
};