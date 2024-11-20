"use client";
import React, { useState, useEffect } from "react";
import { getBalances, sendMoney } from "../../lib/web3/etherutiles";
import { ModalProps } from "@/types/ModalProps";
import {
  FiChevronDown,
  FiDollarSign,
  FiSend,
  FiUser,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { WalletCardProps } from "@/types/WalletCardProps";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletProvider";
import axios from "axios";
import { addressBookType } from "@/types/AddressBook";
import { TokenType } from "@/types/TokenInfo";
import getTokenPriceInUSD from "@/helpers/getPriceInUsd";

const trimAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

interface SendMoneyProps extends WalletCardProps, ModalProps {
  scannedAddress?: string;
}

const SendMoneyComponent: React.FC<SendMoneyProps> = ({
  isOpen,
  onClose,
  scannedAddress,
}) => {

  const { address,usdPrice, setBdtBal, walletBalance, setEthBal,setUsdBal,setWalletBalance,bdtBal, usdBal,ethBal } = useWallet();
  const [addressBook, setAddressBook] = useState<Array<addressBookType>>([]);
  const [recipient, setRecipient] = useState(scannedAddress || "");
  const [amount, setAmount] = useState("");
  const [searchResults, setSearchResults] = useState<Array<addressBookType>>(
    []
  );
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenType>("BDT");


  useEffect(() => {
    if (isOpen) {
      if (scannedAddress) {
        setRecipient(scannedAddress);
        setSelectedAddress(scannedAddress);
      }

      Promise.all([getAddressBook()]).catch((err) => {
        console.error("Error initializing component:", err);
      });
    }
  }, [isOpen, scannedAddress, address]);

  const getAddressBook = async () => {
    try {
      const res = await axios.get("/api/v1/user");
      const data = res.data.data?.addressBook || [];
      setAddressBook(data);
    } catch (err) {
      console.error("Error fetching address book:", err);
      setAddressBook([]);
    }
  };


  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipient(value);
    setSelectedAddress(value);

    if (value.length > 0) {
      const results = addressBook.filter(
        (entry) =>
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
    // Check if the address and amount are valid
    if (/^0x[a-fA-F0-9]{40}$/.test(selectedAddress)) {
      // Ensure the selectedToken is valid
      if (selectedToken) {
        setShowConfirmation(true);
      } else {
        toast.error("Please select a valid token.");
      }
    } else {
      toast.error("Invalid Ethereum address format");
    }
  };

  const updateWalletBalance = async (amount : string) => {
    if (walletBalance !== null) {
      try {
        const conv : any = await getTokenPriceInUSD("ethereum");
        const newBalance = (parseFloat(walletBalance) - parseFloat(amount) * conv.price * usdPrice).toString();
        setWalletBalance(newBalance);
      } catch (error) {
        console.error("Failed to fetch token price or update balance:", error);
      }
    }
  };
  
  

  const confirmSend = async () => {
    const toastId = toast.loading("Executing the transaction...", {
      duration: 30000,
    });
  
    try {
      // Ensure the selectedToken is valid and available
      if (!selectedToken) {
        throw new Error("Token is not selected or invalid");
      }
  
      const result = await sendMoney(selectedAddress, amount, selectedToken);
  
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Transaction successful!", {
          duration: 5000,
        });
  
        if (selectedToken === "BDT") {
          setBdtBal((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) - parseFloat(amount)).toString();
            }
            return bdtBal;
          });
  
          setWalletBalance((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) - parseFloat(amount)).toString();
            }
            return walletBalance ;
          });

        } else if (selectedToken === "USD") {
          setUsdBal((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) - parseFloat(amount)).toString();
            }
            return usdBal;
          });

          setWalletBalance((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) - parseFloat(amount)*usdPrice).toString();
            }
            return walletBalance ;
          });

          

        } else if (selectedToken === "ETH") {
          setEthBal((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) - parseFloat(amount)).toString();
            }
            return ethBal;
          });
          await updateWalletBalance(amount);

          
        }
  
        // await router.refresh();
        onClose();
      } else {
        console.error("Transaction failed");
        toast.error(`Transaction failed on else`, {
          duration: 2000,
        });
      }
    } catch (error: any) {
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
    setRecipient("");
    setAmount("");
    setSearchResults([]);
    setSelectedAddress("");
    setShowConfirmation(false);
    setSelectedToken("BDT");
    onClose();
  };

  const getAmount = () => {
    if(selectedToken == "BDT"){
      return bdtBal;
    }
    else if(selectedToken == "ETH"){
      return ethBal;
    }
    else if(selectedToken == "USD"){
      return usdBal;
    }
    else null;

  }

  const setMaxAmount = () => {
    if(selectedToken == "BDT" && bdtBal){
     setAmount(bdtBal);
    }
    else if(selectedToken == "ETH" && ethBal){
      setAmount(ethBal);
    }
    else if(selectedToken == "USD" && usdBal){
      setAmount(usdBal);
    }
    else null;

  }

  if (!isOpen) return null;

  return ( 
    <div className="fixed  inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50  flex items-center justify-center">
      
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Send Money</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {!showConfirmation ? (
          <>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="recipient"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Recipient
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="recipient"
                    value={recipient}
                    onChange={handleRecipientChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md text-gray-900"
                    placeholder="Address or ENS name"
                  />
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-48 overflow-auto border border-gray-300">
                      {searchResults.map((entry, index) => (
                        <li
                          key={index}
                          className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                          onClick={() => handleSelectRecipient(entry.address)}
                        >
                          {entry.name} - {trimAddress(entry.address)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiDollarSign className="text-gray-400" />
                  </div>

                  <div className="flex flex-row gap-1">
                    <div>

                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md text-gray-900"
                    placeholder="0.00"
                    />
                    </div>
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <label htmlFor="token" className="sr-only">
                      Token
                    </label>
                    <select
                      id="token"
                      name="token"
                      value={selectedToken}
                      onChange={(e) =>
                        setSelectedToken(e.target.value as TokenType)
                      }
                      className="focus:ring-blue-500 focus:border-blue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                      >
                      <option>ETH</option>
                      <option>BDT</option>
                      <option>USD</option>
                    </select>
                  </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Balance: {getAmount()} {selectedToken}
                </span>
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={
                    () => setMaxAmount()}
                >
                  Max
                </button>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSend}
                disabled={!recipient || !amount}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !recipient || !amount
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                <FiSend className="mr-2" /> Send {selectedToken}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Confirm Transaction
              </h3>
              <p className="text-sm text-gray-600">
                You are about to send{" "}
                <span className="font-semibold">
                  {amount} {selectedToken}
                </span>{" "}
                to:
              </p>
              <p className="text-sm font-mono bg-gray-200 p-2 rounded mt-1">
                {recipient}
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmSend}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMoneyComponent;
