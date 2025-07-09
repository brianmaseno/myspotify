"use client";

import { useState } from "react";
import YouTubeAudioPlayer from "@/components/YouTubeAudioPlayer";

export default function YouTubeTest() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ"); // Default to a test video
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerState, setPlayerState] = useState(-1);

  const handleTimeUpdate = (time: number, totalDuration: number) => {
    setCurrentTime(time);
    setDuration(totalDuration);
  };

  const states: Record<number, string> = {
    "-1": "Unstarted",
    "0": "Ended",
    "1": "Playing",
    "2": "Paused",
    "3": "Buffering",
    "5": "Cued",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">YouTube Player Test</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex mb-4 gap-4">
          <button
            className={`px-4 py-2 rounded-md ${
              isPlaying ? "bg-red-500" : "bg-green-500"
            }`}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          
          <input
            type="text"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            className="flex-grow p-2 bg-gray-700 rounded text-white"
            placeholder="Enter YouTube Video ID"
          />
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="mb-2">
            <span className="text-gray-300">Player State: </span>
            <span className="font-mono bg-gray-900 px-2 py-1 rounded">
              {states[playerState] || "Unknown"} ({playerState})
            </span>
          </div>
          
          <div className="mb-2">
            <span className="text-gray-300">Current Time: </span>
            <span className="font-mono bg-gray-900 px-2 py-1 rounded">
              {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
            </span>
          </div>
          
          <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{
                width: `${(currentTime / duration) * 100 || 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="text-sm bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Current Video ID: {videoId}</li>
          <li>Playing: {isPlaying ? "Yes" : "No"}</li>
          <li>Time: {currentTime.toFixed(2)}s / {duration.toFixed(2)}s</li>
          <li>State: {states[playerState] || "Unknown"} ({playerState})</li>
        </ul>
      </div>

      <YouTubeAudioPlayer
        videoId={videoId}
        isPlaying={isPlaying}
        onReady={() => console.log("Player ready")}
        onStateChange={(state) => {
          console.log("State change:", state);
          setPlayerState(state);
        }}
        onError={(error) => console.error("Player error:", error)}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}
