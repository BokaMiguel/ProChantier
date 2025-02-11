import React, { useState, useEffect } from "react";
import { FaUser, FaBriefcase, FaToolbox, FaTimes, FaPlusCircle } from "react-icons/fa";
import { Employe } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";

const InfoEmployes: React.FC<{
  users: Employe[];
  setUsers: React.Dispatch<React.SetStateAction<Employe[]>>;
  userStats: any[];
  setUserStats: (stats: any) => void;
}> = ({ users, setUsers, userStats, setUserStats }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);

  const { employees, fonctions, equipements } = useAuth();

  const handleAddUser = () => {
    if (employees && users.length < employees.length) {
      // Trouver le plus grand ID existant et ajouter 1
      const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
      const newUser: Employe = {
        id: maxId + 1,
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

  const handleDeleteUser = (id: number) => {
    setShowConfirm(true);
    setUserIdToDelete(id);
  };

  const confirmDeleteUser = () => {
    if (userIdToDelete !== null) {
      // Filtrer l'utilisateur au lieu de le vider
      const updatedUsers = users.filter((user) => user.id !== userIdToDelete);
      setUsers(updatedUsers);

      // Supprimer également les stats de l'utilisateur
      setUserStats({
        userStats: userStats.filter(stat => stat.id !== userIdToDelete)
      });
      
      setShowConfirm(false);
      setUserIdToDelete(null);
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
          // Vérifier si l'employé est déjà sélectionné dans la liste
          const isEmployeeAlreadySelected = users.some(
            (existingUser) =>
              existingUser.id !== id && // Ignorer l'utilisateur actuel
              `${existingUser.prenom} ${existingUser.nom}` === value
          );

          if (isEmployeeAlreadySelected) {
            return user;
          }

          // Si l'employé n'est pas déjà sélectionné, trouver ses informations
          const selectedEmployee = employees?.find(
            (emp) => `${emp.prenom} ${emp.nom}` === value
          );

          if (selectedEmployee) {
            return {
              ...user,
              id: selectedEmployee.id,
              nom: selectedEmployee.nom,
              prenom: selectedEmployee.prenom,
              fonction: selectedEmployee.fonction || { id: null, nom: "" },
              equipement: selectedEmployee.equipement || { id: null, nom: "" },
            };
          }
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

  useEffect(() => {
    // If there are no users, add one empty user
    if (users.length === 0 && employees && employees.length > 0) {
      const newUser: Employe = {
        id: Date.now(), // Utiliser timestamp pour éviter les conflits d'ID
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
      setUsers([newUser]);
    }
  }, [users.length, employees]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-12 gap-4 mb-4 px-6 text-sm font-semibold text-gray-600">
        <div className="col-span-4 flex items-center gap-2">
          <span className="bg-blue-100 p-1.5 rounded-lg">
            <FaUser className="text-blue-600 w-4 h-4" />
          </span>
          Employé
        </div>
        <div className="col-span-4 flex items-center gap-2">
          <span className="bg-blue-100 p-1.5 rounded-lg">
            <FaBriefcase className="text-blue-600 w-4 h-4" />
          </span>
          Fonction
        </div>
        <div className="col-span-3 flex items-center gap-2">
          <span className="bg-blue-100 p-1.5 rounded-lg">
            <FaToolbox className="text-blue-600 w-4 h-4" />
          </span>
          Équipement
        </div>
      </div>

      <div className="space-y-4">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <select
                  value={`${user.prenom} ${user.nom}`}
                  onChange={(e) => handleChange(user.id, "nom", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Sélectionner un employé</option>
                  {employees
                    ?.filter((employee) => {
                      const isAlreadySelected = users.some(
                        (selectedUser) =>
                          selectedUser.id !== user.id &&
                          selectedUser.nom === employee.nom &&
                          selectedUser.prenom === employee.prenom
                      );
                      return !isAlreadySelected;
                    })
                    .map((employee) => (
                      <option
                        key={employee.id}
                        value={`${employee.prenom} ${employee.nom}`}
                      >
                        {`${employee.prenom} ${employee.nom}`}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-span-4">
                <select
                  value={user.fonction?.nom || ""}
                  onChange={(e) => handleChange(user.id, "fonction", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Sélectionner une fonction</option>
                  {fonctions?.map((fonction) => (
                    <option key={fonction.id} value={fonction.nom}>
                      {fonction.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-3">
                <select
                  value={user.equipement?.nom || ""}
                  onChange={(e) => handleChange(user.id, "equipement", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Sélectionner un équipement</option>
                  {equipements?.map((equipement) => (
                    <option key={equipement.id} value={equipement.nom}>
                      {equipement.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        ))}

        {users.length < (employees?.length || 0) && (
          <button
            onClick={handleAddUser}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-600"
          >
            <FaPlusCircle className="inline-block mr-2" />
            {users.filter(user => user.nom && user.prenom).length} / {employees?.length || 0} employés
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <p className="text-gray-600 mb-6">Voulez-vous vraiment supprimer cet employé ?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
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
