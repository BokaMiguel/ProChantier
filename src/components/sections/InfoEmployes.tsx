import React, { useState } from "react";
import { FaUser, FaBriefcase, FaToolbox, FaTimes } from "react-icons/fa";
import { Employe } from "../../models/JournalFormModel";

const mockUsers = [
  "Alice Dupont",
  "Bob Martin",
  "Charlie Legrand",
  "David Durand",
  "Eve Martin",
];

const InfoEmployes: React.FC<{
  users: Employe[];
  setUsers: React.Dispatch<React.SetStateAction<Employe[]>>;
}> = ({ users, setUsers }) => {
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);

  const handleAddUser = () => {
    const newUser: Employe = {
      id: users.length + 1,
      nom: "",
      fonctionEmploye: "",
      equipement: "",
      prenom: "",
    };
    setUsers((prevUsers: Employe[]) => [...prevUsers, newUser]);
  };

  const handleChange = (id: number, field: keyof Employe, value: string) => {
    const updatedUsers = users.map((user) => {
      if (user.id === id) {
        return { ...user, [field]: value };
      }
      return user;
    });

    setUsers(updatedUsers);

    const lastUser = updatedUsers[updatedUsers.length - 1];
    if (lastUser.nom !== "") {
      handleAddUser();
    }
  };

  const handleDeleteUser = (id: number) => {
    setShowModal(true);
    setUserIdToDelete(id);
  };

  const confirmDeleteUser = () => {
    if (userIdToDelete !== null) {
      const updatedUsers = users.filter((user) => user.id !== userIdToDelete);
      setUsers(updatedUsers.map((user, index) => ({ ...user, id: index + 1 })));
    }
    setShowModal(false);
    setUserIdToDelete(null);
  };

  const renderUserRows = () => {
    return users.map((user) => (
      <div key={user.id} className="grid grid-cols-10 gap-4 mb-4 items-center">
        <select
          value={user.nom}
          onChange={(e) => handleChange(user.id, "nom", e.target.value)}
          className="col-span-3 border rounded px-2 py-1 w-full"
        >
          <option value=""></option>
          {mockUsers.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={user.fonctionEmploye}
          onChange={(e) =>
            handleChange(user.id, "fonctionEmploye", e.target.value)
          }
          className="col-span-3 border rounded px-2 py-1 w-full"
        >
          <option value=""></option>
          <option value="Chef de projet">Chef de projet</option>
          <option value="Ingénieur">Ingénieur</option>
          <option value="Technicien">Technicien</option>
        </select>
        <select
          value={user.equipement}
          onChange={(e) => handleChange(user.id, "equipement", e.target.value)}
          className="col-span-3 border rounded px-2 py-1 w-full"
        >
          <option value=""></option>
          <option value="Ordinateur">Ordinateur</option>
          <option value="Tablette">Tablette</option>
          <option value="Smartphone">Smartphone</option>
        </select>
        {user.nom !== "" && (
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="col-span-1 hover:text-red-700 flex items-center justify-center"
          >
            <FaTimes />
          </button>
        )}
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
