import React from 'react';
import { MoreVertical, Play, Radio, Share2, Flag, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Song } from '../types';
import { useAuth } from './AuthProvider';
import { db } from '../lib/firebase';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { toast } from 'sonner';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  isCurrent?: boolean;
}

export function SongCard({ song, onPlay, isCurrent }: SongCardProps) {
  const { profile, user } = useAuth();

  const handleReport = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'reports'), {
        songId: song.id,
        reporterId: user.uid,
        reason: 'Reported by user',
        createdAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'songs', song.id), {
        reportCount: (song.reportCount || 0) + 1
      });
      toast.success('Song reported. Thank you for keeping Grove safe.');
    } catch (error) {
      toast.error('Failed to report song');
    }
  };

  const handleRemove = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'songs', song.id));
      toast.success('Song removed successfully');
    } catch (error) {
      toast.error('Failed to remove song');
    }
  };

  const canManage = profile?.role === 'admin' || song.artistId === user?.uid;

  return (
    <div className={`group flex items-center gap-4 p-2 rounded-lg transition-all hover:bg-zinc-900/50 ${isCurrent ? 'bg-zinc-900' : ''}`}>
      <div className="relative w-12 h-12 flex-shrink-0">
        <img 
          src={song.coverArtUrl} 
          alt={song.title} 
          className="w-full h-full rounded object-cover"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={() => onPlay(song)}
          className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isCurrent ? 'opacity-100' : ''}`}
        >
          <Play size={20} fill="white" className="text-white" />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`font-medium truncate ${isCurrent ? 'text-indigo-400' : 'text-white'}`}>{song.title}</h4>
        <p className="text-zinc-500 text-sm truncate">{song.artistName}</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-zinc-500 text-sm hidden md:inline">3:45</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-300">
            <DropdownMenuItem onClick={() => onPlay(song)} className="gap-2 focus:bg-indigo-600 focus:text-white">
              <Play size={16} /> Play Song
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 focus:bg-indigo-600 focus:text-white">
              <Radio size={16} /> Start Radio
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 focus:bg-indigo-600 focus:text-white">
              <Plus size={16} /> Add to Playlist
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="gap-2 focus:bg-indigo-600 focus:text-white">
              <Share2 size={16} /> Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReport} className="gap-2 text-yellow-500 focus:bg-yellow-600 focus:text-white">
              <Flag size={16} /> Report Song
            </DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={handleRemove} className="gap-2 text-red-500 focus:bg-red-600 focus:text-white">
                  <Trash2 size={16} /> Remove from Platform
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
