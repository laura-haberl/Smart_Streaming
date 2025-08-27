"use client";

import React from "react";

interface UnsavedChangesModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({ show, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p className="warning">⚠️</p>
                <h2>Achtung!</h2>
                <p>Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?</p>
                <div className="modal-actions">
                    <button className="cancel-button" onClick={onCancel}>Abbrechen</button>
                    <button className="confirm-button" onClick={onConfirm}>Verlassen</button>
                </div>
            </div>
        </div>
    );
};

export default UnsavedChangesModal;
