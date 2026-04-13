import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Sidebar } from './components/Sidebar';
import { MusicPlayer } from './components/MusicPlayer';
import { UploadModal } from './components/UploadModal';
import { RoleSelection } from './components/RoleSelection';
import { SongCard } from './components/SongCard';
import { signInWithGoogle, logout, db } from './lib/firebase';
import { collection, query, orderBy, onSnapshot, limit, where, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Song } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, LogOut, User as UserIcon, Bell, Play, Pause, Disc, Music2, Menu } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from './lib/error-handler';

import { Visualizer } from './components/Visualizer';

function GroveApp() {
  const { user, profile, loading, setRole, isAuthReady } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthReady || !user) {
      setSongs([]);
      return;
    }

    const q = query(
      collection(db, 'songs'), 
      where('isRemoved', '==', false),
      orderBy('createdAt', 'desc'), 
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const songsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
      setSongs(songsData);
    }, (error) => {
      // If index is missing, fallback to non-ordered query or handle gracefully
      if (error.message.includes('index')) {
        console.warn('Composite index missing for isRemoved and createdAt. Falling back to basic query.');
        const fallbackQ = query(collection(db, 'songs'), limit(50));
        onSnapshot(fallbackQ, (fallbackSnap) => {
          const fallbackData = fallbackSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Song))
            .filter(s => !s.isRemoved)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setSongs(fallbackData);
        });
      } else {
        handleFirestoreError(error, OperationType.LIST, 'songs');
      }
    });
    return unsubscribe;
  }, [user, isAuthReady]);

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-8 shadow-2xl shadow-indigo-500/20">G</div>
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tighter">Grove Music</h1>
          <p className="text-zinc-400 text-xl mb-12 max-w-md mx-auto leading-relaxed">
            The premium destination for artists, fans, and labels to experience music in its purest form.
          </p>
          <Button 
            onClick={signInWithGoogle} 
            size="lg"
            className="bg-white text-black hover:bg-zinc-200 px-12 py-6 text-lg font-bold rounded-full transition-all hover:scale-105 active:scale-95"
          >
            Get Started with Google
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return <RoleSelection onSelect={setRole} />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Nav */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-black/50 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-zinc-400 hover:text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </Button>
            <div className="relative group flex-1">
              <SearchIcon className="absolute left-3 top-2.5 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <Input 
                placeholder="Search for songs, artists, or videos..." 
                className="bg-zinc-900 border-zinc-800 focus:border-indigo-500 pl-10 h-10 w-full rounded-full transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-8">
            <UploadModal />
            <Button 
              variant="outline" 
              className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
              onClick={() => setShowVisualizer(true)}
              disabled={!currentSong}
            >
              Visualizer
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <Bell size={20} />
            </Button>
            <div className="flex items-center gap-3 bg-zinc-900 pl-1 pr-3 py-1 rounded-full border border-zinc-800">
              <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-zinc-700" />
              <span className="text-sm font-medium hidden md:block">{profile.displayName}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-red-400" onClick={logout}>
                <LogOut size={14} />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 pb-32 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6 tracking-tight">Discover New Music</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Featured Card */}
                    <div className="col-span-1 md:col-span-2 relative h-64 rounded-2xl overflow-hidden group cursor-pointer">
                      <img 
                        src="https://picsum.photos/seed/music/1200/600" 
                        alt="Featured" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6">
                        <span className="bg-indigo-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2 inline-block">Featured</span>
                        <h3 className="text-4xl font-bold mb-2">Midnight Echoes</h3>
                        <p className="text-zinc-300">The latest album from Grove Records</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 border border-white/5 flex flex-col justify-between">
                      <div>
                        <Disc className="text-indigo-400 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">Artist Spotlight</h3>
                        <p className="text-zinc-400 text-sm">Check out the rising stars of the month based on your listening habits.</p>
                      </div>
                      <Button className="w-full bg-white text-black hover:bg-zinc-200 mt-4 rounded-full font-bold">Explore Now</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Play size={20} className="text-indigo-500" fill="currentColor" />
                      Recently Added
                    </h3>
                    <div className="space-y-1">
                      {filteredSongs.map((song) => (
                        <div key={song.id}>
                          <SongCard 
                            song={song} 
                            onPlay={setCurrentSong} 
                            isCurrent={currentSong?.id === song.id}
                          />
                        </div>
                      ))}
                      {filteredSongs.length === 0 && (
                        <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                          <Music2 className="mx-auto text-zinc-700 mb-4" size={48} />
                          <p className="text-zinc-500">No songs found. Start by uploading some music!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-6">Trending Genres</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['Lo-Fi', 'Electronic', 'Jazz', 'Indie'].map((genre, i) => (
                        <div key={genre} className={`h-24 rounded-xl p-4 flex items-end cursor-pointer hover:scale-[1.02] transition-transform ${
                          i === 0 ? 'bg-orange-600' : i === 1 ? 'bg-indigo-600' : i === 2 ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}>
                          <span className="font-bold text-lg">{genre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <MusicPlayer currentSong={currentSong} onNext={() => {}} onPrevious={() => {}} />
      </main>

      <AnimatePresence>
        {showVisualizer && currentSong && (
          <Visualizer song={currentSong} onClose={() => setShowVisualizer(false)} />
        )}
      </AnimatePresence>

      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GroveApp />
    </AuthProvider>
  );
}
