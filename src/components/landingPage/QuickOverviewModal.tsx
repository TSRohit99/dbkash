"use client";

import React from "react";

interface QuickOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickOverviewModal: React.FC<QuickOverviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="mt-72 fixed inset-0 text-black bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full transform transition-all duration-300 ease-in-out">
        <h2 className="font-bold text-[#1199fa] bg-gradient-to-bl from-blue-500 to-customBlue rounded-xl p-1 w-28 text-center box-border">
          <span className="text-[#1199fa]">d</span>
          <span className="text-white">BKash</span>
        </h2>
        <ul className="space-y-2 mt-4">
          <li>
            <span className="font-semibold">Project:</span> dBKash
          </li>
          <li>
            <span className="font-semibold">Token 1:</span> BDT (Bangladesh
            Digital Taka)
          </li>
          <li>
            <span className="font-semibold">Token 2:</span> USD (United States Dollar)
          </li>
          <li>
            <span className="font-semibold">Network:</span> Arbitrum (Ethereum
            L2)
          </li>
          <li>
            <span className="font-semibold">Test Environment:</span> Arbitrum
            Sepolia
          </li>
          <li>
            <span className="font-semibold">Tech Stack:</span> Nextjs,
            ethers.js, Solidity
          </li>
        </ul>
        <button
          onClick={onClose}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QuickOverviewModal;
