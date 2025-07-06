"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface VideoPlayerProps {
  video: {
    id: string;
    title: string;
    artist: string;
    source: 'youtube' | 'spotify';
  };
  onClose?: () => void;
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  // For YouTube videos, we'll use an iframe embed
  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1`;
  };

  // Handle ESC key to close player
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-black rounded-2xl overflow-hidden shadow-2xl max-w-6xl w-full max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white truncate">{video.title}</h2>
              <p className="text-gray-300 truncate">{video.artist}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors ml-4"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          {video.source === 'youtube' ? (
            <iframe
              src={getYouTubeEmbedUrl(video.id)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-purple-900/50 to-blue-900/50">
              <div className="text-center">
                <p className="text-lg mb-2">Video player not available</p>
                <p className="text-gray-400">This source is not supported for video playback</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">
                Playing from {video.source === 'youtube' ? 'YouTube' : 'Spotify'}
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              Press ESC to close
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
