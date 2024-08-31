'use client';
import React, { useState, useEffect } from 'react';
import { sendMoney, fetchGasPrice } from '../../lib/web3/etherutiles';
import { ModalProps } from '@/types/ModalProps';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { WalletCardProps } from '@/types/WalletCardProps';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletProvider';
import axios from 'axios';


const trimAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

interface SendMoneyProps extends WalletCardProps, ModalProps {
}

type addressBookType = {
  name: string,
  address: string,

}
type GasItems = {
  estimatedGasFee: string,
  gasPriceGwei: string,

}

const SendMoneyComponent: React.FC<SendMoneyProps> = ({ isOpen, onClose,scannedAddress }) => {
  if(!isOpen) return null;
  const { address } = useWallet();
  const [addressBook, setAddressBook] = useState<Array<addressBookType>>([]);
  const router = useRouter();
  const [recipient, setRecipient] = useState(scannedAddress);
  const [amount, setAmount] = useState('');
  const [searchResults, setSearchResults] = useState<Array<addressBookType>>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [estimatedGasPrice, setEstimatedGasPrice] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (scannedAddress) {
        setRecipient(scannedAddress);
        setSelectedAddress(scannedAddress);
      }

      Promise.all([
        getAddressBook(),
        getGasPrice()
      ]).catch(err => {
        console.error('Error initializing component:', err);
      })
    }
  }, [isOpen, scannedAddress, address]);

  const getAddressBook = async () => {
    try {
      const res = await axios.get('/api/v1/user');
      const data = res.data.data?.addressBook || [];
      setAddressBook(data);
    } catch (err) {
      console.error('Error fetching address book:', err);
      setAddressBook([]);
    }
  };

  const getGasPrice = async () => {
    try {
      const price : GasItems = await fetchGasPrice();
      setGasPrice(price.gasPriceGwei);
      setEstimatedGasPrice(price.estimatedGasFee);
    } catch (err) {
      console.error('Error fetching gas price:', err);
      setGasPrice(null);
    }
  };


  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipient(value);
    setSelectedAddress(value);
    
    if (value.length > 0) {
      const results = addressBook.filter(entry => 
        entry.name.toLowerCase().includes(value.toLowerCase()) ||
        entry.address.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectRecipient = (address: string) => {
    setSelectedAddress(address);
    setRecipient(address);
    setSearchResults([]);
  };

  const handleSend = async () => {
    if (/^0x[a-fA-F0-9]{40}$/.test(selectedAddress)) {
      setShowConfirmation(true);      
    } else {
      toast.error("Invalid Ethereum address format");
    }
  };
  const confirmSend = async () => {
    const toastId = toast.loading("Executing the transaction...", {
      duration: 20000,
    });
  
    try {
      const result = await sendMoney(selectedAddress, amount);
      
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Transaction successful!", {
          duration: 5000,
        });
        await router.refresh();
        onClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error : any) {
      console.error("Transaction failed:", error);
      toast.dismiss(toastId);
      toast.error(`Transaction failed: ${error.message}`, {
        duration: 7000,
      });
    } finally {
      setShowConfirmation(false);
    }
  };

  const handleClose = () => {
    setRecipient('');
    setAmount('');
    setSearchResults([]);
    setSelectedAddress('');
    setShowConfirmation(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-black">
      <div className="bg-white p-6 rounded-lg shadow-xl relative max-w-md w-full max-h-[calc(100vh-2rem)] flex flex-col">
        <button 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={handleClose}
        >
          <FiX size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Send Money</h2>
        <div className="flex-grow overflow-y-auto">
          <div className="mb-4">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">To:</label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={handleRecipientChange}
              placeholder="Name or address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchResults.length > 0 && (
              <ul className="mt-1 bg-white border border-gray-300 rounded-md shadow-sm">
                {searchResults.map((result, index) => (
                  <li 
                    key={index} 
                    onClick={() => handleSelectRecipient(result.address)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {result.name} ({trimAddress(result.address)})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (ETH):</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.0001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {showConfirmation && (
            <div className="mt-4 p-4 border border-gray-300 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Confirm Transaction</h3>
              <p className="mb-1 text-sm">To: {trimAddress(selectedAddress)}</p>
              <p className="mb-1 text-sm">Amount: {amount} ETH</p>
              <p className="mb-1 text-sm">Gas Price: {gasPrice} Gwei</p>
              <p className="mb-3 text-sm">Estimated Gas Fee: {estimatedGasPrice} ETH</p>
            </div>
          )}
        </div>
        <div className="h-10 mt-4 flex justify-end space-x-2">
          {showConfirmation ? (
            <>
              <button 
                onClick={confirmSend}
                className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Confirm
              </button>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={handleSend}
              disabled={!recipient || !amount || !gasPrice}
              className={`w-full ${!recipient || !amount || !gasPrice ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendMoneyComponent;