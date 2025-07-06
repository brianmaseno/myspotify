"use client";

import { motion } from "framer-motion";
import { Home, Search, Library, TrendingUp, Music, Video, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { icon: Home, label: "Home", href: "/", active: true },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Library, label: "Your Library", href: "/library" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: Music, label: "Music", href: "/music" },
  { icon: Video, label: "Videos", href: "/videos" },
];

const bottomNavItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col h-full"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <Link href="/" className="block">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            StellarSound
          </h1>
          <p className="text-sm text-gray-400">Beyond Music</p>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.label}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
            >
              <Link
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                  isActive ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30" : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Recently Played */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mb-6"
      >
        <h3 className="text-lg font-semibold mb-4">Recently Played</h3>
        <div className="space-y-3">
          {["The Weeknd", "Ariana Grande", "Billie Eilish"].map((artist, index) => (
            <motion.div
              key={artist}
              whileHover={{ scale: 1.05, x: 10 }}
              className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-white/5"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg"></div>
              <div>
                <p className="text-sm font-medium">{artist}</p>
                <p className="text-xs text-gray-400">Artist</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <div className="space-y-2 border-t border-white/10 pt-4">
        {bottomNavItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.label}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
            >
              <Link
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                  isActive ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30" : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
