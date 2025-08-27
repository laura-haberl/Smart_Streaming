export const fetchTrendingMovies = async () => {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.TMDB_API_KEY}&language=de`
        );
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.status_message || "Failed to fetch trending movies");
        }

        if (!data.results || data.results.length === 0) {
            console.warn("Keine Trending Movies gefunden.");
            return [];
        }

        // Für jedes Trending Movie zusätzliche Details holen
        const moviesWithDetails = await Promise.all(
            data.results.map(async (movie) => {
                try {
                    const movieDetails = await fetchMovieDetails(movie.id);
                    return {
                        ...movie,
                        ...movieDetails, // Integriere die zusätzlichen Details in das Film-Objekt
                    };
                } catch (error) {
                    console.error(`Fehler beim Abrufen der Details für Film ID ${movie.id}:`, error);
                    return null; // Überspringe Filme, die fehlerhaft sind
                }
            })
        );

        // Entferne null-Werte, falls ein Film nicht verarbeitet werden konnte
        return moviesWithDetails.filter(movie => movie !== null);
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        return []; // Rückgabe eines leeren Arrays im Fehlerfall
    }
};


export const fetchGenres = async () => {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=de`
        );
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.status_message || "Failed to fetch genres");
        }
        return data.genres; // Rückgabe der Genres
    } catch (error) {
        console.error("Error fetching genres:", error);
        return []; // Rückgabe eines leeren Arrays im Fehlerfall
    }
};

export const fetchMoviesByGenre = async (genreId: string) => {
    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&api_key=${process.env.TMDB_API_KEY}&language=de`
        );
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
};

export const fetchRecommendations = async (filters) => {
    //const today = new Date().toISOString().split("T")[0];

    const baseUrl = new URL("https://api.themoviedb.org/3/discover/movie");
    baseUrl.searchParams.set("api_key", process.env.TMDB_API_KEY);
    baseUrl.searchParams.set("language", "DE");
    baseUrl.searchParams.set("region", filters.region);


    if(filters.genre){
        baseUrl.searchParams.set("with_genres", filters.genre);
    }

    if (filters.fsk) {
        let certifications = filters.fsk;

        if (filters.fsk === "16") {
            certifications = "16|12|6|0";
        } else if (filters.fsk === "12") {
            certifications = "12|6|0";
        } else if (filters.fsk === "6") {
            certifications = "6|0";
        } else if (filters.fsk === "0") {
            certifications = "0";
        }

        baseUrl.searchParams.set("certification", certifications);
        baseUrl.searchParams.set("certification_country", "DE");
    }

    if (filters.runtime) {
        baseUrl.searchParams.set("with_runtime.gte", filters.runtime.min);
        baseUrl.searchParams.set("with_runtime.lte", filters.runtime.max);
    }

    if(filters.voteMin) {
        baseUrl.searchParams.set("vote_average.gte", filters.voteMin);
    }

    if(filters.releaseDate){
        baseUrl.searchParams.set("release_date.gte", filters.releaseDate.min);
        baseUrl.searchParams.set("release_date.lte", filters.releaseDate.max);
    }

    try {
        // 1. Erster Request um total_pages zu bekommen
        const firstResponse = await fetch(`${baseUrl.toString()}&page=1`);
        if (!firstResponse.ok) {
            throw new Error('Fehler beim Abrufen der Empfehlungen (erster Request)');
        }
        const firstData = await firstResponse.json();

        if (!firstData.results || firstData.results.length === 0) {
            console.warn("Keine Filme gefunden.");
            return [];
        }

        let totalPages = firstData.total_pages;

        // OPTIONAL: Begrenze totalPages auf maximal 500 (TMDb API Limit, empfohlen)
        if (totalPages > 500) {
            totalPages = 500;
        }

        // 2. Zufällige Seite wählen
        let randomPage = Math.floor(Math.random() * totalPages) + 1;

        //falls randomPages die letzte Seite ist, würde Nutzer vielleicht nur 2 statt 20 Empfehlungen bekommen -> vermeiden
        if(randomPage == totalPages){
            randomPage = randomPage - 1;
        }


        // 3. Zweiter Request mit zufälliger Seite
        const randomPageResponse = await fetch(`${baseUrl.toString()}&page=${randomPage}`);
        if (!randomPageResponse.ok) {
            throw new Error('Fehler beim Abrufen der Empfehlungen (zweiter Request)');
        }
        const randomPageData = await randomPageResponse.json();

        // --- ab hier dein normaler Code wie bisher ---
        const userLanguages = [filters.primary_language, filters.secondary_language];

        const moviesWithDetails = await Promise.all(
            randomPageData.results.map(async (movie) => {
                const movieDetails = await fetchMovieDetails(movie.id);

                if (filters.fsk && (!movieDetails.fsk || movieDetails.fsk === "")) {
                    return null;
                }

                const spokenLanguages = movieDetails.spoken_languages.map(lang => lang.iso_639_1);
                const isLanguageMatch = spokenLanguages.some(lang => userLanguages.includes(lang));

                if (true) {
                    return {
                        ...movie,
                        ...movieDetails,
                    };
                }

                return null;
            })
        );

        return moviesWithDetails.filter(movie => movie !== null);

    } catch (error) {
        console.error('Fehler bei der API-Anfrage:', error);
        throw error;
    }
};


export const fetchMovieDetails = async (movieId) => {
    const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Details für Film ID ${movieId}`);
        }

        const movieDetails = await response.json();

        const releaseData = await fetchMovieReleaseData(movieId);
        const platformData = await fetchMoviePlatformData(movieId);

        return {
            ...movieDetails,
            fsk: releaseData,
            platforms: platformData,
        };

    } catch (error) {
        console.error("Fehler bei der API-Anfrage für Filmdetails:", error);
        throw error;
    }
};

// Funktion für Release-Daten, um FSK zu bekommen
export const fetchMovieReleaseData = async (movieId) => {
    const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}/release_dates`);
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Release-Daten für Film ID ${movieId}`);
        }

        const releaseData = await response.json();

        // Finde FSK für Deutschland
        const germanRelease = releaseData.results.find(result => result.iso_3166_1 === 'DE');
        const fskCertification = germanRelease ? germanRelease.release_dates[0].certification : null;

        return fskCertification;
    } catch (error) {
        console.error("Fehler bei der API-Anfrage für Release-Daten:", error);
        throw error;
    }
};


export const fetchMoviePlatformData = async (movieId) => {
    const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers`);
    url.searchParams.set("api_key", process.env.TMDB_API_KEY);

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Fehler beim Abrufen der Plattform-Daten für Film ID ${movieId}`);
        }

        const platformData = await response.json();

        // Plattformen pro Land holen (z.B. für DE)
        const dePlatformData = platformData.results['DE'];
        return dePlatformData ? dePlatformData.buy || dePlatformData.rent : [];

    } catch (error) {
        console.error("Fehler bei der API-Anfrage für Plattform-Daten:", error);
        throw error;
    }
};