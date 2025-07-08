import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Fallback trending tracks when YouTube API fails
function getFallbackTracks() {
  const fallbackTracks = [
    {
      id: 'nQWFzMvCfLE',
      name: 'What A Beautiful Name',
      artists: [{ name: 'Hillsong Worship', id: 'hillsong-worship' }],
      album: {
        name: 'Let There Be Light',
        images: [{ url: 'https://i.ytimg.com/vi/nQWFzMvCfLE/hqdefault.jpg' }]
      },
      preview_url: null,
      audioUrl: 'https://www.youtube.com/watch?v=nQWFzMvCfLE',
      videoUrl: 'https://www.youtube.com/watch?v=nQWFzMvCfLE',
      duration_ms: 265000,
      duration: '4:25',
      popularity: 95,
      external_urls: { youtube: 'https://www.youtube.com/watch?v=nQWFzMvCfLE' },
      source: 'youtube',
      youtubeId: 'nQWFzMvCfLE',
      thumbnail: 'https://i.ytimg.com/vi/nQWFzMvCfLE/hqdefault.jpg',
      plays: '150M',
      change: '+12%',
      rank: 1
    },
    {
      id: 'Lq4PXLxTuVU',
      name: 'Come Jesus Come',
      artists: [{ name: 'CeCe Winans', id: 'cece-winans' }],
      album: {
        name: 'Believe For It',
        images: [{ url: 'https://i.ytimg.com/vi/Lq4PXLxTuVU/hqdefault.jpg' }]
      },
      preview_url: null,
      audioUrl: 'https://www.youtube.com/watch?v=Lq4PXLxTuVU',
      videoUrl: 'https://www.youtube.com/watch?v=Lq4PXLxTuVU',
      duration_ms: 312000,
      duration: '5:12',
      popularity: 88,
      external_urls: { youtube: 'https://www.youtube.com/watch?v=Lq4PXLxTuVU' },
      source: 'youtube',
      youtubeId: 'Lq4PXLxTuVU',
      thumbnail: 'https://i.ytimg.com/vi/Lq4PXLxTuVU/hqdefault.jpg',
      plays: '45M',
      change: '+8%',
      rank: 2
    },
    {
      id: 'dNKe1fP9O9o',
      name: 'Goodness of God',
      artists: [{ name: 'Bethel Music', id: 'bethel-music' }],
      album: {
        name: 'Peace',
        images: [{ url: 'https://i.ytimg.com/vi/dNKe1fP9O9o/hqdefault.jpg' }]
      },
      preview_url: null,
      audioUrl: 'https://www.youtube.com/watch?v=dNKe1fP9O9o',
      videoUrl: 'https://www.youtube.com/watch?v=dNKe1fP9O9o',
      duration_ms: 298000,
      duration: '4:58',
      popularity: 92,
      external_urls: { youtube: 'https://www.youtube.com/watch?v=dNKe1fP9O9o' },
      source: 'youtube',
      youtubeId: 'dNKe1fP9O9o',
      thumbnail: 'https://i.ytimg.com/vi/dNKe1fP9O9o/hqdefault.jpg',
      plays: '82M',
      change: '+15%',
      rank: 3
    },
    {
      id: 'XK2H-WH5s2g',
      name: 'Way Maker',
      artists: [{ name: 'Sinach', id: 'sinach' }],
      album: {
        name: 'Way Maker',
        images: [{ url: 'https://i.ytimg.com/vi/XK2H-WH5s2g/hqdefault.jpg' }]
      },
      preview_url: null,
      audioUrl: 'https://www.youtube.com/watch?v=XK2H-WH5s2g',
      videoUrl: 'https://www.youtube.com/watch?v=XK2H-WH5s2g',
      duration_ms: 276000,
      duration: '4:36',
      popularity: 90,
      external_urls: { youtube: 'https://www.youtube.com/watch?v=XK2H-WH5s2g' },
      source: 'youtube',
      youtubeId: 'XK2H-WH5s2g',
      thumbnail: 'https://i.ytimg.com/vi/XK2H-WH5s2g/hqdefault.jpg',
      plays: '120M',
      change: '+5%',
      rank: 4
    },
    {
      id: 'rv2Dsb6lmB4',
      name: 'Reckless Love',
      artists: [{ name: 'Cory Asbury', id: 'cory-asbury' }],
      album: {
        name: 'Reckless Love',
        images: [{ url: 'https://i.ytimg.com/vi/rv2Dsb6lmB4/hqdefault.jpg' }]
      },
      preview_url: null,
      audioUrl: 'https://www.youtube.com/watch?v=rv2Dsb6lmB4',
      videoUrl: 'https://www.youtube.com/watch?v=rv2Dsb6lmB4',
      duration_ms: 254000,
      duration: '4:14',
      popularity: 87,
      external_urls: { youtube: 'https://www.youtube.com/watch?v=rv2Dsb6lmB4' },
      source: 'youtube',
      youtubeId: 'rv2Dsb6lmB4',
      thumbnail: 'https://i.ytimg.com/vi/rv2Dsb6lmB4/hqdefault.jpg',
      plays: '95M',
      change: '+10%',
      rank: 5
    }
  ];

  console.log('Using fallback trending tracks:', fallbackTracks.length);
  
  return NextResponse.json({ 
    success: true,
    tracks: { items: fallbackTracks }
  });
}

// Function to fetch with retries
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      // Add timeout to fetch to avoid hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      return response;
    } catch (error) {
      lastError = error;
      retries++;
      console.warn(`Fetch attempt ${retries} failed. Retrying...`, error);
      
      // Add exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
  
  throw lastError || new Error(`Failed after ${maxRetries} retries`);
}

export async function GET() {
  try {
    console.log('Trending tracks API called - Using YouTube');

    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key missing');
      return getFallbackTracks();
    }

    // Search for trending music on YouTube
    const trendingQueries = [
      'trending music 2024',
      'top hits 2024', 
      'viral songs 2024',
      'popular music now',
      'chart toppers 2024'
    ];

    const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
    
    try {
      const response = await fetchWithRetry(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(randomQuery)}&videoCategoryId=10&maxResults=20&order=viewCount&key=${YOUTUBE_API_KEY}`,
        { 
          headers: {
            'Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000'
          }
        }
      );

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} - ${response.statusText}`);
      if (response.status === 403) {
        console.error('YouTube API quota exceeded or access forbidden. Using fallback data.');
      }
      return getFallbackTracks();
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn('No YouTube results found, using fallback');
      return getFallbackTracks();
    }

    // Get video details including duration and statistics
    const videoIds = data.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',');
      
    const detailsResponse = await fetchWithRetry(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
      {}
    );
    
    if (!detailsResponse.ok) {
      console.error(`YouTube details API error: ${detailsResponse.status}`);
      return getFallbackTracks();
    }

    const detailsData = await detailsResponse.json();
    
    if (!detailsData.items || detailsData.items.length === 0) {
      console.warn('No YouTube details found, using fallback');
      return getFallbackTracks();
    }
    const videoDetails = detailsData.items.reduce((acc: Record<string, { contentDetails?: { duration: string }; statistics?: { viewCount: string } }>, item: { id: string; contentDetails?: { duration: string }; statistics?: { viewCount: string } }) => {
      acc[item.id] = item;
      return acc;
    }, {});

    const trendingTracks = data.items
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
      .slice(0, 10)
      .map((item: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: Record<string, { url: string }> } }, index: number) => {
        const details = videoDetails[item.id.videoId];
        const duration = details?.contentDetails?.duration;
        const viewCount = details?.statistics?.viewCount;
        
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
          name: songTitle,
          artists: [{ name: artist, id: `artist-${item.id.videoId}` }],
          album: {
            name: '',
            images: [{ url: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url }]
          },
          preview_url: null, // YouTube doesn't provide direct preview URLs
          audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          duration_ms: (parseInt(match?.[1] || '0') * 60 + parseInt(match?.[2] || '0')) * 1000,
          duration: durationString,
          popularity: Math.min(Math.floor(views / 1000000), 100), // Convert views to popularity score
          external_urls: { youtube: `https://www.youtube.com/watch?v=${item.id.videoId}` },
          source: 'youtube',
          youtubeId: item.id.videoId,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
          plays: formattedViews,
          change: `+${Math.floor(Math.random() * 30 + 5)}%`,
          rank: index + 1
        };
      });

    console.log('YouTube trending tracks fetched:', trendingTracks.length);
    
    return NextResponse.json({ 
      success: true,
      tracks: { items: trendingTracks }
    });

    } catch (fetchError) {
      console.error('Error fetching from YouTube API:', fetchError);
      return getFallbackTracks();
    }
  } catch (error) {
    console.error('Error fetching YouTube trending tracks:', error);
    
    // Return fallback tracks instead of throwing error
    console.log('Using fallback tracks due to error');
    return getFallbackTracks();
  }
}
