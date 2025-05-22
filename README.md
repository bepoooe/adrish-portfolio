# Adrish's 3D Portfolio

An interactive 3D portfolio website built with React and Three.js. This project features a modern, responsive design with a 3D book interface, interactive 3D Earth model, and dynamic components showcasing projects, skills, and experience. Optimized for performance with reduced memory usage and improved rendering efficiency.

## Tech Stack

### Core
- **React** - Front-end library for building the user interface
- **Three.js** - 3D graphics library for creating and rendering 3D models
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber
- **Vite** - Next generation frontend tooling for fast development and optimized builds

### Styling & Animation
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Framer Motion** - Animation library for React
- **GSAP** - Professional-grade animation library
- **Styled Components** - CSS-in-JS styling solution

### State Management & UI
- **Jotai** - Primitive and flexible state management for React
- **React Icons** - Icon library for React
- **React Intersection Observer** - Utility for detecting element visibility
- **FontAwesome** - Icon library for social media and UI elements

### Communication
- **EmailJS** - Client-side email sending service for contact form

### 3D/Math Libraries
- **Maath** - Math helpers for 3D animations
- **OGL** - WebGL framework for the circular gallery component
- **React Tilt** - 3D tilt effect for UI elements

## Features

- **Interactive 3D Book** - Animated 3D book interface with page-turning animations
- **3D Earth Model** - Optimized Earth model with proper textures and atmospheric effects
- **Dynamic Project Gallery** - Showcases projects with:
  - Rectangular, space-efficient card design
  - Dark theme with subtle gradients and rounded corners
  - Horizontal card layout with project image on the left and content on the right
- **Infinite Scroll Components** - Smooth scrolling interface for various content sections
- **Particle Effects System**:
  - Dynamic movement patterns
  - Custom textures and effects
  - Adaptive boundaries
  - Additive blending for enhanced visuals
- **Interactive Navbar** - Smooth scrolling navigation
- **Audio Integration** - Background music player
- **Responsive Design** - Mobile and desktop-friendly interface
- **Contact Form** - Email integration for visitor messages
- **Circular Gallery** - Interactive display of skills and technologies
- **Starry Background** - Animated space-themed backgrounds
- **Vertical Timeline** - Visual representation of experience and education

## Performance Optimizations

- **Memory Management** - Custom memory management system to reduce memory usage
- **Texture Optimization** - Efficient texture loading and caching system
- **Renderer Optimization** - Enhanced Three.js renderer settings for better performance
- **Adaptive Quality** - Automatic quality adjustments based on device capabilities
- **Resource Disposal** - Proper cleanup of 3D resources to prevent memory leaks
- **Lazy Loading** - On-demand loading of assets and components
- **Chunked Loading** - Split code and assets into manageable chunks

## Development

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/bepoooe/adrish-portfolio.git

# Navigate to the project directory
cd adrish-portfolio

# Install dependencies
npm install
# or
yarn
```

### Running the Development Server

```bash
# Start the development server
npm run dev
# or
yarn dev
```

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build

# Preview the production build
npm run preview
# or
yarn preview
```

## Project Structure

- `/src` - Source code
  - `/components` - React components
    - `AboutMe.jsx` - About me section
    - `Book.jsx` - 3D book component with optimized rendering
    - `CircularGallery.jsx` - Interactive skills gallery using OGL
    - `Contact.jsx` - Contact form with 3D Earth model
    - `Experience.jsx` - Main 3D scene setup
    - `Hero.jsx` - Hero section with custom fonts
    - `InfiniteScroll.jsx` - Custom infinite scrolling component
    - `Loader.jsx` - Loading indicator component
    - `MusicPlayer.jsx` - Audio controls
    - `Navbar.jsx` - Navigation bar
    - `Particles.jsx` - Optimized background particle effects
    - `Portfolio.jsx` - Main portfolio container
    - `Projects.jsx` - Projects showcase section
    - `ScholasticRecord.jsx` - Education history section
    - `SimpleInfiniteScroll.jsx` - Lightweight scrolling component
    - `StarryBackground.jsx` - Animated space background
    - `Tech.jsx` - Technologies and skills section
    - `UI.jsx` - User interface elements
    - `/canvas` - 3D models and scene components
  - `/assets` - Static assets
  - `/constants` - Configuration and constants
  - `/hoc` - Higher-order components
  - `/hooks` - Custom React hooks
  - `/utils` - Utility functions
    - `cleanupManager.js` - Resource cleanup utilities
    - `memoryManager.js` - Memory usage optimization
    - `memoryOptimizer.js` - Advanced memory optimization tools
    - `motion.js` - Animation utilities
    - `textureManager.js` - Texture loading and optimization
- `/public` - Static files
  - Images and other assets

## Build Optimizations

The project uses several build optimizations to ensure the best performance:

- **Code Splitting** - Vendor dependencies are split into separate chunks
- **Terser Minification** - Advanced minification with console removal
- **Asset Optimization** - Small assets are inlined to reduce HTTP requests
- **ES2015 Target** - Modern JavaScript target for better performance
- **HMR Overlay Disabled** - Improved development performance

## Latest Version

Current Version: 1.0.0 (May 2025)

### Recent Updates
- Added memory optimization system to reduce RAM usage
- Implemented texture management for better performance
- Enhanced mobile responsiveness for all components
- Optimized 3D models for faster loading and rendering
- Added adaptive quality settings based on device capabilities
- Improved font styling and consistency across sections

## License

This project is private and not intended for redistribution.
