import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { useInView } from "framer-motion";

import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";
import StarryBackground from "./StarryBackground";

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const Contact = () => {
  const formRef = useRef();
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const isMobile = useIsMobile();

  const leftInView = useInView(leftRef, { once: false, amount: 0.2 });
  const rightInView = useInView(rightRef, { once: false, amount: 0.2 });

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };
/*template_li1u7ka*/
/*service_ik7kppd*/
//YdWwEgCsZJN3D5iKq
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .send(
        'service_6hs7dyb',
        'template_xhef82k',
        {
          from_name: form.name,
          to_name: "Adrish Basak",
          from_email: form.email,
          to_email: "adrishbasak003@gmail.com",
          message: form.message,
        },
        'gaxooISZjUYhcdSa9'
      )
      .then(
        () => {
          setLoading(false);
          setShowSuccess(true);

          // Hide success message after 5 seconds
          setTimeout(() => {
            setShowSuccess(false);
          }, 5000);

          setForm({
            name: "",
            email: "",
            message: "",
          });
        },
        (error) => {
          setLoading(false);
          console.error(error);

          alert("Ahh, something went wrong. Please try again.");
        }
      );
  };

  return (
    <div
      className={`flex xl:flex-row flex-col-reverse xl:gap-4 gap-10 overflow-visible relative w-full justify-between items-center`}
      style={{ background: 'none', boxShadow: 'none', border: 'none' }}
    >
      {/* Add StarryBackground with higher density for contact section */}
      <StarryBackground density={250} />
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", damping: 18, stiffness: 100 }}
            className="fixed top-24 left-0 right-0 mx-auto w-80 z-50 bg-gradient-to-r from-[#0f172a] to-[#0c0a1d] p-4 rounded-xl shadow-lg border border-[#3a7bd5]/40 flex items-center justify-center"
            style={{
              boxShadow: '0 10px 40px -5px rgba(63, 81, 181, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mr-3 flex-shrink-0 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-20" style={{animationDuration: '2s'}}></div>
            </div>
            <p className="text-blue-100 font-medium text-center">
              Message received across the stars!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={leftRef}
        initial={{ x: -50, opacity: 0 }}
        animate={leftInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className='xl:w-[38%] lg:w-[40%] md:w-[45%] w-full bg-[#0c0a1d] p-5 md:p-5 p-4 rounded-lg transition-all duration-300 relative overflow-hidden contact-form-container'
        style={{
          boxShadow: '0 8px 32px -5px rgba(63, 81, 181, 0.4)',
          border: '1px solid rgba(99, 130, 255, 0.2)',
          backdropFilter: 'blur(4px)'
        }}
      >
        {/* Cosmic background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[10%] right-[15%] w-[2px] h-[2px] bg-blue-300 rounded-full animate-pulse" style={{boxShadow: '0 0 8px 2px rgba(147, 197, 253, 0.8)', animationDuration: '3s'}}></div>
          <div className="absolute top-[35%] left-[10%] w-[1px] h-[1px] bg-white rounded-full animate-pulse" style={{boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.8)', animationDuration: '4s'}}></div>
          <div className="absolute bottom-[20%] right-[25%] w-[1.5px] h-[1.5px] bg-purple-200 rounded-full animate-pulse" style={{boxShadow: '0 0 7px 2px rgba(221, 214, 254, 0.8)', animationDuration: '5s'}}></div>
          <div className="absolute bottom-[40%] left-[30%] w-[1px] h-[1px] bg-blue-100 rounded-full animate-pulse" style={{boxShadow: '0 0 5px 1px rgba(219, 234, 254, 0.7)', animationDuration: '4.5s'}}></div>
        </div>
        <div>
          <p className='text-blue-300 font-medium uppercase tracking-wider text-sm mb-1'>TRANSMIT A MESSAGE</p>
          <h3 className='text-white font-black md:text-[58px] sm:text-[48px] xs:text-[42px] text-[36px] mb-6 leading-tight'>
            Contact<span className="text-blue-400">.</span>
          </h3>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className='mt-3 flex flex-col gap-3'
        >
          <label className='flex flex-col'>
            <span className='text-blue-200 font-medium mb-2'>Your Name</span>
            <input
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              placeholder="What's your name, traveler?"
              className='bg-[#151129] py-3 px-4 placeholder:text-[#6e6a7d] text-white rounded-lg outline-none border border-[#2a2550] font-medium transition-all duration-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:bg-[#1a1632]'
              style={{boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'}}
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-blue-200 font-medium mb-2'>Your Email</span>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder="Your cosmic coordinates?"
              className='bg-[#151129] py-3 px-4 placeholder:text-[#6e6a7d] text-white rounded-lg outline-none border border-[#2a2550] font-medium transition-all duration-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:bg-[#1a1632]'
              style={{boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'}}
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-blue-200 font-medium mb-2'>Your Message</span>
            <textarea
              rows={4}
              name='message'
              value={form.message}
              onChange={handleChange}
              placeholder='Send a message across the stars...'
              className='bg-[#151129] py-3 px-4 placeholder:text-[#6e6a7d] text-white rounded-lg outline-none border border-[#2a2550] font-medium transition-all duration-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none hover:bg-[#1a1632]'
              style={{boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'}}
            />
          </label>

          <div className="mt-4">
            <button
              type='submit'
              className='relative bg-gradient-to-r from-blue-600 to-indigo-700 py-2.5 px-6 rounded-lg outline-none w-fit text-white font-medium transition-all duration-300 hover:from-blue-700 hover:to-indigo-800 active:from-blue-800 active:to-indigo-900 overflow-hidden group'
              style={{
                boxShadow: '0 4px 15px -3px rgba(37, 99, 235, 0.5)'
              }}
            >
              <span className="relative z-10">
                {loading ? "Transmitting..." : "Send Message"}
              </span>
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-indigo-500/20 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></span>
              <span className="absolute top-0 right-0 w-1 h-full bg-blue-300/30 animate-pulse" style={{animationDuration: '2s'}}></span>
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        ref={rightRef}
        initial={{ x: 50, opacity: 0 }}
        animate={rightInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className='xl:w-[60%] lg:w-[58%] md:w-[55%] w-full h-[500px] md:h-[500px] sm:h-[400px] h-[350px] flex items-center justify-center overflow-visible earth-canvas-container'
        style={{
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
          outline: 'none',
          overflow: 'visible'
        }}
      >
        {/* Always render Earth on desktop, and conditionally on mobile */}
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
