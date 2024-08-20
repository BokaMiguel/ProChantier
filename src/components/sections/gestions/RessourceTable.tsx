import React, { useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaRoute,
  FaChevronDown,
  FaChevronRight,
  FaFileExcel,
} from "react-icons/fa";
import { CSVImporter } from "csv-import-react"; // Assurez-vous que ce package est installé

interface ResourceTableProps {
  title: string;
  icon: React.ReactNode;
  items: any[];
  columns: string[];
  onAdd?: () => void;
  onEdit: (item: any) => void;
  onDelete?: (id: number, item: any) => void;
  renderSubItems?: (item: any) => React.ReactNode;
  onDistances?: () => void;
  onImportExcel?: (data: any[]) => void; // Ajoutez cette ligne
}

const ResourceTable: React.FC<ResourceTableProps> = ({
  title,
  icon,
  items,
  columns,
  onAdd,
  onEdit,
  onDelete,
  renderSubItems,
  onDistances,
  onImportExcel, // Ajoutez cette ligne
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  const filteredItems = items.filter((item) =>
    columns.some((column) => {
      const value = item[column.toLowerCase()];
      return (
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
  );

  const toggleExpand = (itemId: number) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const handleCsvSubmit = (data: any[]) => {
    if (onImportExcel) {
      onImportExcel(data);
    }
    setIsImporterOpen(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </h2>
        <div className="flex space-x-2">
          {title === "Lieux" && onImportExcel && (
            <>
              <button
                onClick={() => setIsImporterOpen(true)}
                className="bg-green-700 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <FaFileExcel />
                <span>Importer Excel</span>
              </button>
              <CSVImporter
                modalIsOpen={isImporterOpen}
                modalOnCloseTriggered={() => setIsImporterOpen(false)}
                darkMode={false}
                onComplete={handleCsvSubmit}
                template={{
                  columns: [
                    {
                      name: "Lieu",
                      key: "lieu",
                      required: true,
                      description: "Le nom du lieu",
                      suggested_mappings: ["Lieu", "Location"],
                    },
                    {
                      name: "Base A",
                      key: "base_a",
                      required: true,
                      description: "La première base",
                      suggested_mappings: ["Base A", "Base1"],
                    },
                    {
                      name: "Base B",
                      key: "base_b",
                      required: true,
                      description: "La deuxième base",
                      suggested_mappings: ["Base B", "Base2"],
                    },
                    {
                      name: "Distance Arrondie (M)",
                      key: "distance_arrondie",
                      data_type: "number",
                      description: "Distance arrondie en mètres",
                    },
                  ],
                }}
              />
            </>
          )}
          {onDistances && (
            <button
              onClick={onDistances}
              className="bg-orange-600 text-white px-4 py-2 rounded flex items-center space-x-2"
            >
              <FaRoute />
              <span>Distances</span>
            </button>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              <FaPlus />
            </button>
          )}
        </div>
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
            <React.Fragment key={index}>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                {columns.map((column, idx) => (
                  <td key={idx} className="px-4 py-2 border">
                    {title === "Lieux" && column === "nom" ? (
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="mr-2"
                        >
                          {expandedItemId === item.id ? (
                            <FaChevronDown />
                          ) : (
                            <FaChevronRight />
                          )}
                        </button>
                        {item[column.toLowerCase()]}
                      </div>
                    ) : (
                      item[column.toLowerCase()]
                    )}
                  </td>
                ))}
                <td className="px-4 py-2 border text-center">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 mr-2"
                  >
                    <FaEdit />
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id, item)}
                      className="text-red-600"
                    >
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
              {expandedItemId === item.id &&
                renderSubItems &&
                title === "Lieux" && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-2 border"
                    >
                      {renderSubItems(item)}
                    </td>
                  </tr>
                )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourceTable;
