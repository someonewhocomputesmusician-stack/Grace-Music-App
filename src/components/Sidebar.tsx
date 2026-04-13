import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, Music2, Disc, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const { profile } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
  ];

  const artistItems = [
    { id: 'my-songs', label: 'My Songs', icon: Music2 },
    { id: 'analytics', label: 'Analytics', icon: Disc },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -256,
          width: isOpen ? 256 : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        className={cn(
          "fixed lg:relative h-full bg-black flex flex-col border-r border-zinc-800 z-50 overflow-hidden",
          !isOpen && "border-none"
        )}
      >
        <div className="p-6 w-64">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-indigo-500">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">G</div>
              <span className="text-xl font-bold text-white tracking-tight">Grove Music</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-zinc-400 hover:text-white"
              onClick={onClose}
            >
              <X size={20} />
            </Button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 group",
                  activeTab === item.id 
                    ? "bg-zinc-900 text-white" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                )}
              >
                <item.icon size={22} className={cn(
                  "transition-colors",
                  activeTab === item.id ? "text-indigo-500" : "group-hover:text-white"
                )} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-4 mb-4">Your Collection</p>
            <nav className="space-y-2">
              <button className="flex items-center gap-4 w-full px-4 py-3 text-zinc-400 hover:text-white transition-colors group">
                <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center group-hover:bg-zinc-700">
                  <PlusSquare size={16} />
                </div>
                <span className="font-medium">Create Playlist</span>
              </button>
              <button className="flex items-center gap-4 w-full px-4 py-3 text-zinc-400 hover:text-white transition-colors group">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-700 to-purple-700 rounded flex items-center justify-center">
                  <Heart size={14} fill="white" className="text-white" />
                </div>
                <span className="font-medium">Liked Songs</span>
              </button>
            </nav>
          </div>

          {(profile?.role === 'artist' || profile?.role === 'label') && (
            <div className="mt-8">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-4 mb-4">Artist Tools</p>
              <nav className="space-y-2">
                {artistItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={cn(
                      "flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 group",
                      activeTab === item.id 
                        ? "bg-zinc-900 text-white" 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                    )}
                  >
                    <item.icon size={22} className={cn(
                      "transition-colors",
                      activeTab === item.id ? "text-indigo-500" : "group-hover:text-white"
                    )} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
