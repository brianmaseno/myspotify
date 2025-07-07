import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const maxResults = searchParams.get('maxResults') || '20';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Search for music videos on YouTube
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `key=${process.env.YOUTUBE_API_KEY}&` +
      `q=${encodeURIComponent(query + ' music song')}&` +
      `part=snippet&` +
      `type=video&` +
      `maxResults=${maxResults}&` +
      `videoCategoryId=10&` + // Music category
      `order=relevance`
    );

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items?.length) {
      return NextResponse.json({
        results: [],
        totalResults: 0
      });
    }

    // Get video details including duration
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
    );

    const detailsData = await detailsResponse.json();
    const videoDetails = detailsData.items.reduce((acc: any, item: any) => {
      acc[item.id] = item;
      return acc;
    }, {});

    // Transform and filter the data
    const transformedResults = searchData.items
      .filter((item: any) => {
        const details = videoDetails[item.id.videoId];
        // Filter for music videos (typically 1-10 minutes)
        const duration = details?.contentDetails?.duration;
        if (!duration) return true; // Include if duration unavailable
        
        // Parse duration (PT4M33S format)
        const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return true;
        
        const minutes = parseInt(match[1] || '0');
        const seconds = parseInt(match[2] || '0');
        const totalSeconds = minutes * 60 + seconds;
        
        return totalSeconds >= 60 && totalSeconds <= 600; // 1-10 minutes
      })
      .map((item: any) => {
        const details = videoDetails[item.id.videoId];
        const duration = details?.contentDetails?.duration;
        const viewCount = details?.statistics?.viewCount;
        
        // Parse duration for display
        let durationString = 'N/A';
        if (duration) {
          const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
          if (match) {
            const minutes = parseInt(match[1] || '0');
            const seconds = parseInt(match[2] || '0');
            durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          }
        }

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

        // Format view count
        const views = viewCount ? parseInt(viewCount) : 0;
        let formattedViews = '0';
        if (views >= 1000000000) {
          formattedViews = `${(views / 1000000000).toFixed(1)}B`;
        } else if (views >= 1000000) {
          formattedViews = `${(views / 1000000).toFixed(1)}M`;
        } else if (views >= 1000) {
          formattedViews = `${(views / 1000).toFixed(1)}K`;
        } else {
          formattedViews = views.toString();
        }

        return {
          id: item.id.videoId,
          title: songTitle,
          artist: artist,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          duration: durationString,
          type: 'video',
          source: 'youtube',
          publishedAt: item.snippet.publishedAt,
          description: item.snippet.description,
          audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          youtubeId: item.id.videoId,
          canPlayAsAudio: true,
          views: formattedViews,
          album: null // YouTube videos don't have album info
        };
      });

    return NextResponse.json({
      results: transformedResults,
      totalResults: transformedResults.length,
      nextPageToken: searchData.nextPageToken
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube' },
      { status: 500 }
    );
  }
}
