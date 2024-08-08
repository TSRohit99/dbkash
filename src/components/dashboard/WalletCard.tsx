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
import { copyToClipboard } from '@/helpers/CopyItem';
import { getBalance } from '../../lib/web3/etherutiles';
import { useWallet } from "@/context/WalletProvider";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"


const addressTrimmer = (address: string | null) => {
  return address ? (`${address.slice(0, 4)}...${address.slice(-3)}`).toLowerCase() : null;
}

const WalletInterface: React.FC = () => {
  const router = useRouter();
  const { address, disconnect } = useWallet();
  const [trimmedWalletAddress, setTrimmedWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [userName, setUserName] = useState<String | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    if (address) {
      setUserName("Anon Dude")
      setTrimmedWalletAddress(addressTrimmer(address));
      fetchBalance();
    }
  }, [address]);

  const fetchBalance = async () => {
    if (address) {
      const balanceValue: any = await getBalance(address);
      setWalletBalance(balanceValue);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    router.replace('/');
    if (address === null) toast.error('Could not log out!');
    else toast.success('Successfully logged out!');
    
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
            <button>
              <FiSettings className="inline-block mr-3 text-xl" />
            </button>
            <button onClick={handleDisconnect}>
              <LuLogOut className="inline-block text-xl" />
            </button>
          </div>
        </div>

        <div className="text-lg font-bold mb-2">{userName ||(
                <Skeleton className="h-5 w-[80px] bg-white" />
              )}</div>
        <div className="text-4xl font-bold mb-2  flex flex-row">{walletBalance||(
                <Skeleton className="h-7 w-[58px] mt-2 bg-white" />
              )} ETH</div>
        <div className="flex mt-4 gap-2">
          <div className="text-sm">{trimmedWalletAddress ||(
                <Skeleton className="h-4 w-[60px] bg-white" />
              )}</div>
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
            className="bg-white hover:bg-blue-100 transition duration-300 hover:p-2 w-1/4 text-blue-500 rounded-lg p-3 flex flex-col items-center"
          >
            <FiArrowUp />
            <span className="text-xs mt-1">Send</span>
          </button>

          <button
            className="bg-white hover:bg-blue-100 transition duration-300 hover:p-2 w-1/4 text-blue-500 rounded-lg p-3 flex flex-col items-center"
          >
            <FiRefreshCw />
            <span className="text-xs mt-1">Swap</span>
          </button>
        </div>
      </div>

      <WalletQR address={address} isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </>
  );
};

export default WalletInterface;
