"use client";

import LayoutWrapper from "@/components/LayoutWrapper";
import { motion } from "framer-motion";
import { Music, Heart, Clock, Plus, Play, MoreHorizontal } from "lucide-react";

const playlists = [
  {
    id: 1,
    name: "Liked Songs",
    description: "Your favorite tracks",
    tracks: 127,
    duration: "6h 23m",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    icon: Heart,
    gradient: "from-purple-600 to-blue-600"
  },
  {
    id: 2,
    name: "Recently Played",
    description: "Your recent listening history",
    tracks: 50,
    duration: "3h 12m",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
    icon: Clock,
    gradient: "from-green-600 to-teal-600"
  },
  {
    id: 3,
    name: "My Playlist #1",
    description: "Created by you",
    tracks: 34,
    duration: "2h 1m",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    icon: Music,
    gradient: "from-pink-600 to-red-600"
  },
  {
    id: 4,
    name: "Chill Vibes",
    description: "Relax and unwind",
    tracks: 67,
    duration: "4h 35m",
    cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop",
    icon: Music,
    gradient: "from-indigo-600 to-purple-600"
  },
  {
    id: 5,
    name: "Workout Mix",
    description: "High energy tracks",
    tracks: 45,
    duration: "3h 8m",
    cover: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=300&h=300&fit=crop",
    icon: Music,
    gradient: "from-orange-600 to-red-600"
  },
  {
    id: 6,
    name: "Late Night",
    description: "Perfect for nighttime",
    tracks: 23,
    duration: "1h 47m",
    cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=300&h=300&fit=crop",
    icon: Music,
    gradient: "from-blue-600 to-indigo-600"
  }
];

export default function LibraryPage() {
  return (
    <LayoutWrapper>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Your Library
          </h1>
          <p className="text-gray-400 text-lg">Your music collection and playlists</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create Playlist</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all border border-white/20"
          >
            <Heart className="w-5 h-5" />
            <span>Import from Spotify</span>
          </motion.button>
        </motion.div>

        {/* Playlists Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {playlists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              <div className="relative mb-4">
                {playlist.id <= 2 ? (
                  <div className={`w-full h-48 bg-gradient-to-br ${playlist.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <playlist.icon className="w-16 h-16 text-white" />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={playlist.cover}
                      alt={playlist.name}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                      >
                        <Play className="w-8 h-8 ml-1" />
                      </motion.button>
                    </motion.div>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-gray-400 text-sm mb-2">{playlist.description}</p>
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <span>{playlist.tracks} tracks</span>
                  <span>{playlist.duration}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recently Played Tracks */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recently Played</h2>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            {[
              { title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop" },
              { title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", duration: "2:54", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=50&h=50&fit=crop" },
              { title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:23", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop" },
              { title: "Good 4 U", artist: "Olivia Rodrigo", album: "SOUR", duration: "2:58", cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=50&h=50&fit=crop" },
              { title: "Stay", artist: "The Kid LAROI & Justin Bieber", album: "F*CK LOVE 3", duration: "2:21", cover: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=50&h=50&fit=crop" }
            ].map((track, index) => (
              <motion.div
                key={index}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ x: 10, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                className="flex items-center p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover mr-4"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                </div>
                <div className="hidden md:block text-gray-400 text-sm mr-4">
                  {track.album}
                </div>
                <div className="text-gray-400 text-sm">
                  {track.duration}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="ml-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Play className="w-4 h-4 ml-0.5" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </LayoutWrapper>
  );
}
