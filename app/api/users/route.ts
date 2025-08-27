import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    const { name, email, password, genres, platforms, primaryLanguage, secondaryLanguage, ageRestriction, fskRating } = await req.json();

    try {
        // Überprüfen, ob der Benutzer mit der gleichen E-Mail bereits existiert
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 400 });
        }

        // Passwort hashen
        const hashedPassword = await bcrypt.hash(password, 10);

        // Falls der Benutzer nicht existiert, Erstellung durchführen
        const newUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                genres: genres.length > 0 ? genres : ["notSetYet"],  // Wenn keine Genres angegeben "notSetYet"
                platforms: platforms.length > 0 ? platforms : ["notSetYet"],
                primaryLanguage: primaryLanguage || null, // Wenn nicht angegeben bleibt es null
                secondaryLanguage: secondaryLanguage || null,
                ageRestriction: ageRestriction || null,
                fskRating: fskRating || null,
            },
        });

        return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
    } catch (error: unknown) {
        // Typisierung des Fehlers als Error
        if (error instanceof Error) {
            console.error('Error creating user:', error);
            return NextResponse.json({ message: 'Error creating user', error: error.message }, { status: 500 });
        } else {
            // Falls der Fehler kein `Error` ist
            console.error('Unexpected error:', error);
            return NextResponse.json({ message: 'Unexpected error occurred', error: 'Unknown error' }, { status: 500 });
        }
    }
}
