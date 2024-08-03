import Link from "next/link"

export default function HeroSection() {
    return (
      <div>
        <section className="container mx-auto px-4 pt-28 md:pt-24 pb-16 text-center max-w-full ">
          <h1 className=" text-3xl md:text-5xl hover:text-[2.9rem] font-bold mb-6 text-white animate-slideIn">
            Revolutionizing Bangladesh's Digital Economy with 
            <span className="text-[#1199fa]"> d</span>
            <span className="text-white">BKash</span>
          </h1>
          <p className="text-sm md:text-xl hover:text-[1.3rem] mb-8 text-[#7f8fa4] hover:text-[#d4d6d9] max-w-3xl mx-auto animate-slideIn">
            Experience a decentralized revolution in mobile financial services with dBKash. Say goodbye to fraud, KYC hassles, transaction limits, and centralization.
          </p>
          <Link href={'/dashboard'} >
          <button className="bg-[#1199fa] text-white px-8 py-3 rounded-lg font-medium transition duration-300 transform hover:scale-105 hover:bg-[#0d7eb4] hover:shadow-lg animate-slideIn">
            Launch App
          </button></Link>
        </section>
      </div>
    )
  }
  