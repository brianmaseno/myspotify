"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { motion } from "framer-motion";
import { Clock, Play, MoreHorizontal, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface HistoryTrack {
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
  playedAt: string;
  playDuration: number;
  completed: boolean;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack } = useAudioPlayer();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetchHistory();
    }
  }, [session]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/history');
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load play history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackPlay = (historyTrack: HistoryTrack) => {
    const track = {
      ...historyTrack.track,
      youtubeId: historyTrack.track.youtubeId || historyTrack.track.id,
    };
    playTrack(track);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatPlayDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <LayoutWrapper>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center min-h-96">
            <Clock className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
            <p className="text-gray-400 text-center">
              Please sign in to view your play history.
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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Play History</h1>
              <p className="text-gray-400">Recently played tracks</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center p-4 bg-white/5 rounded-xl animate-pulse">
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
            <Clock className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading History</h2>
            <p className="text-gray-400 text-center mb-4">{error}</p>
            <button
              onClick={fetchHistory}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-96">
            <Clock className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No History Yet</h2>
            <p className="text-gray-400 text-center">
              Start listening to music to see your play history here.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-2"
          >
            {history.map((historyTrack, index) => (
              <motion.div
                key={historyTrack._id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index, duration: 0.6 }}
                whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                className="flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                onClick={() => handleTrackPlay(historyTrack)}
              >
                {/* Track Number & Play Button */}
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={historyTrack.track.thumbnail || '/placeholder-music.jpg'}
                    alt={historyTrack.track.title}
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

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                    {historyTrack.track.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">{historyTrack.track.artist}</p>
                </div>

                {/* Play Duration */}
                <div className="hidden sm:block text-gray-400 text-sm mr-4">
                  {formatPlayDuration(historyTrack.playDuration)} / {historyTrack.track.duration}
                </div>

                {/* Completion Status */}
                <div className="hidden md:block mr-4">
                  {historyTrack.completed ? (
                    <span className="text-green-400 text-xs bg-green-400/20 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  ) : (
                    <span className="text-yellow-400 text-xs bg-yellow-400/20 px-2 py-1 rounded-full">
                      Partial
                    </span>
                  )}
                </div>

                {/* Time Played */}
                <div className="flex items-center text-gray-400 text-sm min-w-0">
                  <Calendar className="w-4 h-4 mr-1 hidden sm:block" />
                  <span className="truncate">{formatDate(historyTrack.playedAt)}</span>
                </div>

                {/* More Options */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="ml-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add more options functionality here
                  }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </LayoutWrapper>
  );
}
