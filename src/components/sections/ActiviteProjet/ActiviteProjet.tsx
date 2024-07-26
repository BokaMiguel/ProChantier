import React, { useState, useEffect, useRef } from "react";
import {
    FaMapMarkerAlt,
    FaCubes,
    FaMapSigns,
    FaTimes,
    FaPlusCircle,
} from "react-icons/fa";
import StatsGrid from "../StatsGrid";
import LocalisationModal from "./LocalisationModal";

interface Activite {
    id: number;
    nom: string;
    lieu: string;
    localisation: string;
    quantite: number;
}

interface User {
    id: number;
    nom: string;
}

const initialActivite: Activite = {
    id: 1,
    nom: "",
    lieu: "",
    localisation: "",
    quantite: 0,
};

const mockLieux = ["Site A", "Site B", "Site C", "Site D", "Site E"];

const ActiviteProjet: React.FC<{ users: User[] }> = ({ users }) => {
    const [activites, setActivites] = useState<Activite[]>([initialActivite]);
    const [nextId, setNextId] = useState(2);
    const [showModal, setShowModal] = useState(false);
    const [currentActiviteId, setCurrentActiviteId] = useState<number | null>(
        null
    );
    const [selectedLocalisations, setSelectedLocalisations] = useState<
        string[]
    >([]);
    const [savedLocalisations, setSavedLocalisations] = useState<string[]>([]);
    const [liaisonMode, setLiaisonMode] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [notes, setNotes] = useState("");

    const notesRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (notesRef.current) {
            notesRef.current.style.height = "auto";
            notesRef.current.style.height = `${notesRef.current.scrollHeight}px`;
        }
    }, [notes]);

    const handleAddActivite = () => {
        const newActivite: Activite = {
            id: nextId,
            lieu: "",
            localisation: "",
            quantite: 0,
            nom: "",
        };
        setActivites((prevActivites) => [...prevActivites, newActivite]);
        setNextId(nextId + 1);
    };

    const handleChange = (
        id: number,
        field: keyof Activite,
        value: string | number
    ) => {
        const updatedActivites = activites.map((activite) => {
            if (activite.id === id) {
                return { ...activite, [field]: value };
            }
            return activite;
        });
        setActivites(updatedActivites);
    };

    const openModal = (id: number) => {
        setCurrentActiviteId(id);
        const currentActivite = activites.find(
            (activite) => activite.id === id
        );
        if (currentActivite) {
            setSavedLocalisations(
                currentActivite.localisation
                    ? currentActivite.localisation.split(", ")
                    : []
            );
        }
        setSelectedLocalisations([]);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setLiaisonMode(false);
    };

    const handleLocalisationChange = () => {
        if (currentActiviteId !== null) {
            const localisation = savedLocalisations
                .map((loc) => (loc.includes("@") ? `(${loc})` : loc))
                .join(", ");
            handleChange(currentActiviteId, "localisation", localisation);
            closeModal();
        }
    };

    const deleteActivite = (id: number) => {
        setActivites((prevActivites) =>
            prevActivites.filter((activite) => activite.id !== id)
        );
    };

    const clearAllLocalisations = () => {
        setSelectedLocalisations([]);
        setSavedLocalisations([]);
        setShowConfirm(false);
    };

    const renderActivites = () => {
        return activites.map((activite, index) => (
            <div
                key={activite.id}
                className="border rounded p-4 mb-4 shadow-md flex flex-col space-y-4 relative"
            >
                <h3 className="text-lg font-bold">
                    Activité {index + 1}{" "}
                    {activite.nom && (
                        <span className="text-cyan-700">({activite.nom})</span>
                    )}
                    {index > 0 && (
                        <button
                            onClick={() => deleteActivite(activite.id)}
                            className="absolute top-2 right-2 text-zinc-500 hover:text-red-700"
                        >
                            <FaTimes />
                        </button>
                    )}
                </h3>
                <input
                    type="text"
                    placeholder="Nom de l'activité"
                    value={activite.nom}
                    onChange={(e) =>
                        handleChange(activite.id, "nom", e.target.value)
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <div className="grid grid-cols-12 gap-4 items-center">
                    <label className="col-span-2 flex items-center">
                        <FaMapSigns className="mr-2" />
                        Lieu:
                    </label>
                    <select
                        value={activite.lieu}
                        onChange={(e) =>
                            handleChange(activite.id, "lieu", e.target.value)
                        }
                        className="col-span-7 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Sélectionner un lieu</option>
                        {mockLieux.map((lieu, index) => (
                            <option key={index} value={lieu}>
                                {lieu}
                            </option>
                        ))}
                    </select>
                    <div className="col-span-3 flex items-center">
                        <FaCubes className="mr-2" />
                        <input
                            type="number"
                            placeholder="Quantité"
                            value={activite.quantite}
                            onChange={(e) =>
                                handleChange(
                                    activite.id,
                                    "quantite",
                                    parseFloat(e.target.value) || 0
                                )
                            }
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                </div>
                <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    <input
                        type="text"
                        placeholder="Localisation"
                        value={activite.localisation}
                        readOnly
                        onClick={() => openModal(activite.id)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline cursor-pointer"
                    />
                </div>
            </div>
        ));
    };

    return (
        <div className="p-4 w-full space-y-4">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Notes / Remarques
                </label>
                <textarea
                    ref={notesRef}
                    placeholder="Écrire une note ou une remarque."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="shadow-inner border border-gray-400 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none bg-gray-200"
                    style={{ overflow: "hidden" }}
                />
            </div>
            <StatsGrid
                users={users.map((user) => ({ id: user.id, nom: user.nom }))}
            />
            {renderActivites()}
            <button
                onClick={handleAddActivite}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded shadow flex items-center justify-center"
            >
                <FaPlusCircle className="mr-2" />
                Ajouter une activité
            </button>
            <LocalisationModal
                showModal={showModal}
                closeModal={closeModal}
                savedLocalisations={savedLocalisations}
                setSavedLocalisations={setSavedLocalisations}
                liaisonMode={liaisonMode}
                setLiaisonMode={setLiaisonMode}
                handleLocalisationChange={handleLocalisationChange}
                clearAllLocalisations={clearAllLocalisations}
            />
        </div>
    );
};

export default ActiviteProjet;
