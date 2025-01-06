import React, { useState, useEffect } from "react";
import { FaUser, FaBriefcase, FaToolbox, FaTimes } from "react-icons/fa";
import { Employe } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";

const InfoEmployes: React.FC<{
  users: Employe[];
  setUsers: React.Dispatch<React.SetStateAction<Employe[]>>;
}> = ({ users, setUsers }) => {
  const [showModal, setShowModal] = useState(false);
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
    setShowModal(true);
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
    setShowModal(false);
    setUserIdToDelete(null);
  };

  useEffect(() => {
    // If there are no users, add one empty user
    if (users.length === 0 && employees && employees.length > 0) {
      handleAddUser();
    }
  }, [users, employees]);

  const renderUserRows = () => {
    return users.map((user) => (
      <div key={user.id} className="grid grid-cols-10 gap-4 mb-4 items-center">
        <select
          value={user.nom && user.prenom ? `${user.prenom} ${user.nom}` : ""}
          onChange={(e) => handleChange(user.id, "nom", e.target.value)}
          className="col-span-3 border rounded px-2 py-1 w-full"
        >
          <option value=""></option>
          {employees
            ?.filter(
              (emp) =>
                !users.some(
                  (u) =>
                    u.id !== user.id &&
                    u.nom === emp.nom &&
                    u.prenom === emp.prenom &&
                    u.nom !== "" &&
                    u.prenom !== ""
                )
            )
            .map((emp, index) => (
              <option key={index} value={`${emp.prenom} ${emp.nom}`}>
                {`${emp.prenom} ${emp.nom}`}
              </option>
            ))}
        </select>
        <select
          value={user.fonction?.nom || ""}
          onChange={(e) => handleChange(user.id, "fonction", e.target.value)}
          className="col-span-3 border rounded px-2 py-1 w-full"
        >
          <option value=""></option>
          {fonctions?.map((f) => (
            <option key={f.id} value={f.nom}>
              {f.nom}
            </option>
          ))}
        </select>
        <select
          value={user.equipement?.nom || ""}
          onChange={(e) => handleChange(user.id, "equipement", e.target.value)}
          className="col-span-3 border rounded px-2 py-1 w-full"
        >
          <option value=""></option>
          {equipements?.map((e) => (
            <option key={e.id} value={e.nom}>
              {e.nom}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleDeleteUser(user.id)}
          className="col-span-1 hover:text-red-700 flex items-center justify-center"
        >
          <FaTimes />
        </button>
      </div>
    ));
  };

  return (
    <div className="p-4 w-full">
      <div className="grid grid-cols-10 gap-4 mb-4 font-bold">
        <div className="col-span-3 flex items-center justify-center">
          <FaUser className="mr-2" /> Nom
        </div>
        <div className="col-span-3 flex items-center justify-center">
          <FaBriefcase className="mr-2" /> Fonction
        </div>
        <div className="col-span-3 flex items-center justify-center">
          <FaToolbox className="mr-2" /> Équipement
        </div>
        <div className="col-span-1"></div>
      </div>
      {renderUserRows()}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-bold mb-4">Confirmer la Suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cet utilisateur?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded mr-2"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteUser}
                className="bg-red-500 text-white py-2 px-4 rounded"
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
