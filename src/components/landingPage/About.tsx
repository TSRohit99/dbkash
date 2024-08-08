import React from "react";
const About : React.FC = () => {
  return (
    <div id="about">
       <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-12 text-white text-center">About the Protocol</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Decentralized", content: "Fully decentralized platform ensuring transparency and security." },
              { title: "Fast Transactions", content: "Lightning-fast transactions powered by blockchain technology." },
              { title: "Low Fees", content: "Minimal transaction fees compared to traditional banking systems." },
              { title: "Swap", content: "Swap USDT for BDT or do vice versa almost instantly." },
              { title: "Stake", content: "Stake your BDT to earn staking rewards." },
            ].map((feature, index) => (
              <div key={index} className="bg-[#12141e] rounded-lg p-6 border border-[#1e2230]">
                <div className="bg-gradient-to-r from-[#1199fa] to-[#10b981] w-12 h-12 rounded-full mb-4 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-[#7f8fa4]">{feature.content}</p>
              </div>
            ))}
          </div>
        </section>
    </div>
  )
}

export default About;