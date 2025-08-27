import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchTrendingMovies } from "../lib/api-calls/movieApi";
import {genreMappingIds, platformMappingLabels, providerNameToFrontendLabel} from "@/app/constants";

export interface Movie {
    id: string;
    title: string;
    genres: string[];
    rating: number;
    posterUrl: string;
    detailsUrl: string;
    platforms?: string[];
}

interface TrendingMoviesContextProps {
    trendingMovies: any[];
    mappedTrendingMovies: Movie[];
    loadingTrends: boolean;
}

const TrendingMoviesContext = createContext<TrendingMoviesContextProps | undefined>(undefined);

export const TrendingMoviesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
    const [mappedTrendingMovies, setMappedTrendingMovies] = useState<Movie[]>([]); // Gemappte Daten
    const [loadingTrends, setLoadingTrends] = useState<boolean>(true);

    const extractPlatformNames = (movie: any): string[] => {
        if (!Array.isArray(movie.platforms)) return [];

        return movie.platforms
            .map((p: any) => providerNameToFrontendLabel[p.provider_name]) // mappe um
            .filter(
                (name: string | undefined) =>
                    !!name && Object.keys(platformMappingLabels).includes(name)
            );
    };


    // Mapping-Funktion für die gemappten Daten
    const mapTrendingMovies = (movies: any[]): Movie[] => {
        return movies.map((movie) => ({
            id: movie.id,
            title: movie.title || "Unbekannt",
            genres: movie.genre_ids
                ? movie.genre_ids.map((id: number) => genreMappingIds[id.toString()]).filter(Boolean)
                : [], // Filtert ungültige IDs aus
            rating: movie.vote_average / 2 || 0,
            posterUrl: `https://image.tmdb.org/t/p/w200${movie.poster_path}` || "",
            detailsUrl: `https://www.themoviedb.org/movie/${movie.id}`, // Link zur TMDb-Seite
            platforms: extractPlatformNames(movie),
        }));
    };

    useEffect(() => {
        const loadTrendingMovies = async () => {
            try {
                const response = await fetchTrendingMovies();
                const movies = response.movies;
                setTrendingMovies(movies);
                console.log("Trending Movies:", movies);

                // Mapping der Trending Movies
                const mappedMovies = mapTrendingMovies(movies);
                setMappedTrendingMovies(mappedMovies);
            } catch (error) {
                console.error("Fehler beim Laden der Trending Movies:", error);
            } finally {
                setLoadingTrends(false);
            }
        };

        loadTrendingMovies();
    }, []);

    return (
        <TrendingMoviesContext.Provider
            value={{
                trendingMovies,
                mappedTrendingMovies,
                loadingTrends,
            }}
        >
            {children}
        </TrendingMoviesContext.Provider>
    );
};

export const useTrendingMovies = () => {
    const context = useContext(TrendingMoviesContext);
    if (!context) {
        throw new Error("useTrendingMovies must be used within a TrendingMoviesProvider");
    }
    return context;
};
