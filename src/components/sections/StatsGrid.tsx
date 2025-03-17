import React, { useEffect } from "react";
import { FaUser, FaClock, FaHourglassHalf } from "react-icons/fa";

interface JournalUserStats {
  userStats: {
    id: number;
    nom: string;
    act: number[];
    ts: number;
    td: number;
  }[];
  totals: {
    act: number[];
    ts: number;
    td: number;
  };
}

interface StatsGridProps {
  users: {
    id: number;
    nom: string;
    prenom?: string;
  }[];
  activiteCount: number;
  nextStep: boolean;
  setUserStats: (stats: JournalUserStats) => void;
  userStats: JournalUserStats;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  users,
  activiteCount,
  nextStep,
  setUserStats,
  userStats,
}) => {
  const handleActChange = (userId: number, index: number, value: number) => {
    console.log(`StatsGrid - Modification de l'activité pour l'utilisateur ${userId}, index ${index}, valeur ${value}`);
    
    const updatedUserStats = userStats.userStats.map((userStat) => {
      if (userStat.id === userId) {
        const updatedAct = [...userStat.act];
        const actIndex = index + (nextStep ? 5 : 0);
        updatedAct[actIndex] = value;
        
        // Calculer le total des heures pour cet utilisateur
        const totalHours = updatedAct.reduce((sum, val) => sum + (val || 0), 0);
        
        return {
          ...userStat,
          act: updatedAct,
          ts: totalHours // Mettre à jour le total des heures
        };
      }
      return userStat;
    });
    
    // Recalculer les totaux
    const totals = updatedUserStats.reduce(
      (acc: { act: number[], ts: number, td: number }, stat: any) => {
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
  };

  const handleTsChange = (userId: number, value: number) => {
    console.log(`StatsGrid - Modification du TS pour l'utilisateur ${userId}, valeur ${value}`);
    
    const updatedUserStats = userStats.userStats.map((userStat) => {
      if (userStat.id === userId) {
        return {
          ...userStat,
          ts: value,
        };
      }
      return userStat;
    });
    
    // Recalculer les totaux
    const totals = updatedUserStats.reduce(
      (acc: { act: number[], ts: number, td: number }, stat: any) => {
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
  };

  const handleTdChange = (userId: number, value: number) => {
    console.log(`StatsGrid - Modification du TD pour l'utilisateur ${userId}, valeur ${value}`);
    
    const updatedUserStats = userStats.userStats.map((userStat) => {
      if (userStat.id === userId) {
        return {
          ...userStat,
          td: value,
        };
      }
      return userStat;
    });
    
    // Recalculer les totaux
    const totals = updatedUserStats.reduce(
      (acc: { act: number[], ts: number, td: number }, stat: any) => {
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
  };

  const calculateTotals = (stats: typeof userStats.userStats) => {
    const startIndex = nextStep ? 5 : 0;
    const endIndex = nextStep ? 10 : 5;
    
    return stats.reduce(
      (acc: { act: number[], ts: number, td: number }, userStat: any) => {
        // Calculer les totaux uniquement pour le groupe d'activités actuel
        for (let i = startIndex; i < endIndex; i++) {
          const displayIndex = i - startIndex;
          acc.act[displayIndex] = (acc.act[displayIndex] || 0) + (userStat.act[i] || 0);
        }
        acc.ts += userStat.ts || 0;
        acc.td += userStat.td || 0;
        return acc;
      },
      {
        act: Array(5).fill(0),
        ts: 0,
        td: 0,
      }
    );
  };

  const totals = calculateTotals(userStats.userStats);
  const actIndexOffset = nextStep ? 5 : 0;

  useEffect(() => {
    console.log("StatsGrid - users:", users);
    console.log("StatsGrid - userStats:", userStats);
    
    // Vérifier la correspondance entre users et userStats
    const usersWithoutStats = users.filter(
      user => !userStats.userStats.some(stat => stat.id === user.id)
    );
    
    const statsWithoutUsers = userStats.userStats.filter(
      stat => !users.some(user => user.id === stat.id)
    );
    
    if (usersWithoutStats.length > 0) {
      console.warn("Utilisateurs sans statistiques:", usersWithoutStats);
    }
    
    if (statsWithoutUsers.length > 0) {
      console.warn("Statistiques sans utilisateurs correspondants:", statsWithoutUsers);
    }
  }, [users, userStats]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="py-3 px-4 bg-gradient-to-r from-blue-100 to-blue-200 border-b">
              <div className="flex items-center justify-center text-gray-800 font-semibold">
                <span className="bg-blue-200 p-2 rounded-full mr-2">
                  <FaUser className="text-blue-700" />
                </span>
                Nom
              </div>
            </th>
            <th className="py-3 px-4 bg-gradient-to-r from-blue-100 to-blue-200 border-b" colSpan={5}>
              <div className="flex items-center justify-center text-gray-800 font-semibold">
                <span className="bg-blue-200 p-2 rounded-full mr-2">
                  <FaHourglassHalf className="text-blue-700" />
                </span>
                Durée par Activité
              </div>
            </th>
            <th className="py-3 px-4 bg-gradient-to-r from-blue-100 to-blue-200 border-b" colSpan={2}>
              <div className="flex items-center justify-center text-gray-800 font-semibold">
                <span className="bg-blue-200 p-2 rounded-full mr-2">
                  <FaClock className="text-blue-700" />
                </span>
                Heures Totales
              </div>
            </th>
          </tr>
          <tr className="bg-blue-50">
            <th className="py-2 px-4 border-b font-semibold text-gray-700"></th>
            {Array.from({ length: 5 }).map((_, index) => (
              <th
                key={index}
                className={`py-2 px-4 border-b font-semibold ${
                  index >= activiteCount ? "text-gray-400" : "text-gray-700"
                }`}
              >
                ACT {index + 1 + (nextStep ? 5 : 0)}
              </th>
            ))}
            <th className="py-2 px-4 border-b font-semibold text-gray-700">TS</th>
            <th className="py-2 px-4 border-b font-semibold text-gray-700">TD</th>
          </tr>
        </thead>
        <tbody>
          {userStats.userStats
            .filter((userStat) => {
              // Ne montrer que les utilisateurs qui ont un nom valide ou qui correspondent à un utilisateur sélectionné
              const user = users.find(u => u.id === userStat.id);
              const hasValidName = user && user.nom && user.nom.trim() !== "";
              
              // Utilisateur vide/temporaire - ne pas montrer les employés sans noms
              const isEmptyUser = userStat.nom.includes("Employé") || userStat.nom.trim() === "";
              
              // Logs pour débogage
              console.log(`StatsGrid - Filtrage de l'utilisateur ID=${userStat.id}:`, { 
                nom: userStat.nom,
                hasValidName,
                isEmptyUser,
                shouldShow: hasValidName && !isEmptyUser
              });
              
              return hasValidName && !isEmptyUser;
            })
            .map((userStat) => {
              // Chercher l'utilisateur correspondant
              const user = users.find((u) => u.id === userStat.id);
              
              // Initialiser le nom à afficher avec celui dans userStat
              let displayName = userStat.nom.trim();
              
              // Si l'utilisateur est trouvé et a un nom/prénom, utiliser celui-ci
              if (user) {
                // Si l'utilisateur a un nom ou prénom, l'utiliser
                if (user.nom || user.prenom) {
                  displayName = `${user.prenom || ''} ${user.nom || ''}`.trim();
                  
                  // Si le nom est différent de celui dans les stats, mettre à jour les logs
                  if (displayName !== userStat.nom) {
                    console.log(`StatsGrid - Mise à jour du nom:`, {
                      id: userStat.id,
                      ancienNom: userStat.nom,
                      nouveauNom: displayName
                    });
                  }
                }
              }
              
              // Assurer que le nom n'est jamais vide
              if (!displayName) {
                displayName = `Employé ${userStat.id}`;
              }
              
              // Ne pas afficher les lignes sans nom
              if (!displayName) {
                return null;
              }
              
              return (
                <tr key={userStat.id}>
                  <td className="text-left py-2 px-4 border-b font-medium">{displayName}</td>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const actIndex = i + actIndexOffset;
                    return (
                      <td key={i} className="py-2 px-4 border-b">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={userStat.act[actIndex] || 0}
                          onChange={(e) =>
                            handleActChange(
                              userStat.id,
                              i,
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </td>
                    );
                  })}
                  <td className="py-2 px-4 border-b">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={userStat.ts || 0}
                      onChange={(e) =>
                        handleTsChange(userStat.id, Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={userStat.td || 0}
                      onChange={(e) =>
                        handleTdChange(userStat.id, Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </td>
                </tr>
              );
            })}
          <tr className="bg-gray-50 font-semibold text-gray-700">
            <td className="py-3 px-4 border-t">Totaux</td>
            {totals.act.map((total, index) => (
              <td key={index} className="py-3 px-4 border-t text-center">
                {total}
              </td>
            ))}
            <td className="py-3 px-4 border-t text-center">{totals.ts}</td>
            <td className="py-3 px-4 border-t text-center">{totals.td}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatsGrid;
