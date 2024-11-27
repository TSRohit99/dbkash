"use client"
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, HandCoins, Trophy } from 'lucide-react';
import { ModalProps } from '@/types/ModalProps';
import { useWallet } from '@/context/WalletProvider';
import { addLiquidity, fetchAddressRewards, fetchStakingData, removeLiquidity } from '@/lib/web3/etherutiles';
import toast from 'react-hot-toast';


export const StakeModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {

  const {address,usdBal, bdtBal, setBdtBal, setUsdBal,setWalletBalance, usdPrice,walletBalance} = useWallet();
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [depositedBDT, setDepositedBDT] = useState<number>(0);
  const [depositedUSD, setDepositedUSD] = useState<number>(0);
  const [rewardUSD, setRewardUSD] = useState(0);
  const [rewardBDT, setRewardBDT] = useState(0);

  
useEffect(() => {
  if (address) {
    fetchData(); // Properly invoke the function
  }
}, [address]); // Add address as a dependency

const fetchData = async () => {
  try {
    if (address) {
      const val = await fetchStakingData(address);
      setDepositedUSD(val.usd);
      setDepositedBDT(val.bdt);
      const rewardsData = await fetchAddressRewards(address);
      console.log(rewardsData);
      setRewardBDT(rewardsData.bdt);
      setRewardUSD(rewardsData.usd);
    }
  } catch (error: any) {
    console.error("Error fetching stake data:", error);
  }
};

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    const toastId = toast.loading("Executing the transaction...", {
      duration: 400000,
    });

    try {
      const res = await addLiquidity(currency,amount);
      if(res.success){
        toast.dismiss(toastId);
        toast.success(`Succesfully staked ${amount} ${currency}!`);
        if (currency === 'BDT') {
          setDepositedBDT(prev => prev + amount);
            setBdtBal((prev: string | null) => {
              if (prev) {
                return (parseFloat(prev) - amount).toString();
              }
              return bdtBal;
            });

        } else {
          setDepositedUSD(prev => prev + amount);
          setUsdBal((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) - amount).toString();
            }
            return usdBal;
          });
        }

        setWalletBalance((prev: string | null) => {
          if (prev) {
            return (
              parseFloat(prev) -
              (currency === 'BDT' ? amount : amount*usdPrice)
            ).toString();
          }
          return walletBalance;
        });


      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Stake failed!");
      console.error("Stake faile, reason :", error);
    }
    setStakeAmount('');
  };

  const handleUnstake = async () => {
    const amount = parseFloat(unstakeAmount);
    const toastId = toast.loading("Executing the transaction...", {
      duration: 400000,
    });

    try {
      const res = await removeLiquidity(currency,amount);
      if(res.success){
        toast.dismiss(toastId);
        toast.success(`Succesfully unstaked ${amount} ${currency}!`);
        if (currency === 'BDT') {
          setDepositedBDT(prev => prev - amount);
          

            setBdtBal((prev: string | null) => {
              if (prev) {
                return (parseFloat(prev) + amount).toString();
              }
              return bdtBal;
            });

        } else {
          setDepositedUSD(prev => prev - amount);
          setUsdBal((prev: string | null) => {
            if (prev) {
              return (parseFloat(prev) + amount).toString();
            }
            return usdBal;
          });
        }

        setWalletBalance((prev: string | null) => {
          if (prev) {
            return (
              parseFloat(prev) +
              (currency === 'BDT' ? amount : amount*usdPrice)
            ).toString();
          }
          return walletBalance;
        });


      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("UnStake failed!");
      console.error("UnStake faile, reason :", error);
    }
    setUnstakeAmount('');
  };

  const getMaxBalance = () => {
    return currency === 'BDT' ? bdtBal : usdBal;
  };

  const getMaxDeposited = () => {
    return currency === 'BDT' ? depositedBDT : depositedUSD;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[60vh] md:max-h-[80vh] overflow-y-scroll bg-white/90 backdrop-blur-lg border-blue-200 max-w-md w-[95%] mx-auto rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Coins className="text-blue-500" /> 
            {activeTab === 'stake' ? 'Stake' : 'Unstake'}
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {activeTab === 'stake' 
              ? 'Earn rewards from swap fees' 
              : 'Withdraw your staked assets'}
          </p>
        </DialogHeader>

        {/* Enhanced Tab Switcher */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 rounded-full p-1 flex items-center">
            <Button
              variant={activeTab === 'stake' ? 'default' : 'outline'}
              onClick={() => setActiveTab('stake')}
              className={`rounded-full mr-1 ${
                activeTab === 'stake' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
            >
              Stake
            </Button>
            <Button
              variant={activeTab === 'unstake' ? 'default' : 'outline'}
              onClick={() => setActiveTab('unstake')}
              className={`rounded-full ${
                activeTab === 'unstake' 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'text-red-600 hover:bg-red-100'
              }`}
            >
              Unstake
            </Button>
          </div>
        </div>

        {activeTab === 'stake' ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Enter stake amount"
                value={stakeAmount}
                onChange={(e) => {
                  setStakeAmount(e.target.value);
                  
                }}
                className="flex-grow text-gray-800"
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-24 text-gray-700 font-extrabold">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent className='bg-white text-blue-600 font-extrabold'>
                  <SelectItem value="BDT">BDT</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Max: {Number((getMaxBalance() ?? "0")).toFixed(2)} {currency}</span>
              </div>
            </div>

            <Button
              onClick={handleStake}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
            >
              Stake
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Enter unstake amount"
                value={unstakeAmount}
                onChange={(e) => {
                  setUnstakeAmount(e.target.value);

                }}
                className="flex-grow text-gray-800"
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-24 text-gray-700 font-extrabold">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent className='bg-white text-blue-600 font-extrabold'>
                  <SelectItem value="BDT">BDT</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Max: {Number((getMaxDeposited() ?? "0")).toFixed(2)} {currency}</span>
              </div>
            </div>


            <Button
              onClick={handleUnstake}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0}
            >
              Unstake
            </Button>
          </div>
        )}

        {/* Rest of the component remains the same */}
        <hr className="border-t-2 border-blue-100 my-4" />

        <Card className="bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-700">Staking Info</div>
              <div className="flex items-center text-yellow-600">
                <HandCoins size={16} className="mr-1" /> Stake
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <div className="text-xs text-gray-500">Deposited BDT</div>
                <div className="text-blue-600 font-bold">{depositedBDT.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Deposited USD</div>
                <div className="text-blue-600 font-bold">{depositedUSD.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-700">Total Rewards Earned</div>
              <div className="flex items-center text-yellow-600">
                <Trophy size={16} className="mr-1" /> Rewards
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <div className="text-xs text-gray-500">BDT</div>
                <div className="text-green-500 font-bold">{rewardBDT.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">USD</div>
                <div className="text-green-500 font-bold">{rewardUSD.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default StakeModal;