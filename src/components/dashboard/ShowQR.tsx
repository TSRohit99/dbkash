"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiX, FiCopy } from 'react-icons/fi';
import {copyToClipboard} from '@/helpers/CopyItem'

interface WalletQRProps {
  isOpen: boolean;  
  address: string | null;
  onClose: () => void;
}

const WalletQR: React.FC<WalletQRProps> = ({ address,isOpen, onClose }) => {
    if (!isOpen) return null;
  const [copied, setCopied] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
        >
          <FiX size={24} />
        </button>
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Scan to Send Funds</h2>
        <div className="flex justify-center mb-6">
          <QRCodeSVG value={address || "Not found"} size={200} />
        </div>
        <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600 truncate mr-2">{address}</span>
          <button
            onClick={()=>{copyToClipboard(address)
              setCopied(true)
            }}
            className="text-blue-500 hover:text-blue-600 transition duration-300"
          >
            <FiCopy size={20} />
          </button>
        </div>
        {copied && (
          <p className="text-green-500 text-sm text-center">Address copied to clipboard!</p>
        )}
        <p className="text-gray-600 text-center mt-4 text-sm">
          Scan this QR code or copy the address to send funds to this wallet.
        </p>
      </div>
    </div>
  );
};

export default WalletQR;