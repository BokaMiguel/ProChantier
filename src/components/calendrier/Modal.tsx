import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  category: string | null;
  item: any;
  onClose: () => void;
  onSubmit: (item: any) => void;
  fonctions: { id: number; nom: string }[];
  equipements: { id: number; nom: string }[];
}

const Modal: React.FC<ModalProps> = ({
  category,
  item,
  onClose,
  onSubmit,
  fonctions,
  equipements,
}) => {
  const [formState, setFormState] = useState<any>(item || {});

  useEffect(() => {
    setFormState(item || {});
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "fonctionId") {
      const selectedFonction = fonctions.find((f) => f.nom === value);
      setFormState((prevState: any) => ({
        ...prevState,
        fonction: selectedFonction
          ? { nom: selectedFonction.nom }
          : { nom: "Non spécifié" },
      }));
    } else if (name === "equipementId") {
      const selectedEquipement = equipements.find((e) => e.nom === value);
      setFormState((prevState: any) => ({
        ...prevState,
        equipement: selectedEquipement
          ? { nom: selectedEquipement.nom }
          : { nom: "Non spécifié" },
      }));
    } else {
      setFormState((prevState: any) => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {item ? "Modifier" : `Ajouter ${category}`}
          </h2>
          <FaTimes className="cursor-pointer" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit}>
          {[
            "localisations",
            "lieux",
            "fonctions",
            "equipements",
            "materiaux",
          ].includes(category!) && (
            <div className="mb-4">
              <label className="block mb-1">Nom</label>
              <input
                type="text"
                name="nom"
                value={formState.nom || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-gray-300"
              />
            </div>
          )}

          {category === "employes" && (
            <>
              <div className="mb-4">
                <label className="block mb-1">Nom de l'employé</label>
                <input
                  type="text"
                  name="employe"
                  value={`${formState.prenom || ""} ${formState.nom || ""}`}
                  disabled
                  className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-gray-200"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Fonction</label>
                <select
                  name="fonctionId"
                  value={formState.fonction?.nom || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-gray-300"
                >
                  <option value="">
                    {formState.fonction?.nom
                      ? formState.fonction.nom.trim()
                      : "Sélectionner une fonction"}
                  </option>
                  {fonctions.map((f) => (
                    <option key={f.id} value={f.nom.trim()}>
                      {f.nom.trim()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Équipement</label>
                <select
                  name="equipementId"
                  value={formState.equipement?.nom || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300 bg-gray-300"
                >
                  <option value="">
                    {formState.equipement?.nom
                      ? formState.equipement.nom.trim()
                      : "Sélectionner un équipement"}
                  </option>
                  {equipements.map((e) => (
                    <option key={e.id} value={e.nom.trim()}>
                      {e.nom.trim()}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {item ? "Modifier" : `Ajouter ${category}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
