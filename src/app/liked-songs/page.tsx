"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { motion } from "framer-motion";
import { Heart, Play, MoreHorizontal, Music, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface LikedSong {
  _id: string;
  track: {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration: string;
    source: 'youtube' | 'spotify';
    audioUrl?: string;
    videoUrl?: string;
    youtubeId?: string;
  };
  likedAt: string;
}

export default function LikedSongsPage() {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack, setQueue } = useAudioPlayer();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchLikedSongs();
    }
  }, [session]);

  const fetchLikedSongs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/liked-songs');
      
      if (!response.ok) {
        throw new Error('Failed to fetch liked songs');
      }
      
      const data = await response.json();
      setLikedSongs(data.likedSongs || []);
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      setError('Failed to load liked songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackPlay = (likedSong: LikedSong) => {
    const track = {
      ...likedSong.track,
      youtubeId: likedSong.track.youtubeId || likedSong.track.id,
    };
    playTrack(track);
  };

  const handlePlayAll = () => {
    if (likedSongs.length === 0) return;
    
    const tracks = likedSongs.map(likedSong => ({
      ...likedSong.track,
      youtubeId: likedSong.track.youtubeId || likedSong.track.id,
    }));
    
    setQueue(tracks);
    playTrack(tracks[0]);
  };

  const handleUnlike = async (trackId: string) => {
    try {
      const response = await fetch(`/api/user/liked-songs?trackId=${trackId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setLikedSongs(prev => prev.filter(song => song.track.id !== trackId));
      }
    } catch (error) {
      console.error('Error unliking song:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!session) {
    return (
      <LayoutWrapper>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-96">
            <Heart className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-gray-400 text-center">
              Please sign in to view your liked songs.
            </p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="p-4 lg:p-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-6">
            <div className="w-32 h-32 lg:w-48 lg:h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Heart className="w-16 h-16 lg:w-24 lg:h-24 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-2">Playlist</p>
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">Liked Songs</h1>
              <p className="text-gray-400 mb-4">
                {likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}
              </p>
              
              {likedSongs.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Play All
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center p-4 bg-white/5 rounded-xl animate-pulse">
                <div className="w-4 h-4 bg-gray-600 rounded mr-4"></div>
                <div className="w-12 h-12 bg-gray-600 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-32"></div>
                </div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-96">
            <Heart className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Liked Songs</h2>
            <p className="text-gray-400 text-center mb-4">{error}</p>
            <button
              onClick={fetchLikedSongs}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : likedSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-96">
            <Music className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Liked Songs Yet</h2>
            <p className="text-gray-400 text-center">
              Songs you like will appear here. Start exploring music to build your collection!
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-gray-400 text-sm border-b border-white/10 mb-2">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Date Added</div>
              <div className="col-span-1"></div>
            </div>

            {/* Songs List */}
            <div className="space-y-2">
              {likedSongs.map((likedSong, index) => (
                <motion.div
                  key={likedSong._id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * index, duration: 0.6 }}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-white/5 lg:bg-transparent backdrop-blur-sm rounded-xl lg:rounded-none border border-white/10 lg:border-none hover:border-white/20 lg:hover:border-none transition-all duration-300 cursor-pointer group lg:hover:bg-white/5"
                  onClick={() => handleTrackPlay(likedSong)}
                >
                  {/* Mobile Layout */}
                  <div className="lg:hidden flex items-center space-x-4">
                    <div className="relative w-12 h-12">
                      <Image
                        src={likedSong.track.thumbnail || '/placeholder-music.jpg'}
                        alt={likedSong.track.title}
                        fill
                        className="rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-music.jpg';
                        }}
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Play className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                        {likedSong.track.title}
                      </h4>
                      <p className="text-gray-400 text-sm truncate">{likedSong.track.artist}</p>
                      <p className="text-gray-500 text-xs">{formatDate(likedSong.likedAt)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">{likedSong.track.duration}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlike(likedSong.track.id);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/20 transition-all"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:contents">
                    {/* Index */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-gray-400 group-hover:hidden">{index + 1}</span>
                      <Play className="w-4 h-4 text-white hidden group-hover:block" />
                    </div>

                    {/* Title & Artist */}
                    <div className="col-span-6 flex items-center space-x-4">
                      <div className="relative w-12 h-12">
                        <Image
                          src={likedSong.track.thumbnail || '/placeholder-music.jpg'}
                          alt={likedSong.track.title}
                          fill
                          className="rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-music.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                          {likedSong.track.title}
                        </h4>
                        <p className="text-gray-400 text-sm truncate">{likedSong.track.artist}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-400 text-sm">{likedSong.track.duration}</span>
                    </div>

                    {/* Date Added */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-400 text-sm">{formatDate(likedSong.likedAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlike(likedSong.track.id);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/20 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </LayoutWrapper>
  );
}
