import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Music, Image as ImageIcon, Loader2 } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';

interface UploadModalProps {
  compact?: boolean;
}

export function UploadModal({ compact }: UploadModalProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    album: '',
    genre: '',
    audioUrl: '',
    coverArtUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !profile) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'songs'), {
        ...formData,
        artistId: auth.currentUser.uid,
        artistName: profile.displayName,
        createdAt: new Date().toISOString(),
        reportCount: 0,
        isRemoved: false,
        duration: 0, // In a real app, we'd calculate this from the audio file
      });
      toast.success('Song uploaded successfully!');
      setIsOpen(false);
      setFormData({ title: '', album: '', genre: '', audioUrl: '', coverArtUrl: '' });
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload song');
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role === 'fan') return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-12 h-12 shadow-lg shadow-indigo-500/40">
            <Upload size={24} />
          </Button>
        ) : (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Upload size={18} />
            Upload Music
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[425px] bg-zinc-900 text-white border-zinc-800 p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Music className="text-indigo-500" />
            Upload New Track
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Song Title</Label>
            <Input 
              id="title" 
              required 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-zinc-800 border-zinc-700 focus:ring-indigo-500"
              placeholder="Enter song title"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="album">Album (Optional)</Label>
              <Input 
                id="album" 
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                className="bg-zinc-800 border-zinc-700 focus:ring-indigo-500"
                placeholder="Album name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input 
                id="genre" 
                required
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="bg-zinc-800 border-zinc-700 focus:ring-indigo-500"
                placeholder="e.g. Pop, Rock"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio URL (Direct link to .mp3)</Label>
            <div className="relative">
              <Input 
                id="audioUrl" 
                required
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                className="bg-zinc-800 border-zinc-700 focus:ring-indigo-500 pl-10"
                placeholder="https://example.com/song.mp3"
              />
              <Music className="absolute left-3 top-2.5 text-zinc-500" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverArtUrl">Cover Art URL</Label>
            <div className="relative">
              <Input 
                id="coverArtUrl" 
                required
                value={formData.coverArtUrl}
                onChange={(e) => setFormData({ ...formData, coverArtUrl: e.target.value })}
                className="bg-zinc-800 border-zinc-700 focus:ring-indigo-500 pl-10"
                placeholder="https://example.com/cover.jpg"
              />
              <ImageIcon className="absolute left-3 top-2.5 text-zinc-500" size={18} />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg font-semibold"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
            Publish Track
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
