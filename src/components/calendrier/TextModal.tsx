import React, { useState } from "react";

interface TextModalProps {
  title: string;
  value: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

const TextModal: React.FC<TextModalProps> = ({
  title,
  value,
  onSave,
  onClose,
}) => {
  const [text, setText] = useState(value);

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <textarea
          className="w-full p-2 border rounded"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSave}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextModal;
