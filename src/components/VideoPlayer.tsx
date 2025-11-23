'use client'

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

function VideoPlayer({
  src,
  className = '',
  autoPlay = true,
  muted = true,
  loop = true
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(containerRef, {
    amount: 0.5, // 50% visible
    margin: "-100px 0px"
  });

  // control play based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView && autoPlay) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isInView, autoPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoaded = () => setIsLoaded(true);

    if (video.readyState >= 3) {
      setIsLoaded(true);
    }

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('canplay', handleLoaded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('canplay', handleLoaded);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      style={{ width: '1000px', height: '480px' }}
    >
      <motion.video
        ref={videoRef}
        src={src}
        muted={muted}
        loop={loop}
        playsInline
        className="w-full h-full object-contain rounded-md bg-black/5"
        style={{ borderRadius: 'inherit' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Control overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/10 rounded-md flex items-center justify-center cursor-pointer"
            onClick={togglePlayPause}
          >
            {/* Play/Pause button in bottom right corner */}
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VideoPlayer;
