import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { useInView } from "framer-motion";

import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";

const Contact = () => {
  const formRef = useRef();
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  
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
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", damping: 18, stiffness: 100 }}
            className="fixed top-24 left-0 right-0 mx-auto w-80 z-50 bg-gradient-to-r from-[#202942] to-[#151729] p-4 rounded-xl shadow-lg border border-[#3a7bd5]/30 flex items-center justify-center"
            style={{
              boxShadow: '0 10px 40px -5px rgba(63, 81, 181, 0.4)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#3a7bd5] to-[#3f51b5] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium text-center">
              Thank you! I'll get back to you soon.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={leftRef}
        initial={{ x: -50, opacity: 0 }}
        animate={leftInView ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className='xl:w-[38%] lg:w-[40%] md:w-[45%] w-full bg-[#1e1836] p-5 rounded-lg transition-all duration-300'
        style={{
          boxShadow: '0 8px 32px -5px rgba(63, 81, 181, 0.3)',
          border: '1px solid rgba(99, 130, 255, 0.15)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <div>
          <p className='text-gray-400 font-medium uppercase tracking-wider text-sm mb-1'>GET IN TOUCH</p>
          <h3 className='text-white font-black md:text-[58px] sm:text-[48px] xs:text-[42px] text-[36px] mb-6 leading-tight'>Contact.</h3>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className='mt-3 flex flex-col gap-3'
        >
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-2'>Your Name</span>
            <input
              type='text'
              name='name'
              value={form.name}
              onChange={handleChange}
              placeholder="What's your good name?"
              className='bg-[#261f3b] py-3 px-4 placeholder:text-[#6e6a7d] text-white rounded-lg outline-none border-none font-medium transition-all duration-300 focus:ring-1 focus:ring-purple-500 hover:bg-[#2a2240]'
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-2'>Your email</span>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder="What's your web address?"
              className='bg-[#261f3b] py-3 px-4 placeholder:text-[#6e6a7d] text-white rounded-lg outline-none border-none font-medium transition-all duration-300 focus:ring-1 focus:ring-purple-500 hover:bg-[#2a2240]'
            />
          </label>
          <label className='flex flex-col'>
            <span className='text-white font-medium mb-2'>Your Message</span>
            <textarea
              rows={4}
              name='message'
              value={form.message}
              onChange={handleChange}
              placeholder='What you want to say?'
              className='bg-[#261f3b] py-3 px-4 placeholder:text-[#6e6a7d] text-white rounded-lg outline-none border-none font-medium transition-all duration-300 focus:ring-1 focus:ring-purple-500 resize-none hover:bg-[#2a2240]'
            />
          </label>

          <div className="mt-4">
            <button
              type='submit'
              className='relative bg-blue-500 py-2 px-5 rounded-lg outline-none w-fit text-white font-medium transition-all duration-300 hover:bg-blue-600 active:bg-blue-700'
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        ref={rightRef}
        initial={{ x: 50, opacity: 0 }}
        animate={rightInView ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className='xl:w-[60%] lg:w-[58%] md:w-[55%] w-full h-[500px] flex items-center justify-center overflow-visible'
        style={{ 
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
          outline: 'none',
          overflow: 'visible'
        }}
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");
