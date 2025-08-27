import { NextResponse } from "next/server";
import { fetchMoviesByGenre } from "../../../../lib/tmdb";

export async function GET(req: Request, { params }: { params: { genre: string } }) {
    const { genre } = params;

    try {
        if (!genre) {
            return NextResponse.json({ message: "Kein Genre angegeben" }, { status: 400 });
        }

        const movies = await fetchMoviesByGenre(genre);

        return NextResponse.json({ movies }, { status: 200 });
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
