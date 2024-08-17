'use client'

import React from "react";
import axios from 'axios'
const LoadingPage: React.FC = () => {

  const handle =async  ()=>{
    const address = '0xf8eD8B98d3423c3744606744f756a68198BeeA51';
    const res = await axios.get('/api/v1/user',
      {
        params: {address}
      }
    );

    const data = await res.data.data.addressBook
    console.log(data);

  }

  return (
    <div className="flex justify-center items-center h-screen bg-[#09162e]">
      <div className="text-6xl font-extrabold text-white animate-slideIn">
        <span className="text-[#1199fa]">d</span>
        <span className="">BKash</span>     
      </div>
      <button onClick={
         async ()=> handle()}> Test DB connect
          </button>
    </div>
  );
};

export default LoadingPage;