import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/schedule.json');

export async function POST(request: Request) {
    try {
        const { sessions, isRecurring, lastMove } = await request.json();

        // In a real app, we would handle recurring logic properly by date.
        // For this MVP, we are re-ordering the master JSON.
        await fs.writeFile(DB_PATH, JSON.stringify(sessions, null, 2));

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
    }
}
