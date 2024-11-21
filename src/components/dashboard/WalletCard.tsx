"use client";

import React, { useEffect, useState } from "react";
import {
  FiSettings,
  FiPlus,
  FiArrowUp,
  FiRefreshCw,
  FiCopy,
} from "react-icons/fi";
import { LuLogOut } from "react-icons/lu";
import Link from "next/link";
import WalletQR from "./ShowQR";
import { copyToClipboard } from "@/helpers/CopyItem";
import { getBalances } from "../../lib/web3/etherutiles";
import { useWallet } from "@/context/WalletProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import SendMoneyComponent from "./SendMoney";
import { WalletCardProps } from "@/types/WalletCardProps";
import SettingsModal from "./Settings";
import axios from "axios";
import { checkIfTheyNew } from "@/lib/checkIfTheyNew";
import getTokenPriceInUSD from "@/helpers/getPriceInUsd";
import SwapInterface from "./Swap";

const addressTrimmer = (address: string | null) => {
  return address
    ? `${address.slice(0, 4)}...${address.slice(-3)}`.toLowerCase()
    : null;
};

const WalletInterface: React.FC<WalletCardProps> = ({ scannedAddress ,  handleAddressScanned}) => {
  const router = useRouter();
  const { address, disconnect, walletBalance, usdPrice } = useWallet();
  const [trimmedWalletAddress, setTrimmedWalletAddress] = useState<
    string | null
  >(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSMModalOpen, setIsSMModalOpen] = useState(false);
  const [isSTModalOpen, setIsSTModalOpen] = useState(false);
  const [isSwapModalOPen, setIsSwapModalOpen] = useState(false);

  useEffect(() => {
    if (address) {
      setTrimmedWalletAddress(addressTrimmer(address));
      getInfo();
    }
  }, [address]);

  useEffect(() => {
    if (scannedAddress) {
      setIsQrModalOpen(false);
      setIsSMModalOpen(true);
    }
  }, [scannedAddress]);

  const getInfo = async () => {
    try {
      const response = await axios.get("/api/v1/user");
      if (await response.data.success) {
        const data = await response.data.data;
        setUserName(await data.username);
        const emailValue = (await data.email) || "";
        setUserEmail(emailValue);
      } else {
        console.error("Couldnt get info!");
      }
    } catch (err: any) {
      if (!(await err.response.data.success)) {
        console.log("Checking if its a new user wallet....");
        if (address) {
          try {
            await checkIfTheyNew();
          } catch (error) {
            console.error(
              "Error creating new account while accountChanged :",
              error
            );
          } finally {
            window.location.reload();
          }
        }
      }

      console.error("Error fetching userInfo:", err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    router.replace("/");
    if (address === null) toast.error("Could not log out!");
    else toast.success("Successfully logged out!");
  };

  const handleSettings = () => {
    setIsSTModalOpen(true);
  };

  return (
    <>
      <div className="font-sans mx-auto bg-gradient-to-bl from-blue-500 to-customBlue rounded-3xl p-6 text-white m-0 box-border">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" target="_blank">
            <h2 className="text-3xl font-extrabold">
              <span className="text-[#1199fa]">d</span>BKash
            </h2>
          </Link>
          <div>
            <button onClick={handleSettings}>
              <FiSettings className="inline-block mr-3 text-xl" />
            </button>
            <button onClick={handleDisconnect}>
              <LuLogOut className="inline-block text-xl" />
            </button>
          </div>
        </div>

        <div className="text-lg font-bold mb-2">
          {userName || <Skeleton className="h-5 w-[80px] bg-white" />}
        </div>
        <div className="text-4xl font-bold mb-2 flex flex-row">
          {walletBalance != null && walletBalance !== undefined ? (
            `${parseFloat(walletBalance).toFixed(3)} BDT`
          ) : (
            <Skeleton className="h-7 w-[58px] mt-2 bg-white" />
          )}
        </div>

        <div className="flex mt-4 gap-2">
          <div className="text-sm">
            {trimmedWalletAddress || (
              <Skeleton className="h-4 w-[60px] bg-white" />
            )}
          </div>
          <div className="flex justify-center items-center hover:bg-blue-400 transition duration-300">
            <button onClick={() => copyToClipboard(address)}>
              <FiCopy />
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="bg-white hover:bg-blue-100 transition duration-300 hover:p-2 w-1/4 text-blue-500 rounded-lg p-3 flex flex-col items-center"
          >
            <FiPlus />
            <span className="text-xs mt-1">Receive</span>
          </button>

          <button
            onClick={() => {
              setIsSMModalOpen(true);
            }}
            className="bg-white hover:bg-blue-100 transition duration-300 hover:p-2 w-1/4 text-blue-500 rounded-lg p-3 flex flex-col items-center"
          >
            <FiArrowUp />
            <span className="text-xs mt-1">Send</span>
          </button>

          <button
            onClick={() => {
              setIsSwapModalOpen(true);
            }}
            className="bg-white hover:bg-blue-100 transition duration-300 hover:p-2 w-1/4 text-blue-500 rounded-lg p-3 flex flex-col items-center"
          >
            <FiRefreshCw />
            <span className="text-xs mt-1">Swap</span>
          </button>
        </div>
      </div>

      <WalletQR
        address={address}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
      <SettingsModal
        isOpen={isSTModalOpen}
        onClose={() => setIsSTModalOpen(false)}
        username={userName}
        setUsername={setUserName}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
      />
      <SendMoneyComponent
        isOpen={isSMModalOpen}
        onClose={() => setIsSMModalOpen(false)}
        scannedAddress={scannedAddress}
        handleAddressScanned = {handleAddressScanned}
      />

      <SwapInterface
        isOpen={isSwapModalOPen}
        onClose={() => setIsSwapModalOpen(false)}
      />
    </>
  );
};

export default WalletInterface;
