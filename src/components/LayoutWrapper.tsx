"use client";

import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { Search, Heart } from "lucide-react";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Background Animated Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 animate-pulse" />
      
      {/* Floating Orbs Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="p-6 bg-black/20 backdrop-blur-xl border-b border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for songs, artists, albums..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full focus:border-purple-400 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
              </div>
            </div>
          </motion.header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
