"use client";

import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart } from "lucide-react";
import { useState } from "react";
import LayoutWrapper from "../components/LayoutWrapper";

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack] = useState({
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:23",
    progress: 45,
  });

  return (
    <LayoutWrapper>
      <div className="p-6">
        {/* Hero Section */}
        <motion.section
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative h-80 bg-gradient-to-r from-purple-600/40 to-pink-600/40 rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="relative z-10 h-full flex items-end p-8">
              <div>
                <motion.h2
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-5xl font-bold mb-4"
                >
                  Discover Your Sound
                </motion.h2>
                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-xl text-gray-200 mb-6"
                >
                  Experience music and videos like never before
                </motion.p>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-purple-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300"
                >
                  Start Listening
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Featured Playlists */}
        <motion.section
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold mb-6">Featured Playlists</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Today's Top Hits", subtitle: "The biggest songs right now", color: "from-green-400 to-blue-500" },
              { title: "Chill Vibes", subtitle: "Relax and unwind", color: "from-purple-400 to-pink-500" },
              { title: "Workout Mix", subtitle: "High energy tracks", color: "from-orange-400 to-red-500" },
              { title: "Indie Favorites", subtitle: "Underground gems", color: "from-yellow-400 to-orange-500" },
            ].map((playlist, index) => (
              <motion.div
                key={playlist.title}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 cursor-pointer group"
              >
                <div className={`w-full h-32 bg-gradient-to-br ${playlist.color} rounded-xl mb-4 relative overflow-hidden`}>
                  <motion.div
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <Play className="w-12 h-12 text-white" />
                  </motion.div>
                </div>
                <h4 className="font-semibold text-lg mb-2">{playlist.title}</h4>
                <p className="text-gray-400 text-sm">{playlist.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Trending Now */}
        <motion.section
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold mb-6">Trending Now</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Anti-Hero", artist: "Taylor Swift", plays: "2.1M", image: "bg-gradient-to-br from-purple-500 to-pink-500" },
              { title: "As It Was", artist: "Harry Styles", plays: "1.8M", image: "bg-gradient-to-br from-blue-500 to-cyan-500" },
              { title: "Heat Waves", artist: "Glass Animals", plays: "1.5M", image: "bg-gradient-to-br from-orange-500 to-red-500" },
              { title: "Stay", artist: "The Kid LAROI & Justin Bieber", plays: "1.3M", image: "bg-gradient-to-br from-green-500 to-emerald-500" },
              { title: "Bad Habit", artist: "Steve Lacy", plays: "1.1M", image: "bg-gradient-to-br from-yellow-500 to-orange-500" },
              { title: "Unholy", artist: "Sam Smith ft. Kim Petras", plays: "980K", image: "bg-gradient-to-br from-indigo-500 to-purple-500" },
            ].map((track, index) => (
              <motion.div
                key={track.title}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 ${track.image} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{track.title}</h4>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">{track.plays} plays</p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center mt-1"
                  >
                    <Play className="w-3 h-3 text-white ml-0.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Music Player */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/20 p-4"
      >
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Track Info */}
          <div className="flex items-center space-x-4 flex-1">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 10, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
              className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl"
            ></motion.div>
            <div>
              <h4 className="font-semibold">{currentTrack.title}</h4>
              <p className="text-gray-400 text-sm">{currentTrack.artist}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Heart className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="flex items-center space-x-2 w-full max-w-md">
              <span className="text-xs text-gray-400">1:23</span>
              <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${currentTrack.progress}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
              <span className="text-xs text-gray-400">{currentTrack.duration}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div className="w-24 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </LayoutWrapper>
  );
}
