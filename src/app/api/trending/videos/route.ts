import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyBPo_E4UQVbENLyZXVSlJLjyCEBByTWL_o';

export async function GET() {
  try {
    // Search for trending music videos
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `type=video&` +
      `videoCategoryId=10&` + // Music category
      `order=viewCount&` +
      `publishedAfter=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&` + // Last 7 days
      `maxResults=12&` +
      `regionCode=US&` +
      `relevanceLanguage=en&` +
      `key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from YouTube API');
    }

    const data = await response.json();

    // Get video details for additional info like view count and duration
    const videoIds = data.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',');
    
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics,contentDetails&` +
      `id=${videoIds}&` +
      `key=${YOUTUBE_API_KEY}`
    );

    if (!detailsResponse.ok) {
      throw new Error('Failed to fetch video details from YouTube API');
    }

    const detailsData = await detailsResponse.json();

    // Combine search results with detailed statistics
    const trendingVideos = data.items.map((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: Record<string, { url: string }>; publishedAt: string; description: string } }) => {
      const details = detailsData.items.find((detail: { id: string; contentDetails?: { duration: string }; statistics?: { viewCount: string } }) => detail.id === item.id.videoId);
      
      // Parse duration from YouTube format (PT4M13S) to readable format
      const duration = details?.contentDetails?.duration || 'PT3M30S';
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = parseInt(match?.[1] || '0');
      const minutes = parseInt(match?.[2] || '0');
      const seconds = parseInt(match?.[3] || '0');
      
      let formattedDuration = '';
      if (hours > 0) {
        formattedDuration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      // Format view count
      const viewCount = parseInt(details?.statistics?.viewCount || '0');
      let formattedViews = '';
      if (viewCount >= 1000000) {
        formattedViews = `${(viewCount / 1000000).toFixed(1)}M`;
      } else if (viewCount >= 1000) {
        formattedViews = `${(viewCount / 1000).toFixed(1)}K`;
      } else {
        formattedViews = viewCount.toString();
      }

      return {
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        views: formattedViews,
        duration: formattedDuration,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description
      };
    });

    return NextResponse.json({ videos: trendingVideos });

  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending videos' },
      { status: 500 }
    );
  }
}
