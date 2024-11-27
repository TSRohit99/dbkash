'use client'

import React, { useState } from "react";
import { FaRegAddressBook } from "react-icons/fa";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import AddressBookComponent from "./AddressBook";
import ArbiWinzLogo from "./ArbiWinzLogo";
import StakeModal from "./Stake";

const FeatureButtons: React.FC = () => {
  const features = [
    { icon: <FaMoneyBillTrendUp />, label: "Stake", color: "bg-green-500", hover: "hover:bg-green-600" },
    { icon: <FaRegAddressBook />, label: "Address Book", color: "bg-purple-500", hover: "hover:bg-purple-600" },
    { 
      icon: <ArbiWinzLogo />, 
      label: "Play Lottery", 
      color: "bg-blue-900", 
      hover: "hover:from-indigo-700 hover:via-blue-600 hover:to-cyan-600" 
    },
  ];
  
  const [isABModalOpen, setIsABModalOpen] = useState(false);

  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

  const handleAddressBook = () => {
    setIsABModalOpen(true);
  };

  const handleStake = () => {
    setIsStakeModalOpen(true);
  };

  const handlePlayLottery = () => {
    // Open the Play Lottery page in a new tab
    window.open("https://arbiwinz.vercel.app/", "_blank");
  };

  return (
    <>
      <div className="flex justify-between mt-6 gap-2 md:px-20">
        {features.map((feature, index) => (
          <button
            onClick={() => {
              if (feature.label === "Address Book") {
                handleAddressBook();
              }
              if (feature.label === "Play Lottery") {
                handlePlayLottery();
              }
              if (feature.label ===  "Stake") {
                handleStake();
              }
            }}
            key={index}
            className={`${feature.color} ${feature.hover} text-white rounded-full p-3 flex flex-col items-center w-1/3 md:w-1/5 border`}
          >
            {feature.icon}
            <span className="text-xs mt-1">{feature.label}</span>
          </button>
        ))}
      </div>
      <AddressBookComponent isOpen={isABModalOpen} onClose={() => setIsABModalOpen(false)} />
      <StakeModal isOpen={isStakeModalOpen} onClose={() => setIsStakeModalOpen(false)} />
    </>
  );
};

export default FeatureButtons;
