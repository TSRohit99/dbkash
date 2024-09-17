import React from "react";
import {
  Dialog,
  DialogContent,
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
   const {txns} = useWallet();
  
  const transactions: Transaction[] | undefined = txns;

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 4)}....${address.substring(
      address.length - 3
    )}`;
  };

  const getIcon = (type: TransactionType): JSX.Element => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="text-red-500" />;
      case "receive":
        return <ArrowDownLeft className="text-green-500" />;
      case "pay":
        return <CreditCard className="text-blue-500" />;
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
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] p-0 bg-white rounded-lg overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-blue-500">
            Transaction History
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] px-6 py-4">
          <div className="space-y-4">
            {transactions && transactions.map((transaction, index) => (
              <Link
                href={`https://sepolia.arbiscan.io/tx/${transaction.id}`}
                key={index}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col space-y-2 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className="mr-4">{getIcon(transaction.type)}</div>
                  <div className="flex-grow">
                    <p className="font-semibold text-blue-500 hover:text-blue-700">
                      {formatAddress(getTransactionParty(transaction))}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.date} at {transaction.time}
                    </p>
                  </div>
                  <div
                    className={`font-bold ${
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
                <div className="text-xs text-gray-500">
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
