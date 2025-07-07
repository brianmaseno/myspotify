"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Play, Volume2, Sparkles, X } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useSession } from 'next-auth/react';

interface AIDJProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIDJ({ isOpen, onClose }: AIDJProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [djMessage, setDjMessage] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { setAIDJ, setQueue, playTrack } = useAudioPlayer();
  const { data: session } = useSession();

  const startAIDJ = async () => {
    if (!session) {
      setDjMessage("Hey there! Sign in to get personalized recommendations from DJ X!");
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);
    
    try {
      const response = await fetch('/api/ai/dj', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setDjMessage(data.djMessage);
        setRecommendations(data.recommendations || []);
        setUserStats(data.userStats);
        setAIDJ(true);
        
        // Simulate DJ talking with text-to-speech effect
        await simulateDJVoice(data.djMessage);
        
        // Auto-load recommended tracks
        if (data.recommendations && data.recommendations.length > 0) {
          await loadRecommendedTracks(data.recommendations);
        }
      } else {
        setDjMessage("Oops! DJ X is having some technical difficulties. Try again in a moment!");
      }
    } catch (error) {
      console.error('AI DJ error:', error);
      setDjMessage("Hey! I'm DJ X, and I'm excited to play some music for you!");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateDJVoice = async (message: string) => {
    // Simulate text-to-speech by revealing text word by word
    const words = message.split(' ');
    setDjMessage('');
    
    for (let i = 0; i <= words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setDjMessage(words.slice(0, i).join(' '));
    }
  };

  const loadRecommendedTracks = async (searchQueries: string[]) => {
    const tracks: any[] = [];
    
    for (const query of searchQueries) {
      try {
        const response = await fetch(`/api/search/youtube?q=${encodeURIComponent(query)}&maxResults=1`);
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const track = data.results[0];
            tracks.push({
              id: track.id,
              title: track.title,
              artist: track.artist,
              thumbnail: track.thumbnail,
              duration: track.duration,
              source: 'youtube' as const,
              audioUrl: track.audioUrl,
              videoUrl: track.videoUrl,
              youtubeId: track.youtubeId,
            });
          }
        }
      } catch (error) {
        console.error('Error loading track for query:', query, error);
      }
    }
    
    if (tracks.length > 0) {
      setQueue(tracks);
      // Start playing the first track after a short delay
      setTimeout(() => {
        playTrack(tracks[0]);
      }, 2000);
    }
  };

  const stopAIDJ = () => {
    setIsPlaying(false);
    setAIDJ(false);
    setDjMessage('');
    setRecommendations([]);
    setUserStats(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* DJ Avatar */}
              <motion.div
                animate={{ 
                  rotate: isPlaying ? 360 : 0,
                  scale: isPlaying ? [1, 1.1, 1] : 1,
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" },
                  scale: { duration: 2, repeat: isPlaying ? Infinity : 0 }
                }}
                className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center relative ${
                  isPlaying ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}
              >
                <Bot className="w-12 h-12 text-white" />
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
                )}
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
              </motion.div>

              {/* DJ Name */}
              <h2 className="text-3xl font-bold text-white mb-2">DJ X</h2>
              <p className="text-blue-300 mb-6">Your AI Music Companion</p>

              {/* DJ Message */}
              {djMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-6 border border-white/20"
                >
                  <p className="text-white text-sm leading-relaxed">{djMessage}</p>
                </motion.div>
              )}

              {/* User Stats */}
              {userStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-2xl font-bold text-purple-300">{userStats.totalPlayed}</div>
                    <div className="text-xs text-gray-300">Songs Played</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-2xl font-bold text-pink-300">{userStats.totalLiked}</div>
                    <div className="text-xs text-gray-300">Liked Songs</div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isPlaying ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startAIDJ}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        DJ X is getting ready...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start DJ X Session
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopAIDJ}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-5 h-5" />
                    Stop DJ Session
                  </motion.button>
                )}

                {!session && (
                  <p className="text-sm text-gray-400 mt-3">
                    Sign in for personalized recommendations
                  </p>
                )}
              </div>

              {/* Recommendations Preview */}
              {recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 pt-6 border-t border-white/20"
                >
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Playing Next:</h3>
                  <div className="space-y-1">
                    {recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="text-xs text-gray-400 truncate">
                        {index + 1}. {rec}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
