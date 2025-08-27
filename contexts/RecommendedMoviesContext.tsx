import React, { createContext, useContext, useState } from "react";
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

interface RecommendedMoviesContextProps {
    recommendedMoviesDynamic: any[];
    mappedRecommendationsDynamic: Movie[];
    setRecommendedMoviesDynamic: (movies: any[]) => void;
}

const RecommendedMoviesContext = createContext<RecommendedMoviesContextProps | undefined>(undefined);

export const RecommendedMoviesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [recommendedMoviesDynamic, setRecommendedMovies] = useState<any[]>([]);
    const [mappedRecommendationsDynamic, setMappedRecommendationsDynamic] = useState<Movie[]>([]);

    console.log("Recommended Movies in Context:", recommendedMoviesDynamic);

    const extractPlatformNames = (movie: any): string[] => {
        if (!Array.isArray(movie.platforms)) return [];

        return movie.platforms
            .map((p: any) => providerNameToFrontendLabel[p.provider_name]) // mappe um
            .filter(
                (name: string | undefined) =>
                    !!name && Object.keys(platformMappingLabels).includes(name)
            );
    };

    // Mapping-Funktion für empfohlene Filme
    const mapRecommendations = (movies: any[]): Movie[] => {
        return movies.map((movie) => ({
            id: movie.id,
            title: movie.title || "Unbekannt",
            genres: movie.genre_ids
                ? movie.genre_ids.map((id: number) => genreMappingIds[id.toString()]).filter(Boolean)
                : [],
            rating: movie.vote_average / 2 || 0,
            posterUrl: movie.poster_path
                ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                : "",
            detailsUrl: `https://www.themoviedb.org/movie/${movie.id}`,
            platforms: extractPlatformNames(movie),
        }));
    };

    // Setzen und Mappen der Empfehlungen
    const setRecommendedMoviesDynamic = (movies: any[]) => {
        setRecommendedMovies(movies);
        const mappedMovies = mapRecommendations(movies);
        setMappedRecommendationsDynamic(mappedMovies);
    };

    return (
        <RecommendedMoviesContext.Provider
            value={{
                recommendedMoviesDynamic,
                mappedRecommendationsDynamic,
                setRecommendedMoviesDynamic
            }}
        >
            {children}
        </RecommendedMoviesContext.Provider>
    );
};

export const useRecommendedMovies = () => {
    const context = useContext(RecommendedMoviesContext);
    if (!context) {
        throw new Error("useRecommendedMovies must be used within a RecommendedMoviesProvider");
    }
    return context;
};
