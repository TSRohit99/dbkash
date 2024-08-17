'use client'

import { useWallet } from '@/context/WalletProvider';
import { ModalProps } from '@/types/ModalProps';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
// import { Checkmark } from 'react-checkmark'
import { IoCheckmarkCircleSharp } from "react-icons/io5";

interface SettingsProps extends ModalProps{
    username : string,
    setUsername : React.Dispatch<React.SetStateAction<string>>
    userEmail : string
}

const SettingsModal: React.FC<SettingsProps> = ({ isOpen, onClose, username, setUsername,userEmail }) => {
  const [name, setName] = useState(username);
  const [email, setEmail] = useState<string>(userEmail);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { address } = useWallet();

  useEffect(() => {
    setName(username);
  }, [username]);

  useEffect(() => {
    setEmail(userEmail);
  }, [userEmail]);


  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleVerification = () => {
    setIsVerifying(true);
    // Here you would typically send a verification code to the user's email
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value.slice(0, 4));
  };

  const handleSubmitVerification = () => {
    // Here you would verify the code
    console.log('Verifying code:', verificationCode);
   
  };

  const handleSaveChanges = async () => {
    console.log('Saving changes:', { name, email });
    setIsLoading(true);
    setUsername(name);
    try {
        const response = await axios.post('/api/v1/info-update', { 
            address,
            name,
        });

        if(await response.data.success){
            toast.success("User name updated successfully!");
            setIsLoading(false);
        }
      } catch (err) {
        console.error('Error username update:', err);
        toast.error('Failed to update username. Please try again.');
      } finally{
        setIsVerifying(false)
      }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Settings</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder={username}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
         {!userEmail ? ( <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <div className="flex">
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleVerification}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Verify
              </button>
            </div>
          </div>) : (<div className="mb-4"> 
            <p className='text-sm font-medium text-gray-700 mb-1'>Email: (Verified)</p>
            <div className='p-2 border border-green-500 flex flex-row gap-1 text-[16px] font-medium '>
              {email}  <div className='flex justify-center items-center text-green-500 text-lg'>
              <IoCheckmarkCircleSharp />
              </div>

            </div>


          </div>) }
          {isVerifying && (
            <div className="mb-4 p-4 bg-gray-100 rounded-md">
              <input
                type="text"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                maxLength={4}
                placeholder="Enter 4-digit code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <button 
                onClick={handleSubmitVerification}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Submit Code
              </button>
            </div>
          )}
          <button 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSaveChanges}
            disabled={isLoading}
          >
             {isLoading ? 'Saving...' : 'Save Changes'
             }
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;