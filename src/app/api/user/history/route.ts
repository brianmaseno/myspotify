import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { PlayHistory } from '@/lib/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const history = await PlayHistory.find({ userId: session.user.id })
      .sort({ playedAt: -1 })
      .limit(50);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching play history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { track, playDuration, completed } = await request.json();

    // Validate track data
    if (!track || !track.id) {
      console.warn('Invalid track data received:', track);
      return NextResponse.json({ error: 'Invalid track data - missing track.id' }, { status: 400 });
    }

    await connectDB();

    // Check if entry already exists to prevent duplicates
    const existingEntry = await PlayHistory.findOne({
      userId: session.user.id,
      trackId: track.id,
      playedAt: { $gte: new Date(Date.now() - 60000) } // Within last minute
    });

    if (existingEntry) {
      // Update existing entry
      existingEntry.playDuration = playDuration;
      existingEntry.completed = completed;
      existingEntry.playedAt = new Date();
      await existingEntry.save();
      return NextResponse.json({ historyEntry: existingEntry });
    }

    // Create new entry
    const historyEntry = await PlayHistory.create({
      userId: session.user.id,
      trackId: track.id,
      track,
      playDuration: playDuration || 0,
      completed: completed || false,
      playedAt: new Date(),
    });

    return NextResponse.json({ historyEntry });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      // Duplicate key error - handle gracefully
      console.warn('Duplicate play history entry attempted');
      return NextResponse.json({ message: 'Entry already exists' }, { status: 200 });
    }
    console.error('Error saving play history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
