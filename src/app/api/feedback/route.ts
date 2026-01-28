import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/feedback.json');

async function getDB() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

async function saveDB(data: any) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const gymId = searchParams.get('gymId');
    const db = await getDB();

    if (gymId && db[gymId]) {
        return NextResponse.json(db[gymId]);
    }

    return NextResponse.json(db);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { gymId, skillLevel, crowdLevel } = body;

    if (!gymId) return NextResponse.json({ error: 'Missing gymId' }, { status: 400 });

    const db = await getDB();

    if (!db[gymId]) {
        db[gymId] = {
            skillSum: 0,
            skillCount: 0,
            crowdVotes: { 'Empty': 0, 'Moderate': 0, 'Full': 0 },
            lastUpdated: new Date().toISOString()
        };
    }

    // Update skill average
    if (skillLevel) {
        db[gymId].skillSum += skillLevel;
        db[gymId].skillCount += 1;
    }

    // Update crowd meter
    if (crowdLevel) {
        db[gymId].crowdVotes[crowdLevel] += 1;
    }

    db[gymId].lastUpdated = new Date().toISOString();

    await saveDB(db);

    return NextResponse.json(db[gymId]);
}
