import React from "react";
import { FaUser, FaClock, FaHourglassHalf } from "react-icons/fa";

interface StatsGridProps {
  users: {
    id: number;
    nom: string;
  }[];
  activiteCount: number;
  nextStep: boolean;
  setUserStats: (newUserStats: any) => void;
  userStats: {
    id: number;
    nom: string;
    act: number[];
    ts: number;
    td: number;
  }[];
}

const StatsGrid: React.FC<StatsGridProps> = ({
  users,
  activiteCount,
  nextStep,
  setUserStats,
  userStats,
}) => {
  const handleActChange = (userId: number, index: number, value: number) => {
    const updatedUserStats = userStats.map((userStat) => {
      if (userStat.id === userId) {
        const updatedAct = [...userStat.act];
        const actualIndex = nextStep ? index + 5 : index;
        updatedAct[actualIndex] = value;
        
        // Calculer le total des heures pour le groupe d'activités actuel uniquement
        const startIndex = nextStep ? 5 : 0;
        const endIndex = nextStep ? 10 : 5;
        const groupTotal = updatedAct
          .slice(startIndex, endIndex)
          .reduce((acc, curr) => acc + curr, 0);
        
        return { 
          ...userStat, 
          act: updatedAct, 
          ts: groupTotal - userStat.td 
        };
      }
      return userStat;
    });
    
    setUserStats({
      userStats: updatedUserStats,
      totals: calculateTotals(updatedUserStats),
    });
  };

  const handleTdChange = (userId: number, value: number) => {
    const updatedUserStats = userStats.map((userStat) => {
      if (userStat.id === userId) {
        // Calculer le total des heures pour le groupe d'activités actuel uniquement
        const startIndex = nextStep ? 5 : 0;
        const endIndex = nextStep ? 10 : 5;
        const groupTotal = userStat.act
          .slice(startIndex, endIndex)
          .reduce((acc, curr) => acc + curr, 0);
          
        return {
          ...userStat,
          td: value,
          ts: groupTotal - value,
        };
      }
      return userStat;
    });
    
    setUserStats({
      userStats: updatedUserStats,
      totals: calculateTotals(updatedUserStats),
    });
  };

  const calculateTotals = (stats: typeof userStats) => {
    const startIndex = nextStep ? 5 : 0;
    const endIndex = nextStep ? 10 : 5;
    
    return stats.reduce(
      (acc, userStat) => {
        // Calculer les totaux uniquement pour le groupe d'activités actuel
        for (let i = startIndex; i < endIndex; i++) {
          const displayIndex = i - startIndex;
          acc.act[displayIndex] = (acc.act[displayIndex] || 0) + userStat.act[i];
        }
        
        // Ajouter uniquement les heures TS et TD du groupe actuel
        const groupTotal = userStat.act
          .slice(startIndex, endIndex)
          .reduce((acc, curr) => acc + curr, 0);
        const groupTs = groupTotal - userStat.td;
        
        acc.ts += groupTs;
        acc.td += userStat.td;
        return acc;
      },
      { act: Array(5).fill(0), ts: 0, td: 0 }
    );
  };

  const totals = calculateTotals(userStats);
  const actIndexOffset = nextStep ? 5 : 0;

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
          {userStats
            .filter(userStat => userStat.nom && userStat.nom.trim() !== "")
            .map((userStat) => (
            <tr key={userStat.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="py-2 px-4 border-b">{userStat.nom}</td>
              {userStat.act.slice(nextStep ? 5 : 0, nextStep ? 10 : 5).map((value, index) => (
                <td key={index} className="py-2 px-4 border-b">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="24"
                    value={value}
                    onChange={(e) =>
                      handleActChange(
                        userStat.id,
                        index,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={`w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      index >= activiteCount ? "text-gray-300 bg-gray-50" : "text-gray-700"
                    }`}
                    disabled={index >= activiteCount}
                  />
                </td>
              ))}
              <td className="py-2 px-4 border-b">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={userStat.ts}
                  readOnly
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </td>
              <td className="py-2 px-4 border-b">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={userStat.td}
                  onChange={(e) =>
                    handleTdChange(
                      userStat.id,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
                />
              </td>
            </tr>
          ))}
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
