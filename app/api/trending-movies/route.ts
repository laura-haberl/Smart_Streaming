import { NextResponse } from "next/server";
import { fetchTrendingMovies } from "../../../lib/tmdb";

export async function GET() {
    try {
        const movies = await fetchTrendingMovies();
        return NextResponse.json({ movies }, { status: 200 });
    } catch (error: unknown) {
        // Überprüfen, ob der Fehler eine Instanz von Error ist
        if (error instanceof Error) {
            console.error('Error fetching trending movies:', error.message);
            return NextResponse.json({ message: 'Error fetching movies', error: error.message }, { status: 500 });
        } else {
            // Falls der Fehler kein Error ist, eine generische Nachricht zurückgeben
            console.error('Unexpected error:', error);
            return NextResponse.json({ message: 'Unexpected error occurred', error: 'Unknown error' }, { status: 500 });
        }
    }
}
