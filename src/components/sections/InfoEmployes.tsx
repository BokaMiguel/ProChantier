import React, { useState, useEffect } from "react";
import { FaUser, FaBriefcase, FaToolbox, FaTimes, FaPlusCircle } from "react-icons/fa";
import { Employe, Fonction, Equipement, UserStat, JournalUserStats } from "../../models/JournalFormModel";
import { useAuth } from "../../context/AuthContext";

const InfoEmployes: React.FC<{
  users: Employe[];
  setUsers: React.Dispatch<React.SetStateAction<Employe[]>>;
  userStats: JournalUserStats;
  setUserStats: (stats: JournalUserStats) => void;
}> = ({ users, setUsers, userStats, setUserStats }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);

  const { employees, fonctions, equipements } = useAuth();

  const handleAddUser = () => {
    if (employees && users.length < employees.length) {
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

      // Vérifier si cet utilisateur a déjà des statistiques
      const existingStat = userStats.userStats.find(stat => stat.id === newUser.id);

      if (!existingStat) {
        // Initialize user statistics
        const newUserStat: UserStat = {
          id: newUser.id,
          nom: "", // Nom vide, sera mis à jour quand l'utilisateur sélectionnera un nom
          act: Array(10).fill(0),
          ts: 0,
          td: 0
        };

        const updatedUserStats = [...userStats.userStats, newUserStat];

        // Recalculer les totaux
        const totals = updatedUserStats.reduce(
          (acc: { act: number[], ts: number, td: number }, stat: UserStat) => {
            for (let i = 0; i < 10; i++) {
              acc.act[i] = (acc.act[i] || 0) + (stat.act[i] || 0);
            }
            acc.ts += stat.ts || 0;
            acc.td += stat.td || 0;
            return acc;
          },
          { act: Array(10).fill(0), ts: 0, td: 0 }
        );

        setUserStats({
          userStats: updatedUserStats,
          totals
        });
      }
    }
  };

  const handleDeleteUser = (userIdToDelete: number) => {
    if (userIdToDelete) {
      setUsers((prevUsers: Employe[]) => prevUsers.filter((user) => user.id !== userIdToDelete));

      // Supprimer également les statistiques de l'utilisateur
      const updatedUserStats = userStats.userStats.filter(stat => stat.id !== userIdToDelete);

      // Recalculer les totaux
      const totals = updatedUserStats.reduce(
        (acc: { act: number[], ts: number, td: number }, stat: UserStat) => {
          for (let i = 0; i < 10; i++) {
            acc.act[i] = (acc.act[i] || 0) + (stat.act[i] || 0);
          }
          acc.ts += stat.ts || 0;
          acc.td += stat.td || 0;
          return acc;
        },
        { act: Array(10).fill(0), ts: 0, td: 0 }
      );

      setUserStats({
        userStats: updatedUserStats,
        totals
      });

      setShowConfirm(false);
      setUserIdToDelete(null);
    }
  };

  const handleEmployeeChange = (id: number, field: keyof Employe, value: any): Employe => {
    const userToUpdate = users.find(user => user.id === id);
    if (!userToUpdate) {
      // Si l'utilisateur n'est pas trouvé, retourner un utilisateur vide
      return { id: 0, nom: "", prenom: "", fonction: { id: null, nom: "" }, equipement: { id: null, nom: "" } };
    }

    const updatedUser = { ...userToUpdate, [field]: value };

    // Mettre à jour le nom dans les statistiques utilisateur si le nom ou prénom change
    if (field === 'nom' || field === 'prenom') {
      // Construire le nom complet pour les statistiques
      const fullName = field === 'prenom' 
        ? `${value} ${updatedUser.nom || ''}`.trim()
        : `${updatedUser.prenom || ''} ${value}`.trim();

      // Vérifier si l'utilisateur a déjà des statistiques
      const existingStat = userStats.userStats.find(stat => stat.id === id);

      if (existingStat) {
        // Mettre à jour les statistiques existantes
        const updatedUserStats = userStats.userStats.map(stat => {
          if (stat.id === id) {
            return {
              ...stat,
              nom: fullName
            };
          }
          return stat;
        });

        setUserStats({
          ...userStats,
          userStats: updatedUserStats
        });
      } else {
        // Créer de nouvelles statistiques si elles n'existent pas
        const newUserStat: UserStat = {
          id: id,
          nom: fullName,
          act: Array(10).fill(0),
          ts: 0,
          td: 0
        };

        const updatedUserStats = [...userStats.userStats, newUserStat];

        // Recalculer les totaux
        const totals = updatedUserStats.reduce(
          (acc: { act: number[], ts: number, td: number }, stat: UserStat) => {
            for (let i = 0; i < 10; i++) {
              acc.act[i] = (acc.act[i] || 0) + (stat.act[i] || 0);
            }
            acc.ts += stat.ts || 0;
            acc.td += stat.td || 0;
            return acc;
          },
          { act: Array(10).fill(0), ts: 0, td: 0 }
        );

        setUserStats({
          userStats: updatedUserStats,
          totals
        });
      }
    }

    return updatedUser;
  };

  const handleChange = (
    id: number,
    field: keyof Employe | "fonction" | "equipement",
    value: any
  ) => {
    setUsers((prevUsers: Employe[]) => {
      return prevUsers.map((user) => {
        if (user.id === id) {
          if (field === "fonction") {
            // Si la valeur est une chaîne, chercher la fonction correspondante
            if (typeof value === 'string') {
              const fonction = fonctions?.find(f => f.nom === value);
              return {
                ...user,
                fonction: fonction
                  ? { id: fonction.id, nom: fonction.nom }
                  : { id: null, nom: value },
              };
            } else {
              // Si c'est déjà un objet fonction
              return {
                ...user,
                fonction: value
                  ? { id: value.id, nom: value.nom }
                  : { id: null, nom: "" },
              };
            }
          } else if (field === "equipement") {
            // Si la valeur est une chaîne, chercher l'équipement correspondant
            if (typeof value === 'string') {
              const equipement = equipements?.find(e => e.nom === value);
              return {
                ...user,
                equipement: equipement
                  ? { id: equipement.id, nom: equipement.nom }
                  : { id: null, nom: value },
              };
            } else {
              // Si c'est déjà un objet équipement
              return {
                ...user,
                equipement: value
                  ? { id: value.id, nom: value.nom }
                  : { id: null, nom: "" },
              };
            }
          } else {
            // Appeler handleEmployeeChange mais ne pas utiliser sa valeur de retour directement
            // car nous avons déjà l'utilisateur à jour ici
            handleEmployeeChange(id, field as keyof Employe, value);
            return { ...user, [field]: value };
          }
        }
        return user;
      });
    });
  };

  useEffect(() => {
    if (users.length === 0 && employees && employees.length > 0) {
      const newUser: Employe = {
        id: Date.now(), 
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

  useEffect(() => {
    // Vérifier si userStats est défini
    if (userStats && userStats.userStats) {
      // Créer un nouvel objet de statistiques utilisateur
      const updatedUserStats = userStats.userStats.map(stat => {
        // Trouver l'utilisateur correspondant
        const user = users.find(u => u.id === stat.id);
        if (user) {
          // Construire le nom complet
          let fullName = "";
          if (user.prenom && user.nom) {
            fullName = `${user.prenom} ${user.nom}`;
          } else if (user.prenom) {
            fullName = user.prenom;
          } else if (user.nom) {
            fullName = user.nom;
          }
          
          // Mettre à jour le nom dans les statistiques
          return {
            ...stat,
            nom: fullName.trim() || stat.nom
          };
        }
        return stat;
      });

      // Mettre à jour les statistiques utilisateur si elles ont changé
      if (JSON.stringify(updatedUserStats) !== JSON.stringify(userStats.userStats)) {
        setUserStats({
          ...userStats,
          userStats: updatedUserStats
        });
      }
    }
  }, [users, userStats, setUserStats]);

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
                  value={`${user.prenom || ''} ${user.nom || ''}`.trim() || ""}
                  onChange={(e) => {
                    const fullName = e.target.value;
                    if (fullName) {
                      // Trouver l'employé correspondant dans la liste
                      const selectedEmployee = employees?.find(
                        emp => `${emp.prenom} ${emp.nom}`.trim() === fullName
                      );
                      
                      if (selectedEmployee) {
                        // Mettre à jour le prénom et le nom avec les valeurs de l'employé sélectionné
                        handleChange(user.id, "prenom", selectedEmployee.prenom);
                        handleChange(user.id, "nom", selectedEmployee.nom);
                        
                        // Mettre à jour directement les statistiques utilisateur avec le nom complet
                        const updatedUserStats = userStats.userStats.map(stat => {
                          if (stat.id === user.id) {
                            return {
                              ...stat,
                              nom: `${selectedEmployee.prenom} ${selectedEmployee.nom}`.trim()
                            };
                          }
                          return stat;
                        });
                        
                        // Recalculer les totaux
                        const totals = updatedUserStats.reduce(
                          (acc: { act: number[], ts: number, td: number }, stat: UserStat) => {
                            for (let i = 0; i < 10; i++) {
                              acc.act[i] = (acc.act[i] || 0) + (stat.act[i] || 0);
                            }
                            acc.ts += stat.ts || 0;
                            acc.td += stat.td || 0;
                            return acc;
                          },
                          { act: Array(10).fill(0), ts: 0, td: 0 }
                        );
                        
                        setUserStats({
                          userStats: updatedUserStats,
                          totals
                        });
                        
                        // Mettre à jour la fonction et l'équipement si disponibles
                        if (selectedEmployee.fonction) {
                          handleChange(user.id, "fonction", selectedEmployee.fonction);
                        }
                        if (selectedEmployee.equipement) {
                          handleChange(user.id, "equipement", selectedEmployee.equipement);
                        }
                      } else {
                        // Si l'employé n'est pas trouvé dans la liste, extraire le prénom et le nom
                        const nameParts = fullName.split(' ');
                        const prenom = nameParts[0] || '';
                        const nom = nameParts.slice(1).join(' ') || '';
                        
                        // Mettre à jour à la fois le prénom et le nom
                        handleChange(user.id, "prenom", prenom);
                        handleChange(user.id, "nom", nom);
                        
                        // Mettre à jour directement les statistiques utilisateur avec le nom complet
                        const updatedUserStats = userStats.userStats.map(stat => {
                          if (stat.id === user.id) {
                            return {
                              ...stat,
                              nom: fullName
                            };
                          }
                          return stat;
                        });
                        
                        // Recalculer les totaux
                        const totals = updatedUserStats.reduce(
                          (acc: { act: number[], ts: number, td: number }, stat: UserStat) => {
                            for (let i = 0; i < 10; i++) {
                              acc.act[i] = (acc.act[i] || 0) + (stat.act[i] || 0);
                            }
                            acc.ts += stat.ts || 0;
                            acc.td += stat.td || 0;
                            return acc;
                          },
                          { act: Array(10).fill(0), ts: 0, td: 0 }
                        );
                        
                        setUserStats({
                          userStats: updatedUserStats,
                          totals
                        });
                      }
                      
                      // Ajouter automatiquement un nouvel utilisateur si c'est le dernier de la liste
                      if (index === users.length - 1) {
                        handleAddUser();
                      }
                    }
                  }}
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
                  onClick={() => setUserIdToDelete(user.id)}
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
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                onClick={() => handleDeleteUser(userIdToDelete!)}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoEmployes;
