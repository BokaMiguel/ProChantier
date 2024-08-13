import React, { useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";

interface ResourceTableProps {
  title: string;
  icon: React.ReactNode;
  items: any[];
  columns: string[];
  onAdd?: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

const ResourceTable: React.FC<ResourceTableProps> = ({
  title,
  icon,
  items,
  columns,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredItems = items.filter((item) =>
    columns.some((column) =>
      item[column.toLowerCase()]
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </h2>
        {onAdd && (
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            <FaPlus />
          </button>
        )}
      </div>
      <div className="flex mb-4">
        <FaSearch className="mr-2" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border-gray-300"
        />
      </div>
      <table className="min-w-full bg-white border rounded-lg shadow-md">
        <thead className="bg-gray-300 text-black">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="px-4 py-2 border">
                {column.charAt(0).toUpperCase() + column.slice(1)}
              </th>
            ))}
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => (
            <tr
              key={index}
              className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
            >
              {columns.map((column, idx) => (
                <td key={idx} className="px-4 py-2 border">
                  {item[column.toLowerCase()]}
                </td>
              ))}
              <td className="px-4 py-2 border text-center">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 mr-2"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourceTable;
