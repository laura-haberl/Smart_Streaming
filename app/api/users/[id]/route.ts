import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const userPreferences = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });

        if (!userPreferences) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ userPreferences }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error retrieving preferences:', error.message);
            return NextResponse.json({ message: 'Error retrieving preferences', error: error.message }, { status: 500 });
        } else {
            console.error('Unexpected error:', error);
            return NextResponse.json({ message: 'Unexpected error occurred', error: 'Unknown error' }, { status: 500 });
        }
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    // Extrahiere die übergebenen Werte aus dem Request-Body
    const requestData = await req.json();

    try {
        // Aktuelle Benutzerpräferenzen abrufen
        const userPreferences = await prisma.user.findUnique({
            where: { id: id },
        });

        if (!userPreferences) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // **Nur die Felder aktualisieren, die wirklich im Request vorhanden sind**
        const updatedData: Record<string, any> = {};

        if ("genres" in requestData) updatedData.genres = requestData.genres;
        if ("platforms" in requestData) updatedData.platforms = requestData.platforms;
        if ("primaryLanguage" in requestData) updatedData.primaryLanguage = requestData.primaryLanguage;
        if ("secondaryLanguage" in requestData) updatedData.secondaryLanguage = requestData.secondaryLanguage;
        if ("ageRestriction" in requestData) updatedData.ageRestriction = requestData.ageRestriction;
        if ("fskRating" in requestData) updatedData.fskRating = requestData.fskRating;
        if ("initialInteractionCompleted" in requestData) {
            updatedData.initialInteractionCompleted = requestData.initialInteractionCompleted;
        }

        // **Benutzer mit den gefilterten Daten aktualisieren**
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: updatedData,
        });

        return NextResponse.json({ message: 'Preferences updated successfully', user: updatedUser }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error updating preferences:', error.message);
            return NextResponse.json({ message: 'Error updating preferences', error: error.message }, { status: 500 });
        } else {
            console.error('Unexpected error:', error);
            return NextResponse.json({ message: 'Unexpected error occurred', error: 'Unknown error' }, { status: 500 });
        }
    }
}