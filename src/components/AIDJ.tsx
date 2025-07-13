"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Play, Volume2, X, VolumeX } from 'lucide-react';
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
  const [userStats, setUserStats] = useState<{ totalPlayed: number; totalLiked: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { setAIDJ, setQueue, playTrack } = useAudioPlayer();
  const { data: session } = useSession();

  // Cleanup speech synthesis when component unmounts or closes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsTyping(false);
    }
  }, [isOpen]);

  const speakText = async (text: string) => {
    if (!speechEnabled || !text) return;

    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    return new Promise<void>((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings for a more DJ-like experience
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.7;

      // Try to find a suitable voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Microsoft David') || 
        voice.name.includes('Google US English') ||
        voice.lang.startsWith('en')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const typeText = async (text: string, speed: number = 50) => {
    setIsTyping(true);
    setTypingText('');
    
    for (let i = 0; i <= text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, speed));
      setTypingText(text.slice(0, i));
    }
    
    setIsTyping(false);
  };

  const startAIDJ = async () => {
    if (!session) {
      const message = "Hey there! Sign in to get personalized recommendations from DJ X!";
      setDjMessage(message);
      
      if (speechEnabled) {
        await speakText(message);
      } else {
        await typeText(message);
      }
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
        setRecommendations(data.recommendations || []);
        setUserStats(data.userStats);
        setAIDJ(true);
        
        // Either speak or type the DJ message
        if (speechEnabled) {
          setDjMessage(data.djMessage);
          await speakText(data.djMessage);
        } else {
          await typeText(data.djMessage);
          setDjMessage(data.djMessage);
        }
        
        // Auto-load recommended tracks
        if (data.recommendations && data.recommendations.length > 0) {
          await loadRecommendedTracks(data.recommendations);
        }
      } else {
        const fallbackMessage = "Oops! DJ X is having some technical difficulties. Try again in a moment!";
        if (speechEnabled) {
          setDjMessage(fallbackMessage);
          await speakText(fallbackMessage);
        } else {
          await typeText(fallbackMessage);
          setDjMessage(fallbackMessage);
        }
      }
    } catch (error) {
      console.error('AI DJ error:', error);
      const errorMessage = "Hey! I'm DJ X, and I'm excited to play some music for you!";
      if (speechEnabled) {
        setDjMessage(errorMessage);
        await speakText(errorMessage);
      } else {
        await typeText(errorMessage);
        setDjMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendedTracks = async (searchQueries: string[]) => {
    const tracks: {
      id: string;
      title: string;
      artist: string;
      thumbnail: string;
      duration: string;
      source: 'youtube';
      audioUrl: string;
      videoUrl: string;
      youtubeId: string;
    }[] = [];
    
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
    setTypingText('');
    setRecommendations([]);
    setUserStats(null);
    setIsSpeaking(false);
    setIsTyping(false);
    
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled);
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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
            className={`bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-indigo-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl relative ${
              isTyping ? 'overflow-hidden' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxHeight: '90vh',
              overflowY: isTyping ? 'hidden' : 'auto'
            }}
          >
            {/* Scroll Lock Overlay when typing */}
            {isTyping && (
              <div className="absolute inset-0 z-10 bg-transparent" />
            )}
            
            <div className="text-center">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Speech Toggle */}
              <button
                onClick={toggleSpeech}
                className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors z-20"
                title={speechEnabled ? "Disable voice" : "Enable voice"}
              >
                {speechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* DJ Avatar */}
              <motion.div
                animate={{ 
                  rotate: (isPlaying || isSpeaking) ? 360 : 0,
                  scale: (isPlaying || isSpeaking) ? [1, 1.05, 1] : 1,
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: (isPlaying || isSpeaking) ? Infinity : 0, ease: "linear" },
                  scale: { duration: 1.5, repeat: (isPlaying || isSpeaking) ? Infinity : 0 }
                }}
                className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center relative ${
                  (isPlaying || isSpeaking) ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/50' : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}
              >
                {/* Spotify-like circular design */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  (isPlaying || isSpeaking) ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  <Bot className="w-8 h-8 text-white" />
                </div>
                
                {/* Pulsing ring effect when active */}
                {(isPlaying || isSpeaking) && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400/60 animate-ping"></div>
                    <div className="absolute inset-0 rounded-full border border-blue-300/40 animate-pulse"></div>
                  </>
                )}
                
                {/* Speaking indicator dots */}
                {isSpeaking && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-0.5">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 bg-blue-400 rounded-full"
                          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                          transition={{ 
                            duration: 0.8, 
                            repeat: Infinity, 
                            delay: i * 0.15 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* DJ Name */}
              <h2 className="text-2xl font-bold text-white mb-1">DJ X</h2>
              <p className="text-blue-300 mb-4 text-sm">Your AI Music Companion</p>

              {/* Status Indicator */}
              {(isSpeaking || isTyping) && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">
                    {isSpeaking ? 'Speaking...' : 'Typing...'}
                  </span>
                </div>
              )}

              {/* DJ Message */}
              {(djMessage || typingText) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur rounded-xl p-3 mb-4 border border-white/20 min-h-[60px] flex items-center"
                >
                  <p className="text-white text-xs leading-relaxed">
                    {speechEnabled ? djMessage : (typingText || djMessage)}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </p>
                </motion.div>
              )}

              {/* User Stats */}
              {userStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 gap-3 mb-4"
                >
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-lg font-bold text-blue-300">{userStats.totalPlayed}</div>
                    <div className="text-xs text-gray-300">Played</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <div className="text-lg font-bold text-blue-300">{userStats.totalLiked}</div>
                    <div className="text-xs text-gray-300">Liked</div>
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
                    disabled={isLoading || isSpeaking || isTyping}
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

                {!session && !isLoading && (
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
                  <div className="space-y-1 max-h-20 overflow-y-auto">
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
