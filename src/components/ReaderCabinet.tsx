import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';
import { soundEffects } from '../services/soundEffects';

interface ReaderCabinetProps {
  isDark: boolean;
}

const TOTAL_PAGES = 219;
const LAST_PAGE_KEY = 'wilting_of_words_last_page';
const BOOKMARKS_KEY = 'wilting_of_words_bookmarks';

export const ReaderCabinet: React.FC<ReaderCabinetProps> = ({
  isDark
}) => {
  // Read initial saved page from localStorage if available, defaulting to Page 1
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LAST_PAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= TOTAL_PAGES) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Unable to read localStorage:', e);
    }
    return 1;
  });

  // Saved bookmark pages array
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Unable to read bookmarks from localStorage:', e);
    }
    return [];
  });

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(1); // 1 = next, -1 = prev
  const [pageInput, setPageInput] = useState<string>(currentPage.toString());
  const [isPlaying, setIsPlaying] = useState<boolean>(() => audioSynth.getIsPlaying());

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Sync with audio engine
  useEffect(() => {
    const unsub = audioSynth.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  // Save current page to localStorage & prefetch adjacent pages
  useEffect(() => {
    setPageInput(currentPage.toString());
    try {
      localStorage.setItem(LAST_PAGE_KEY, currentPage.toString());
    } catch (e) {}

    // Eagerly prefetch +/- 6 neighboring pages into browser cache for zero lag
    const prefetchTargets = [
      currentPage,
      currentPage + 1,
      currentPage + 2,
      currentPage + 3,
      currentPage + 4,
      currentPage + 5,
      currentPage - 1,
      currentPage - 2,
      currentPage - 3
    ];

    prefetchTargets.forEach(num => {
      if (num >= 1 && num <= TOTAL_PAGES) {
        const img = new Image();
        img.src = `/book_pages_webp/page_${num}.webp`;
      }
    });
  }, [currentPage]);

  // Save bookmarks array to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);

  // Preload first 30 pages on mount
  useEffect(() => {
    for (let i = 1; i <= 30; i++) {
      const img = new Image();
      img.src = `/book_pages_webp/page_${i}.webp`;
    }
  }, []);

  // Prevent background body scrolling when in full screen mode
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  const isCurrentBookmarked = bookmarks.includes(currentPage);

  const toggleBookmark = () => {
    if (isCurrentBookmarked) {
      setBookmarks(prev => prev.filter(p => p !== currentPage));
    } else {
      setBookmarks(prev => [...prev, currentPage].sort((a, b) => a - b));
    }
  };

  // Instantaneous Smooth Next Page
  const turnNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES) {
      soundEffects.playPageTurnSound();
      setDirection(1);
      setCurrentPage(prev => Math.min(TOTAL_PAGES, prev + 1));
    }
  }, [currentPage]);

  // Instantaneous Smooth Previous Page
  const turnPrev = useCallback(() => {
    if (currentPage > 1) {
      soundEffects.playPageTurnSound();
      setDirection(-1);
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  }, [currentPage]);

  // Fast Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        turnNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        turnPrev();
      } else if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [turnNext, turnPrev, isFullScreen]);

  // Touch Swipe Gesture Handlers (Swift & Sweet)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Ensure horizontal gesture intent over vertical scroll
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 25) {
      if (deltaX < 0) {
        turnNext();
      } else {
        turnPrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  const handleReset = () => {
    setDirection(-1);
    setCurrentPage(1);
    setZoomLevel(100);
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= TOTAL_PAGES) {
      if (val !== currentPage) {
        soundEffects.playPageTurnSound();
      }
      setDirection(val > currentPage ? 1 : -1);
      setCurrentPage(val);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const getPageSrc = (num: number) => `/book_pages_webp/page_${num}.webp`;

  return (
    <>
      <section id="reader-cabinet" className="px-2 sm:px-6 pt-4 pb-14 max-w-4xl mx-auto select-none">
        
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-3.5 px-2 text-[#B93826] dark:text-[#E5A93C] font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#B93826] dark:text-[#E5A93C]" />
            <span>DIGITAL READER CABINET</span>
          </div>

          <div className="flex items-center gap-2 text-stone-500 text-[11px] font-sans font-medium">
            <span className="hidden sm:inline">219 Original Manuscript Pages</span>
          </div>
        </div>

        {/* Standard Cabinet View */}
        <div className="relative rounded-[24px] sm:rounded-[36px] p-2 sm:p-4 bg-[#141210] border-t-4 border-r-4 border-[#D85A2A] border-b-2 border-l-2 border-[#1E1915] shadow-2xl shadow-black/80 overflow-hidden">
          
          {/* Inner Dark Reader Box */}
          <div className="rounded-[18px] sm:rounded-[28px] bg-[#110E0C] p-2.5 sm:p-4 text-white flex flex-col justify-between min-h-[620px] sm:min-h-[760px] relative overflow-hidden">
            
            {/* Top Control Bar */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-2.5 mb-1 border-b border-[#241D17]">
              
              {/* Left Box: Novel Title */}
              <div className="bg-[#1C1815] border border-[#2D241E] rounded-xl px-2 sm:px-2.5 py-1 text-center flex items-center gap-1.5 shadow-inner shrink-0">
                <span className="text-[10px] sm:text-xs font-cinzel font-semibold text-stone-200">
                  Wilting of Words
                </span>
              </div>

              {/* Jump to Page input */}
              <form onSubmit={handlePageSubmit} className="hidden sm:flex items-center gap-1 bg-[#1A1512] px-2.5 py-1 rounded-xl border border-[#2D241E] text-xs">
                <span className="text-stone-400 font-cinzel">Page</span>
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={() => setPageInput(currentPage.toString())}
                  className="w-10 text-center bg-[#251E18] text-[#E5A93C] font-mono font-bold rounded px-1 py-0.5 border border-[#3A2D22] focus:outline-none"
                />
                <span className="text-stone-500 font-mono">/ {TOTAL_PAGES}</span>
              </form>

              {/* Right Controls */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-stone-300 shrink-0">
                
                {/* Speaker Toggle inside Reader Top Bar */}
                <button
                  type="button"
                  data-speaker-toggle="true"
                  onClick={() => audioSynth.togglePlay()}
                  title={isPlaying ? 'Pause Background Music' : 'Play Background Music'}
                  className={`p-1 sm:p-1.5 sm:px-2.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] sm:text-xs font-cinzel ${
                    isPlaying 
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-black border-[#D4AF37] font-bold shadow-md' 
                      : 'bg-[#1C1815] border-[#2D241E] text-stone-400 hover:text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-black animate-pulse" />
                      <span className="hidden md:inline">Music ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-[#E5A93C]" />
                      <span className="hidden md:inline">Music</span>
                    </>
                  )}
                </button>

                {/* Bookmark Toggle Button */}
                <button
                  onClick={toggleBookmark}
                  title={isCurrentBookmarked ? "Remove Bookmark" : "Bookmark this page"}
                  className={`p-1 sm:p-1.5 sm:px-2 rounded-lg border transition-all flex items-center gap-1 text-xs font-cinzel ${
                    isCurrentBookmarked 
                      ? 'bg-[#E5A93C]/20 border-[#E5A93C] text-[#E5A93C]' 
                      : 'bg-[#1C1815] border-[#2D241E] text-stone-400 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isCurrentBookmarked ? 'fill-current text-[#E5A93C]' : ''}`} />
                  <span className="hidden md:inline font-semibold">
                    {isCurrentBookmarked ? 'Saved' : 'Save'}
                  </span>
                </button>

                <button
                  onClick={() => setZoomLevel(z => Math.max(80, z - 10))}
                  title="Zoom Out"
                  className="hidden sm:block p-1 sm:p-1.5 hover:text-white transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                </button>

                <button
                  onClick={() => setZoomLevel(100)}
                  title="Fit Page"
                  className="hidden sm:block text-center font-cinzel text-[11px] sm:text-xs hover:text-white transition-colors leading-tight px-1 font-semibold"
                >
                  Fit
                </button>

                <button
                  onClick={() => setZoomLevel(z => Math.min(130, z + 10))}
                  title="Zoom In"
                  className="hidden sm:block p-1 sm:p-1.5 hover:text-white transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                </button>

                <button
                  onClick={handleReset}
                  title="Return to Page 1"
                  className="hidden sm:block p-1 sm:p-1.5 hover:text-white transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                </button>

                {/* FULL SCREEN TOGGLE BUTTON */}
                <button
                  onClick={toggleFullScreen}
                  title="Full Screen Reader"
                  className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-[#B93826] to-[#D85A2A] text-white border border-[#FFE58F]/50 hover:scale-105 transition-all flex items-center gap-1 font-cinzel text-xs shadow-md font-bold"
                >
                  <Maximize2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span className="hidden sm:inline">Full Screen</span>
                </button>

              </div>

            </div>

            {/* PAGE STAGE */}
            <div 
              className="flex-1 w-full flex items-center justify-center relative min-h-[490px] sm:min-h-[630px] my-auto py-1 overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Left Navigation Button */}
              <button
                onClick={turnPrev}
                disabled={currentPage <= 1}
                aria-label="Previous Page"
                className={`absolute left-1 sm:left-2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all ${
                  currentPage <= 1
                    ? 'opacity-20 cursor-not-allowed border-transparent text-stone-600'
                    : 'bg-black/70 hover:bg-[#B93826] border-[#D4AF37]/50 text-white shadow-xl hover:scale-110 active:scale-95'
                }`}
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Right Navigation Button */}
              <button
                onClick={turnNext}
                disabled={currentPage >= TOTAL_PAGES}
                aria-label="Next Page"
                className={`absolute right-1 sm:right-2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all ${
                  currentPage >= TOTAL_PAGES
                    ? 'opacity-20 cursor-not-allowed border-transparent text-stone-600'
                    : 'bg-black/70 hover:bg-[#B93826] border-[#D4AF37]/50 text-white shadow-xl hover:scale-110 active:scale-95'
                }`}
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* The Book Display Container */}
              <div 
                className="relative w-full max-w-[480px] sm:max-w-[560px] h-[500px] sm:h-[630px] flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
              >
                <div className="absolute inset-x-6 bottom-1 h-4 bg-black/60 blur-lg rounded-full pointer-events-none" />

                {/* Physical Book Frame */}
                <div className="relative w-full h-full bg-[#120F0D] rounded-2xl p-1.5 sm:p-2.5 shadow-2xl border border-[#2D241E] flex items-center justify-center overflow-hidden">
                  
                  {/* Instantaneous Smooth Page Transition */}
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0.7, x: direction * 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full flex items-center justify-center relative"
                    >
                      {/* The Printed Book Page Sheet */}
                      <div className="relative max-h-[490px] sm:max-h-[615px] max-w-[96%] sm:max-w-[92%] rounded-lg sm:rounded-xl shadow-2xl overflow-hidden bg-[#FAFAF8] border border-stone-300/80">
                        
                        {/* Golden Bookmark Ribbon */}
                        {isCurrentBookmarked && (
                          <div className="absolute top-0 right-4 z-30 w-5 h-8 bg-[#E5A93C] rounded-b-md shadow-md flex items-end justify-center pb-1 text-black">
                            <Bookmark className="w-3 h-3 fill-current" />
                          </div>
                        )}

                        {/* High-Resolution Manuscript Page */}
                        <img
                          src={getPageSrc(currentPage)}
                          onError={(e) => {
                            e.currentTarget.src = `/book_pages/page_${currentPage}.jpg`;
                          }}
                          alt={`Wilting of Words - Page ${currentPage}`}
                          className="max-h-[490px] sm:max-h-[615px] w-auto h-auto object-contain block mx-auto select-none pointer-events-none"
                          loading="eager"
                          decoding="async"
                          draggable={false}
                        />
                      </div>
                    </motion.div>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Bar: Current Page Number + Range Slider + Reading Progress */}
            <div className="pt-2 sm:pt-3 flex items-center justify-between gap-4 relative">
              
              <div className="flex items-center gap-3 flex-1 max-w-[280px] sm:max-w-md">
                <span className="font-mono text-xs sm:text-sm text-[#E5A93C] font-bold tabular-nums">
                  {currentPage}
                </span>
                <input
                  type="range"
                  min={1}
                  max={TOTAL_PAGES}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDirection(val > currentPage ? 1 : -1);
                    setCurrentPage(val);
                  }}
                  className="w-full h-1.5 accent-[#E5A93C] bg-[#2C241E] rounded-lg cursor-pointer"
                />
                <span className="font-mono text-[11px] text-stone-500 tabular-nums">
                  {TOTAL_PAGES}
                </span>
              </div>

              <div className="text-right text-[11px] sm:text-xs text-stone-400 font-cinzel">
                <span className="text-[#E5A93C] font-bold">{Math.round((currentPage / TOTAL_PAGES) * 100)}%</span>
                <span className="hidden sm:inline text-stone-500 ml-1">Completed</span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* DEDICATED FULL-SCREEN IMMERSIVE READER MODAL */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0A0806] text-white flex flex-col justify-between p-2 sm:p-4 overflow-hidden"
          >
            {/* Full Screen Top Control Bar with Guaranteed Prominent Back Button */}
            <header className="flex items-center justify-between gap-2 p-2 sm:px-4 bg-[#14100D] rounded-2xl border border-[#2D241E] shadow-2xl">
              
              {/* PROMINENT BACK / EXIT BUTTON (Top Left) */}
              <button
                onClick={() => setIsFullScreen(false)}
                title="Back to normal view"
                className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#B93826] to-[#D85A2A] text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 font-cinzel text-xs sm:text-sm font-bold shadow-lg border border-[#FFE58F]/50 shrink-0"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back</span>
              </button>

              {/* Novel Title & Page Counter (Center) */}
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-cinzel text-xs sm:text-sm font-bold text-[#E5A93C] truncate hidden xs:inline">
                  WILTING OF WORDS
                </span>
                <span className="text-stone-300 font-mono text-xs bg-[#201813] px-2.5 py-1 rounded-lg border border-[#3E2D20] font-bold">
                  Page {currentPage} / {TOTAL_PAGES}
                </span>
              </div>

              {/* Full Screen Top Actions (Right) */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                
                {/* Speaker Button in Full Screen */}
                <button
                  type="button"
                  data-speaker-toggle="true"
                  onClick={() => audioSynth.togglePlay()}
                  title={isPlaying ? 'Pause Music' : 'Play Music'}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-xs font-cinzel font-bold flex items-center gap-1.5 ${
                    isPlaying 
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-black border-[#D4AF37] shadow-md' 
                      : 'bg-[#1C1815] border-[#2D241E] text-stone-300 hover:text-white'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-black animate-pulse" />
                      <span className="hidden sm:inline">Music ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-[#E5A93C]" />
                      <span className="hidden sm:inline">Music</span>
                    </>
                  )}
                </button>

                {/* Bookmark Toggle */}
                <button
                  onClick={toggleBookmark}
                  title={isCurrentBookmarked ? "Remove Bookmark" : "Bookmark this page"}
                  className={`p-1.5 px-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-cinzel ${
                    isCurrentBookmarked 
                      ? 'bg-[#E5A93C]/20 border-[#E5A93C] text-[#E5A93C]' 
                      : 'bg-[#1C1815] border-[#2D241E] text-stone-400 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isCurrentBookmarked ? 'fill-current text-[#E5A93C]' : ''}`} />
                  <span className="hidden sm:inline">{isCurrentBookmarked ? 'Saved' : 'Save'}</span>
                </button>

                {/* Close Full Screen Icon Button */}
                <button
                  onClick={() => setIsFullScreen(false)}
                  title="Exit Full Screen"
                  className="p-1.5 sm:px-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 transition-all shadow-sm"
                >
                  <Minimize2 className="w-4 h-4 stroke-[2]" />
                </button>

              </div>
            </header>

            {/* Full Screen Page Display */}
            <main 
              className="flex-1 w-full flex items-center justify-center relative my-auto py-1 overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Left Arrow */}
              <button
                onClick={turnPrev}
                disabled={currentPage <= 1}
                aria-label="Previous Page"
                className={`absolute left-2 sm:left-6 z-30 w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  currentPage <= 1
                    ? 'opacity-20 cursor-not-allowed border-transparent text-stone-600'
                    : 'bg-black/80 hover:bg-[#B93826] border-[#D4AF37]/60 text-white shadow-2xl hover:scale-110 active:scale-95'
                }`}
              >
                <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={turnNext}
                disabled={currentPage >= TOTAL_PAGES}
                aria-label="Next Page"
                className={`absolute right-2 sm:right-6 z-30 w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  currentPage >= TOTAL_PAGES
                    ? 'opacity-20 cursor-not-allowed border-transparent text-stone-600'
                    : 'bg-black/80 hover:bg-[#B93826] border-[#D4AF37]/60 text-white shadow-2xl hover:scale-110 active:scale-95'
                }`}
              >
                <ChevronRight className="w-7 h-7 stroke-[2.5]" />
              </button>

              {/* Center Page */}
              <div className="relative max-h-[82vh] max-w-[95%] sm:max-w-[85%] flex items-center justify-center">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0.7, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="relative max-h-[82vh] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden bg-[#FAFAF8] border border-stone-300"
                >
                  {isCurrentBookmarked && (
                    <div className="absolute top-0 right-4 z-30 w-6 h-10 bg-[#E5A93C] rounded-b-md shadow-md flex items-end justify-center pb-1 text-black">
                      <Bookmark className="w-4 h-4 fill-current" />
                    </div>
                  )}

                  <img
                    src={getPageSrc(currentPage)}
                    onError={(e) => {
                      e.currentTarget.src = `/book_pages/page_${currentPage}.jpg`;
                    }}
                    alt={`Wilting of Words - Page ${currentPage}`}
                    className="max-h-[82vh] w-auto h-auto object-contain block mx-auto select-none pointer-events-none"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                </motion.div>
              </div>

            </main>

            {/* Full Screen Bottom Slider */}
            <footer className="flex items-center justify-between gap-4 p-2 sm:px-6 bg-[#14100D] rounded-2xl border border-[#2D241E]">
              <div className="flex items-center gap-3 flex-1 max-w-xl mx-auto">
                <span className="font-mono text-xs text-[#E5A93C] font-bold">
                  {currentPage}
                </span>
                <input
                  type="range"
                  min={1}
                  max={TOTAL_PAGES}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDirection(val > currentPage ? 1 : -1);
                    setCurrentPage(val);
                  }}
                  className="w-full h-1.5 accent-[#E5A93C] bg-[#2C241E] rounded-lg cursor-pointer"
                />
                <span className="font-mono text-xs text-stone-500">
                  {TOTAL_PAGES}
                </span>
              </div>
            </footer>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
