import React, { useState, useEffect } from "react";
import { Tilt } from 'react-tilt';
import { motion } from "framer-motion";

import { styles } from "../styles";
import { github } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import SimpleInfiniteScroll from "./SimpleInfiniteScroll";
import StarryBackground from "./StarryBackground";
import ProjectsMobile from "./ProjectsMobile";
import "./ProjectCard.css";

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const ProjectCard = ({
  index,
  name,
  description,
  tags,
  image,
  source_code_link,
}) => {
  return (
    <motion.div 
      variants={fadeIn("up", "spring", index * 0.5, 0.75)} 
      className="project-card"
    >      <Tilt
        options={{
          max: 15,
          scale: 1,
          speed: 200,
          glare: true,
          "max-glare": 0.3,
        }}
        className='bg-transparent p-3 md:p-4 rounded-xl w-full border border-gray-800'
      >
        <div className='flex flex-col gap-3 md:gap-4 h-full'>
          {/* Image section at the top */}
          <div className='relative w-full h-[140px] md:h-[200px] overflow-hidden rounded-t-lg'>
            <img
              src={image}
              alt={`${name} project image`}
              className='w-full h-full object-cover'
              loading="lazy"
            />            <div className='absolute top-3 right-3 github-overlay-pc'>
              <div
                onClick={() => window.open(source_code_link, "_blank")}
                className='github-btn-pc'
              >
                <img
                  src={github}
                  alt='source code'
                  className='github-icon-pc'
                />
              </div>
            </div>
          </div>
          
          {/* Content section below the image */}
          <div className='flex flex-col flex-1 justify-between px-2 md:px-3 pb-2 md:pb-3'>
            <div className='flex-1'>
              <h3 className='text-white font-bold text-[18px] md:text-[20px] leading-tight mb-2'>{name}</h3>
              <p className='text-gray-300 text-[13px] md:text-[14px] mb-2 md:mb-3 leading-relaxed'>{description}</p>
            </div>

            <div className='mt-1 md:mt-2 flex flex-wrap gap-1.5 md:gap-2'>
              {tags.map((tag) => (
                <p
                  key={`${name}-${tag.name}`}
                  className={`text-[12px] md:text-[14px] ${tag.color} px-2 md:px-3 py-1 rounded-full bg-gray-800 bg-opacity-70`}
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
  const isMobile = useIsMobile();
  
  console.log("Projects component rendering, isMobile:", isMobile);
  console.log("Window width:", window.innerWidth);

  // If mobile, render the mobile version
  if (isMobile) {
    console.log("Rendering mobile version");
    return <ProjectsMobile />;
  }

  console.log("Rendering desktop version");
  
  // Desktop version (unchanged)
  const projectItems = projects.map((project, index) => (
    <div key={`project-${index}`} className="project-card-wrapper">
      <ProjectCard 
        index={index} 
        {...project} 
      />
    </div>
  ));

  return (
    <div className="relative">
      <StarryBackground density={280} />
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText} text-center`}>My work</p>
        <h2 className={`${styles.sectionHeadText} text-center`}>Projects.</h2>
      </motion.div>

      <div className='w-full flex justify-center'>        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className='mt-3 text-gray-300 text-[17px] max-w-sm md:max-w-3xl leading-[30px] text-center'
        >
          Following projects showcase my skills and experience through
          real-world examples of my work. Each project is briefly described with
          links to code repositories and live demos. These reflect my
          ability to solve complex problems, work with different technologies,
          and manage projects effectively.
        </motion.p>
      </div>

      <div className='mt-20 w-full flex justify-center'>
        <SimpleInfiniteScroll
          items={projectItems}
          maxHeight="700px"
          isTilted={true}
          tiltDirection="left"
          autoplay={true}
          autoplaySpeed={0.8} /* Adjusted for a more moderate scrolling pace */
          pauseOnHover={true}
        />
      </div>
    </div>
  );
};

export default SectionWrapper(Projects, "projects");
