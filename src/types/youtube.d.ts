interface YoutubePlayer {
  destroy: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
}

// Extend Window interface to include YouTube player
interface Window {
  YT: {
    Player: new (elementId: string, options: {
      height: string;
      width: string;
      videoId: string;
      playerVars: Record<string, unknown>;
      events: {
        onReady: (event: { target: YoutubePlayer }) => void;
        onStateChange: (event: { data: number; target: YoutubePlayer }) => void;
        onError: (event: { data: number }) => void;
      };
    }) => YoutubePlayer;
    PlayerState: {
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  };
  youtubePlayerInstance: YoutubePlayer | null;
  youtubePlayerSeekTo: ((time: number) => void) | undefined;
  youtubePlayerDirectPlay: (() => Promise<void>) | undefined;
  onYouTubeIframeAPIReady?: () => void;
}
