import React, { useEffect, useRef } from 'react';
import { Song } from '../types';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VisualizerProps {
  song: Song | null;
  onClose: () => void;
}

export function Visualizer({ song, onClose }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !song) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: any[] = [];
    
    // Simple particle system for the "music video" feel
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, '#1e1b4b');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
        
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      // Draw central waveform (simulated for now, real one would use Web Audio API)
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      for (let i = 0; i < canvas.width; i++) {
        const amplitude = 50 * Math.sin(i * 0.02 + Date.now() * 0.005) * Math.sin(Date.now() * 0.002);
        ctx.lineTo(i, canvas.height / 2 + amplitude);
      }
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [song]);

  if (!song) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-8 right-8 text-white hover:bg-white/10 z-10"
        onClick={onClose}
      >
        <X size={32} />
      </Button>

      <div className="z-10 text-center pointer-events-none">
        <motion.img 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          src={song.coverArtUrl} 
          alt={song.title} 
          className="w-64 h-64 rounded-2xl shadow-2xl mb-8 mx-auto object-cover border-4 border-white/10"
          referrerPolicy="no-referrer"
        />
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl font-bold text-white mb-2 tracking-tight"
        >
          {song.title}
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl text-zinc-400"
        >
          {song.artistName}
        </motion.p>
      </div>
    </motion.div>
  );
}
