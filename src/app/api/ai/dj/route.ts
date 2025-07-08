import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { PlayHistory, LikedSong } from '@/lib/models';
import { AzureOpenAI } from 'openai';

const client = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user's listening history and liked songs
    const [playHistory, likedSongs] = await Promise.all([
      PlayHistory.find({ userId: session.user.id })
        .sort({ playedAt: -1 })
        .limit(50),
      LikedSong.find({ userId: session.user.id })
        .sort({ likedAt: -1 })
        .limit(20),
    ]);

    // Analyze user preferences
    const topArtists = analyzeTopArtists(playHistory, likedSongs);
    const topGenres = analyzeTopGenres(playHistory, likedSongs);
    const recentTracks = playHistory.slice(0, 10).map(h => h.track);

    // Create personalized message
    const prompt = `You are DJ X, a cool and friendly AI DJ. Based on the user's music taste, create a personalized greeting and music recommendation. 

User's top artists: ${topArtists.slice(0, 5).join(', ')}
User's top genres: ${topGenres.slice(0, 3).join(', ')}
Recent tracks: ${recentTracks.map(t => `${t.artist} - ${t.title}`).slice(0, 3).join(', ')}

Create a warm, enthusiastic greeting (2-3 sentences) and suggest 5 songs similar to their taste. Keep it casual and exciting, like a real DJ introducing a set. End with enthusiasm about the music you're about to play.`;

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT!,
      messages: [
        { role: 'system', content: 'You are DJ X, an enthusiastic AI DJ who loves music and knows how to get people excited about great songs.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const djMessage = response.choices[0]?.message?.content || "Hey there! I'm DJ X, and I've got some amazing tracks lined up for you based on your incredible taste in music!";

    // Generate recommended songs based on user's preferences
    const recommendations = await generateRecommendations(topArtists, topGenres);

    return NextResponse.json({
      djMessage,
      recommendations,
      userStats: {
        topArtists: topArtists.slice(0, 5),
        topGenres: topGenres.slice(0, 3),
        totalPlayed: playHistory.length,
        totalLiked: likedSongs.length,
      }
    });

  } catch (error) {
    console.error('AI DJ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface Track {
  artist: string;
  title: string;
  genre?: string;
}

interface PlayHistoryEntry {
  track: Track;
  playedAt: Date;
}

interface LikedSongEntry {
  track: Track;
  likedAt: Date;
}

function analyzeTopArtists(playHistory: PlayHistoryEntry[], likedSongs: LikedSongEntry[]): string[] {
  const artistCounts: { [key: string]: number } = {};
  
  // Count from play history
  playHistory.forEach(entry => {
    const artist = entry.track.artist;
    artistCounts[artist] = (artistCounts[artist] || 0) + 1;
  });
  
  // Weight liked songs more heavily
  likedSongs.forEach(entry => {
    const artist = entry.track.artist;
    artistCounts[artist] = (artistCounts[artist] || 0) + 3;
  });
  
  return Object.entries(artistCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([artist]) => artist);
}

function analyzeTopGenres(playHistory: PlayHistoryEntry[], likedSongs: LikedSongEntry[]): string[] {
  const genreCounts: { [key: string]: number } = {};
  
  // Count from play history
  playHistory.forEach(entry => {
    const genre = entry.track.genre || 'Unknown';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });
  
  // Weight liked songs more heavily
  likedSongs.forEach(entry => {
    const genre = entry.track.genre || 'Unknown';
    genreCounts[genre] = (genreCounts[genre] || 0) + 3;
  });
  
  return Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([genre]) => genre)
    .filter(genre => genre !== 'Unknown');
}

async function generateRecommendations(topArtists: string[], topGenres: string[]) {
  // This would ideally fetch from YouTube API based on user preferences
  // For now, we'll return some sample recommendations
  const searchQueries = [
    `${topArtists[0]} similar artists`,
    `${topGenres[0]} music 2024`,
    `${topArtists[1]} best songs`,
    `${topGenres[1]} playlist`,
    `${topArtists[2]} latest music`
  ];

  return searchQueries.slice(0, 5);
}
