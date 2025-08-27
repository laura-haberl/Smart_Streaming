import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchGenres } from "../lib/api-calls/movieApi";

interface Genre {
    id: number;
    name: string;
}

interface GenresContextProps {
    genres: Genre[];
    loadingGenres: boolean;
}

const GenresContext = createContext<GenresContextProps | undefined>(undefined);

export const GenresProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loadingGenres, setLoadingGenres] = useState<boolean>(true);

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const data = await fetchGenres();
                setGenres(data.genres || []);
            } catch (error) {
                console.error("Fehler beim Laden der Genres:", error);
            } finally {
                setLoadingGenres(false);
            }
        };

        loadGenres();
    }, []);

    return (
        <GenresContext.Provider value={{ genres, loadingGenres }}>
            {children}
        </GenresContext.Provider>
    );
};

export const useGenres = () => {
    const context = useContext(GenresContext);
    if (!context) {
        throw new Error("useGenres must be used within a GenresProvider");
    }
    return context;
};
