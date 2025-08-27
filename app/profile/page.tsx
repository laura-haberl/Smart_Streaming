"use client";

import React, {useState, useEffect, useCallback, useMemo} from "react";
import SelectableBox from "../../components/SelectableBoxProps";
import DropdownBox from "@/components/DropdownBoxProps";
import { fetchUserPreferences, patchUserPreferences } from "../../lib/api-calls/userPreferencesApi";
import { userId, platforms, ageRestriction, fskRating, ageRestrictionLabels, fskRatingLabels, languages, languageLabels } from '../constants';
import {fetchGenres} from "@/lib/api-calls/movieApi";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import {useGenres} from "@/contexts/GenresContext";
import {useRouter} from "next/navigation";
import { usePathname } from "next/navigation";
import UnsavedChangesModal from "@/components/UnsavedChangesModal";


const Profile: React.FC = () => {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [selectedPrimaryLanguage, setSelectedPrimaryLanguage] = useState<string>("");
    const [selectedSecondaryLanguage, setSelectedSecondaryLanguage] = useState<string>("");
    const [selectedAgeRestriction, setSelectedAgeRestriction] = useState<string>("");
    const [selectedFskRating, setSelectedFskRating] = useState<string>("");
    const { userPreferences, loading } = useUserPreferences();
    const { genres, loadingGenres } = useGenres();

    const currentLanguageSettings = useMemo(() => ({
        firstDropdown: selectedPrimaryLanguage,
        secondDropdown: selectedSecondaryLanguage,
    }), [selectedPrimaryLanguage, selectedSecondaryLanguage]);

    const currentAgeRestrictionSettings = useMemo(() => ({
        firstDropdown: selectedAgeRestriction,
        secondDropdown: selectedFskRating,
    }), [selectedAgeRestriction, selectedFskRating]);


    const router = useRouter();
    const pathname = usePathname(); //Aktuelle Seite überwachen

    //Unsaved States für Änderungen
    const [unsavedSelectableChanges, setUnsavedSelectableChanges] = useState(false);
    const [unsavedDropdownChanges, setUnsavedDropdownChanges] = useState(false);
    const hasUnsavedChanges = unsavedSelectableChanges || unsavedDropdownChanges;

    const [showWarningModal, setShowWarningModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);


    // Konvertiere die internen Werte in angezeigte Labels
    const ageRestrictionDropdownOptions = ["Keine Auswahl", ...ageRestriction.map((value) => ageRestrictionLabels[value])];
    const fskDropdownOptions = ["Keine Auswahl", ...fskRating.map((value) => fskRatingLabels[value])];
    const languageDropdownOptions = ["Keine Auswahl", ...languages.map((value) => languageLabels[value])];

    // Umkehr-Labels für Sprachen
    const languageLabelsInverse: { [key: string]: string } = Object.fromEntries(
        Object.entries(languageLabels).map(([key, value]) => [value, key])
    );

    const ageRestrictionLabelsInverse: { [key: string]: string } = Object.fromEntries(
        Object.entries(ageRestrictionLabels).map(([key, value]) => [value, key])
    );

    const fskRatingLabelsInverse: { [key: string]: string } = Object.fromEntries(
        Object.entries(fskRatingLabels).map(([key, value]) => [value, key])
    );

    //Warnung bei Navigation in der App oder Browser-Zurück
    useEffect(() => {
        const handleRouteChange = (url: string) => {
            //selbe Seite
            if (url === pathname) {
                return; //Bricht ab, falls Ziel = aktuelle Seite
            }

            //ungespeicherte Änderungen
            if (hasUnsavedChanges) {
                setShowWarningModal(true);
                setPendingNavigation(url);
            }

            //keine ungespeicherten Änderungen, navigiert direkt
            else {
                router.push(url);
            }
        };

        //Browser Back
        const handlePopState = () => {
            if (hasUnsavedChanges) {
                setShowWarningModal(true);
                setPendingNavigation("back");

                //Blockiere den eigentlichen Browser-Back-Vorgang temporär
                window.history.pushState(null, "", window.location.href);
            }
        };

        const originalPush = router.push;
        router.push = async (...args) => {
            if (!hasUnsavedChanges || showWarningModal) {
                originalPush(...args);
                return;
            }
            handleRouteChange(args[0] as string);
        };

        //Browser-Back-Button fixen
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePopState);

        return () => {
            router.push = originalPush;
            window.removeEventListener("popstate", handlePopState);
        };
    }, [hasUnsavedChanges, pathname, router, showWarningModal]); // `showWarningModal` hinzugefügt

    //Navigation bestätigen
    const confirmNavigation = () => {
        setUnsavedSelectableChanges(false);
        setUnsavedDropdownChanges(false);
        setShowWarningModal(false);
    };

    //Navigation abbrechen
    const cancelNavigation = () => {
        setShowWarningModal(false);
        setPendingNavigation(null);
    };

    //Effect für Navigation nach Modal-Schließen
    useEffect(() => {
        if (!showWarningModal && pendingNavigation) {
            //Navigation zu vorheriger Seite
            if (pendingNavigation === "back") {
                const previousPage = sessionStorage.getItem("previousPage") || "/";
                router.push(previousPage);
            }

            //Navigation zu bestimmter Seite
            else {
                router.push(pendingNavigation);
            }
            setPendingNavigation(null); // Navigation wurde durchgeführt → Reset
        }
    }, [showWarningModal, pendingNavigation, router]); //useEffect springt an, wenn Modal geschlossen wurde


    //Warnung beim Verlassen der Seite (z. B. Tab schließen oder Neuladen)
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = ""; //Standard-Browser-Warnung aktivieren
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);


    //Ausgewählte Werte setzen
    useEffect(() => {
        if (!loading && userPreferences) {
            console.log("Benutzerpräferenzen aus der API:", userPreferences);
            setSelectedGenres(userPreferences.genres || []);
            setSelectedPlatforms(userPreferences.platforms || []);

            // Umwandlung der Sprachcodes in lesbare Form
            const primaryLanguage = userPreferences.primaryLanguage || "";
            const secondaryLanguage = userPreferences.secondaryLanguage || "";

            // Setze die Sprachen in den State, indem du die Codes in Labels umwandelst
            setSelectedPrimaryLanguage(languageLabels[primaryLanguage] || primaryLanguage); // Falls kein Label gefunden wird, setze den Code
            setSelectedSecondaryLanguage(languageLabels[secondaryLanguage] || secondaryLanguage);

            const ageRestriction = userPreferences.ageRestriction || "";
            const fskRating = userPreferences.fskRating || "";

            setSelectedAgeRestriction(ageRestrictionLabels[ageRestriction] || ageRestriction);
            setSelectedFskRating(fskRatingLabels[fskRating] || fskRating);
        }
    }, [loading, userPreferences]);


    // Ladezustand
    if (loading) {
        return <h1>Loading...</h1>;
    }


    const saveUserGenres = async (genres: string[]) => {
        try {
            await patchUserPreferences(userId, { genres }); // Aktualisiere nur die Genres
            console.log("Genres erfolgreich gepatcht!");
            setUnsavedSelectableChanges(false);
        } catch (error) {
            console.error("Fehler beim Patchen der Genres:", error);
        }
    };

    const saveUserPlatforms = async (platforms: string[]) => {
        try {
            await patchUserPreferences(userId, { platforms });
            console.log("Plattformen erfolgreich gepatcht!");
            setUnsavedSelectableChanges(false);
        } catch (error) {
            console.error("Fehler beim Patchen der Plattformen:", error);
        }
    };

    const saveUserLanguages = async (firstDropdown: string, secondDropdown: string) => {
        const primaryLanguage = languageLabelsInverse[firstDropdown] || "none";  // Umwandlung zurück zu Code
        const secondaryLanguage = languageLabelsInverse[secondDropdown] || "none";  // Umwandlung zurück zu Code

        console.log(primaryLanguage);
        console.log(secondaryLanguage);
        try {
            await patchUserPreferences(userId, { primaryLanguage, secondaryLanguage });
            console.log("Sprachen erfolgreich gepatcht!");
            setUnsavedDropdownChanges(false);
        } catch (error) {
            console.error("Fehler beim Patchen der Sprachen:", error);
        }
    };

    const saveAgeRestriction = async (firstDropdown: string, secondDropdown: string) => {
        const ageRestriction = ageRestrictionLabelsInverse[firstDropdown] || "none";
        const fskRating = fskRatingLabelsInverse[secondDropdown] || "none";

        console.log(ageRestriction);
        console.log(fskRating);
        try {
            await patchUserPreferences(userId, { ageRestriction, fskRating });
            console.log("Altersfreigabe erfolgreich gepatcht!");
            setUnsavedDropdownChanges(false);
        } catch (error) {
            console.error("Fehler beim Patchen der Sprachen:", error);
        }
    };

    return (
        <div className="settings-container">
            {/* Navigation */}
            <nav className="settings-nav">
                <ul>
                    <li><a href="#genres">🎭 Genres</a></li>
                    <li><a href="#platforms">📺 Plattformen</a></li>
                    {/*<li><a href="#languages">🌍 Sprachen</a></li>-->*/}
                    <li><a href="#age-restriction">👶 Altersfreigabe</a></li>
                </ul>
            </nav>

            {/* Einstellungselemente */}
            <div className="settings-content">
                <section id="genres">
                    <SelectableBox
                        items={genres.map((genre) => genre.name)}
                        title="Genres"
                        icon="🎭"
                        selectedItems={selectedGenres}
                        onSave={saveUserGenres}
                        onUnsavedChanges={setUnsavedSelectableChanges}
                    />
                </section>

                <section id="platforms">
                    <SelectableBox
                        items={platforms}
                        title="Plattformen"
                        icon="📺"
                        selectedItems={selectedPlatforms}
                        onSave={saveUserPlatforms}
                        onUnsavedChanges={setUnsavedSelectableChanges}
                    />
                </section>


                {/*
                <section id="languages">
                    <DropdownBox
                        title="Sprachen"
                        icon={<span>🌍</span>}
                        firstDropdownOptions={languageDropdownOptions}
                        secondDropdownOptions={languageDropdownOptions}
                        firstDropdownLabel="Hauptsprache"
                        secondDropdownLabel="Zweitsprache"
                        currentSettings={currentLanguageSettings}
                        onSave={(firstDropdown, secondDropdown) => {
                            saveUserLanguages(firstDropdown, secondDropdown);
                        }}
                        onUnsavedChanges={setUnsavedDropdownChanges}
                    />
                </section>
                */}



                <section id="age-restriction">
                    <DropdownBox
                        id="age-restriction"
                        title="Altersfreigabe"
                        icon={<span>👶</span>}
                        firstDropdownOptions={ageRestrictionDropdownOptions}
                        secondDropdownOptions={fskDropdownOptions}
                        firstDropdownLabel="Kinder berücksichtigen"
                        secondDropdownLabel="Altersfreigabe"
                        currentSettings={currentAgeRestrictionSettings}
                        onSave={(firstDropdown, secondDropdown) => {
                            console.log(firstDropdown, secondDropdown);
                            if ((firstDropdown === "" && secondDropdown !== "") || (firstDropdown === "Nein" && secondDropdown !== "")) {
                                console.log("Fehler: Eine FSK-Auswahl kann nur berücksichtigt werden, wenn Kinder manchmal oder immer berücksichtigt werden sollen.")
                            } else {
                                saveAgeRestriction(firstDropdown, secondDropdown);
                            }
                        }}
                        onUnsavedChanges={setUnsavedDropdownChanges}
                    />
                </section>
            </div>

            <UnsavedChangesModal
                show={showWarningModal}
                onConfirm={confirmNavigation}
                onCancel={cancelNavigation}
            />
        </div>
    );
};

export default Profile;
