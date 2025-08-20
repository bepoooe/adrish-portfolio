import React, { useState, useEffect } from "react";
import { Tilt } from 'react-tilt';
import { motion } from "framer-motion";

import { styles } from "../styles";
import { github, website } from "../assets";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import StarryBackground from "./StarryBackground";
import ProjectsMobile from "./ProjectsMobile";
import "./ProjectCard.css";

// Mobile detection hook with better initial loading
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
    
    const checkMobile = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
    };

    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return { isMobile, isClient };
};

const ProjectCard = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
  website_link,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ 
        duration: 1.2, 
        delay: index * 0.15,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      viewport={{ once: false, amount: 0.2 }}
      className="w-full h-full"
    >      
      <Tilt
        options={{
          max: 15,
          scale: 1.02,
          speed: 200,
          glare: true,
          "max-glare": 0.3,
        }}
        className='bg-transparent p-5 rounded-xl w-full h-full border border-gray-800 transition-all duration-300 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/10 min-h-[380px]'
      >
        <div className='flex flex-col gap-4 h-full'>
          {/* Image section at the top - 16:9 aspect ratio */}
          <div className='relative w-full h-0 pb-[56.25%] overflow-hidden rounded-lg'>
            <img
              src={image}
              alt={`${name} project image`}
              className='absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105'
              loading="lazy"
            />            
            {/* Website link button - top left */}
            {website_link && (
              <div className='absolute top-3 left-3 website-overlay-pc'>
                <div
                  onClick={() => window.open(website_link, "_blank")}
                  className='website-btn-pc bg-black/60 backdrop-blur-sm rounded-full p-2.5 hover:bg-black/80 transition-all duration-300 cursor-pointer'
                >
                  <img
                    src={website}
                    alt='live website'
                    className='w-5 h-5'
                  />
                </div>
              </div>
            )}
            {/* GitHub button - top right */}
            <div className='absolute top-3 right-3 github-overlay-pc'>
              <div
                onClick={() => window.open(source_code_link, "_blank")}
                className='github-btn-pc bg-black/60 backdrop-blur-sm rounded-full p-2.5 hover:bg-black/80 transition-all duration-300 cursor-pointer'
              >
                <img
                  src={github}
                  alt='source code'
                  className='w-5 h-5'
                />
              </div>
            </div>
          </div>
          
          {/* Content section below the image */}
          <div className='flex flex-col flex-1 justify-between px-2 pb-2'>
            <div className='flex-1'>
              <h3 className='text-white font-bold text-[18px] lg:text-[20px] leading-tight mb-3'>{name}</h3>
              <p className='text-gray-300 text-[14px] lg:text-[15px] mb-3 leading-relaxed line-clamp-3'>{description}</p>
            </div>

            <div className='mt-2 flex flex-wrap gap-2'>
              {tags.map((tag) => (
                <p
                  key={`${name}-${tag.name}`}
                  className={`text-[12px] lg:text-[13px] ${tag.color} px-3 py-1 rounded-full bg-gray-800 bg-opacity-70 hover:bg-opacity-90 transition-all duration-200`}
                >
                  #{tag.name}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Tilt>
    </motion.div>
  );
};

const Projects = () => {
  const { isMobile, isClient } = useIsMobile();

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <section
        id="projects"
        className="relative w-screen min-h-screen overflow-x-hidden flex items-center justify-center"
      >
        <div className="text-white text-lg">Loading projects...</div>
      </section>
    );
  }

  // If mobile, render the mobile version
  if (isMobile) {
    return (
      <section
        id="projects"
        className="relative w-screen min-h-screen overflow-x-hidden"
        style={{ 
          background: 'transparent',
          margin: 0,
          padding: 0,
          left: 0,
          right: 0,
        }}
      >
        <motion.div
          className="relative z-10 transition-all duration-1000"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <ProjectsMobile />
        </motion.div>
      </section>
    );
  }
  
  // Desktop version - using grid layout like mobile but adapted for desktop
  return (
    <section
      id="projects"
      className="relative w-screen min-h-screen overflow-x-hidden"
      style={{ 
        background: 'transparent',
        margin: 0,
        padding: 0,
        left: 0,
        right: 0,
      }}
    >
      <StarryBackground density={280} />
      
      <div className="relative z-10 w-full min-h-screen py-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <motion.div 
          variants={textVariant()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.1 }}
        >
          <p className={`${styles.sectionSubText} text-center`}>My work</p>
          <h2 className={`${styles.sectionHeadText} text-center`}>Projects.</h2>
        </motion.div>

        <div className='w-full flex justify-center'>        
          <motion.p
            variants={fadeIn("", "", 0.1, 1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.1 }}
            className='mt-3 text-gray-300 text-[17px] max-w-4xl leading-[30px] text-center'
          >
            Following projects showcase my skills and experience through
            real-world examples of my work. Each project is briefly described with
            links to code repositories and live demos. These reflect my
            ability to solve complex problems, work with different technologies,
            and manage projects effectively.
          </motion.p>
        </div>

        {/* Desktop grid layout - 3 cards per row */}
        <div className='mt-12 w-full'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 w-full px-4 sm:px-8 lg:px-16 xl:px-24'>
            {projects.map((project, index) => (
              <ProjectCard 
                key={`project-${index}`}
                index={index} 
                {...project} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
