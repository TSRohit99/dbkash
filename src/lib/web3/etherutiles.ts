import axios from "axios";
import { UtilFuncsResponse } from "@/types/UtilFuncsResponse";
import { Contract, ethers, parseUnits } from "ethers";
import { checkIfTheyNew } from "../checkIfTheyNew";
import { authVerifier } from "../authVerifier";
import { TokenInfo, TokenType } from "@/types/TokenInfo";
import { ERC20_ABI } from "./ERC20Abi";
import { swapContractAbi } from "./GasEfficientBDTUSDSwap";
import { ArbiscanTx } from "@/types/ArbiscanTx";
import { ContractResponse } from "@/types/ContractResponse";
import { stakeData } from "@/types/StakeData";
import { faucetAbi } from "./faucet";

const ARBITRUM_SEPOLIA_RPC = "https://sepolia-rollup.arbitrum.io/rpc";
const BDT_ADDRESS = "0xf327e19106F172eE87Fb65896ACfc0757069BA3A";
const USD_ADDRESS = "0x127490E895Cc21eAC9e247eeF157021db78F9061";
const swapContract_ADDRESS = "0xC943F3591d171c69Bc7eC77e3A20dD43Bd428F6e";
const faucet_ADDRESS = "0x20588dE1C6dAe2f4e00EBFEf8Bc66d6Dc6aa4693";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY;
const ARBISCAN_API_URL = "https://api-sepolia.arbiscan.io/api";

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
      console.log("Signer", signer);
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
      await provider.send("wallet_switchEthereumChain", [
        { chainId: "0x66eee" },
      ]);
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
  try {
    const provider = getProvider();

    // Get ETH balance
    const ethBalance = await provider.getBalance(address);

    // Get BDT balance
    const bdtContract = new ethers.Contract(BDT_ADDRESS, ERC20_ABI, provider);
    const bdtBalance = await bdtContract.balanceOf(address);

    // Get USD balance
    const usdContract = new ethers.Contract(USD_ADDRESS, ERC20_ABI, provider);
    const usdBalance = await usdContract.balanceOf(address);

    const balances = {
      ETH: ethers.formatEther(ethBalance),
      BDT: ethers.formatUnits(bdtBalance, 18),
      USD: ethers.formatUnits(usdBalance, 18),
    };

    return balances;
  } catch (error) {
    console.error("Failed to get balances:", error);
    return null;
  }
};

// Remove the direct call to getBalances
// getBalances("0xf8eD8B98d3423c3744606744f756a68198BeeA51")

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
        const gasLimit = await tokenContract.transfer.estimateGas(
          toAddress,
          amountInSmallestUnit
        );

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

export const fetchTxns = async (
  address: string
): Promise<UtilFuncsResponse> => {
  console.log("Started fetching Arbitrum txns", address);

  try {
    const response = await axios.get<{
      status: string;
      message: string;
      result: ArbiscanTx[];
    }>(ARBISCAN_API_URL, {
      params: {
        module: "account",
        action: "tokentx",
        address: address,
        startblock: 0,
        endblock: "latest",
        sort: "desc",
        apikey: ARBISCAN_API_KEY,
      },
    });

    if (response.data.status !== "1") {
      throw new Error(`Arbiscan API error: ${response.data.message}`);
    }

    const transactions: any = response.data.result.map((tx: ArbiscanTx) => {
      const date = new Date(Number(tx.timeStamp) * 1000);
      return {
        id: tx.hash,
        type:
          tx.from.toLowerCase() === address.toLowerCase() ? "send" : "receive",
        amount: ethers.formatUnits(tx.value, parseInt(tx.tokenDecimal)),
        tokenType: tx.tokenSymbol,
        from: tx.from,
        to: tx.to,
        date: date.toISOString().split("T")[0],
        time: date.toTimeString().split(" ")[0],
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

export const fetchFee = async (): Promise<string | null> => {
  try {
    const provider = getProvider();
    const swapContract = new ethers.Contract(
      swapContract_ADDRESS,
      swapContractAbi,
      provider
    );
    const val = await swapContract.getFeePercentage();
    console.log("Fetched Fee", val);
    return val.toString();
  } catch (error) {
    console.error("Error fetching fee", error);
  }
  return null;
};

export const fetchStakingData = async (address: string): Promise<stakeData> => {
  try {
    const provider = getProvider();
    const swapContract = new ethers.Contract(
      swapContract_ADDRESS,
      swapContractAbi,
      provider
    );

    const valBDT = await swapContract.getLiquidityBalance(address, BDT_ADDRESS);
    const valUSD = await swapContract.getLiquidityBalance(address, USD_ADDRESS);

    console.log("Fetched lp", valBDT, valUSD);
    return {
      usd: parseFloat(ethers.formatUnits(valUSD, 18)),
      bdt: parseFloat(ethers.formatUnits(valBDT, 18)),
    };
  } catch (error) {
    console.error("Error fetching fee", error);
    return {
      usd: 0,
      bdt: 0,
    };
  }
};

export const fetchAddressRewards = async (
  targetAddress: string
): Promise<stakeData> => {
  let bdtReward = 0;
  let usdReward = 0;

  try {
    const provider = getProvider();
    const swapContract = new ethers.Contract(
      swapContract_ADDRESS,
      swapContractAbi,
      provider
    );

    const filter = swapContract.filters.RewardsDistributed();
    const events = await swapContract.queryFilter(filter);

    const bdtContract = new ethers.Contract(
      BDT_ADDRESS,
      [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
      ],
      provider
    );

    const usdContract = new ethers.Contract(
      USD_ADDRESS,
      [
        "event Transfer(address indexed from, address indexed to, uint256 value)",
      ],
      provider
    );

    const normalizedAddress = targetAddress.toLowerCase();

    for (const event of events) {
      const receipt = await provider.getTransactionReceipt(
        event.transactionHash
      );
      if (!receipt) continue;

      const bdtTransfers = receipt.logs
        .filter(
          (log) =>
            log.address.toLowerCase() === BDT_ADDRESS.toLowerCase() &&
            bdtContract.interface.parseLog(log)
        )
        .map((log) => {
          const parsedLog = bdtContract.interface.parseLog(log);
          if (parsedLog) {
            const to = parsedLog.args[1].toLowerCase();
            return to === normalizedAddress
              ? parseFloat(ethers.formatUnits(parsedLog.args[2].toString(), 18))
              : 0;
          }
          return 0;
        });

      const usdTransfers = receipt.logs
        .filter(
          (log) =>
            log.address.toLowerCase() === USD_ADDRESS.toLowerCase() &&
            usdContract.interface.parseLog(log)
        )
        .map((log) => {
          const parsedLog = usdContract.interface.parseLog(log);
          if (parsedLog) {
            const to = parsedLog.args[1].toLowerCase();
            return to === normalizedAddress
              ? parseFloat(ethers.formatUnits(parsedLog.args[2].toString(), 18))
              : 0;
          }
          return 0;
        });

      bdtReward += bdtTransfers.reduce((a, b) => a + b, 0);
      usdReward += usdTransfers.reduce((a, b) => a + b, 0);
    }

    return { usd: usdReward, bdt: bdtReward };
  } catch (error) {
    console.error("Error fetching address rewards", error);
    return { usd: 0, bdt: 0 };
  }
};

// Common utilities for token operations
async function setupTokenOperation(tokenName: string, amount: number) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();

  // Get token contract address
  const tokenCA = tokenName === "BDT" ? BDT_ADDRESS : USD_ADDRESS;

  // Create token contract instance
  const tokenContract = new Contract(tokenCA, ERC20_ABI, signer);

  // Get token decimals and parse amount
  const decimals = await tokenContract.decimals();
  const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

  return {
    signer,
    signerAddress,
    tokenCA,
    tokenContract,
    parsedAmount,
  };
}

// Handle token approval
async function handleTokenApproval(
  tokenContract: Contract,
  signerAddress: string,
  parsedAmount: bigint
) {
  const currentAllowance = await tokenContract.allowance(
    signerAddress,
    swapContract_ADDRESS
  );

  const oneTimeBigAllowance = ethers.parseUnits("10000", 18);

  if (currentAllowance < parsedAmount) {
    const approveTx = await tokenContract.approve(
      swapContract_ADDRESS,
      oneTimeBigAllowance
    );
    const approvalReceipt = await approveTx.wait();
    return approvalReceipt.hash;
  }
  return null;
}

// Create and execute contract transaction
export const executeContractTransaction = async (
  signer: any,
  tokenCA: string,
  parsedAmount: bigint,
  operationType: "add" | "remove" | "swap"
) => {
  const liquidityContract = new Contract(
    swapContract_ADDRESS,
    swapContractAbi,
    signer
  );

  // Choose function based on operation type
  const contractFunction = {
    add: liquidityContract.addLiquidity,
    remove: liquidityContract.removeLiquidity,
    swap: liquidityContract.swap,
  }[operationType];

  // Estimate gas
  const estimatedGas = await contractFunction.estimateGas(
    tokenCA,
    parsedAmount
  );

  // Execute transaction
  const tx = await contractFunction(tokenCA, parsedAmount, {
    gasLimit: estimatedGas,
  });

  const receipt = await tx.wait();
  return receipt.hash;
};

// Main functions for adding and removing liquidity
export const addLiquidity = async (
  tokenName: string,
  amount: number
): Promise<ContractResponse> => {
  try {
    // Setup basic token operation
    const { signer, signerAddress, tokenCA, tokenContract, parsedAmount } =
      await setupTokenOperation(tokenName, amount);

    // Handle token approval if needed
    const approvalHash = await handleTokenApproval(
      tokenContract,
      signerAddress,
      parsedAmount
    );

    // Execute add liquidity transaction
    const transactionHash = await executeContractTransaction(
      signer,
      tokenCA,
      parsedAmount,
      "add"
    );

    return {
      success: true,
      transactionHash,
      approvalHash,
      signerAddress,
    };
  } catch (error) {
    console.error("Add liquidity failed:", error);
    return {
      success: false,
    };
  }
};

export const removeLiquidity = async (
  tokenName: string,
  amount: number
): Promise<ContractResponse> => {
  try {
    // Setup basic token operation
    const { signer, signerAddress, tokenCA, parsedAmount } =
      await setupTokenOperation(tokenName, amount);

    // Execute remove liquidity transaction
    const transactionHash = await executeContractTransaction(
      signer,
      tokenCA,
      parsedAmount,
      "remove"
    );

    return {
      success: true,
      transactionHash,
      signerAddress,
    };
  } catch (error) {
    console.error("Remove liquidity failed:", error);
    return {
      success: false,
    };
  }
};

export const swap = async (
  fromToken: string,
  amount: number
): Promise<ContractResponse> => {
  try {
    // Setup basic token operation for source token
    const {
      signer,
      signerAddress,
      tokenCA: fromTokenCA,
      tokenContract: fromTokenContract,
      parsedAmount,
    } = await setupTokenOperation(fromToken, amount);

    // Handle token approval if needed
    const approvalHash = await handleTokenApproval(
      fromTokenContract,
      signerAddress,
      parsedAmount
    );

    // Create swap contract instance
    const swapContract = new Contract(
      swapContract_ADDRESS,
      swapContractAbi,
      signer
    );

    // Estimate gas for swap
    const estimatedGas = await swapContract.swap.estimateGas(
      fromTokenCA,
      parsedAmount
    );

    // Execute swap
    const swapTx = await swapContract.swap(fromTokenCA, parsedAmount, {
      gasLimit: estimatedGas,
    });

    const receipt = await swapTx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      approvalHash,
      signerAddress,
      fromToken,
      amount,
    };
  } catch (error) {
    console.error("Token swap failed:", error);
    return {
      success: false,
    };
  }
};

export const getFaucetTokens = async (): Promise<boolean> => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(faucet_ADDRESS, faucetAbi, signer);

  try {
    const tx = await contract.getTokens();
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error in faucet", error);
    return false;
  }
};
