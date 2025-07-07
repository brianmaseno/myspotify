import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: null,
  },
  preferences: {
    favoriteGenres: [String],
    preferredLanguage: {
      type: String,
      default: 'en',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const TrackSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: String,
  thumbnail: String,
  duration: String,
  source: {
    type: String,
    enum: ['youtube', 'spotify'],
    required: true,
  },
  audioUrl: String,
  videoUrl: String,
  preview_url: String,
  genre: String,
  youtubeId: String,
  spotifyId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PlayHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trackId: {
    type: String,
    required: true,
  },
  track: {
    type: TrackSchema,
    required: true,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
  playDuration: {
    type: Number, // in seconds
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const LikedSongSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trackId: {
    type: String,
    required: true,
  },
  track: {
    type: TrackSchema,
    required: true,
  },
  likedAt: {
    type: Date,
    default: Date.now,
  },
});

const PlaylistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  thumbnail: String,
  isPublic: {
    type: Boolean,
    default: false,
  },
  tracks: [TrackSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better performance
PlayHistorySchema.index({ userId: 1, playedAt: -1 });
LikedSongSchema.index({ userId: 1, likedAt: -1 });
TrackSchema.index({ genre: 1 });
PlaylistSchema.index({ userId: 1 });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Track = mongoose.models.Track || mongoose.model('Track', TrackSchema);
export const PlayHistory = mongoose.models.PlayHistory || mongoose.model('PlayHistory', PlayHistorySchema);
export const LikedSong = mongoose.models.LikedSong || mongoose.model('LikedSong', LikedSongSchema);
export const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema);
