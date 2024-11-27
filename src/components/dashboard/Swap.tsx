"use client";
import React, { useState } from "react";
import { ArrowDownCircle, X } from "lucide-react";
import { ModalProps } from "@/types/ModalProps";
import { swap } from "@/lib/web3/etherutiles";
import { useWallet } from "@/context/WalletProvider";
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

  const [isBDT, setIsBDT] = useState(true); // Direction: true = BDT -> USD, false = USD -> BDT
  const [payAmount, setPayAmount] = useState("0");
  const [receiveAmount, setReceiveAmount] = useState("0");

  const swapFeeP = swapFee ? parseFloat(swapFee) / 100 : 0.02;

  /** Calculate receive amount based on pay amount */
  const calculateReceiveAmount = (amount: string, fromBDT: boolean): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return "0";

    const converted = fromBDT ? numAmount / usdPrice : numAmount * usdPrice;
    const afterFee = converted * (1 - swapFeeP); // Apply swap fee
    return afterFee.toFixed(2); // Round to 2 decimals
  };

  /** Handle input changes for pay amount */
  const handlePayAmountChange = (amount: string) => {
    setPayAmount(amount);
    const converted = calculateReceiveAmount(amount, isBDT);
    setReceiveAmount(converted);
  };

  /** Swap direction (BDT <-> USD) */
  const handleSwapDirection = () => {
    setIsBDT((prev) => !prev);
    const converted = calculateReceiveAmount(payAmount, !isBDT);
    setReceiveAmount(converted);
  };

  /** Execute the swap */
  const handleSwap = async () => {
    const fromToken = isBDT ? "BDT" : "USD";
    const toToken = isBDT ? "USD" : "BDT";
    const amount = parseFloat(payAmount);
    const receivedAmount = parseFloat(receiveAmount);

    if (
      isNaN(amount) ||
      amount <= 0 ||
      isNaN(receivedAmount) ||
      receivedAmount <= 0
    ) {
      toast.error("Invalid amount. Please enter a valid value.");
      return;
    }

    const toastId = toast.loading("Processing swap...", {
      duration: 40000,
    });

    try {
      const result = await swap(fromToken, amount);
      if (result.success) {
        // Update balances
        if (isBDT) {
          setBdtBal((prev) => (parseFloat(prev || "0") - amount).toFixed(2));
          setUsdBal((prev) =>
            (parseFloat(prev || "0") + receivedAmount).toFixed(2)
          );
        } else {
          setUsdBal((prev) => (parseFloat(prev || "0") - amount).toFixed(2));
          setBdtBal((prev) =>
            (parseFloat(prev || "0") + receivedAmount).toFixed(2)
          );
        }
        setWalletBalance((prev) =>
          (
            parseFloat(prev || "0") -
            (isBDT ? amount * swapFeeP : amount * usdPrice * swapFeeP)
          ).toFixed(3)
        );

        toast.dismiss(toastId);
        toast.success(
          `Successfully swapped ${amount} ${fromToken} for ${receivedAmount} ${toToken}`
        );
        onClose();
        clearInputs();
      } else {
        toast.error("Swap failed. Please try again.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Swap error:", error);
      toast.error("An error occurred during the swap.");
    }
  };

  /** Clear input fields */
  const clearInputs = () => {
    setPayAmount("0");
    setReceiveAmount("0");
  };

  const getMaxBalance = () => {
    return isBDT ? bdtBal : usdBal;
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
              onChange={(e) => handlePayAmountChange(e.target.value)}
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
          <div className="flex flex-row  text-sm text-gray-600 mb-2">
            <span>
              Max: {Number(getMaxBalance() ?? "0").toFixed(2)}{" "}
              {isBDT ? "BDT" : "USD"}
            </span>
          </div>
        </div>

        <div className="flex justify-center -my-2">
          <button
            onClick={handleSwapDirection}
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
          <span className="font-medium text-gray-900">{receiveAmount}</span>
          <span className="font-medium text-gray-900">
            {!isBDT ? "BDT" : "USD"}
          </span>
        </div>

        <button
          onClick={async () => await handleSwap()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-4 mt-6 font-medium transition-colors"
        >
          Swap
        </button>
      </div>
    </div>
  );
};

export default SwapInterface;
