export type UserRole = 'artist' | 'fan' | 'label' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  bio?: string;
  createdAt: string;
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  album?: string;
  genre: string;
  duration: number;
  audioUrl: string;
  coverArtUrl: string;
  createdAt: string;
  reportCount: number;
  isRemoved: boolean;
  labelId?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  songIds: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  songId: string;
  reporterId: string;
  reason: string;
  createdAt: string;
}
