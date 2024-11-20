import React, { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Banknote, DollarSign } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";

const TokensList: React.FC = () => {
  const {bdtBal, usdBal,ethBal } = useWallet();

  const tokensList = [
    {
      name: "Bangladeshi Digital Taka",
      ticker: "BDT",
      value: bdtBal,
      icon: <Banknote className="h-6 w-6" />,
      gradientFrom: "from-green-500",
      gradientTo: "to-emerald-600",
    },
    {
      name: "United States Dollars",
      ticker: "USD",
      value: usdBal,
      icon: <DollarSign className="h-6 w-6" />,
      gradientFrom: "from-blue-500",
      gradientTo: "to-cyan-600",
    },
    {
      name: "Ethereum",
      ticker: "ETH",
      value: ethBal,
      icon: <FontAwesomeIcon icon={faEthereum} className="h-6 w-6" />,
      gradientFrom: "from-purple-500",
      gradientTo: "to-indigo-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 mt-6 shadow-lg text-gray-800">
      <div className="space-y-3 sm:space-y-4">
        {tokensList.map((token, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-3 sm:py-4 border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 px-2 sm:px-4 rounded-lg"
          >
            <div className="flex gap-2 sm:gap-3 items-center flex-1">
              <div
                className={`rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r ${token.gradientFrom} ${token.gradientTo} flex justify-center items-center text-white shadow-md`}
              >
                {token.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-semibold truncate">
                  {token.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {token.ticker}
                </div>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="font-bold text-sm sm:text-lg text-gray-800 flex items-center justify-end gap-1 sm:gap-2">
                {token.value ?? (
                  <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-400 rounded-md" />
                )}
                <span className="text-xs sm:text-base">{token.ticker}</span>
              </div>
              <div className="text-[10px] hidden md:block text-gray-500">
                Available Balance
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokensList;
