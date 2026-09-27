// Singleton Background Audio Engine for Wilting of Words
// Plays exclusively the provided Radha Krishna flute master soundtrack.
// Ensures 100% audibility, preset to ON by default, and continuous unmuted playback.

class SingleBackgroundMusicEngine {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = true; // Preset to ON by default
  private userExplicitlyPaused: boolean = false;
  private listeners: ((playing: boolean) => void)[] = [];
  private unlockListenersAttached: boolean = false;
  private unlockHandler: ((e: Event) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
      } else {
        this.init();
      }
    }
  }

  public init() {
    if (typeof window === 'undefined') return;

    try {
      if ((window as any).__bgAudio) {
        this.audio = (window as any).__bgAudio;
      } else {
        const existingEl = document.getElementById('exclusive-bg-music-player') as HTMLAudioElement | null;
        if (existingEl) {
          this.audio = existingEl;
        } else if (!this.audio) {
          this.audio = new Audio('/background_music.mp3');
          this.audio.id = 'exclusive-bg-music-player';
        }
        (window as any).__bgAudio = this.audio;
      }

      if (this.audio) {
        this.audio.loop = true;
        this.audio.autoplay = true;
        this.audio.volume = 1.0;
        this.audio.preload = 'auto';
        (this.audio as any).playsInline = true;

        this.audio.onplay = () => {
          this.isPlaying = true;
          this.userExplicitlyPaused = false;
          this.removeUnlockListeners();
          this.notify();
        };

        this.audio.onplaying = () => {
          this.isPlaying = true;
          this.userExplicitlyPaused = false;
          this.removeUnlockListeners();
          this.notify();
        };

        this.audio.onpause = () => {
          // Only show as paused in UI if user explicitly toggled it off
          if (this.userExplicitlyPaused) {
            this.isPlaying = false;
            this.notify();
          }
        };

        this.audio.onended = () => {
          if (this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch(() => {});
          }
        };

        this.audio.onerror = (e) => {
          console.warn('[MusicEngine] Primary source error, falling back to m4a:', e);
          if (this.audio && this.audio.src.endsWith('.mp3')) {
            this.audio.src = '/background_music.m4a';
            this.audio.load();
            if (!this.userExplicitlyPaused) {
              this.audio.play().catch(() => {});
            }
          }
        };
      }

      // Attach unlock listeners and attempt autoplay
      this.setupUnlockListeners();
      this.attemptAutoPlay();
    } catch (err) {
      console.warn('[MusicEngine] Audio initialization warning:', err);
    }
  }

  private unlockAudioContext() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      }
    } catch (e) {
      // Silent catch
    }
  }

  public setupUnlockListeners() {
    if (this.unlockListenersAttached || typeof window === 'undefined') return;
    this.unlockListenersAttached = true;

    this.unlockHandler = (e: Event) => {
      this.unlockAudioContext();

      // If user tapped directly on header speaker button, togglePlay handles that
      const target = e.target;
      if (target && typeof (target as any).closest === 'function') {
        if ((target as Element).closest('[data-speaker-toggle]')) {
          return;
        }
      }

      if (this.audio) {
        this.audio.muted = false;
        this.audio.volume = 1.0;
      }

      if (!this.userExplicitlyPaused && this.audio && this.audio.paused) {
        this.attemptAutoPlay();
      } else if (this.audio && !this.audio.paused) {
        this.removeUnlockListeners();
      }
    };

    const unlockEvents = [
      'touchstart', 'touchend', 'pointerdown', 'pointerup', 
      'click', 'keydown', 'scroll'
    ];
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, this.unlockHandler!, { passive: true, capture: true });
      document.addEventListener(evt, this.unlockHandler!, { passive: true, capture: true });
    });
  }

  private removeUnlockListeners() {
    if (!this.unlockListenersAttached || !this.unlockHandler || typeof window === 'undefined') return;
    const unlockEvents = [
      'touchstart', 'touchend', 'pointerdown', 'pointerup', 
      'click', 'keydown', 'scroll'
    ];
    unlockEvents.forEach((evt) => {
      window.removeEventListener(evt, this.unlockHandler!, { capture: true });
      document.removeEventListener(evt, this.unlockHandler!, { capture: true });
    });
    this.unlockListenersAttached = false;
    this.unlockHandler = null;
  }

  public attemptAutoPlay() {
    if (!this.audio) {
      this.init();
    }
    if (!this.audio || this.userExplicitlyPaused) return;

    this.unlockAudioContext();
    this.audio.volume = 1.0;
    this.audio.muted = false;
    
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.removeUnlockListeners();
          this.notify();
        })
        .catch(() => {
          // If browser policy holds initial unmuted playback pending a user gesture,
          // play in muted mode immediately so the hardware media pipeline is running
          if (this.audio && !this.userExplicitlyPaused) {
            this.audio.muted = true;
            this.audio.play().catch(() => {});
          }
          this.isPlaying = true;
          this.setupUnlockListeners();
          this.notify();
        });
    }
  }

  public playNow() {
    this.userExplicitlyPaused = false;
    this.unlockAudioContext();
    if (!this.audio) {
      this.init();
    }
    if (this.audio) {
      this.audio.muted = false;
      this.audio.volume = 1.0;
      this.audio.play()
        .then(() => {
          this.isPlaying = true;
          this.removeUnlockListeners();
          this.notify();
        })
        .catch((err) => {
          console.warn('[MusicEngine] playNow gesture catch:', err);
          if (this.audio) {
            this.audio.muted = false;
            this.audio.play().catch(() => {});
          }
        });
    }
  }

  public togglePlay() {
    if (!this.audio) {
      this.init();
    }
    if (!this.audio) return;

    this.unlockAudioContext();

    // Check if audio is currently playing sound
    const isActuallyPlaying = !this.audio.paused;

    if (isActuallyPlaying) {
      // User tapped to explicitly pause the music
      this.userExplicitlyPaused = true;
      this.audio.pause();
      this.isPlaying = false;
      this.removeUnlockListeners();
      this.notify();
    } else {
      // User tapped to play
      this.userExplicitlyPaused = false;
      this.audio.volume = 1.0;
      
      if (this.audio.readyState === 0) {
        this.audio.load();
      }

      this.audio
        .play()
        .then(() => {
          this.isPlaying = true;
          this.removeUnlockListeners();
          this.notify();
        })
        .catch((err) => {
          console.warn('[MusicEngine] Explicit playback request warning:', err);
          this.isPlaying = true;
          this.notify();
        });
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribe(listener: (playing: boolean) => void) {
    this.listeners.push(listener);
    listener(this.isPlaying);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isPlaying));
  }
}

export const audioSynth = new SingleBackgroundMusicEngine();
