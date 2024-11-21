import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, CreditCard } from "lucide-react";
import { ModalProps } from "@/types/ModalProps";
import { Transaction, TransactionType } from "@/types/TxnHistoryTypes";
import Link from "next/link";
import { useWallet } from "@/context/WalletProvider";

const TransactionHistoryModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { txns } = useWallet();
  const transactions: Transaction[] | undefined = txns;

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 4)}....${address.substring(
      address.length - 3
    )}`;
  };

  const getIcon = (type: TransactionType): JSX.Element => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case "receive":
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case "pay":
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      default:
        return <></>;
    }
  };

  const getTransactionParty = (transaction: Transaction): string => {
    if (transaction.type === "send" || transaction.type === "pay")
      return transaction.to;
    return transaction.from;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] p-0 bg-white rounded-lg overflow-hidden sm:w-[420px] md:w-[600px]">
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-blue-500">
            Transaction History
          </DialogTitle>
          <DialogDescription className="text-gray-500">
        {null}
      </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] sm:h-[70vh] px-4 sm:px-6 py-4">
          <div className="space-y-3 sm:space-y-4">
            {transactions && transactions.map((transaction, index) => (
              <Link
                href={`https://sepolia.arbiscan.io/tx/${transaction.id}`}
                key={index}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col space-y-2 p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start sm:items-center">
                  <div className="mr-3 sm:mr-4 mt-1 sm:mt-0">
                    {getIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-blue-500 hover:text-blue-700 text-sm sm:text-base truncate">
                      {formatAddress(getTransactionParty(transaction))}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {transaction.date} at {transaction.time}
                    </p>
                  </div>
                  
                  <div
                    className={`text-sm sm:text-base font-bold -ml-1 text-right ${
                      transaction.type === "receive" ||
                      transaction.type === "pay"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {`${transaction.amount} ${transaction.tokenType}`}
                  </div>
                </div>

                {/* Gas Fee Section */}
                <div className="text-[10px] sm:text-xs text-gray-500">
                  Gas Fee: {transaction.gasFee} ETH
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionHistoryModal;