"use client";

import BottomNav from "@/components/dashboard/BottomNav";
import FeatureButtons from "@/components/dashboard/Features";
import TokensList from "@/components/dashboard/Tokens";
import WalletInterface from "@/components/dashboard/WalletCard";


export default function dashboard() {

  
  return ( 
    <>
    <div className="px-2 mt-3">
     <WalletInterface />
     <TokensList />
     <FeatureButtons />
     <div className="p-10"> </div>
     <BottomNav />
    </div>
     
    </>
  );
}
