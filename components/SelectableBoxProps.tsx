"use client";

import React, { useState, useEffect } from "react";

interface SelectableBoxProps {
    items: string[]; // Die auswählbaren Elemente (z. B. Genres, Plattformen)
    title: string; // Der Titel (z. B. "Genres", "Plattformen")
    icon: React.ReactNode; // Ein Icon für die Box (z. B. 🎭 oder 📺)
    selectedItems: string[]; // Bereits ausgewählte Elemente
    onSave: (selectedItems: string[]) => void; // Callback-Funktion beim Speichern
    onUnsavedChanges: (hasUnsavedChanges: boolean) => void; //Callback für ungespeicherte Änderungen
}

const SelectableBox: React.FC<SelectableBoxProps> = ({
                                                         items,
                                                         title,
                                                         icon,
                                                         selectedItems: initialSelectedItems,
                                                         onSave,
                                                         onUnsavedChanges,
                                                     }) => {
    const [selectedItems, setSelectedItems] = useState<string[]>(initialSelectedItems || []);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    // Synchronisiere initiale Auswahl, wenn sich die Prop ändert
    useEffect(() => {
        setSelectedItems(initialSelectedItems);
        setUnsavedChanges(false); // Nach dem Speichern zurücksetzen
        onUnsavedChanges(false); // Beim Laden sicherstellen, dass keine unsavedChanges gesetzt sind
    }, [initialSelectedItems, onUnsavedChanges]);

    // **Prüfen, ob sich die Auswahl geändert hat**
    useEffect(() => {
        const hasChanges = JSON.stringify(selectedItems) !== JSON.stringify(initialSelectedItems);
        setUnsavedChanges(hasChanges);
        onUnsavedChanges(hasChanges);
    }, [selectedItems, initialSelectedItems, onUnsavedChanges]);


    const toggleItem = (item: string) => {
        setSelectedItems((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item) // Entfernen
                : [...prev, item] // Hinzufügen
        );
    };

    const handleSave = () => {
        onSave(selectedItems);
        setUnsavedChanges(false);

        // Hier den ursprünglichen Zustand aktualisieren
        initialSelectedItems.length = 0;
        initialSelectedItems.push(...selectedItems);


        onUnsavedChanges(false); // Nach dem Speichern den Status zurücksetzen
    };


    return (
        <div className="profile-container">
            <div className="profile-header">
                <span className="profile-icon">{icon}</span>
                <h2 className="profile-title">{title}</h2>
            </div>
            <div style={styles.itemsContainer}>
                {items.map((item) => (
                    <div
                        key={item}
                        style={{
                            ...styles.item,
                            ...(selectedItems.includes(item) ? styles.selectedItem : {}),
                        }}
                        onClick={() => toggleItem(item)}
                    >
                        {item}
                    </div>
                ))}
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
    itemsContainer: {
        display: "flex",
        flexWrap: 'wrap' as 'wrap',
        gap: "10px",
        margin: "20px"
    },
    item: {
        padding: "10px 20px",
        borderRadius: "30px",
        backgroundColor: "#1e3757",
        cursor: "pointer",
        color: 'var(--text1)',
        border: "2px solid transparent",
        textAlign: 'center' as 'center',
        fontSize: "14px"
    },
    selectedItem: {
        border: "2px solid #FFF",
        color: "#FFF",
    }
};

export default SelectableBox;
