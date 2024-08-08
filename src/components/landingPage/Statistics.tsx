import React from "react";

const Statistics : React.FC = ()=> {
  return (
    <section className="text-center py-16">
      <div className="container px-5">
        <h2 className="text-4xl font-bold text-white mb-4">Statistics</h2>
        <p className="text-[#7f8fa4] mb-10">
          We believe that everyone should have access to open and powerful
          financial tools.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: "100", text: "Total Users" },
            { number: "200", text: "BDT in Circulation" },
            { number: "300", text: "Total Transactions" },
            { number: "400", text: "Total Transactions Volume" },
          ].map((data, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/5 text-white py-12 rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-105 "
            >
              <div className="text-3xl md:text-5xl font-bold mb-2 max-h-4 md:max-h-full">
                {data.number}
                <span className="text-[#1199fa]">+</span>
              </div>
              <br />
              <p className="text-[#7f8fa4]"> 
                {data.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Statistics;
