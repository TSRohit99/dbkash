import { useWallet } from "@/context/WalletProvider";
import { getFaucetTokens } from "@/lib/web3/etherutiles";
import { ModalProps } from "@/types/ModalProps";
import React, { useState } from "react";
import toast from "react-hot-toast";

const ClaimModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const {usdPrice,setBdtBal,setUsdBal,setWalletBalance} = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const amount = 20;

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const val = await getFaucetTokens(); // Call the claim function passed as a prop
      if(val){
      toast.success("Tokens claimed successfully!"); // Success message
      setBdtBal((prev) => (parseFloat(prev || "0") + amount).toFixed(2));
      setUsdBal((prev) =>
        (parseFloat(prev || "0") + amount).toFixed(2)
      );
      setWalletBalance((prev) =>
        (
          parseFloat(prev || "0") +
          (20+20*usdPrice)
        ).toFixed(3)
      );
      onClose();
       } // Close the modal
      else {
        toast.error("Tokens claim failed!");
      }
    } catch (error) {
      console.error("Error claiming tokens:", error);
      toast.error("Failed to claim tokens.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null; // Do not render if modal is not open

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative w-full max-w-md p-6 bg-white text-gray-800 rounded-lg shadow-xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="font-bold text-[#1199fa] bg-gradient-to-bl from-blue-500 to-customBlue rounded-xl p-1 w-28 text-center box-border">
          <span className="text-[#1199fa]">d</span>
          <span className="text-white">BKash</span>
        </h2>
        <button
          onClick={onClose}
          className="text-black hover:text-gray-600 transition text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Main Content */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Get free BDT and USD tokens for testing! Click the button below to claim your tokens and enjoy exploring the dBKash platform.
      </p>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleClaim}
          disabled={isLoading}
          className={`px-6 py-2 font-semibold text-white bg-[#1199fa] rounded-lg shadow-md hover:bg-[#0f82d0] transition ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Claiming..." : "Claim Tokens"}
        </button>
      </div>
    </div>
  </div>
  );
};

export default ClaimModal;
