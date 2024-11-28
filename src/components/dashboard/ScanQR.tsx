"use client";

import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ModalProps } from '@/types/ModalProps';

interface QRScannerProps extends ModalProps {
  handleAddressScanned?: (address: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, handleAddressScanned }) => {

  const handleDecode = (result: any) => {
    if (/^0x[a-fA-F0-9]{40}$/.test(result[0].rawValue)) {
      if (handleAddressScanned) handleAddressScanned(result[0].rawValue);
      onClose();
    } else {
      toast.error("Invalid Ethereum address format");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
    <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
      <button
        onClick={()=>{
          onClose();
        }}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
      >
        <FiX size={24} />
      </button>
      <h2 className="text-3xl text-center mb-6 font-extrabold text-blue-600">Scan QR Code</h2>
      <div className="relative h-64 md:h-96 w-full">
        <Scanner
        components={ {audio : false} }        
          onScan={(result) => {
            handleDecode(result);
          }}
          constraints={{ facingMode: 'environment' }}
        />
      </div>
      <p className="text-gray-600 text-center mt-4 text-sm">
        Position the QR code within the frame to scan.
      </p>
    </div>
  </div>
  
  );
};

export default QRScanner;