"use client";

import { CopilotPopup } from "@copilotkit/react-ui";
import { useEffect, useState } from "react";
import useChatbotAction from "../lib/hooks/useChatbotActions";
import { fetchRecommendations } from "../lib/api-calls/movieApi";
import {useCopilotAction} from "@copilotkit/react-core";
import { useCopilotReadable } from "@copilotkit/react-core";
import { platforms, languages, ageRestriction, fskRating, genreMappingLabels, platformMappingLabels } from '../app/constants';
import { useUserPreferences } from "../contexts/UserPreferencesContext";
import {useTrendingMovies} from "@/contexts/TrendingMoviesContext";
import {useRecommendedMovies} from "@/contexts/RecommendedMoviesContext";
import {useStaticRecommendations} from "@/contexts/StaticRecommendationsContext";


const Chatbot = ({ userId }: { userId: string }) => {
    const { userPreferences, loading } = useUserPreferences();
    const { trendingMovies, loadingTrends } = useTrendingMovies();
    const region = "DE";
    const userName = userPreferences?.name || "";
    const { recommendedMoviesDynamic, setRecommendedMoviesDynamic } = useRecommendedMovies();
    const { staticRecommendations } = useStaticRecommendations();
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [greetingMessage, setGreetingMessage] = useState("");


    useEffect(() => {
        if (userPreferences?.initialInteractionCompleted && userName) {
            const greeting = getRandomGreeting(userName, userPreferences);
            setGreetingMessage(greeting);
        }
    }, [userPreferences?.initialInteractionCompleted, userName]);


    useEffect(() => {
        console.log("preferences changed", userPreferences);
    }, [userPreferences]);


    useCopilotReadable({
        description: "Aktuelle Nutzerpräferenzen",
        value: {
            genres: userPreferences.genres,
            platforms: userPreferences.platforms,
            //primaryLanguage: userPreferences.primaryLanguage,
            //secondaryLanguage: userPreferences.secondaryLanguage,
            ageRestriction: userPreferences.ageRestriction,
            fskRating: userPreferences.fskRating,
        },
    });

    useCopilotReadable({
        description: "Verfügbare Optionen für Inhalteinstellungen",
        value: {
            genreOptions: Object.keys(genreMappingLabels),
            platformOptions: platforms,
            //languageOptions: languages,
            ageRestrictionOptions: ageRestriction,
            fskRatingOptions: fskRating,
        },
    });

    // Dynamische Empfehlungen basierend auf den aktuellen Nutzerpräferenzen für den Chatbot bereitstellen
    // ergänzend die Genres, auf denen die Empfehlungen basieren (vorallem für Überraschung, Neues entdecken)
    useCopilotReadable({
        description: "Empfehlungen basierend auf den aktuell eingegebenen Präferenzen des Nutzers. Die Genres, auf denen die aktuellen Empfehlungen basieren",
        value: recommendedMoviesDynamic,
    });

    useCopilotReadable({
        description: "Die Genres, auf denen die aktuellen Empfehlungen basieren",
        value: selectedGenres,
    });


    // Statische Empfehlungen basierend auf gespeicherten Nutzerpräferenzen für den Chatbot bereitstellen
    useCopilotReadable({
        description: "Eine Liste von Filmen, die auf den dauerhaft gespeicherten Präferenzen des Nutzers basieren.",
        value: staticRecommendations,
    });


    //Daten der trending movies dem Chatbot zur Verfügung stellen
    useCopilotReadable({
        description: "Liste der trending movies",
        value: trendingMovies,
    });




    useCopilotAction({
        name: "getRecommendedMovies",
        description: "Holt Filme basierend auf den vom Nutzer eingegebenen Präferenzen",
        parameters: [
            {
                name: "genre",
                type: "string[]",
                description: "Genres des Films (eines oder mehrere)",
                required: false,
            },
            {
                name: "runtime_gte",
                type: "string",
                description: "Mindestdauer des Films",
                required: false,
            },
            {
                name: "runtime_lte",
                type: "string",
                description: "Maximaldauer des Films",
                required: false,
            },
            {
                name: "fsk",
                type: "string",
                description: "Liegt ein FSK-Wert vor und soll dieser berücksichtigt werden?",
                required: false,
            },
            {
                name: "vote_average_gte",
                type: "string",
                description: "Bestimmt die durchschnittliche Bewertung die vorliegen muss",
                required: false,
            },
            {
                name: "release_date_gte",
                type: "string",
                description: "Bestimmt das niedrigmöglichste Veröffentlichungsdatum",
                required: false,
            },
            {
                name: "release_date_lte",
                type: "string",
                description: "Bestimmt das höchstmögliche Veröffentlichungsdatum",
                required: false,
            },
        ],
        handler: async (data: any) => {
            // Falls keine Genres angegeben sind → zufällige Auswahl treffen
            // Sicherstellen, dass `data.genre` existiert und ein Array ist
            const genreArray = Array.isArray(data.genre) ? data.genre : [];

            let finalGenres;
            if (genreArray.length > 0) {
                finalGenres = genreArray;
                console.log("Genres aus Nutzereingabe:", finalGenres);
            } else {
                const randomCount = Math.floor(Math.random() * 3) + 1; // Zufällig 1-3 Genres wählen
                finalGenres = getRandomGenres(randomCount);
                console.log(`Keine Nutzereingabe gefunden, zufällige Auswahl (${randomCount} Genres):`, finalGenres);
            }

            // State mit den tatsächlich verwendeten Genres aktualisieren
            setSelectedGenres(finalGenres);

            // **Genre-IDs ermitteln (mehrere Genres unterstützen)**
            const genreIds = finalGenres
                .map((genre: string) => genreMappingLabels[genre])
                .filter(Boolean)
                .join("|");


            // Filter für die Anfrage
            const platformIds = userPreferences.platforms
                .map((platform: string) => platformMappingLabels[platform])
                .join("|"); // | = or

            const today = new Date().toISOString().split("T")[0];

            const filters = {
                genre: genreIds,
                platform: platformIds,
                region: region,
                primary_language: userPreferences.primaryLanguage,
                secondary_language: userPreferences.secondaryLanguage,
                fsk: data.fsk ,
                runtime_gte: data.runtime_gte || "0",
                runtime_lte: data.runtime_lte || "500",
                vote_average_gte: data.vote_average_gte || null,
                release_date_gte: data.release_date_gte || "2000-01-01",
                release_date_lte: data.release_date_lte || today,
            };

            console.log("Filterparameter:", filters);

            try {
                const recommendations = await fetchRecommendations(filters);
                console.log("teeeest");
                console.log("Empfohlene Filme:", recommendations);

                setRecommendedMoviesDynamic(recommendations); // Speichere die Ergebnisse im Kontext



            } catch (error) {
                console.error("Fehler beim Abrufen der Empfehlungen:", error);
            }
        },
    });



    useChatbotAction(
        "saveGenres",
        "Speichert, ändert oder löscht die bevorzugten Genres des Nutzers",
        [
            {
                name: "genres",
                type: "string[]",
                description: "Die bevorzugten Genres des Nutzers",
                required: true,
            },
        ],
        userId
    );

    useChatbotAction(
        "savePlatforms",
        "Speichert, ändert oder löscht die bevorzugten Streaming-Plattformen",
        [
            {
                name: "platforms",
                type: "string[]",
                description: "Die bevorzugten Plattformen des Nutzers",
                required: true,
            },
        ],
        userId
    );

    /*useChatbotAction(
        "savePrimaryLanguage",
        "Speichert, ändert oder löscht die bevorzugte Hauptsprache",
        [
            {
                name: "primaryLanguage",
                type: "string",
                description: "Die bevorzugte Hauptsprache des Nutzers",
                required: false,
            },
        ],
        userId
    );*/


    /*useChatbotAction(
        "saveSecondaryLanguage",
        "Speichert, ändert oder löscht die bevorzugte Zweitsprache",
        [
            {
                name: "secondaryLanguage",
                type: "string",
                description: "Die bevorzugte Zweitsprache des Nutzers",
                required: false,
            },
        ],
        userId
    );*/


    useChatbotAction(
        "saveAgeRestriction",
        "Speichert, ändert oder löscht die bevorzugte Kinderberücksichtigung",
        [
            {
                name: "ageRestriction",
                type: "string",
                description: "Die bevorzugte Kinderberücksichtigung des Nutzers",
                required: false,
            },
        ],
        userId
    );

    useChatbotAction(
        "saveFskRating",
        "Speichert, ändert oder löscht die bevorzugte Altersfreigabe (FSK)",
        [
            {
                name: "fskRating",
                type: "string",
                description: "Die bevorzugte Altersfreigabe (FSK) des Nutzers",
                required: false,
            },
        ],
        userId
    );


    useChatbotAction(
        "saveInitialInteractionCompleted",
        "Speichert den Status, ob die Erstinteraktion abgeschlossen wurde. Dieser Wert wird auf 'true' gesetzt, sobald der Prozess erfolgreich beendet ist.",
        [
            {
                name: "initialInteractionCompleted",
                type: "boolean",
                description: "Gibt an, ob die Erstinteraktion abgeschlossen ist.",
                required: false,
            },
        ],
        userId
    );



    // Ladezustand
    if (loading && loadingTrends) {
        return;
    }

    function formatGenres(genres, useOrAtEnd = false) {
        if (!genres || genres.length === 0) return "etwas Spannendes"; // Fallback, falls keine Genres gesetzt sind

        if (genres.length === 1) {
            return genres[0]; // Nur ein Genre direkt zurückgeben
        }

        if (useOrAtEnd && genres.length > 1) {
            return `${genres.slice(0, -1).join(", ")} oder ${genres[genres.length - 1]}`; // Mit „oder“ am Ende
        }

        return genres.join(", "); // Einfach kommagetrennte Liste zurückgeben
    }



    function getRandomGreeting(userName, userPreferences) {
        const genres = userPreferences?.genres || [];
        const hasMultipleGenres = genres.length > 1;

        if (genres.length === 0) {
            const fallbackMessages = [
                `Hey ${userName}, du hast keine Lieblingsgenres angegeben. Hast du Lust auf was bestimmtes oder soll ich dich überraschen?`,
                `Willkommen zurück, ${userName}! Wenn du mir verrätst, welche Genres du magst, finde ich passende Filme für dich. Ich kann dich aber auch überraschen.`,
                `Hey ${userName}, aktuell kenne ich deine Lieblingsgenres noch nicht. Möchtest du welche angeben oder dich überraschen lassen?`
            ];
            return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
        }

        const genresTextWithOr = formatGenres(genres, true);
        const genresTextWithoutOr = formatGenres(genres, false);

        // Dynamische Begriffe für Einzahl/Mehrzahl
        const favoriteGenresText = hasMultipleGenres ? `Lieblingsgenres (${genresTextWithoutOr})` : `Lieblingsgenre ${genresTextWithoutOr}`;
        const followingGenresText = hasMultipleGenres ? `folgende Genres: ${genresTextWithoutOr}` : `folgendes Genre: ${genresTextWithoutOr}`;

        let childrenText = "";
        if(userPreferences.fskRating && userPreferences.ageRestriction == 'sometimes'){
            childrenText = "Außerdem kannst du festlegen, ob der gespeichtere FSK-Wert von " + userPreferences.fskRating + " berücksichtigt werden soll."
        }

        const messages = [
            `Hey ${userName}, hast du heute Lust auf ${genresTextWithOr}? Oder soll ich dich mit einem anderen Genre überraschen? Du kannst außerdem eine gewünschte Filmlänge, einen Veröffentlichungszeitraum und eine Mindestbewertung für die Empfehlungen festlegen – musst du aber nicht. ${childrenText} Teile mir einfach mit, wie du es gerne hättest. `,
            `Willkommen zurück, ${userName}! Wie wäre es mit ${genresTextWithoutOr}? Oder darf es was Neues sein?`,
            `Schön, dich wiederzusehen, ${userName}! Ich habe gespeichert, dass du ${followingGenresText} magst. Soll ich danach suchen oder möchtest du etwas anderes sehen?`,
            `Hey ${userName}, soll ich deine ${favoriteGenresText} durchstöbern oder mal was völlig anderes vorschlagen?`,
            `Willkommen zurück, ${userName}! Ich kann dir Filme aus deinen ${favoriteGenresText} vorschlagen, aber wir können auch mal etwas anderes probieren. Was meinst du?`
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    function getRandomGenres(count = 3) {
        const allGenres = Object.keys(genreMappingLabels); // Alle verfügbaren Genre-Namen
        const shuffled = allGenres.sort(() => 0.5 - Math.random()); // Zufällige Reihenfolge
        return shuffled.slice(0, count); // Nimm die ersten `count` Genres
    }



    // Instruktionen für den Chatbot
    const baseInstructions = `
        ## Kommunikation:
        - Sprich Deutsch und duze den Nutzer.
    
        ## Datenspeicherung:
        - Speichere nur, wenn du 100% sicher bist, was gemeint ist – frage sonst nach.
        - Verwende exakte Bezeichnungen („Liebesfilm“, nicht „Romance“) - siehe Readable mit den Optionen.
        - Formatiere Begriffe korrekt (z.B. „Disney+“, nicht „Disney plus“).
        - Informiere den Nutzer über alles was du speicherst.
    `;

    const instructionsInitial = `
        ## Initiale Präferenzabfrage:
        - Wenn keine Präferenzen vorliegen:
          - Antwortet der Nutzer auf die erste Frage mit „nein“ oder „später“, antworte mit „Alles klar, melde dich einfach, wenn du soweit bist.“. Biete trotzdem Empfehlungen ohne gespeicherte Präferenzen an.
          - Antwortet der Nutzer mit „ja“, "beginnen" oder ähnlich, stelle nacheinander folgende Fragen und nenne jeweils alle verfügbaren Optionen aus denen der Nutzer auswählen kann:
            1. **Genres**: „Welche Genres schaust du am liebsten?“ (z.B. Thriller, Komödie, Sci-Fi). Speichere nur gültige Genre Optionen (siehe Readable - genreOptions) und nenne diese explizit.
            2. **Plattformen**: „Auf welchen Streaming-Plattformen schaust du normalerweise?“
            3. **Alter**: „Bist du über 18 Jahre alt?“  
               - Falls **unter 18**:
                 - Frage "Wie alt bist du?" Setze \`fskRating\` basierend auf Alter (0, 6, 12 oder 16). 
                 - Speichere \`ageRestriction = "always"\`   
                 - Überspringe Fragen zu Kindermitnutzung. Setze sofort \`initialInteractionCompleted = true\`.
               - Falls **über 18**:  
                 - Frage: „Schaust du manchmal, immer oder nie mit einem Kind? Wenn manchmal oder immer, wie alt ist dieses Kind?“  
                 - Bei „manchmal“ oder „immer“: setze \`fskRating\` entsprechend (0, 6, 12 oder 16).
                 - Bei "nie" setzte sofort \`ageRestriction = "never"\` und  \`initialInteractionCompleted = true\`.
          - Wenn du alle Fragen gestellt hast:
            - Setze sofort \`initialInteractionCompleted = true\`.
            - Teile dem Nutzer mit, dass er auf Basis der angegebenen Präferenzen nun Empfehlungen auf der Startseite sieht!
            - Frage: „Möchtest du noch weitere Empfehlungen?" biete die Filmdauer, den Veröffentlichungszeitraum und die Mindestbewertung einschränken zu können, wenn gewünscht. Die Mindestbewertung erwartet einen Wert zwischen 0 und 10, oder in Sternen gerechnet 0-5 wobei diese angabe dann für die suche verdoppelt werden muss 
            - Wechsle zur Empfehlungserstellung und stelle die dort beschriebenen Fragen.
    `;

    const instructionsRecommendation = `
        ## Empfehlungserstellung:
        - Der Nutzer wird bereits nach den gewünschten Genre/s gefragt, das musst du nicht tun. Reagiere auf die Antwort entsprechend:
          - Wenn der Nutzer konkrete Genres nennt → nutze sie.
          - Wenn er sich überraschen lassen will, etwas neues/anderes sehen will oder nichts nennt → verwende keine Genres.
          - Wenn er Empfehlungen auf Basis seiner gespeicherten Vorlieben möchte → nutze alle gespeicherten Genres.
        
        - Wenn nicht bereits erwähnt, frage das alles auf einmal (alle Optionen sind für den Nutzer freiwillig):
            - Wenn \`ageRestriction = "sometimes"\`:
              - Frage: „Schaust du heute mit einem Kind?“
                - Bei „ja“ → berücksichtige den gespeicherten \`fskRating\`.
                - Bei „nein“ → ignoriere FSK.
            - Frage nach der gewünschten Filmlänge:
              - Wenn eine konkrete Spanne genannt wird → verwende sie.
              - Wenn nur ein Wert genannt wird (z.B. „90 Minuten“) → rechne mit +/-10 Minuten als Spanne, außer es handelt sich um einen Maximal-Wert (dann wähle 0 bis genannter Wert)
            - Frage nach dem gewünschten Veröffentlichungszeitraum: verwende sie im Format YYYY-MM-DD
            - Frage nach der gewünschten Mindestbewertung: Wert 0-10 (oder in Sternen gesehen 0-5, dann unbedingt auf 0-10 umrechnen!)  
        
        - Danach:
          - Führe die Aktion \`getRecommendedMovies\` aus.
          - Gib die erhaltenen Filme **nicht direkt** aus.
          - Informiere den Nutzer:
              - Nutze \`useCopilotReadable\` mit description: „Die Genres, auf denen die aktuellen Empfehlungen basieren“ um dem Nutzer zu sagen auf welchen Genre/s die Empfehlungen basieren.
              - Dass die Empfehlungen auf der Startseite angezeigt werden.
              - Dass er dir zu den Empfehlungen gerne Fragen stellen kann.
              - Dass er über den „Mehr Details“-Button weitere Infos zum Film erhält.
              - Dass er den Chatbot schließen kann, aber über das Chatbot-Icon jederzeit zur Konversation zurückkehren kann.
    `;

    const fullInstructions = `
        ${baseInstructions}
        ${userPreferences.initialInteractionCompleted ? "" : instructionsInitial}
        ${instructionsRecommendation}
    `;


    return (
        <CopilotPopup
            labels={{
                title: "Dein Smart Streaming Assistent",
                initial: userPreferences?.initialInteractionCompleted
                    ? greetingMessage
                    : `Hallo ${userName} und herzlich willkommen bei Smart Streaming! Ich freue mich, dir passende Filme 
                       zu empfehlen. Darf ich dir ein paar Fragen zu deinem Geschmack stellen, damit ich dir gezieltere 
                        Vorschläge machen kann? Wenn du lieber später beginnen möchtest, ist das natürlich auch kein Problem.`
            }}
            instructions={fullInstructions}
            clickOutsideToClose={false}
            defaultOpen={!userPreferences.initialInteractionCompleted}
        />
    );
};

export default Chatbot;
