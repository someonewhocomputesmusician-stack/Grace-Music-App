import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Song } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MusicPlayerProps {
  currentSong: Song | null;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function MusicPlayer({ currentSong, onNext, onPrevious }: MusicPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!waveformRef.current || !currentSong) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4f46e5',
      progressColor: '#818cf8',
      cursorColor: '#ffffff',
      barWidth: 2,
      barRadius: 3,
      height: 40,
      normalize: true,
    });

    wavesurfer.current.load(currentSong.audioUrl);

    wavesurfer.current.on('ready', () => {
      setDuration(wavesurfer.current?.getDuration() || 0);
      wavesurfer.current?.play();
      setIsPlaying(true);
    });

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current?.getCurrentTime() || 0);
    });

    wavesurfer.current.on('finish', () => {
      setIsPlaying(false);
      onNext?.();
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [currentSong]);

  const togglePlay = () => {
    wavesurfer.current?.playPause();
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    wavesurfer.current?.setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      wavesurfer.current?.setVolume(volume);
      setIsMuted(false);
    } else {
      wavesurfer.current?.setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 p-3 md:p-4 z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 md:w-1/4 min-w-0">
          <img 
            src={currentSong.coverArtUrl} 
            alt={currentSong.title} 
            className="w-12 h-12 md:w-14 md:h-14 rounded-md object-cover shadow-lg flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <h4 className="text-white font-medium truncate text-sm md:text-base">{currentSong.title}</h4>
            <p className="text-zinc-400 text-xs md:text-sm truncate">{currentSong.artistName}</p>
          </div>
        </div>

        {/* Controls & Waveform */}
        <div className="flex flex-col items-center gap-1 md:gap-2 flex-[2] md:w-2/4">
          <div className="flex items-center gap-4 md:gap-6">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hidden sm:flex">
              <Shuffle size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onPrevious}>
              <SkipBack size={20} className="md:w-6 md:h-6" />
            </Button>
            <Button 
              size="icon" 
              className="bg-white text-black hover:bg-zinc-200 rounded-full w-9 h-9 md:w-10 md:h-10"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause size={20} className="md:w-6 md:h-6" fill="currentColor" /> : <Play size={20} className="md:w-6 md:h-6 ml-0.5" fill="currentColor" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={onNext}>
              <SkipForward size={20} className="md:w-6 md:h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hidden sm:flex">
              <Repeat size={18} />
            </Button>
          </div>
          
          <div className="w-full flex items-center gap-2 md:gap-3">
            <span className="text-[10px] md:text-xs text-zinc-500 w-8 md:w-10 text-right">{formatTime(currentTime)}</span>
            <div ref={waveformRef} className="flex-1 min-w-[60px]" />
            <span className="text-[10px] md:text-xs text-zinc-500 w-8 md:w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Extra */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={toggleMute}>
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
          <div className="w-24">
            <Slider 
              value={[isMuted ? 0 : volume]} 
              max={1} 
              step={0.01} 
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
