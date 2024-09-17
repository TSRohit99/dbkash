import { UtilFuncsResponse } from "@/types/UtilFuncsResponse";
import { ethers } from "ethers";
import { checkIfTheyNew } from "../checkIfTheyNew";
import { authVerifier } from "../authVerifier";
import { TokenInfo, TokenType } from "@/types/TokenInfo";
import { ERC20_ABI } from "./ERC20Abi";
import { Transaction, TransactionType } from "@/types/TxnHistoryTypes";

const ARBITRUM_SEPOLIA_RPC =
  "https://sepolia-rollup.arbitrum.io/rpc";
const BDT_ADDRESS = "0xf327e19106F172eE87Fb65896ACfc0757069BA3A";
const USD_ADDRESS = "0x127490E895Cc21eAC9e247eeF157021db78F9061";

export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    return new ethers.providers.JsonRpcProvider(ARBITRUM_SEPOLIA_RPC);
  }
};

export const getCurrentNetwork = async (): Promise<string | null> => {
  if (typeof window !== "undefined" && window.ethereum?.request) {
    try {
      const { chainId } = await window.ethereum.request({
        method: "eth_chainId",
      });
      return chainId;
    } catch (error) {
      console.error("Failed to get current network:", error);
      return null;
    }
  } else {
    return null;
  }
};

export const connectWallet = async (): Promise<UtilFuncsResponse> => {
  if (typeof window !== "undefined" && window.ethereum?.request) {
    try {
      const currentNetwork = await getCurrentNetwork(); // Fetch current network
      const sepoliaChainId = "0x66eee"; // Chain ID for Arbitrum Sepolia

      if (currentNetwork !== sepoliaChainId) {
        // If not on Sepolia, switch to it
        const switchResponse = await switchToArbitrumSepolia();
        if (!switchResponse.success) {
          return { success: false, error: switchResponse.error };
        }
      }

      // Proceed with connecting the wallet
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = getProvider();
      const signer = provider.getSigner();
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
  const chainId = "0x66eee"; // Chain ID for Arbitrum Sepolia
  if (typeof window !== "undefined" && window.ethereum?.request) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
      return { success: true };
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId,
                chainName: "Arbitrum Sepolia",
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [ARBITRUM_SEPOLIA_RPC],
                blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
              },
            ],
          });
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
    return { success: false, error: "MetaMask not detected" };
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
      ETH: ethers.utils.formatEther(ethBalance),
      BDT: ethers.utils.formatUnits(bdtBalance, 18),
      USD: ethers.utils.formatUnits(usdBalance, 18),
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
  if (typeof window === "undefined" || !window.ethereum) {
    return { success: false, error: "MetaMask not detected" };
  }

  try {
    const provider = getProvider();
    const signer = provider.getSigner();
    const tokenInfo = TOKEN_INFO[tokenType];

    if (tokenType === "ETH") {
      // Handle ETH transfer
      const amountWei = ethers.utils.parseEther(amount);
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
      const amountInSmallestUnit = ethers.utils.parseUnits(amount, decimals);
      const gasLimit = 500000;
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
};

// ABI for ERC20 transfer event and a basic payment function
const ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function pay(address token, uint256 amount) payable",
];

export const fetchTxns = async (
  address: string
): Promise<UtilFuncsResponse> => {

  console.log("started fetcing txns", address);

  const provider = getProvider();
  const transactions: Array<Transaction> = [];

  try {
    for (const [tokenType, tokenInfo] of Object.entries(TOKEN_INFO)) {
      const tokenContract = new ethers.Contract(
        tokenInfo.address,
        ABI,
        provider
      );
      if(tokenContract.address == '') continue;

      console.log( tokenContract.address)

      const sentFilter = tokenContract.filters.Transfer(address, null); // Token transfers 'from' your address
      const receivedFilter = tokenContract.filters.Transfer(null, address); // Token transfers 'to' your address

      const [sentEvents, receivedEvents] = await Promise.all([
        tokenContract.queryFilter(sentFilter, -1020).catch(() => []),
        tokenContract.queryFilter(receivedFilter, -1020).catch(() => [])
      ]);
      

      const allEvents = [...(sentEvents || []), ...(receivedEvents || [])];

      for (const event of allEvents) {
        console.log('its on events')
        if (!event || !event.args) {
          console.warn(
            "Encountered undefined event or event without args, skipping..."
          );
          continue;
        }

        try {
          const receipt = await provider.getTransactionReceipt(
            event.transactionHash
          );
          if (!receipt) {
            console.warn(
              `No receipt found for transaction ${event.transactionHash}, skipping...`
            );
            continue;
          }

          const block = await event.getBlock();
          if (!block) {
            console.warn(
              `No block found for event ${event.transactionHash}, skipping...`
            );
            continue;
          }

          let type: TransactionType =
            ethers.utils.getAddress(event.args.from) ===
            ethers.utils.getAddress(address)
              ? "send"
              : "receive";

          const gasFee = ethers.utils.formatEther(
            receipt.gasUsed.mul(receipt.effectiveGasPrice)
          );

          const date = new Date(block.timestamp * 1000);
          transactions.push({
            id: event.transactionHash,
            type: type,
            amount: ethers.utils.formatUnits(
              event.args.value,
              tokenInfo.decimals
            ),
            tokenType: tokenType as TokenType,
            from: event.args.from,
            to: event.args.to,
            date: date.toISOString().split("T")[0],
            time: date.toTimeString().split(" ")[0],
            gasFee: gasFee,
          });
        } catch (error) {
          console.error(
            `Error processing event ${event.transactionHash}:`,
            error
          );
        }
      }
    }

    console.log(transactions)
    // Sort transactions by date, most recent first
    transactions.sort(
      (a, b) =>
        new Date(b.date + " " + b.time).getTime() -
        new Date(a.date + " " + a.time).getTime()
    );
    console.log(transactions);
    return {
      success: true,
      txns: transactions,
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      success: false,
      txns: [],
    };
  }
};
