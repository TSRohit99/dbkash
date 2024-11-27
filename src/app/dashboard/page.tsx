"use client";

import BottomNav from "@/components/dashboard/BottomNav";
import ConnectMetamask from "@/components/dashboard/ConnectWallet";
import FeatureButtons from "@/components/dashboard/Features";
import TokensList from "@/components/dashboard/Tokens";
import WalletInterface from "@/components/dashboard/WalletCard";
import { useWallet } from "@/context/WalletProvider";
import { useEffect, useState } from "react";
import LoadingPage from "../loading";

export default function Dashboard() {
  const { address } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean | null>(null); // Start with `null` to signify "loading"
  const [scannedAddress, setScannedAddress] = useState("");

  const handleAddressScanned = (address: string) => {
    setScannedAddress(address);
  };

  useEffect(() => {
    // Delay rendering until the address check is complete
    if (address === undefined) {
      setIsWalletModalOpen(null); // Still loading
    } else {
      setIsWalletModalOpen(!address); // Open modal if no address is found
    }
  }, [address]);

  if (isWalletModalOpen === null) {
    // Show a loading state until we determine whether the modal should open
    return <LoadingPage />;
  }

  return (
    <>
      {!isWalletModalOpen ? (
        <div className="px-2 mt-3">
          <WalletInterface
            scannedAddress={scannedAddress}
            handleAddressScanned={handleAddressScanned}
          />
          <TokensList />
          <FeatureButtons />
          <div className="p-10"></div>
          <BottomNav handleAddressScanned={handleAddressScanned} />
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
