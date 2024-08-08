"use client";

import React, { useState } from "react";
import { FiHome, FiCamera, FiList } from "react-icons/fi";
import QRScanner from "./ScanQR";

const BottomNav : React.FC = () => {
  const [active, setActive] = useState("Home");
  const [isQRScanModalOpen, seIsQRScanModalOpen] = useState(false);

  const navItems = [
    { icon: <FiHome />, label: "Home" },
    { icon: <FiCamera />, label: "Scan QR" },
    { icon: <FiList />, label: "Txns" },
  ];

  return (
    <>
    <div className="fixed rounded-lg bottom-0 left-1 right-1 bg-white shadow-lg flex justify-around py-2">
      {navItems.map((navItem, index) => (
        <button
          key={index}
          className={`flex flex-col items-center ${
            active === navItem.label ? "text-blue-500" : "text-gray-800"
          }`}
          onClick={() => {setActive(navItem.label)
            if(navItem.label==="Scan QR"){
              seIsQRScanModalOpen(true);
            }
          }}
        >
          {React.cloneElement(navItem.icon, {
            className: active === navItem.label ? "fill-current" : "",
          })}
          <span className="text-xs mt-1">{navItem.label}</span>
        </button>
      ))}

    </div>
    <QRScanner isOpen={isQRScanModalOpen} onClose={()=>seIsQRScanModalOpen(false)}/>
    </>
  );
};

export default BottomNav;
