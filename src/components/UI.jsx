import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";

// Array of image names to use for book pages
// These must match exactly with filenames in public/textures
const pictures = [
  "DSC00680",
  "DSC00933",
];

export const pageAtom = atom(0);

// Create pages structure with exactly 2 pages (Cover, Page 1, Back Cover)
export const pages = [
  // Page 0: Front cover
  {
    front: "book-cover",
    back: pictures[0], // Page 1 content (back of cover)
  },
  // Page 1: Back cover
  {
    front: pictures[1 % pictures.length], // Page 2 content
    back: "book-back", // Back cover
  },
];


export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play();
  }, [page]);
  
  // Handle scroll to hide/show controls
  useEffect(() => {
    const handleScroll = () => {
      const bookSection = document.getElementById('book');
      if (bookSection) {
        const bookRect = bookSection.getBoundingClientRect();
        const isVisible = 
          bookRect.top < window.innerHeight && 
          bookRect.bottom > 0;
        setShowControls(isVisible);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Page navigation controls that show/hide based on scroll position */}
      <main 
        className={`pointer-events-none select-none z-20 fixed inset-0 flex justify-between flex-col transition-opacity duration-500 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >

        <div className="flex-grow"></div>
        <div className="w-full overflow-auto pointer-events-auto flex justify-center mb-8">
          <div className="overflow-auto flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-full p-3 md:p-5 bg-black/70 backdrop-blur-md rounded-xl shadow-2xl border border-white/10">
            {/* Cover */}
            <button
              className={`border border-white/30 hover:border-white hover:shadow-glow transition-all duration-300 px-3 md:px-5 py-2 md:py-3 rounded-full text-xs md:text-base font-semibold uppercase shrink-0 ${
                page === 0 ? "bg-white/90 text-black" : "bg-black/80 text-white"
              }`}
              onClick={() => setPage(0)}
            >
              Cover
            </button>
            
            {/* Page 1 */}
            <button
              className={`border border-white/30 hover:border-white hover:shadow-glow transition-all duration-300 px-3 md:px-5 py-2 md:py-3 rounded-full text-xs md:text-base font-semibold uppercase shrink-0 ${
                page === 1 ? "bg-white/90 text-black" : "bg-black/80 text-white"
              }`}
              onClick={() => setPage(1)}
            >
              Page 1
            </button>
            
            {/* Back Cover */}
            <button
              className={`border border-white/30 hover:border-white hover:shadow-glow transition-all duration-300 px-3 md:px-5 py-2 md:py-3 rounded-full text-xs md:text-base font-semibold uppercase shrink-0 ${
                page === pages.length ? "bg-white/90 text-black" : "bg-black/80 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              Back
            </button>
            
            {/* Divider - hidden on small mobile */}
            <div className="h-8 border-l border-white/30 mx-1 hidden sm:block"></div>
            
            {/* Download Resume Button */}
            <a
              href="/Resume-Adrish.pdf"
              download
              className="border border-white/30 hover:border-white hover:shadow-glow transition-all duration-300 px-3 md:px-5 py-2 md:py-3 rounded-full text-xs md:text-base font-semibold uppercase shrink-0 bg-black/80 text-white flex items-center gap-1 md:gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Resume</span>
            </a>
          </div>
        </div>
      </main>


    </>
  );
};

