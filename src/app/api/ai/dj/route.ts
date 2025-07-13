import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { PlayHistory, LikedSong } from '@/lib/models';
import { AzureOpenAI } from 'openai';

// Check if Azure OpenAI credentials are available
const hasAzureCredentials = 
  process.env.AZURE_OPENAI_ENDPOINT && 
  process.env.AZURE_OPENAI_API_KEY && 
  process.env.AZURE_OPENAI_DEPLOYMENT && 
  process.env.AZURE_OPENAI_API_VERSION;

let client: AzureOpenAI | null = null;

if (hasAzureCredentials) {
  try {
    client = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
    });
  } catch (error) {
    console.error('Failed to initialize Azure OpenAI client:', error);
  }
} else {
  console.warn('Azure OpenAI credentials not provided. AI DJ will use fallback responses.');
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let playHistory: PlayHistoryEntry[] = [];
    let likedSongs: LikedSongEntry[] = [];
    
    try {
      await connectDB();
      // Get user's listening history and liked songs
      const [playHistoryResult, likedSongsResult] = await Promise.all([
        PlayHistory.find({ userId: session.user.id })
          .sort({ playedAt: -1 })
          .limit(50)
          .lean()
          .catch(() => []),
        LikedSong.find({ userId: session.user.id })
          .sort({ likedAt: -1 })
          .limit(20)
          .lean()
          .catch(() => []),
      ]);
      
      playHistory = playHistoryResult as PlayHistoryEntry[];
      likedSongs = likedSongsResult as LikedSongEntry[];
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with empty arrays if database fails
    }

    // Analyze user preferences
    const topArtists = analyzeTopArtists(playHistory, likedSongs);
    const topGenres = analyzeTopGenres(playHistory, likedSongs);

    // Default fallback message - short and energetic
    let djMessage = "Hey! DJ X here. I've got some fire tracks coming your way!";
    
    if (client) {
      try {
        // Create short, personalized message
        const prompt = `You are DJ X, a cool AI DJ like Spotify's DJ. Create a very short (1-2 sentences max), energetic greeting. 

User's music: ${topArtists.slice(0, 3).join(', ') || 'Various Artists'}
Genres: ${topGenres.slice(0, 2).join(', ') || 'Mixed'}

Keep it brief, exciting, and DJ-like. No long introductions - just quick energy like "What's up! Got some amazing [genre] vibes for you!" or "Hey there! Time for some [artist] energy!"`;

        const response = await client.chat.completions.create({
          model: process.env.AZURE_OPENAI_DEPLOYMENT!,
          messages: [
            { role: 'system', content: 'You are DJ X, a brief and energetic AI DJ. Keep messages under 15 words. Be like Spotify DJ - short, fun, energetic.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 50,
          temperature: 0.9,
        });

        const aiMessage = response.choices[0]?.message?.content || djMessage;
        // Ensure the message is short
        djMessage = aiMessage.length > 80 ? djMessage : aiMessage;
      } catch (aiError) {
        console.error('AI service error:', aiError);
        // Continue with default DJ message if AI service fails
      }
    }

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
  // Generate search queries for related songs
  const searchQueries: string[] = [];
  
  // Add similar artists to top artists
  if (topArtists.length > 0) {
    searchQueries.push(`${topArtists[0]} similar artists best songs`);
    if (topArtists.length > 1) {
      searchQueries.push(`${topArtists[1]} popular tracks`);
    }
    if (topArtists.length > 2) {
      searchQueries.push(`${topArtists[2]} hit songs`);
    }
  }
  
  // Add genre-based recommendations
  if (topGenres.length > 0) {
    searchQueries.push(`${topGenres[0]} trending songs 2024`);
    if (topGenres.length > 1) {
      searchQueries.push(`${topGenres[1]} popular hits`);
    }
  }
  
  // Add some variety with related recommendations
  const relatedQueries = [
    'trending music 2024',
    'viral songs tiktok',
    'popular hits now',
    'new music 2024',
    'best songs right now'
  ];
  
  // Fill remaining slots with related content
  while (searchQueries.length < 8) {
    const randomQuery = relatedQueries[Math.floor(Math.random() * relatedQueries.length)];
    if (!searchQueries.includes(randomQuery)) {
      searchQueries.push(randomQuery);
    }
  }

  return searchQueries.slice(0, 8);
}
