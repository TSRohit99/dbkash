'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useWallet } from '@/context/WalletProvider';
import { ModalProps } from '@/types/ModalProps';

interface AddressEntry {
  name: string;
  address: string;
}



const AddressBookComponent: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [addressBook, setAddressBook] = useState<AddressEntry[]>([]);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { address: userAddress } = useWallet();

  useEffect(() => {
    if (isOpen) {
      fetchAddressBook();
    }
  }, [isOpen]);

  const fetchAddressBook = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/v1/user', { params: { address: userAddress } });
      setAddressBook(response.data.data.addressBook || []);
    } catch (err) {
            
      if(addressBook.length !== 0){
        toast.error('Failed to fetch address book. Please try again.');
        console.error('Error fetching address book:', err);
      }else {
        toast.error('No addressBook found!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!newName.trim() || !newAddress.trim()) {
      toast.error('Name and address are required.');
      setIsLoading(false);
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newAddress)) {
      toast.error('Invalid Ethereum address format.');
      setIsLoading(false);
      return;
    }

    // Check if the address already exists in the addressBook
    const addressExists = addressBook.some(entry => entry.address.toLowerCase() === newAddress.trim().toLowerCase());

    if (addressExists) {
      toast.error('This address is already in your address book.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/v1/addressbook', {
        userAddress,
        name: newName.trim(),
        address: newAddress.trim(),
      });

      if (response.data.success) {
        setAddressBook([...addressBook, { name: newName.trim(), address: newAddress.trim() }]);
        setNewName('');
        setNewAddress('');
        toast.success('Address added successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to add address');
      }
    } catch (err) {
      console.error('Error adding address:', err);
      toast.error('Failed to add address. Please try again.');
    } finally {
      setIsLoading(false);
    }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl relative max-w-md w-full max-h-[90vh] flex flex-col">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Address Book</h2>       
        <div className="flex-grow overflow-y-auto mb-4">
          {isLoading ? (
            <p>Loading address book...</p>
          ) : addressBook.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {addressBook.map((entry, index) => (
                <li key={index} className="py-2">
                  <p className="font-semibold">{entry.name}</p>
                  <p className="text-sm text-gray-600">{entry.address}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No addresses in your address book.</p>
          )}
        </div>

        <form onSubmit={handleAddAddress} className="space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Ethereum Address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : (
              <>
                <FiPlus className="mr-2" />
                Add Address
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressBookComponent;