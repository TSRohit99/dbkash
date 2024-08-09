"use client";

import BottomNav from "@/components/dashboard/BottomNav";
import ConnectMetamask from "@/components/dashboard/ConnectWallet";
import FeatureButtons from "@/components/dashboard/Features";
import TokensList from "@/components/dashboard/Tokens";
import WalletInterface from "@/components/dashboard/WalletCard";
import { useWallet } from "@/context/WalletProvider";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { address } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState('');
  const handleAddressScanned = (address: string) => {
    setScannedAddress(address);
  };

  useEffect(() => {
    if (address === null || address === undefined) {
      setIsWalletModalOpen(true);
    }
  }, [address]);

  return (
    <>
      {!isWalletModalOpen ? (
        <div className="px-2 mt-3">
          <WalletInterface scannedAddress={scannedAddress}/>
          <TokensList />
          <FeatureButtons />
          <div className="p-10"></div>
          <BottomNav handleAddressScanned={handleAddressScanned}/>
        </div>
      ) : (
        <ConnectMetamask
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
        />
      )}
    </>
  );
}
