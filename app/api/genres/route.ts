import { NextResponse } from "next/server";
import { fetchGenres } from "../../../lib/tmdb";

export async function GET() {
    try {
        const genres = await fetchGenres();
        return NextResponse.json({ genres }, { status: 200 });
    } catch (error: unknown) {
        // Überprüfen, ob der Fehler eine Instanz von Error ist
        if (error instanceof Error) {
            console.error('Error fetching genres:', error.message);
            return NextResponse.json({ message: 'Error fetching genres', error: error.message }, { status: 500 });
        } else {
            console.error('Unexpected error:', error);
            return NextResponse.json({ message: 'Unexpected error occurred', error: 'Unknown error' }, { status: 500 });
        }
    }
}
