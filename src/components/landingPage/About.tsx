import { Network } from "ethers";
import { Zap, DollarSign, RefreshCw, TrendingUp, NotebookTabs } from "lucide-react";
import React from "react";
const About: React.FC = () => {

  const about = [
    {
      icon : <NotebookTabs />,
      title: "Decentralized",
      content:
        "Fully decentralized platform ensuring transparency and security.",
    },
    {
      icon : <Zap />,
      title: "Fast Transactions",
      content:
        "Lightning-fast transactions powered by blockchain technology.",
    },
    {
      icon : <DollarSign />,
      title: "Low Fees",
      content:
        "Minimal transaction fees compared to traditional banking systems.",
    },
    {
      icon : <RefreshCw />,
      title: "Swap",
      content: "Swap USDT for BDT or do vice versa almost instantly.",
    },
    {
      icon : <TrendingUp />,
      title: "Stake",
      content: "Stake your BDT/USD to earn staking rewards.",
    },
  ];


  return (
    <div id="about">
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-white text-center">
          About the Protocol
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {about.map((feature, index) => (
            <div
              key={index}
              className="bg-[#12141e] rounded-lg p-6 border border-[#1e2230] transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-[#1199fa]/20 hover:-translate-y-2 hover:bg-[#1a1d2a]"
            >
              <div className="bg-gradient-to-r from-[#1199fa] to-[#10b981] w-12 h-12 rounded-full mb-4 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-[#7f8fa4]">{feature.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
