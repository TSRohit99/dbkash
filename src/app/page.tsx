"use client"

import React from 'react';
import Head from 'next/head';
import HeroSection from '@/components/landingPage/HeroSection';
import Statistics from '@/components/landingPage/Statistics';
import About from '@/components/landingPage/About';
import Footer from '@/components/landingPage/Footer';
import Announcements from '@/components/landingPage/Announcements';
import FAQ from '@/components/landingPage/FAQ';
import Navbar from '@/components/landingPage/Navbar';


export default function Home() {
  return (
    <div className="min-h-screen bg-customBlue">
      <Head>
        <title>dBKash: Empowering Bangladesh's Digital Future</title>
        <meta name="description" content="Experience a decentralized revolution in mobile financial services with dBKash." />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="./site.webmanifest" />
      </Head>
 
      
      <Navbar />

      <main className="md:pt-28 pt-7">
      <HeroSection />
      <Announcements />
      <Statistics />
      <FAQ />
      <About />
      <Footer />
      </main>

    </div>
  );
}