import React from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { github, website } from "../assets";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import StarryBackground from "./StarryBackground";
import "./ProjectsMobile.css";

const MobileProjectCard = ({
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
      variants={fadeIn("up", "spring", index * 0.15, 0.6)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.1 }}
      className="mobile-project-card"
    >
      <div className="mobile-glass-card">
        {/* Image section */}
        <div className="mobile-card-image">
          <img
            src={image}
            alt={`${name} project`}
            className="mobile-project-img"
            loading="lazy"
          />
          
          {/* Website link button - top left */}
          {website_link && (
            <div className="mobile-website-overlay">
              <button
                onClick={() => window.open(website_link, "_blank")}
                className="mobile-website-btn"
                aria-label={`Visit ${name} website`}
              >
                <img
                  src={website}
                  alt="Website"
                  className="mobile-website-icon"
                />
              </button>
            </div>
          )}
          
          {/* GitHub button - top right */}
          <div className="mobile-github-overlay">
            <button
              onClick={() => window.open(source_code_link, "_blank")}
              className="mobile-github-btn"
              aria-label={`View ${name} source code`}
            >
              <img
                src={github}
                alt="GitHub"
                className="mobile-github-icon"
              />
            </button>
          </div>
        </div>

        {/* Content section */}
        <div className="mobile-card-content">
          <h3 className="mobile-project-title">{name}</h3>
          <p className="mobile-project-description">{description}</p>
          
          {/* Tags */}
          <div className="mobile-tags-container">
            {tags.map((tag) => (
              <span
                key={`${name}-${tag.name}`}
                className={`mobile-tag ${tag.color}`}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectsMobile = () => {
  return (
    <div className="mobile-projects-container">
      <StarryBackground density={280} />
      
      {/* Header section */}
      <motion.div 
        variants={textVariant()}
        initial="hidden"
        animate="show"
      >
        <p className={`${styles.sectionSubText} text-center`}>My work</p>
        <h2 className={`${styles.sectionHeadText} text-center`}>Projects.</h2>
      </motion.div>

      {/* Description */}
      <div className="mobile-description-container">
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          initial="hidden"
          animate="show"
          className="mobile-description-text"
        >
          Following projects showcase my skills and experience through
          real-world examples of my work. Each project is briefly described with
          links to code repositories and live demos. These reflect my
          ability to solve complex problems, work with different technologies,
          and manage projects effectively.
        </motion.p>
      </div>

      {/* Static project grid */}
      <div className="mobile-projects-grid">
        {projects.map((project, index) => (
          <MobileProjectCard
            key={`mobile-project-${index}`}
            index={index}
            {...project}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectsMobile;
