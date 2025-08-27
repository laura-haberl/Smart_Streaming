import { NextResponse } from "next/server";
import { fetchRecommendations } from "../../../lib/tmdb";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const filters = {
        genre: url.searchParams.get('genre'),
        platform: url.searchParams.get('platform'),
        region: url.searchParams.get('region'),
        primary_language: url.searchParams.get('primary_language'),
        secondary_language: url.searchParams.get('secondary_language'),
        fsk: url.searchParams.get('fsk'),
        runtime: {
            min: parseInt(url.searchParams.get('runtimeMin') || '0', 10),
            max: parseInt(url.searchParams.get('runtimeMax') || '500', 10),
        },
        voteMin: url.searchParams.get('voteMin'),
        releaseDate: {
            min: url.searchParams.get('releaseDateMin'),
            max: url.searchParams.get('releaseDateMax'),
        }
    };

    try {
        const recommendations = await fetchRecommendations(filters);

        return NextResponse.json(recommendations, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error fetching movies:', error.message);
            return NextResponse.json({ message: 'Error fetching movies', error: error.message }, { status: 500 });
        } else {
            console.error('Unexpected error:', error);
            return NextResponse.json({ message: 'Unexpected error occurred', error: 'Unknown error' }, { status: 500 });
        }
    }
}
