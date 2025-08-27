"use client";

import React, { useState, useEffect } from "react";

interface DropdownBoxProps {
    title: string; // Der Titel (z. B. "Altersfreigabe", "Sprachen")
    icon: React.ReactNode; // Ein Icon für die Box (z. B. 🎭 oder 🌍)
    firstDropdownOptions: string[]; // Optionen für das erste Dropdown (z. B. "Ja, immer", "Ja, manchmal", "Nein" oder Sprachen)
    secondDropdownOptions: string[]; // Optionen für das zweite Dropdown (z. B. "FSK 0", "FSK 6", "FSK 12", "FSK 16" oder Sprachen)
    firstDropdownLabel: string; // Beschriftung für das erste Dropdown
    secondDropdownLabel: string; // Beschriftung für das zweite Dropdown
    currentSettings: { firstDropdown: string; secondDropdown: string }; // Aktuelle Auswahl aus der DB
    onSave: (firstDropdown: string, secondDropdown: string) => void; // Callback-Funktion zum Speichern
    onUnsavedChanges?: (hasChanges: boolean) => void;
}

const DropdownBox: React.FC<DropdownBoxProps> = ({
                                                     title,
                                                     icon,
                                                     firstDropdownOptions,
                                                     secondDropdownOptions,
                                                     firstDropdownLabel,
                                                     secondDropdownLabel,
                                                     currentSettings,
                                                     onSave,
                                                     onUnsavedChanges,
                                                 }) => {
    const [firstDropdownValue, setFirstDropdownValue] = useState<string>(currentSettings.firstDropdown);
    const [secondDropdownValue, setSecondDropdownValue] = useState<string>(currentSettings.secondDropdown);
    const [unsavedChanges, setUnsavedChanges] = useState(false);


    // **Synchronisiere initiale Auswahl**
    useEffect(() => {
        if (
            currentSettings.firstDropdown !== firstDropdownValue ||
            currentSettings.secondDropdown !== secondDropdownValue
        ) {
            setFirstDropdownValue(currentSettings.firstDropdown);
            setSecondDropdownValue(currentSettings.secondDropdown);
            setUnsavedChanges(false);
            if (onUnsavedChanges) onUnsavedChanges(false);
        }
    }, [currentSettings]);



    // **Überwache Änderungen**
    useEffect(() => {
        const hasChanges =
            firstDropdownValue !== currentSettings.firstDropdown ||
            secondDropdownValue !== currentSettings.secondDropdown;

        if (onUnsavedChanges) onUnsavedChanges(hasChanges);
        setUnsavedChanges(hasChanges);
    }, [firstDropdownValue, secondDropdownValue, currentSettings]);


    const handleSave = () => {
        onSave(firstDropdownValue, secondDropdownValue);
        setUnsavedChanges(false);

        // Hier den ursprünglichen Zustand aktualisieren
        currentSettings.firstDropdown = firstDropdownValue;
        currentSettings.secondDropdown = secondDropdownValue;

        if (onUnsavedChanges) onUnsavedChanges(false);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <span className="profile-icon">{icon}</span>
                <h2 className="profile-title">{title}</h2>
            </div>
            <div style={styles.dropdownContainer}>
                <div style={styles.dropdownRow}>
                    <label style={styles.label}>{firstDropdownLabel}</label>
                    <select
                        value={firstDropdownValue}
                        onChange={(e) => setFirstDropdownValue(e.target.value)}
                        style={styles.dropdown}
                    >
                        {firstDropdownOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.dropdownRow}>
                    <label style={styles.label}>{secondDropdownLabel}</label>
                    <select
                        value={secondDropdownValue}
                        onChange={(e) => setSecondDropdownValue(e.target.value)}
                        style={styles.dropdown}
                    >
                        {secondDropdownOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="profile-footer">
                <button
                    className={`saveButton ${unsavedChanges ? "active-button" : "disabled-button"}`}
                    onClick={handleSave}
                    disabled={!unsavedChanges}
                >
                    {unsavedChanges ? "Speichern" : "Gespeichert"}
                </button>

            </div>
        </div>
    );
};

const styles = {
    dropdownContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        margin: "20px"
    },
    dropdownRow: {
        display: "flex",
        flexDirection: "column",
    },
    label: {
        marginBottom: "5px",
        fontSize: "16px",
        fontWeight: "600"
    },
    dropdown: {
        padding: "6px",
        backgroundColor: 'var(--text1)',
        color: 'var(--background)',
        borderRadius: "5px",
        border: "none",
        fontSize: "14px"
    }
};

export default DropdownBox;
