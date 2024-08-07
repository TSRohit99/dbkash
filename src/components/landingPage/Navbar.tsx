"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import QuickOverviewModal from './QuickOverviewModal'
import ConnectMetamask from '../dashboard/ConnectWallet'

const navItems = [
  { name: 'Swap', href: '#' },
  { name: 'Stake', href: '#' },
  { name: 'FAQ', href: '#faq' },
  { name: 'About', href: '#about' },

]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [show, setShow] = useState(true);
  const [scrollPos, setScrollPos] = useState(0);

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;
    if (currentScrollPos > scrollPos) {
      setShow(false);
    } else {
      setShow(true);
    }
    setScrollPos(currentScrollPos);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollPos]);

  return (
    <nav
      className={`fixed w-full z-20 py-4 text-[1.1rem] transition-transform duration-300 ${
        show ? 'transform translate-y-0' : 'transform -translate-y-full'
      } bg-customBlue shadow-md`}
      style={{
        backgroundColor: 'rgba(9, 22, 46, .8)' // Adjust opacity to your liking
      }}
    >
      <div className="container  px-4 flex justify-between items-center mt-4">
        <Link href="/" className="text-3xl font-bold">
          <span className="text-[#1199fa]">d</span>
          <span className="text-white">BKash</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 justify-center flex-grow">
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href} 
              className="text-[#b1bdce] hover:text-white transition duration-300"
            >
              {item.name}
            </a>
          ))}
        <button onClick={()=> setIsModalOpen(true)}> Quick Overview </button>
        </div>

        <button onClick={()=>{ 
          setIsModalOpen(false)
          setIsWalletModalOpen(true)}} className="hidden md:block bg-[#2669f5] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-opacity-90 transition duration-300">
          Connect Wallet
        </button>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-customBlue mt-4 py-2 max-w-full " 
        style={
         { backgroundColor: 'rgba(9, 22, 46, .8)'}
        }>
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href} 
              className="block text-[#b1bdce] hover:text-white transition duration-300 py-2 px-4"
            >
              {item.name}
            </a>
          ))
          
        }
        <button onClick={()=>{ 
          setIsModalOpen(false)
          setIsWalletModalOpen(true)}} className='ml-4 mt-2 mb-2 '> Quick Overview </button>
         <div className=' flex items-center justify-center'>

          <button onClick={()=>{ 
          setIsModalOpen(false)
          setIsOpen(false)
          setIsWalletModalOpen(true)}} className="block text-left  bg-[#1199fa] text-white px-4 py-2 mt-2 rounded-lg font-medium hover:bg-opacity-90 transition duration-300">
          Connect Wallet
        </button>
         </div>
        </div>
      )}
      <QuickOverviewModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} />
      <ConnectMetamask isOpen={isWalletModalOpen} onClose={()=>setIsWalletModalOpen(false)} />
    </nav>
  )
} 