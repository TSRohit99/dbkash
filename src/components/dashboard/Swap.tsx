"use client";
import React, { useState } from "react";
import { ArrowDownCircle, X } from "lucide-react";
import { ModalProps } from "@/types/ModalProps";
import { swap } from "@/lib/web3/etherutiles";
import { useWallet } from "@/context/WalletProvider";
import { ContractResponse } from "@/types/ContractResponse";
import toast from "react-hot-toast";

const SwapInterface: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const {
    usdPrice,
    swapFee,
    bdtBal,
    usdBal,
    walletBalance,
    setBdtBal,
    setUsdBal,
    setWalletBalance,
  } = useWallet();
  const [isBDT, setIsBDT] = useState(true);
  const [payAmount, setPayAmount] = useState("0");
  const [receiveAmount, setReceiveAmount] = useState("0");
  const [estimatedAmountUSD, setEstimatedAmountUSD] = useState("0");
  const [estimatedAmountBDT, setEstimatedAmountBDT] = useState("0");
  const swapFeeP = swapFee ? parseFloat(swapFee) / 100 : 0.02;

  const calculateConversion = (amount: string, fromBDT: boolean) => {
    if (amount === "" || amount === "0") {
      return {
        receiveAmount: "0",
        estimatedAmount: "0",
      };
    }

    const numAmount = parseFloat(amount);
    let receivedVal: number;
    let estimatedVal: number;

    if (fromBDT) {
      // Converting from BDT to USD
      receivedVal = numAmount / usdPrice;
      estimatedVal = receivedVal - receivedVal * swapFeeP; // 2% fee
      return {
        receiveAmount: receivedVal.toString(),
        estimatedAmount: estimatedVal.toString(),
      };
    } else {
      // Converting from USD to BDT
      receivedVal = numAmount * usdPrice;
      estimatedVal = receivedVal - receivedVal * swapFeeP; // 2% fee
      return {
        receiveAmount: receivedVal.toString(),
        estimatedAmount: estimatedVal.toString(),
      };
    }
  };

  const handleConv = (amount: string) => {
    setPayAmount(amount);
    const { receiveAmount: convertedAmount, estimatedAmount } =
      calculateConversion(amount, isBDT);
    setReceiveAmount(convertedAmount);

    if (isBDT) {
      setEstimatedAmountBDT(estimatedAmount);
    } else {
      setEstimatedAmountUSD(estimatedAmount);
    }
  };

  const handleArrowSwap = () => {
    setIsBDT(!isBDT);
    // When swapping, we need to recalculate based on the new currency direction
    const { receiveAmount: convertedAmount, estimatedAmount } =
      calculateConversion(payAmount, !isBDT);
    setReceiveAmount(convertedAmount);

    if (!isBDT) {
      // Note: we use !isBDT because the state hasn't updated yet
      setEstimatedAmountBDT(estimatedAmount);
    } else {
      setEstimatedAmountUSD(estimatedAmount);
    }
  };

  const clearModal = () => {
    setEstimatedAmountBDT("0");
    setEstimatedAmountUSD("0");
    setPayAmount("0");
    setReceiveAmount("0");
  };

  const handleSwap = async () => {
    const token = isBDT ? "BDT" : "USD";
    const toastId = toast.loading("Executing the transaction...", {
      duration: 600000,
    });

    try {
      const amount = parseFloat(payAmount);
      const val: ContractResponse = await swap(token,amount );
      const conf = `You have succesfully swapped ${amount} ${token} for ${receiveAmount} ${token == "BDT" ? "USD" : "BDT"}`
      if (val.success) {
        toast.dismiss(toastId);
        onClose();
        toast.success(conf, {
          duration: 5000,
        });

        if (token == "BDT") {
          setBdtBal((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) - parseFloat(payAmount)).toString();
            }
            return bdtBal;
          });

          setUsdBal((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) + parseFloat(estimatedAmountUSD)).toString();
            }
            return usdBal;
          });
        } else {
          setUsdBal((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) - parseFloat(payAmount)).toString();
            }
            return usdBal;
          });

          setBdtBal((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) + parseFloat(estimatedAmountBDT)).toString();
            }
            return bdtBal;
          });
        }

        setWalletBalance((prev: string | null) => {
          if (prev) {
            return (
              parseFloat(prev) -
              parseFloat(receiveAmount) * swapFeeP
            ).toString();
          }
          return walletBalance;
        });

        clearModal();
      } else {
        toast.dismiss(toastId);
        toast.error("Swapping Failed!", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error in swap :", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed text-gray-700 inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="w-96 bg-white rounded-xl shadow-lg p-6 relative z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>

        <div className="text-xl font-semibold text-blue-600 mb-6">Swap</div>

        <div className="space-y-2 mb-2">
          <div className="text-sm text-gray-600">Pay</div>
          <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <input
              type="number"
              value={payAmount}
              onChange={(e) => handleConv(e.target.value)}
              className="bg-transparent text-2xl font-semibold outline-none w-1/2"
            />
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <div
                className={`w-6 h-6 rounded-full ${
                  isBDT ? "bg-green-500" : "bg-blue-600"
                } flex items-center justify-center text-white text-xs`}
              >
                {isBDT ? "B" : "$"}
              </div>
              <span className="font-medium">{isBDT ? "BDT" : "USD"}</span>
            </div>
          </div>
          <div className="text-sm text-gray-400 pl-2">~{payAmount}</div>
        </div>

        <div className="flex justify-center -my-2">
          <button
            onClick={handleArrowSwap}
            className="transform transition-transform hover:scale-110"
          >
            <ArrowDownCircle className="w-8 h-8 text-blue-600 bg-white rounded-full" />
          </button>
        </div>

        <div className="space-y-2 mt-2">
          <div className="text-sm text-gray-600">Receive</div>
          <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <input
              type="text"
              value={receiveAmount}
              readOnly
              className="bg-transparent text-2xl font-semibold outline-none w-1/2 cursor-not-allowed"
            />
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <div
                className={`w-6 h-6 rounded-full ${
                  !isBDT ? "bg-green-500" : "bg-blue-600"
                } flex items-center justify-center text-white text-xs`}
              >
                {!isBDT ? "B" : "$"}
              </div>
              <span className="font-medium">{!isBDT ? "BDT" : "USD"}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 flex items-center gap-1">
          You Get (incl. fees)
          <span className="font-medium text-gray-900">
            {isBDT ? estimatedAmountBDT : estimatedAmountUSD}
          </span>
          <span className="font-medium text-gray-900">
            {!isBDT ? "BDT" : "USD"}
          </span>
        </div>

        <button
          onClick={handleSwap}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-4 mt-6 font-medium transition-colors"
        >
          Swap
        </button>
      </div>
    </div>
  );
};

export default SwapInterface;
