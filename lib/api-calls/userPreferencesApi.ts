import { preferencesStore } from "@/lib/stores/preferencesStore";


export const fetchUserPreferences = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Benutzerpräferenzen");
    }
    return response.json();
};


export const patchUserPreferences = async (userId: string, preferences: Record<string, any>) => {
    try {
        const updatedPreferences: any = {};

        // Wenn Genres vorhanden sind, stelle sicher, dass sie als Array gespeichert werden
        if (preferences.genres) {
            updatedPreferences.genres = Array.isArray(preferences.genres)
                ? preferences.genres
                : preferences.genres.split(",").map((genre: string) => genre.trim());
        }

        // Wenn Plattformen vorhanden sind, stelle sicher, dass sie als Array gespeichert werden
        if (preferences.platforms) {
            updatedPreferences.platforms = Array.isArray(preferences.platforms)
                ? preferences.platforms
                : preferences.platforms.split(",").map((platform: string) => platform.trim());
        }

        // Weitere Optionen hinzufügen, wenn sie vorhanden sind (z.B. Sprachen, Altersfreigabe)
        if (preferences.primaryLanguage === "" || preferences.primaryLanguage === "none") {
            updatedPreferences.primaryLanguage = null;
        } else if ("primaryLanguage" in preferences) {
            updatedPreferences.primaryLanguage = preferences.primaryLanguage;
        }

        if (preferences.secondaryLanguage === "" || preferences.secondaryLanguage === "none") {
            updatedPreferences.secondaryLanguage = null;
        } else if ("secondaryLanguage" in preferences) {
            updatedPreferences.secondaryLanguage = preferences.secondaryLanguage;
        }

        if (preferences.ageRestriction === "" || preferences.ageRestriction === "none") {
            updatedPreferences.ageRestriction = null;
        } else if ("ageRestriction" in preferences) {
            updatedPreferences.ageRestriction = preferences.ageRestriction;
        }

        if (preferences.fskRating === "" || preferences.fskRating === "none") {
            updatedPreferences.fskRating = null;
        } else if ("fskRating" in preferences) {
            updatedPreferences.fskRating = preferences.fskRating;
        }

        if (preferences.initialInteractionCompleted) {
            updatedPreferences.initialInteractionCompleted = preferences.initialInteractionCompleted;
        }

        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPreferences),
        });

        if (!response.ok) {
            throw new Error("Fehler beim Aktualisieren der Benutzerpräferenzen");
        }

        const data = await response.json();
        console.log("Erfolgreich aktualisierte Präferenzen:", data);

        //Zustand aktualisieren - Empfehlungen neu laden
        preferencesStore.getState().setPreferencesUpdated();
    } catch (error) {
        console.error("Fehler beim Patchen der Präferenzen:", error);
    }
};
