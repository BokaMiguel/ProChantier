import React, { useState, useEffect } from "react";
import { FaUser, FaBriefcase, FaToolbox, FaTimes, FaPlusCircle } from "react-icons/fa";
import { Employe } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";

const InfoEmployes: React.FC<{
  users: Employe[];
  setUsers: React.Dispatch<React.SetStateAction<Employe[]>>;
}> = ({ users, setUsers }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);

  const { employees, fonctions, equipements } = useAuth();

  const handleAddUser = () => {
    if (employees && users.length < employees.length) {
      const newUser: Employe = {
        id: users.length + 1,
        nom: "",
        prenom: "",
        fonction: {
          id: null,
          nom: "",
        },
        equipement: {
          id: null,
          nom: "",
        },
      };
      setUsers((prevUsers: Employe[]) => [...prevUsers, newUser]);
    }
  };

  const handleChange = (
    id: number,
    field: keyof Employe | "fonction" | "equipement",
    value: string
  ) => {
    const updatedUsers = users.map((user) => {
      if (user.id === id) {
        if (field === "nom") {
          const selectedEmployee = employees?.find(
            (emp) => `${emp.prenom} ${emp.nom}` === value
          );
          return {
            ...user,
            nom: selectedEmployee?.nom || "",
            prenom: selectedEmployee?.prenom || "",
            fonction: selectedEmployee?.fonction || { id: null, nom: "" },
            equipement: selectedEmployee?.equipement || { id: null, nom: "" },
          };
        } else if (field === "fonction") {
          const selectedFonction = fonctions?.find((f) => f.nom === value);
          return {
            ...user,
            fonction: selectedFonction
              ? { id: selectedFonction.id, nom: selectedFonction.nom }
              : { id: null, nom: "" },
          };
        } else if (field === "equipement") {
          const selectedEquipement = equipements?.find((e) => e.nom === value);
          return {
            ...user,
            equipement: selectedEquipement
              ? { id: selectedEquipement.id, nom: selectedEquipement.nom }
              : { id: null, nom: "" },
          };
        } else {
          return { ...user, [field]: value };
        }
      }
      return user;
    });

    setUsers(updatedUsers);

    // Add a new row if an employee is selected and we haven't reached the maximum
    if (
      field === "nom" &&
      value !== "" &&
      users.length < (employees?.length || 0)
    ) {
      handleAddUser();
    }
  };

  const handleDeleteUser = (id: number) => {
    setShowConfirm(true);
    setUserIdToDelete(id);
  };

  const confirmDeleteUser = () => {
    if (userIdToDelete !== null) {
      const updatedUsers = users.map((user) =>
        user.id === userIdToDelete
          ? {
              ...user,
              nom: "",
              prenom: "",
              fonction: { id: null, nom: "" },
              equipement: { id: null, nom: "" },
            }
          : user
      );
      setUsers(updatedUsers);
    }
    setShowConfirm(false);
    setUserIdToDelete(null);
  };

  useEffect(() => {
    // If there are no users, add one empty user
    if (users.length === 0 && employees && employees.length > 0) {
      handleAddUser();
    }
  }, [users, employees]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaUser className="text-blue-600" />
                  </span>
                  Employé
                </label>
                <select
                  value={`${user.prenom} ${user.nom}`}
                  onChange={(e) => handleChange(user.id, "nom", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Sélectionner un employé</option>
                  {employees?.map((employee) => (
                    <option
                      key={employee.id}
                      value={`${employee.prenom} ${employee.nom}`}
                    >
                      {`${employee.prenom} ${employee.nom}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaBriefcase className="text-blue-600" />
                  </span>
                  Fonction
                </label>
                <select
                  value={user.fonction?.nom || ""}
                  onChange={(e) => handleChange(user.id, "fonction", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Sélectionner une fonction</option>
                  {fonctions?.map((fonction) => (
                    <option key={fonction.id} value={fonction.nom}>
                      {fonction.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-full mr-2">
                    <FaToolbox className="text-blue-600" />
                  </span>
                  Équipement
                </label>
                <select
                  value={user.equipement?.nom || ""}
                  onChange={(e) => handleChange(user.id, "equipement", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Sélectionner un équipement</option>
                  {equipements?.map((equipement) => (
                    <option key={equipement.id} value={equipement.nom}>
                      {equipement.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {users.length > 1 && (
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors duration-200"
                title="Supprimer l'employé"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        {employees && users.length < employees.length && (
          <button
            onClick={handleAddUser}
            className="w-full mt-4 py-3 px-4 bg-blue-50 text-blue-600 rounded-lg border-2 border-blue-100 hover:bg-blue-100 transition-all duration-200 flex items-center justify-center font-medium"
          >
            <FaPlusCircle className="mr-2" />
            Ajouter un employé
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmation</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet employé ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoEmployes;
