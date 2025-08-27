export const fetchTrendingMovies = async () => {
    const response = await fetch('/api/trending-movies');
    if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Trending Movies");
    }
    return response.json();
};

export const fetchGenres = async () => {
    const response = await fetch('/api/genres');
    if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Genres");
    }
    return response.json();
};

export const fetchMoviesByGenre = async (genreId: string) => {
    const response = await fetch(`/api/movies-by-genre/${genreId}`);
    if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Movies");
    }

    const data = await response.json();
    console.log("Daten von der API:", data);
    return data;
};

export const fetchRecommendations = async (filters: any) => {
    const url = new URL("/api/recommendations", window.location.origin);

    if(filters.genre){
        url.searchParams.set('genre', filters.genre);
    }
    if(filters.platform){
        url.searchParams.set('platform', filters.platform);
    }
    if(filters.region){
        url.searchParams.set('region', filters.region);
    }
    if(filters.primary_language){
        url.searchParams.set('primary_language', filters.primary_language);
    }
    if(filters.secondary_language){
        url.searchParams.set('secondary_language', filters.secondary_language);
    }
    if(filters.fsk){
        url.searchParams.set('fsk', filters.fsk);
    }
    if(filters.runtime_gte){
        url.searchParams.set('runtimeMin', filters.runtime_gte);
    }
    if(filters.runtime_lte){
        url.searchParams.set('runtimeMax', filters.runtime_lte);
    }
    if(filters.vote_average_gte){
        url.searchParams.set('voteMin', filters.vote_average_gte);
    }
    if(filters.release_date_gte){
        url.searchParams.set('releaseDateMin', filters.release_date_gte);
    }
    if(filters.release_date_lte){
        url.searchParams.set('releaseDateMax', filters.release_date_lte);
    }




    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Filme');
        }

        const data = await response.json();
        console.log('Empfohlene Filme:', data);
        return data;
    } catch (error) {
        console.error('Fehler bei der API-Anfrage:', error);
        throw error;
    }
};
