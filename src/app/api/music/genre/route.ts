import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre');
  const limit = searchParams.get('limit') || '50';

  if (!genre) {
    return NextResponse.json({ error: 'Genre parameter is required' }, { status: 400 });
  }

  try {
    // Search for genre-specific music on YouTube
    const searchQuery = `${genre} music 2024 songs`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&videoCategoryId=10&maxResults=${limit}&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    // Get video details including duration
    const videoIds = data.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );

    const detailsData = await detailsResponse.json();
    const videoDetails = detailsData.items.reduce((acc: Record<string, { contentDetails?: { duration: string }; statistics?: { viewCount: string } }>, item: { id: string; contentDetails?: { duration: string }; statistics?: { viewCount: string } }) => {
      acc[item.id] = item;
      return acc;
    }, {});

    const tracks = data.items
      .filter((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: Record<string, { url: string }> } }) => {
        const details = videoDetails[item.id.videoId];
        // Filter for music videos (typically 2-8 minutes)
        const duration = details?.contentDetails?.duration;
        if (!duration) return false;
        
        // Parse duration (PT4M33S format)
        const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return false;
        
        const minutes = parseInt(match[1] || '0');
        const seconds = parseInt(match[2] || '0');
        const totalSeconds = minutes * 60 + seconds;
        
        return totalSeconds >= 120 && totalSeconds <= 480; // 2-8 minutes
      })
      .map((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: Record<string, { url: string }> } }) => {
        const details = videoDetails[item.id.videoId];
        const duration = details?.contentDetails?.duration;
        
        // Parse duration for display
        const match = duration?.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
        const minutes = parseInt(match?.[1] || '0');
        const seconds = parseInt(match?.[2] || '0');
        const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Extract artist and title from video title
        const title = item.snippet.title;
        let artist = item.snippet.channelTitle;
        let songTitle = title;

        // Try to parse "Artist - Song" format
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          artist = parts[0].trim();
          songTitle = parts.slice(1).join(' - ').trim();
        }

        return {
          id: item.id.videoId,
          title: songTitle,
          artist: artist,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          duration: durationString,
          source: 'youtube' as const,
          audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          genre: genre,
          youtubeId: item.id.videoId,
          album: null,
        };
      });

    return NextResponse.json({ 
      success: true, 
      tracks,
      genre,
      total: tracks.length 
    });

  } catch (error) {
    console.error('Error fetching genre music:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch genre music' 
    }, { status: 500 });
  }
}
