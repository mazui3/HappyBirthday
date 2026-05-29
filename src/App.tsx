/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Cake, 
  Heart, 
  Music, 
  Volume2, 
  ChevronLeft, 
  Sparkles, 
  ZoomIn, 
  X,
  ArrowRight
} from 'lucide-react';

// Import custom generated watercolor memory memories
import starrySkyImg from './assets/images/starry_sky_friends_1780045099159.png';
import cozyWarmTableImg from './assets/images/cozy_warm_table_1780045115274.png';
import wildflowersJarImg from './assets/images/wildflowers_jar_1780045134376.png';

// Web Audio API Synthesizer cozy melody
class LofiSynth {
  private audioCtx: AudioContext | null = null;
  private musicInterval: any = null;
  private isPlaying: boolean = false;

  public start(onNotePlay?: (index: number) => void) {
    if (this.isPlaying) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    this.isPlaying = true;

    // A beautiful nostalgic lullaby (Canon in D adapted for cozy pentatonic scale)
    const notes = [
      293.66, 329.63, 369.99, 440.00, // D4, E4, F#4, A4
      369.99, 329.63, 293.66, 261.63, // F#4, E4, D4, C4
      329.63, 293.66, 261.63, 220.00, // E4, D4, C4, A3
      261.63, 293.66, 329.63, 369.99, // C4, D4, E4, F#4
      440.00, 493.88, 554.37, 587.33, // A4, B4, C#5, D5
      554.37, 493.88, 440.00, 369.99, // C#5, B4, A4, F#4
    ];
    let index = 0;

    const playNote = (freq: number) => {
      if (!this.audioCtx || !this.isPlaying) return;
      
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      // Use triangle or sine wave for a clean music-box sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      // Smooth envelope to emulate standard music box pluck
      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 1.2);

      if (onNotePlay) {
        onNotePlay(index);
      }
    };

    // First note immediately
    playNote(notes[index]);
    index = (index + 1) % notes.length;

    this.musicInterval = setInterval(() => {
      if (this.audioCtx && this.isPlaying) {
        playNote(notes[index]);
        index = (index + 1) % notes.length;
      }
    }, 900);
  }

  public stop() {
    this.isPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  public getStatus() {
    return this.isPlaying;
  }
}

const synthInstance = new LofiSynth();

export default function App() {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [inputBuffer, setInputBuffer] = useState<string[]>([]);
  const [heartClicks, setHeartClicks] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);
  const [successToast, setSuccessToast] = useState(false);

  // Lightbox view for memories
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; alt: string; caption: string } | null>(null);

  // Customize letter and captions with local storage persistence
  const [salutation, setSalutation] = useState(() => localStorage.getItem('bt_salutation') || '致我最可爱的朋友：');
  const [letterBody, setLetterBody] = useState(() => localStorage.getItem('bt_letterBody') || '祝你生日快乐！下个月就是你的生日啦，我很早就想为你准备一个不一样的惊喜。在这个特别的页面里，我藏了一份“秘密时光胶囊”给你。\n\n感谢命运让我们相遇，过去的岁月里，那些一起笑过、聊过、看过的日子，都像夜空中的流星一样，发出温柔而璀璨的光芒。\n\n愿你新的一岁里，所有愿望都如期而至，永远被温柔和善意包围，开心、快乐、无忧无虑地生活。这两张拍立得，是我心中对我们美好回忆的写照。点击它们可以看背后的故事，还有这首轻柔的心灵音乐送给你。');
  const [signature, setSignature] = useState(() => localStorage.getItem('bt_signature') || '永远支持你的挚友 留');

  // Polaroid Caption states
  const [caption1, setCaption1] = useState(() => localStorage.getItem('bt_cap1') || '那一夜，我们一起看过的星空');
  const [caption2, setCaption2] = useState(() => localStorage.getItem('bt_cap2') || '热咖啡与随心所欲的悄悄话');

  // Secrets key code configuration
  // Konami code: Up Up Down Down Left Right Left Right (Arrow or letter mapped)
  const codeSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
  const altSequence = ['w', 'w', 's', 's', 'a', 'd', 'a', 'd'];

  // Synthesis success sound chime (plink-plonk!)
  const playUnlockChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const playFreq = (f: number, delay: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(f, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.5);
      };
      playFreq(523.25, 0); // C5
      playFreq(659.25, 0.1); // E5
      playFreq(783.99, 0.2); // G5
      playFreq(1046.50, 0.3); // C6
    } catch (e) {
      console.log('Audio contextual unlock fail safety: ', e);
    }
  };

  const handleSecretUnlock = useCallback(() => {
    setSecretUnlocked(true);
    playUnlockChime();
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4500);

    // Launch a special golden magical spark confetti
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#EE82EE']
    });
  }, []);

  // Listen to physical keyboard events anywhere on the page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keydown if editing textfields
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const nextInput = [...inputBuffer, e.key];
      // Limit size
      if (nextInput.length > 12) {
        nextInput.shift();
      }
      setInputBuffer(nextInput);

      // Check sequence match (matching last 8 keys)
      const lastKeysStr = nextInput.slice(-8).join(',').toLowerCase();
      const codeStr = codeSequence.join(',').toLowerCase();
      const altStr = altSequence.join(',').toLowerCase();

      if (lastKeysStr === codeStr || lastKeysStr === altStr) {
        handleSecretUnlock();
        setInputBuffer([]); // reset
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputBuffer, handleSecretUnlock]);

  // Click handler to trigger celebration confetti
  const handleCelebrate = useCallback(() => {
    setIsCelebrating(true);
    
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 45 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#D8BFD8', '#E6E6FA']
    });
  }, []);

  // Soft mobile-friendly fallback tap interaction (tapping transparent/decorative hearts)
  const handleHeartClick = () => {
    const nextHeart = heartClicks + 1;
    setHeartClicks(nextHeart);
    // Flash a miniature heart confetti
    confetti({
      particleCount: 5,
      spread: 30,
      origin: { x: 0.5, y: 0.9 },
      colors: ['#FF69B4']
    });

    if (nextHeart >= 5) {
      handleSecretUnlock();
      setHeartClicks(0); // Reset
    }
  };

  // Toggle ambient melody synthesizer
  const toggleMusic = () => {
    if (isMusicPlaying) {
      synthInstance.stop();
      setIsMusicPlaying(false);
    } else {
      synthInstance.start((idx) => {
        setActiveNoteIndex(idx);
      });
      setIsMusicPlaying(true);
    }
  };

  // Clean play state when unmounting
  useEffect(() => {
    return () => {
      synthInstance.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex flex-col items-center justify-center overflow-x-hidden relative font-sans transition-colors duration-500">
      
      {/* Floating Success Toast when capsule is unlocked */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -70, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 bg-pink-500 text-white px-6 py-3.5 rounded-2xl shadow-xl border border-pink-300/40 z-50 flex items-center gap-3 backdrop-blur-md max-w-sm mx-4"
          >
            <div className="p-1.5 bg-pink-400 rounded-full animate-bounce">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <p className="font-bold text-sm tracking-wide">🔓 秘密通道已开启！</p>
              <p className="text-xs text-pink-100">输入了魔法上上下下左右左右 🌟</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!secretUnlocked ? (
          // MAIN PAGE VIEW (FESTIVE LANDING)
          <motion.div
            key="landing-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full flex-1 flex flex-col items-center justify-center p-6 relative"
          >
            {/* Ambient Tapping Hearts for Mobile Unlocking */}
            <button 
              onClick={handleHeartClick}
              className="absolute top-8 left-8 p-3 opacity-30 hover:opacity-100 transition-opacity active:scale-95 duration-200"
              title="Secret Sensor"
            >
              <Heart className="text-pink-400 w-12 h-12 hover:scale-110 duration-200" />
            </button>
            
            <div className="absolute top-8 right-8 text-right opacity-10 text-xs font-mono select-none pointer-events-none hidden md:block leading-relaxed">
              <span>⌨️ Try typing: ↑ ↑ ↓ ↓ ← → ← →</span>
            </div>

            <AnimatePresence mode="wait">
              {!isCelebrating ? (
                // Invitation to press Click Me
                <motion.div
                  key="button-container"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="z-10 text-center"
                >
                  <motion.div 
                    className="mb-6 flex justify-center text-pink-500"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  >
                    <Cake className="w-16 h-16 stroke-[1.5]" />
                  </motion.div>
                  
                  <button
                    id="celebrate-btn"
                    onClick={handleCelebrate}
                    className="group relative px-9 py-4.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold text-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 border border-pink-400"
                  >
                    <span>Click Me!</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                  <p className="text-pink-400/70 text-sm mt-3.5 tracking-wide">按一下飞出庆典气球 🎈</p>
                </motion.div>
              ) : (
                // Celebration texts
                <motion.div
                  key="birthday-text"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center z-10 max-w-lg px-4"
                >
                  <motion.h1 
                    className="text-6xl md:text-8xl font-black text-pink-600 mb-6 tracking-tighter"
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18 }}
                  >
                    Happy Birthday!
                  </motion.h1>
                  <motion.p 
                    className="text-2xl md:text-3xl text-pink-500 font-medium tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    祝你生日快乐，永远开心！
                  </motion.p>
                  
                  <motion.div 
                    className="mt-14 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                  >
                    <button 
                      onClick={() => setIsCelebrating(false)}
                      className="px-6 py-2 bg-pink-100 hover:bg-pink-200 text-pink-600 text-sm rounded-full transition-colors font-medium border border-pink-200"
                    >
                      再次开启
                    </button>
                    
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Static background decor stars/hearts floating */}
            <div className="absolute bottom-8 text-pink-300 text-xs tracking-wider flex items-center gap-1 font-mono">
              <span>Made with</span>
              <button onClick={handleHeartClick} className="text-pink-500 scale-110 inline-block hover:scale-130 transition-transform active:scale-90 p-1">❤</button>
              <span>for her</span>
            </div>
          </motion.div>
        ) : (
          // THE SECRET CAPSULE VIEW (EXCLUSIVE INTIMATE MEMORIES AND LETTERS)
          <motion.div
            key="secret-capsule-screen"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full flex-1 max-w-6xl px-4 md:px-8 py-10 relative z-20"
          >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 border-b border-pink-100 pb-6">
              <button
                onClick={() => {
                  setSecretUnlocked(false);
                  synthInstance.stop();
                  setIsMusicPlaying(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-pink-50 text-pink-500 rounded-full shadow-sm text-sm border border-pink-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>返回</span>
              </button>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-pink-500 tracking-wide">只给你的信</h2>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3">
                {/* Music trigger */}
                <button
                  onClick={toggleMusic}
                  className={`p-3 rounded-full flex items-center justify-center transition-all shadow-md group ${
                    isMusicPlaying 
                      ? 'bg-pink-500 text-white animate-spin-slow' 
                      : 'bg-white text-pink-500 hover:bg-pink-50'
                  }`}
                  title={isMusicPlaying ? '暂停背景轻音乐' : '开启轻柔心灵音乐'}
                >
                  <Music className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Optional Synthesizer Visual Floating Bar */}
            <AnimatePresence>
              {isMusicPlaying && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0, scaleY: 0 }}
                  className="mb-8 p-3 bg-pink-50/80 rounded-2xl flex items-center justify-between border border-pink-100 backdrop-blur-sm px-6"
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-pink-500 animate-bounce" />
                    <span className="text-xs text-pink-700 font-mono">正在为你演奏八音盒：《温暖旋律》</span>
                  </div>
                  <div className="flex gap-1 h-5 items-end">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-pink-400 rounded-full"
                        animate={{ height: isMusicPlaying ? [4, 20, 4] : 4 }}
                        transition={{
                          duration: 0.6 + i * 0.15,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Large layout: Polaroid 1 (Left), Letter Scroll (Middle), Polaroid 2 (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Polaroid 1 (3 cols) */}
              <div className="lg:col-span-3 flex flex-col justify-center">
                <motion.div
                  initial={{ rotate: -3, scale: 0.95, opacity: 0 }}
                  animate={{ rotate: -2, scale: 1, opacity: 1 }}
                  whileHover={{ rotate: 1, scale: 1.02, y: -4 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  onClick={() => setSelectedPhoto({ src: starrySkyImg, alt: 'Starry memory', caption: caption1 })}
                  className="bg-white p-4 pb-6 polaroid-shadow rounded-sm border border-gray-100 flex flex-col cursor-pointer transform origin-center"
                >
                  <div className="aspect-square w-full rounded-xs overflow-hidden relative group bg-indigo-50">
                    <img
                      src={starrySkyImg}
                      alt="Starry memory"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white filter drop-shadow" />
                    </div>
                  </div>
                  
                  <span className="font-cursive-cn text-2xl text-center text-gray-700 block mt-4 select-none">
                    {caption1}
                  </span>
                  <span className="font-caveat text-right text-xs text-gray-400 mt-2 block select-none">
                    ⭐ Sweet Memory
                  </span>
                </motion.div>
              </div>

              {/* MIDDLE COLUMN: THE LETTER (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="vintage-paper p-8 rounded-3xl polaroid-shadow border border-orange-100/30 relative flex-1 min-h-[450px]"
                >

                  {/* BEAUTIFUL DISPLAY LETTER */}
                  <div className="flex flex-col h-full font-serif-cn leading-relaxed tracking-wide text-gray-800 z-10 relative">

                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 font-serif-cn border-b border-orange-100 pb-2">
                      {salutation}
                    </h3>

                    <div className="text-base md:text-lg text-gray-700 whitespace-pre-line flex-1 min-h-[255px] leading-loose space-y-4">
                      {letterBody}
                    </div>

                    <div className="text-right mt-10 pr-2 pt-6 border-t border-orange-100 font-serif-cn italic font-bold text-gray-900 text-lg">
                      {signature}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN: Polaroid 2 (3 cols) */}
              <div className="lg:col-span-3 flex flex-col justify-center">
                <motion.div
                  initial={{ rotate: 2, scale: 0.95, opacity: 0 }}
                  animate={{ rotate: 3, scale: 1, opacity: 1 }}
                  whileHover={{ rotate: -1, scale: 1.02, y: -4 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  onClick={() => setSelectedPhoto({ src: cozyWarmTableImg, alt: 'Cozy table', caption: caption2 })}
                  className="bg-white p-4 pb-6 polaroid-shadow rounded-sm border border-gray-100 flex flex-col cursor-pointer transform origin-center"
                >
                  <div className="aspect-square w-full rounded-xs overflow-hidden relative group bg-amber-50">
                    <img
                      src={cozyWarmTableImg}
                      alt="Cozy table"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white filter drop-shadow" />
                    </div>
                  </div>

                  <span className="font-cursive-cn text-2xl text-center text-gray-700 block mt-4 select-none">
                    {caption2}
                  </span>
                  <span className="font-caveat text-right text-xs text-gray-400 mt-2 block select-none">
                    ☕ Pure Warmth
                  </span>
                </motion.div>
              </div>

            </div>

            {/* Bottom hidden keycode reminder summary details */}
            <div className="mt-16 text-center text-gray-400 text-xs font-mono max-w-sm mx-auto p-4 bg-gray-50 border border-gray-200/50 rounded-2xl select-none leading-relaxed">
              🔑 已安全开启
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX MODAL DIALOG */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-md"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-5 pb-7 rounded-sm max-w-lg w-full flex flex-col border border-gray-200 shadow-2xl relative"
            >
              <div className="aspect-square w-full rounded-sm overflow-hidden bg-gray-100">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-cursive-cn text-3xl text-center text-gray-800 mt-5 leading-snug">
                {selectedPhoto.caption}
              </p>
              <div className="flex items-center justify-between text-xs text-pink-400 font-semibold mt-4 border-t border-pink-50 pt-3">
                <span>📸 Polaroid Memories Archive</span>
                <span>Forever Friends 💖</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles background decoration - always active for warmth */}
      <div className="absolute inset-0 pointer-events-none z-10 select-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-pink-200/45 rounded-full"
            style={{
              width: Math.random() * 16 + 8,
              height: Math.random() * 16 + 8,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -110, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.12, 0.45, 0.12],
            }}
            transition={{
              duration: Math.random() * 6 + 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

    </div>
  );
}
