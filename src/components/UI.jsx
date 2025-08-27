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
  const [userInteracted, setUserInteracted] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle PDF iframe load error
  const handlePDFError = () => {
    const fallback = document.getElementById('pdf-fallback');
    const iframe = document.querySelector('iframe[title="Adrish Basak Resume"]');
    if (fallback && iframe) {
      iframe.style.display = 'none';
      fallback.style.display = 'flex';
    }
  };

  useEffect(() => {
    if (userInteracted) {
      const audio = new Audio("/audios/page-flip-01a.mp3");
      audio.play().catch(error => {
        console.log("Audio play failed:", error);
      });
    }
  }, [page, userInteracted]);
  
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
            
            {/* View Resume Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowResumeModal(true);
              }}
              className="group border border-white/30 hover:border-blue-400/60 hover:shadow-glow transition-all duration-300 px-3 md:px-5 py-2 md:py-3 rounded-full text-xs md:text-base font-semibold uppercase shrink-0 bg-black/80 hover:bg-blue-900/40 text-white flex items-center gap-1 md:gap-2 hover:scale-105 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Resume</span>
            </button>
          </div>
        </div>
      </main>

      {/* Resume Modal */}
      {showResumeModal && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowResumeModal(false)}
          style={{
            animation: 'fadeIn 0.3s ease-out',
            background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.8) 0%, rgba(0, 0, 0, 0.95) 70%)'
          }}
        >
          <div 
            className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl border border-slate-700/30 overflow-hidden backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalSlideIn 0.4s ease-out',
              boxShadow: '0 0 30px rgba(30, 41, 59, 0.4), 0 0 60px rgba(71, 85, 105, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Dark Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-lg z-20 p-4 border-b border-slate-700/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    
                    <div className="flex flex-col">
                      <span className="text-white font-semibold text-base">
                        Resume
                      </span>
                      <span className="text-slate-400 text-sm">
                        Adrish Basak
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setShowResumeModal(false)}
                  className="group bg-slate-800/60 hover:bg-slate-700/80 border border-slate-600/50 hover:border-slate-500/70 text-slate-300 hover:text-white rounded-lg w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Resume content area */}
            <div className="pt-16 h-full bg-slate-900 rounded-b-2xl relative overflow-hidden">
              {!isMobile ? (
                // Desktop PDF Viewer
                <>
                  <div className="w-full h-full bg-white rounded-b-2xl">
                    <iframe
                      src="/Resume-Adrish.pdf#toolbar=1&navpanes=0&scrollbar=1"
                      className="w-full h-full border-0 rounded-b-2xl"
                      title="Adrish Basak Resume"
                      type="application/pdf"
                      onError={handlePDFError}
                      onLoad={(e) => {
                        // Check if PDF loaded successfully
                        try {
                          if (e.target.contentDocument === null) {
                            handlePDFError();
                          }
                        } catch (error) {
                          // Cross-origin or other access errors
                          console.log('PDF viewer loaded successfully');
                        }
                      }}
                      style={{
                        minHeight: '100%'
                      }}
                    />
                  </div>
                  
                  {/* Fallback for browsers that don't support PDF iframe */}
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-center p-8" id="pdf-fallback" style={{display: 'none'}}>
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 max-w-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      
                      <h3 className="text-white font-semibold text-lg mb-2">PDF Viewer Not Supported</h3>
                      <p className="text-slate-400 text-sm mb-6">Your browser doesn't support inline PDF viewing. Please use one of the options below.</p>
                      
                      <div className="flex flex-col gap-3">
                        <a
                          href="https://drive.google.com/file/d/1KgGxu_hs8wl7ggg2gRhqqzINWTcRRc6D/view"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View in Google Drive
                        </a>
                        
                        <a
                          href="/Resume-Adrish.pdf"
                          download
                          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Mobile-friendly options
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 max-w-sm w-full">
                    <div className="mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-white font-semibold text-lg mb-2">View My Resume</h3>
                      <p className="text-slate-400 text-sm">Choose how you'd like to view my resume on mobile</p>
                    </div>
                    
                    <div className="space-y-3">
                      <a
                        href="https://drive.google.com/file/d/1KgGxu_hs8wl7ggg2gRhqqzINWTcRRc6D/view"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm"
                        onClick={() => setShowResumeModal(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in Browser
                      </a>
                      
                      <a
                        href="/Resume-Adrish.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm"
                        onClick={() => setShowResumeModal(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 0 6 16 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View PDF
                      </a>
                      
                      <a
                        href="/Resume-Adrish.pdf"
                        download="Adrish_Basak_Resume.pdf"
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm"
                        onClick={() => setShowResumeModal(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </a>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-slate-500 text-xs">
                        For the best mobile viewing experience, try "Open in Browser" or "View PDF"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

