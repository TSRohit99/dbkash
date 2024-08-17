'use client'

import React, { useState } from "react";
import { FaRegAddressBook } from "react-icons/fa";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { LuUtilityPole } from "react-icons/lu";
import AddressBookComponent from "./AddressBook";



const FeatureButtons: React.FC = () => {
  const features = [
    { icon: <FaMoneyBillTrendUp />, label: "Stake", color: "bg-green-500", hover: "hover:bg-green-600" },
    { icon: <FaRegAddressBook />, label: "Address Book", color: "bg-purple-500", hover: "hover:bg-purple-600" },
    { icon: <LuUtilityPole  />, label: "Pay Utility", color: "bg-red-500", hover: "hover:bg-red-600" },
  ];
  const [isABModalOpen, setIsABModalOpen] = useState(false);

  const handleAddressBook = ()=>{
    setIsABModalOpen(true);
  }

  return (
   <>
    <div className="flex justify-between mt-6 gap-2 md:px-20">
      {features.map((feature, index) => (
        <button
         onClick={ ()=> {
          if(feature.label === "Address Book"){
            handleAddressBook();
          }
          
         }
         }
          key={index}
          className={`${feature.color} ${feature.hover} text-white rounded-full p-3 flex flex-col items-center w-1/3 md:w-1/5`      
        }
        >
          {feature.icon}
          <span className="text-xs mt-1">{feature.label}</span>
        </button>
      ))}
    </div>
    <AddressBookComponent  isOpen={isABModalOpen} onClose={() => setIsABModalOpen(false)} />
    </>
  );
};

export default FeatureButtons;
