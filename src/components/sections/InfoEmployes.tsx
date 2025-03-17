import React, { useState, useEffect, useMemo } from "react";
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
      
      console.log("Ajout d'un nouvel employé:", newUser);
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

        console.log("Création d'une nouvelle stat pour l'utilisateur ID:", newUser.id);
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
      } else {
        console.log("Statistiques existantes trouvées pour l'ID:", newUser.id);
      }
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

  const handleChange = (
    id: number,
    field: keyof Employe | "fonction" | "equipement",
    value: any
  ) => {
    console.log(`InfoEmployes - handleChange - ID: ${id}, Field: ${field}, Value:`, value);
    
    if (field === "nom") {
      const fullName = value;
      const selectedEmployee = employees?.find(
        emp => `${emp.prenom} ${emp.nom}`.trim() === fullName
      );
      
      if (selectedEmployee) {
        console.log("Employé trouvé:", selectedEmployee);
        
        // 1. Mise à jour de l'employé avec l'ID et les infos correctes
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user => {
            if (user.id === id) {
              return {
                ...user,
                id: selectedEmployee.id,
                prenom: selectedEmployee.prenom,
                nom: selectedEmployee.nom,
                fonction: selectedEmployee.fonction || user.fonction,
                equipement: selectedEmployee.equipement || user.equipement
              };
            }
            return user;
          });
          return updatedUsers;
        });
        
        // 2. Mise à jour des stats utilisateur
        const statExists = userStats.userStats.some(
          (stat: UserStat) => stat.id === selectedEmployee.id
        );
        
        console.log("Statistiques existantes pour ID", selectedEmployee.id, ":", statExists);
        
        // Filtrer les anciennes stats pour cet ID temporaire
        let filteredStats = userStats.userStats.filter(
          (stat: UserStat) => stat.id !== id
        );
        
        let newUserStats: UserStat[];
        
        if (statExists) {
          // Mise à jour des stats existantes
          newUserStats = filteredStats.map((stat: UserStat) => {
            if (stat.id === selectedEmployee.id) {
              return {
                ...stat,
                nom: `${selectedEmployee.prenom} ${selectedEmployee.nom}`.trim()
              };
            }
            return stat;
          });
          console.log("Mise à jour des statistiques pour employé existant:", selectedEmployee.id);
        } else {
          // Création d'une nouvelle stat
          const newStat: UserStat = {
            id: selectedEmployee.id,
            nom: `${selectedEmployee.prenom} ${selectedEmployee.nom}`.trim(),
            act: Array(10).fill(0),
            ts: 0,
            td: 0
          };
          newUserStats = [...filteredStats, newStat];
          console.log("Création d'une nouvelle statistique pour:", newStat.nom, "(ID:", newStat.id, ")");
        }
        
        // Recalcul des totaux
        const totals = newUserStats.reduce(
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
        
        // Mettre à jour directement avec le nouvel objet
        setUserStats({
          userStats: newUserStats,
          totals
        });
        
        // Afficher l'état des statistiques après mise à jour
        console.log("État des statistiques après mise à jour:", {
          userStats: newUserStats,
          totals
        });
      } else {
        // Si l'employé n'est pas trouvé, mettre à jour uniquement le nom
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === id ? { ...user, nom: value } : user
          )
        );
      }
    } else if (field === "prenom") {
      // Mise à jour du prénom
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, prenom: value } : user
        )
      );
      
      // Mise à jour des statistiques
      const user = users.find(u => u.id === id);
      if (user) {
        const fullName = `${value} ${user.nom || ''}`.trim();
        
        // Créer une copie des stats actuelles puis les mettre à jour
        const updatedUserStats = userStats.userStats.map((stat: UserStat) => {
          if (stat.id === id) {
            return { ...stat, nom: fullName };
          }
          return stat;
        });
        
        setUserStats({
          ...userStats,
          userStats: updatedUserStats
        });
      }
    } else if (field === "fonction") {
      if (typeof value === 'string') {
        const fonction = fonctions?.find(f => f.nom === value);
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === id) {
              return {
                ...user,
                fonction: fonction
                  ? { id: fonction.id, nom: fonction.nom }
                  : { id: null, nom: value }
              };
            }
            return user;
          })
        );
      } else {
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === id) {
              return {
                ...user,
                fonction: value
                  ? { id: value.id, nom: value.nom }
                  : { id: null, nom: "" }
              };
            }
            return user;
          })
        );
      }
    } else if (field === "equipement") {
      if (typeof value === 'string') {
        const equipement = equipements?.find(e => e.nom === value);
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === id) {
              return {
                ...user,
                equipement: equipement
                  ? { id: equipement.id, nom: equipement.nom }
                  : { id: null, nom: value }
              };
            }
            return user;
          })
        );
      } else {
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id === id) {
              return {
                ...user,
                equipement: value
                  ? { id: value.id, nom: value.nom }
                  : { id: null, nom: "" }
              };
            }
            return user;
          })
        );
      }
    } else {
      // Pour les autres champs
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, [field]: value } : user
        )
      );
    }
  };

  // Fonction pour vérifier si tous les employés ont des noms valides
  const allUsersHaveValidNames = useMemo(() => {
    // Vérifie si chaque utilisateur a au moins un nom ou prénom non vide
    return users.every(user => 
      (user.nom && user.nom.trim() !== "") || (user.prenom && user.prenom.trim() !== "")
    );
  }, [users]);

  // Fonction pour vérifier s'il y a déjà un employé vide
  const hasEmptyUser = useMemo(() => {
    return users.some(user => 
      (!user.nom || user.nom.trim() === "") && (!user.prenom || user.prenom.trim() === "")
    );
  }, [users]);

  // Effet pour auto-ajouter un employé quand nécessaire
  useEffect(() => {
    // Seulement si on a sélectionné un employé sur chaque ligne et qu'il n'y a pas de ligne vide
    if (users.length > 0 && allUsersHaveValidNames && !hasEmptyUser && employees && users.length < employees.length) {
      console.log("Auto-ajout d'un employé car tous les employés actuels ont des noms valides");
      handleAddUser();
    }
  }, [users, employees, allUsersHaveValidNames, hasEmptyUser]);

  // Effet pour ajouter un utilisateur vide au chargement initial
  useEffect(() => {
    // If there are no users, add one empty user
    if (users.length === 0 && employees && employees.length > 0) {
      handleAddUser();
    }
  }, [users.length, employees]);

  // Effet pour logger la liste des employés quand elle change
  useEffect(() => {
    console.log("Liste actuelle des employés:", users);
    users.forEach((user, index) => {
      console.log(`Employé ${index + 1}: ID=${user.id}, Nom=${user.nom}, Prénom=${user.prenom}`);
    });
  }, [users]);

  // Effet pour mettre à jour les stats utilisateur
  useEffect(() => {
    // Ne mettre à jour que si nous avons des utilisateurs avec des noms
    const validUsers = users.filter(user => (user.nom || user.prenom));
    
    if (validUsers.length > 0) {
      console.log("Mise à jour des stats avec les utilisateurs valides:", validUsers.length);
      
      // Ne garder que les utilisateurs valides dans les stats
      const updatedUserStats = validUsers.map(user => {
        const stat = userStats.userStats.find(stat => stat.id === user.id);
        if (stat) {
          return {
            ...stat,
            nom: `${user.prenom || ''} ${user.nom || ''}`.trim()
          };
        } else {
          return {
            id: user.id,
            nom: `${user.prenom || ''} ${user.nom || ''}`.trim(),
            act: Array(10).fill(0),
            ts: 0,
            td: 0
          };
        }
      });

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
  }, [users.filter(user => (user.nom || user.prenom)).map(user => `${user.id}-${user.nom}-${user.prenom}`).join(',')]);

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
