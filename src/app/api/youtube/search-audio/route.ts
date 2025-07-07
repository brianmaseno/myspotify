import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artist = searchParams.get('artist');
    const title = searchParams.get('title');
    
    if (!artist || !title) {
      return NextResponse.json(
        { success: false, error: 'Artist and title are required' },
        { status: 400 }
      );
    }

    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key not configured');
      return NextResponse.json(
        { success: false, error: 'YouTube API not configured' },
        { status: 500 }
      );
    }

    // Search for the audio version of the track on YouTube
    const searchQuery = `${artist} ${title} audio`;
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=medium&q=${encodeURIComponent(searchQuery)}&key=${YOUTUBE_API_KEY}&maxResults=3&videoEmbeddable=true&fields=items(id/videoId,snippet(title,thumbnails,channelTitle))`
    );

    if (!response.ok) {
      console.error('YouTube API error:', response.status);
      return NextResponse.json(
        { success: false, error: 'Failed to search YouTube' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      // Return the first result that best matches
      const video = data.items[0];
      const videoId = video.id.videoId;
      
      return NextResponse.json({
        success: true,
        videoId: videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        channel: video.snippet.channelTitle,
        embedUrl: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No YouTube audio found for this track'
      });
    }

  } catch (error) {
    console.error('Error fetching YouTube audio:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
