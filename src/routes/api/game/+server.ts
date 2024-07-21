import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { wordList } from '$lib/stores';


// In-memory storage for game sessions (replace with a database in production)
let gameSessions: Record<string, GameSession> = {};

interface GameSession {
    playerId: string;
    score: number;
    meatCount: number;
    correctWords: Record<string, number>;
    incorrectWords: Record<string, number>;
}

// Initialize the word dictionaries
function initializeWordDict(): Record<string, number> {
    return wordList.reduce((acc, word) => {
        acc[word] = 0;
        return acc;
    }, {} as Record<string, number>);
}

export const POST: RequestHandler = async ({ request }) => {
    const { playerId } = await request.json();

    // Create a new game session
    const newSession: GameSession = {
        playerId,
        score: 0,
        meatCount: 0,
        correctWords: initializeWordDict(),
        incorrectWords: initializeWordDict()
    };

    gameSessions[playerId] = newSession;

    return json({ message: 'Game session created', sessionId: playerId });
};


export const PUT: RequestHandler = async ({ request }) => {
    const { playerId, score, meatCount, word, isCorrect } = await request.json();

    if (!gameSessions[playerId]) {
        return json({ error: 'Game session not found' }, { status: 404 });
    }

    // Update the game session
    const session = gameSessions[playerId];
    session.score += score;
    session.meatCount += meatCount;
    if (isCorrect) {
        session.correctWords[word] = (session.correctWords[word] || 0) + 1;
    } else {
        session.incorrectWords[word] = (session.incorrectWords[word] || 0) + 1;
    }

    return json({ message: 'Game session updated', session });
};


export const GET: RequestHandler = ({ url }) => {
    const playerId = url.searchParams.get('playerId');

    if (!playerId || !gameSessions[playerId]) {
        return json({ error: 'Game session not found' }, { status: 404 });
    }

    return json(gameSessions[playerId]);
};