import React from 'react';
import { FaEdit, FaFileExport, FaPaperPlane } from "react-icons/fa";

interface ActionButtonsProps {
  journalId: number;
  handleEdit: (id: number) => void;
  handleExport: (id: number) => void;
  handleSend: (id: number) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ journalId, handleEdit, handleExport, handleSend }) => (
  <div className="flex justify-center space-x-2">
    <button onClick={() => handleEdit(journalId)}>
      <FaEdit className="text-blue-500" />
    </button>
    <button onClick={() => handleExport(journalId)}>
      <FaFileExport className="text-green-500" />
    </button>
    <button onClick={() => handleSend(journalId)}>
      <FaPaperPlane className="text-red-500" />
    </button>
  </div>
);

export default ActionButtons;
