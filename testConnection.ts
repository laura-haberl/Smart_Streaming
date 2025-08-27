const { PrismaClient } = require('@prisma/client');

// Erstelle eine neue PrismaClient-Instanz
const prisma = new PrismaClient();

async function testConnection() {
    try {
        // Teste die Verbindung, indem du eine Abfrage machst
        const result = await prisma.user.findMany();
        console.log('Verbindung erfolgreich:', result);
    } catch (error) {
        console.error('Fehler bei der Verbindung:', error);
    } finally {
        await prisma.$disconnect(); // Disconnect von Prisma am Ende
    }
}

testConnection();
