"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ModalProps } from '@/types/ModalProps';

interface QRScannerProps extends ModalProps {
  handleAddressScanned?: (address: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, handleAddressScanned  }) => {
  // const router = useRouter()
  const [error, setError] = useState<string | null>(null);
  // const [address, setAddress] = useState<string | null>(null);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      const qrCodeScanner = new Html5Qrcode("reader");
      setHtml5QrCode(qrCodeScanner);
      startScan(qrCodeScanner);
    } else {
      stopScan();
    }

    return () => {
      stopScan();
    };
  }, [isOpen]);

  const startScan = (qrCodeScanner: Html5Qrcode) => {
    qrCodeScanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        handleScan,
        handleError
      )
      .catch(err => {
        console.error("Unable to start scanning", err);
        setError("Unable to start scanning");
      });
  };

  const stopScan = () => {
    if (html5QrCode) {
      html5QrCode.stop().catch(err => console.error("Failed to stop scanning", err));
    }
  };

  const handleScan = (decodedText: string) => {
    if (/^0x[a-fA-F0-9]{40}$/.test(decodedText)) {
      if(handleAddressScanned) handleAddressScanned(decodedText);
      onClose();
      stopScan();
    } else {
      setError("Invalid Ethereum address format");
      toast.error("Invalid Ethereum address format");
    }
  };

  const handleError = (err: string) => {
    console.error("QR Code Scan Error", err);
    setError("Error accessing camera");
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
        <button
          onClick={() => {
            onClose();
            stopScan();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
        >
          <FiX size={24} />
        </button>
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Scan QR Code</h2>
        <div id="reader" className="mb-6"></div>
        <p className="text-gray-600 text-center mt-4 text-sm">
          Position the QR code within the frame to scan.
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  ) : null;
};

export default QRScanner;