import { FaTimes, FaTrash } from "react-icons/fa";

const ConfirmDeleteModal: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
  itemName: string;
}> = ({ onConfirm, onCancel, itemName }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">
          Confirmation de suppression
        </h2>
        <p className="text-gray-700 mb-6">
          Êtes-vous sûr de vouloir supprimer{" "}
          <span className="font-bold">{itemName}</span> ? Cette action est
          irréversible.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
            onClick={onCancel}
          >
            <FaTimes className="mr-2" /> Annuler
          </button>
          <button
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            <FaTrash className="mr-2" /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
