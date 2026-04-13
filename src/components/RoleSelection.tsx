import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Users, Building2, Check } from 'lucide-react';
import { UserRole } from '../types';
import { motion } from 'motion/react';

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
}

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  const roles = [
    {
      id: 'fan' as UserRole,
      title: 'Fan',
      description: 'Discover new music, create playlists, and follow your favorite artists.',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      id: 'artist' as UserRole,
      title: 'Artist',
      description: 'Upload your tracks, manage your discography, and connect with fans.',
      icon: Music,
      color: 'bg-indigo-600',
    },
    {
      id: 'label' as UserRole,
      title: 'Label',
      description: 'Manage multiple artists, distribute music, and track performance.',
      icon: Building2,
      color: 'bg-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Grove Music</h1>
          <p className="text-zinc-400 text-lg">Choose your role to get started on the platform</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-zinc-900 border-zinc-800 hover:border-indigo-500 transition-all cursor-pointer group h-full flex flex-col" onClick={() => onSelect(role.id)}>
                <CardHeader>
                  <div className={`${role.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}>
                    <role.icon size={24} />
                  </div>
                  <CardTitle className="text-white text-2xl">{role.title}</CardTitle>
                  <CardDescription className="text-zinc-400 text-base leading-relaxed">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-6">
                  <Button className="w-full bg-zinc-800 hover:bg-indigo-600 text-white group-hover:bg-indigo-600 transition-colors">
                    Select {role.title}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
