import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  category: string | null;
  item: any;
  fonctions: string[];
  equipements: string[];
  onClose: () => void;
  onSubmit: (item: any) => void;
}

const Modal: React.FC<ModalProps> = ({
  category,
  item,
  fonctions,
  equipements,
  onClose,
  onSubmit,
}) => {
  const [formState, setFormState] = useState<any>(item || {});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState: any) => ({ ...prevState, [name]: value }));
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
          {["localisations", "lieux", "fonctions", "equipements"].includes(
            category!
          ) && (
            <>
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
