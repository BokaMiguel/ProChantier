import React, { useState } from "react";

interface ModalProps {
  notes: string;
  onSave: (notes: string) => void;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ notes, onSave, onClose }) => {
  const [currentNotes, setCurrentNotes] = useState<string>(notes);

  const handleSave = () => {
    onSave(currentNotes);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Ajouter des notes</h2>
        <textarea
          className="border rounded w-full py-2 px-3"
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          rows={5}
        ></textarea>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
