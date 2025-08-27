import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchUserPreferences } from "../lib/api-calls/userPreferencesApi";

interface UserPreferencesContextProps {
    userPreferences: any | null;
    loading: boolean;
    refreshing: boolean;
    refreshPreferences: () => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextProps | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({ userId, children }) => {
    const [userPreferences, setUserPreferences] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const loadPreferences = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchUserPreferences(userId);
            setUserPreferences(data.userPreferences || {});

        } catch (error) {
            console.error("Fehler beim Laden der Benutzerpräferenzen:", error);
            setUserPreferences({});

        } finally {
            setLoading(false);
        }
    }, [userId]);

    const refreshPreferences = useCallback(async () => {
        try {
            setRefreshing(true);
            const data = await fetchUserPreferences(userId);
            setUserPreferences(data.userPreferences || {});

        } catch (error) {
            console.error("Fehler beim Aktualisieren der Benutzerpräferenzen:", error);
        } finally {
            setRefreshing(false);
        }
    }, [userId]);


    useEffect(() => {
        loadPreferences();
    }, [userId, loadPreferences]);

    return (
        <UserPreferencesContext.Provider
            value={{
                userPreferences,
                loading,
                refreshing,
                refreshPreferences,
            }}
        >
            {children}
        </UserPreferencesContext.Provider>
    );
};

export const useUserPreferences = () => {
    const context = useContext(UserPreferencesContext);
    if (!context) {
        throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
    }
    return context;
};
