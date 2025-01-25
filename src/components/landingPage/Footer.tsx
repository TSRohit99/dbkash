import React from "react";
import { FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";

const Footer: React.FC = () => {

  const currentYear = new Date().getFullYear();

  return <footer className=" text-white py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-[#1199fa]"> d</span>
            <span className="text-white">BKash</span>
          </h2>
          <p className="mb-4 text-[14px] md:text-[1rem]">
            This project is a proud initiative by{" "}
            <a href="https://tsrohit99.github.io/" target="_blank">
              <span className="text-blue-500"> Rohit Sen </span>
            </a>
            , a Computer Science student at NEUB, who is passionate about
            exploring new technologies and trends in the tech world. Rohit aims
            to revolutionize financial services through blockchain innovation.
          </p>
        </div>
        <div className="flex flex-col md:items-end md:mr-8">
          <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
          <div className="flex space-x-4">
            <a
              href="https://x.com/ro_hitbro/"
              target="_blank"
              className="text-white hover:text-purple-200 transition duration-300"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://www.linkedin.com/in/rohit-sen-3a010019b"
              target="_blank"
              className="text-white hover:text-purple-200 transition duration-300"
            >
              <FaLinkedinIn size={24} />
            </a>
            <a
              href="https://github.com/TSRohit99/"
              target="_blank"
              className="text-white hover:text-purple-200 transition duration-300"
            >
              <FaGithub size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-sm">
        &copy; {currentYear} dBKash. All rights reserved.
      </div>
    </div>
  </footer>
};

export default Footer;
