import { useCopilotAction } from "@copilotkit/react-core";
import { patchUserPreferences } from "../api-calls/userPreferencesApi";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import { platforms, languages, ageRestriction, fskRating, genreMappingLabels, platformMappingLabels } from '../../app/constants';

const useChatbotAction = (
    name: string,
    description: string,
    parameters: any[],
    userId: string
) => {
    const { refreshPreferences } = useUserPreferences(); // Zugriff auf die zentrale Refresh-Funktion

    useCopilotAction({
        name,
        description,
        parameters,
        handler: async (data: any) => {
            console.log(`${name}:`, data);

            //Validierung je nach Action
            try {
                if (name === "saveGenres") {
                    const validGenres = Object.keys(genreMappingLabels);
                    const invalidGenres = data.genres.filter(
                        (genre: string) => !validGenres.includes(genre)
                    );
                    if (invalidGenres.length > 0) {
                        throw new Error(
                            `Folgende Genres sind ungültig: ${invalidGenres.join(", ")}. Bitte wähle gültige Genres aus.`
                        );
                    }
                }

                if (name === "savePlatforms") {
                    const invalidPlatforms = data.platforms.filter(
                        (platform: string) => !platforms.includes(platform)
                    );
                    if (invalidPlatforms.length > 0) {
                        throw new Error(
                            `Folgende Plattformen sind ungültig: ${invalidPlatforms.join(", ")}.`
                        );
                    }
                }

                if (name === "saveAgeRestriction") {
                    if (
                        typeof data.ageRestriction !== "string" ||
                        !ageRestriction.includes(data.ageRestriction)
                    ) {
                        throw new Error(
                            `Ungültiger Wert für die Kinderberücksichtigung: "${data.ageRestriction}".`
                        );
                    }
                }

                if (name === "saveFskRating") {
                    if (
                        typeof data.fskRating !== "string" ||
                        !fskRating.includes(data.fskRating)
                    ) {
                        throw new Error(
                            `Ungültiger FSK-Wert: "${data.fskRating}". Bitte wähle einen gültigen Wert.`
                        );
                    }
                }

                //Wenn alle Checks bestanden wurden
                await patchUserPreferences(userId, data);
                await refreshPreferences();
            } catch (error: any) {
                console.error(`Fehler bei ${name}:`, error);
                throw new Error(error.message || "Unbekannter Fehler bei der Eingabe.");
            }
        },
    });
};

export default useChatbotAction;
