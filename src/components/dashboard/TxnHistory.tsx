"use client"
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, CreditCard, Download } from "lucide-react";
import { ModalProps } from "@/types/ModalProps";
import { Transaction, TransactionType } from "@/types/TxnHistoryTypes";
import Link from "next/link";
import { useWallet } from "@/context/WalletProvider";
import { addressTrimmer } from "@/helpers/AddressTrimmer";
import Copybtn from "@/helpers/Copybtn";
import { generatePDF } from "@/lib/generateTxnPdf";
import toast from "react-hot-toast";
import axios from "axios";
import { fetchTxns } from "@/lib/web3/etherutiles";
import { UtilFuncsResponse } from "@/types/UtilFuncsResponse";

const TransactionHistoryModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      const fetchTransactions = async () => {
        setLoading(true);
        const response: UtilFuncsResponse = await fetchTxns(address || "");
        if (response.success && response.txns) {
          setTransactions(response.txns);
        } else {
          console.error(response.error);
        }
        setLoading(false);
      };

      fetchTransactions();
    }
  }, [isOpen, address]);

  const getUserInfo = async () => {
    try {
      const response = await axios.get("/api/v1/user");
      if (await response.data.success) {
        const data = await response.data.data;
        return data.username;
      } else {
        console.error("Couldnt get info!");
        return "";
      }
    } catch (err: any) {
      if (err.response) {
        console.error("Error fetching userInfo:", err.response.data.message);
      }
      console.error("Error fetching userInfo:", err);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const name = await getUserInfo();
      generatePDF(transactions, name, address);
      toast.success("PDF Downloaded Successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    }
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
    if (transaction.type === "send" || transaction.type === "pay") return transaction.to;
    return transaction.from;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] p-0 bg-white rounded-lg overflow-hidden sm:w-[420px] md:w-[600px]">
        <DialogHeader className="p-4 sm:p-6 pb-2 flex justify-between items-center">
          <div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-blue-500">
              Transaction History
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {/* Optional description text */}
            </DialogDescription>
          </div>
          <button
            onClick={async () => await handleDownloadPdf()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600 transition duration-200"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </DialogHeader>

        <ScrollArea className="h-[60vh] sm:h-[70vh] px-4 sm:px-6 py-4">
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <h3>Loading transactions...</h3>
            ) : transactions && transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <Link
                  href={`https://sepolia.arbiscan.io/tx/${transaction.id}`}
                  key={index}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col space-y-2 p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start sm:items-center">
                    <div className="mr-3 sm:mr-4 mt-1 sm:mt-0">{getIcon(transaction.type)}</div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-blue-500 hover:text-blue-700 text-sm sm:text-base truncate">
                        {addressTrimmer(getTransactionParty(transaction))}
                      </p>
                      <p className="text-[11px] sm:text-sm text-gray-500">
                        {transaction.date} at {transaction.time}
                      </p>
                      <div className="text-xs sm:text-sm text-gray-500 flex flex-row">
                        Txn ID: {addressTrimmer(transaction.id)}{" "}
                        <div className="-mt-1">
                          <Copybtn address={transaction.id} />
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-sm sm:text-base font-bold -ml-1 text-right ${
                        transaction.type === "receive" || transaction.type === "pay"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {`${parseFloat(transaction.amount).toFixed(3)} ${transaction.tokenType}`}
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Gas Fee: {transaction.gasFee} ETH</div>
                </Link>
              ))
            ) : (
              <h3>No transactions found</h3>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionHistoryModal;
