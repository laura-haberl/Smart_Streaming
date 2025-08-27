import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchRecommendations } from "@/lib/api-calls/movieApi";
import {genreMappingIds, genreMappingLabels, platformMappingLabels, providerNameToFrontendLabel} from "@/app/constants";
import { usePreferencesStore } from "@/lib/stores/preferencesStore";

export interface Movie {
    id: string;
    title: string;
    genres: string[];
    rating: number;
    posterUrl: string;
    detailsUrl: string;
    platforms?: string[];
}

interface StaticRecommendationsContextProps {
    staticRecommendations: any[];
    mappedRecommendationsStatic: Movie[];
    fetchStaticRecommendations: () => Promise<void>;
}

const StaticRecommendationsContext = createContext<StaticRecommendationsContextProps | undefined>(undefined);

export const StaticRecommendationsProvider: React.FC<{ children: React.ReactNode; userPreferences: any }> = ({ children, userPreferences }) => {
    const [staticRecommendations, setStaticRecommendations] = useState<any[]>([]);
    const [mappedRecommendationsStatic, setMappedRecommendationsStatic] = useState<Movie[]>([]);
    const preferencesUpdatedAt = usePreferencesStore((state) => state.preferencesUpdatedAt);

    const extractPlatformNames = (movie: any): string[] => {
        if (!Array.isArray(movie.platforms)) return [];

        return movie.platforms
            .map((p: any) => providerNameToFrontendLabel[p.provider_name]) // mappe um
            .filter(
                (name: string | undefined) =>
                    !!name && Object.keys(platformMappingLabels).includes(name)
            );
    };

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


    const fetchStaticRecommendations = async () => {
        if (!userPreferences) {
            console.error("Nutzerpräferenzen fehlen.");
            return;
        }

        console.log("pref", userPreferences);

        const genreIds = (userPreferences.genres || [])
            .map((genre: string) => genreMappingLabels[genre])
            .join("|");

        const platformIds = (userPreferences.platforms || [])
            .map((platform: string) => platformMappingLabels[platform])
            .join("|");


        const filters = {
            genre: genreIds,
            platform: platformIds,
            region: "DE",
            primary_language: userPreferences.primaryLanguage,
            secondary_language: userPreferences.secondaryLanguage,
            fsk: userPreferences.ageRestriction === "always" ? userPreferences.fskRating : null,
        };

        try {
            console.log("filter static", filters);
            const recommendations = await fetchRecommendations(filters);
            setStaticRecommendations(recommendations);
            setMappedRecommendationsStatic(mapRecommendations(recommendations));
        } catch (error) {
            console.error("Fehler beim Abrufen der statischen Empfehlungen:", error);
        }
    };

    useEffect(() => {
        if (userPreferences?.initialInteractionCompleted) {
            fetchStaticRecommendations();
        }
    }, [userPreferences?.initialInteractionCompleted, preferencesUpdatedAt]);


    return (
        <StaticRecommendationsContext.Provider
            value={{
                staticRecommendations,
                mappedRecommendationsStatic,
                fetchStaticRecommendations,
            }}
        >
            {children}
        </StaticRecommendationsContext.Provider>
    );
};

export const useStaticRecommendations = () => {
    const context = useContext(StaticRecommendationsContext);
    if (!context) {
        throw new Error("useStaticRecommendations must be used within a StaticRecommendationsProvider");
    }
    return context;
};
