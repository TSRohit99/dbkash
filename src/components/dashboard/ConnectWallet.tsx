"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { ModalProps } from "@/types/ModalProps";
import { useWallet } from "../../context/WalletProvider";
import { UtilFuncsResponse } from "../../types/UtilFuncsResponse";
import { useRouter } from "next/navigation";
import LoadingPage from "@/app/dashboard/loading";

const ConnectMetamask: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const { connect } = useWallet();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleConnect = async () => {
    setIsLoading(true);

    try {
      const res: UtilFuncsResponse | undefined = await connect();

      if (res?.success) {
        router.replace("/dashboard");
        toast.success("Successfully logged in!");
        onClose();
      } else {
        throw new Error(res?.error || "Failed to connect wallet.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCross = () => {
    setIsLoading(true);
    onClose();
    if (window.location.pathname !== "/") router.replace("/");
  };
  return isLoading ? (
    <LoadingPage />
  ) : (
    <div className="fixed mt-72 inset-0 bg-gradient-to-br z-50 flex justify-center items-center p-4 pb-48">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
        <button
          onClick={() => handleCross()}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
        >
          <FiX size={24} />
        </button>
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Connect to Metamask
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Click the button below to connect your Metamask wallet and access your
          account.
        </p>
        <button
          onClick={handleConnect}
          className="w-full bg-blue-500 text-white font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Connect Metamask
        </button>
        <div className="mt-6 text-center text-sm">
          <a
            href="https://metamask.io/"
            target="_blank"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            Learn more about Metamask
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConnectMetamask;
