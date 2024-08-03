"use client";

import React from 'react';

interface QuickOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickOverviewModal: React.FC<QuickOverviewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="mt-72 fixed inset-0 text-black bg-black bg-opacity-100 z-50 flex justify-center items-center">
    <div className="bg-white rounded-lg p-8 max-w-md w-full transform transition-all duration-300 ease-in-out">
      <h2 className="text-2xl font-bold mb-4">Quick Overview</h2>
      <ul className="space-y-2">
        <li><span className="font-semibold">Project:</span> dBKash</li>
        <li><span className="font-semibold">Token:</span> BDT (Bangladesh Digital Taka)</li>
        <li><span className="font-semibold">Network:</span> Arbitrum (Ethereum L2)</li>
        <li><span className="font-semibold">Test Environment:</span> Arbitrum Goerli</li>
        <li><span className="font-semibold">Tech Stack:</span> Nextjs, Web3.js, Solidity</li>
      </ul>
      <button
        onClick={onClose}
        className="mt-6 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300"
      >
        Close
      </button>
    </div>
  </div>
);
};

export default QuickOverviewModal;