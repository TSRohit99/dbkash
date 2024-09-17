import { useWallet } from "@/context/WalletProvider";
import { getBalances } from "@/lib/web3/etherutiles";
import React, { useEffect, useState } from "react";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { Skeleton } from "../ui/skeleton";

const TokensList :  React.FC = () => {
  const { address } = useWallet();
  const [bdtBal, setBdtBal] = useState<number | null>(null)
  const [usdBal, setUsdBal] = useState<number | null>(null)
  const [ethBal, setEthBal] = useState<number | null>(null)

  useEffect(() => {
    if (address) {
      fetchBalance()
        .catch(error => {
          console.error("Error fetching balance:", error);
        });
    }
  }, [address]);

  const fetchBalance = async () => {
    if (address) {
      try {
        const balanceValue: any = await getBalances(address);
        setBdtBal(parseFloat(balanceValue?.BDT));
        setUsdBal(parseFloat(balanceValue?.USD));
        setEthBal(parseFloat(balanceValue?.ETH));
        
      } catch (error) {
        console.error("Error Fetching Balance : ", error);
      }
      
    }
  };
  const tokensList = [
    { name: "Bangladeshi Digital Taka", ticker: "BDT", value: bdtBal },
    { name: "United States Dollars", ticker: "USD", value: usdBal },
    { name: "Ethereum", ticker: "ETH", value: ethBal },
  
  ];

  return (
    <div className="bg-white rounded-xl p-6 mt-6 shadow-lg text-gray-800">
      {tokensList.map((token, index) => (
        <div
          key={index}
          className="flex justify-between items-center py-4 border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
        >
          <div className="flex gap-3 w-2/3 items-center">
            <div className="rounded-full h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 flex justify-center items-center text-white">
              <FaCircleDollarToSlot size={25} />
            </div>
            <div>
              <div className=" text-[15px] md:text-md font-semibold ">{token.name}</div>
              <div className="text-sm text-gray-500">{token.ticker}</div>
            </div>
          </div>
          <div className="text-right ">

            <div className="font-bold text-[15px] md:text-lg text-gray-800 flex flex-row gap-3">
              { ( token.value ||
               <Skeleton className="mt-1 h-5 w-20  bg-gray-400 rounded-md" />
              )} {token.ticker}
            </div>

            <div className=" text-[11px] md:text-sm text-gray-500">Available Balance</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TokensList;