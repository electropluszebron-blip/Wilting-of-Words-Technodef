import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroCoverSection } from './components/HeroCoverSection';
import { NovelPrologueShowcase } from './components/NovelPrologueShowcase';
import { AboutTheBook } from './components/AboutTheBook';
import { AuthorSection } from './components/AuthorSection';
import { EditionAnnouncement } from './components/EditionAnnouncement';
import { ReaderCabinet } from './components/ReaderCabinet';
import { QuoteSharer } from './components/QuoteSharer';
import { ReaderReflections } from './components/ReaderReflections';
import { Footer } from './components/Footer';
import { IndianCulturalCanvas } from './components/IndianCulturalCanvas';
import { QuickJumpBar } from './components/QuickJumpBar';
import { audioSynth } from './services/audioSynth';
import { EntranceGate } from './components/EntranceGate';
import { AuthPortal, AuthUser } from './components/AuthPortal';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('wilting_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAuthPortal, setShowAuthPortal] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signup' | 'signin'>('signup');

  // Trigger background music playback on mount by default
  useEffect(() => {
    audioSynth.init();
    audioSynth.attemptAutoPlay();
  }, []);

  const handleJumpToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEnter = () => {
    setHasEntered(true);
    audioSynth.playNow();

    if (!currentUser) {
      setAuthInitialMode('signup');
      setShowAuthPortal(true);
    }
  };

  const handleAuthenticated = (user: AuthUser) => {
    setCurrentUser(user);
    setShowAuthPortal(false);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('wilting_auth_user');
    } catch {}
    setCurrentUser(null);
    setAuthInitialMode('signin');
    setShowAuthPortal(true);
  };

  const handleOpenAuth = (mode: 'signup' | 'signin' = 'signin') => {
    setAuthInitialMode(mode);
    setShowAuthPortal(true);
  };

  return (
    <div 
      className={`min-h-screen w-full max-w-[100vw] overflow-x-hidden relative transition-colors duration-300 ${
        isDark ? 'bg-alpona-dark text-[#FAF7F2]' : 'bg-alpona-pattern text-[#2D241E]'
      }`}
    >
      {/* Cinematic Sacred Entrance Gateway: prevalent until user clicks ENTER WEBSITE */}
      {!hasEntered && <EntranceGate onEnter={handleEnter} />}

      {/* Sacred Reader Authentication Portal: opens after clicking Enter Website if not authenticated */}
      {hasEntered && (
        <AuthPortal
          isOpen={!currentUser || showAuthPortal}
          initialMode={authInitialMode}
          onClose={currentUser ? () => setShowAuthPortal(false) : undefined}
          onAuthenticated={handleAuthenticated}
        />
      )}

      {/* Main Website is exclusively revealed once the reader is authenticated */}
      {currentUser && (
        <>
          {/* Background Indian Cultural Heritage Canvas with Konark & Bishnupur Rotating Mandalas */}
          <IndianCulturalCanvas isDark={isDark} />

      {/* Header with speaker button as exclusive music controller & quick jump links */}
      <Header
        isDark={isDark}
        setIsDark={setIsDark}
        onJumpToSection={handleJumpToSection}
        user={currentUser}
        onOpenAuth={() => handleOpenAuth('signin')}
        onSignOut={handleSignOut}
      />

      {/* Hero Cover Showcase at Top (Surrounded by Sacred Mandalas & Sun Wheels) */}
      <HeroCoverSection
        isDark={isDark}
        onStartReading={() => handleJumpToSection('reader-cabinet')}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 w-full max-w-[100vw] overflow-x-hidden">
        
        {/* World-Class Glowing Vibrant "Wilting of Words" Title & Novel Exposition */}
        <NovelPrologueShowcase
          isDark={isDark}
          onOpenEBook={() => handleJumpToSection('reader-cabinet')}
          onExploreAuthor={() => handleJumpToSection('author-section')}
        />

        {/* About the Book */}
        <AboutTheBook
          isDark={isDark}
        />

        {/* About the Author */}
        <AuthorSection
          isDark={isDark}
        />

        {/* Ultra Realistic Glowing Dynamic Edition Announcement Section (Before Digital Reader) */}
        <EditionAnnouncement
          isDark={isDark}
        />

        {/* Digital Reader Cabinet */}
        <ReaderCabinet
          isDark={isDark}
        />

        {/* Famous Quotes */}
        <QuoteSharer
          isDark={isDark}
        />

        {/* Community Reader Reflections */}
        <ReaderReflections
          isDark={isDark}
        />
      </main>

      {/* Footer */}
      <Footer
        isDark={isDark}
      />

      {/* Floating Professional Quick Jump Bar */}
      <QuickJumpBar
        isDark={isDark}
        onJumpToSection={handleJumpToSection}
      />
        </>
      )}
    </div>
  );
}
