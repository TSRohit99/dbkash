"use client"

import React from "react";
import {
  FiSettings,
  FiCamera,
  FiPlus,
  FiArrowUp,
  FiRefreshCw,
  FiPercent,
} from "react-icons/fi";
import { LuLogOut } from "react-icons/lu"

const WalletInterface = () => {

  const btns = [
    { icon: <FiPlus />, label: "Receive" },
    { icon: <FiArrowUp />, label: "Send" },
    { icon: <FiRefreshCw />, label: "Swap" },
  ];

  return (
    <>
      <div className="font-sans  mx-auto bg-gradient-to-br from-blue-500 to-customBlue rounded-3xl p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">dBKash</h2>
          <div>
            <FiSettings className="inline-block mr-3 text-xl" />
            <LuLogOut className="inline-block text-xl" />
          </div>
        </div>

        <div className="text-lg font-bold mb-2">Rohit Sen</div>
        <div className="text-4xl font-bold mb-2">1000 BDT</div>
        <div className="mt-2 text-sm">UQC5Vx...EkjbSG ℹ️</div>

        <div className="flex justify-between mt-6">
          {btns.map((action, index) => (
            <button
              key={index}
              className="bg-white w-1/4 text-blue-500 rounded-lg p-3 flex flex-col items-center"
            >
              {action.icon}
              <span className="text-xs mt-1">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      

    </>
  );
};

export default WalletInterface;
