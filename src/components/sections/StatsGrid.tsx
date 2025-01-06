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
    <div className="p-4">
      <table className="min-w-full bg-white border rounded shadow-md">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 border-b border-r">
              <div className="flex items-center justify-center">
                <FaUser className="mr-2" /> Nom
              </div>
            </th>
            <th className="py-2 px-4 bg-gray-200 border-b border-r" colSpan={5}>
              <div className="flex items-center justify-center">
                <FaHourglassHalf className="mr-2" /> Durée par Activité
              </div>
            </th>
            <th className="py-2 px-4 bg-gray-200 border-b" colSpan={2}>
              <div className="flex items-center justify-center">
                <FaClock className="mr-2" /> Heures Totales
              </div>
            </th>
          </tr>
          <tr>
            <th className="py-2 px-4 bg-gray-100 border-b border-r"></th>
            {Array.from({ length: 5 }).map((_, index) => (
              <th
                key={index}
                className={`py-2 px-4 border-b border-r ${
                  index >= activiteCount ? "text-gray-300" : "text-black"
                }`}
              >
                ACT {index + 1 + (nextStep ? 5 : 0)}
              </th>
            ))}
            <th className="py-2 px-4 bg-gray-100 border-b border-r">TS</th>
            <th className="py-2 px-4 bg-gray-100 border-b">TD</th>
          </tr>
        </thead>
        <tbody>
          {userStats
            .filter((userStat) => userStat.nom.trim() !== "")
            .map((userStat) => (
              <tr key={userStat.id}>
                <td className="py-2 px-4 border-b border-r">{userStat.nom}</td>
                {userStat.act.slice(nextStep ? 5 : 0, nextStep ? 10 : 5).map((value, index) => (
                  <td key={index} className="py-2 px-4 border-b border-r">
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
                      className={`border rounded px-2 py-1 w-full ${
                        index >= activiteCount ? "text-gray-300" : "text-black"
                      }`}
                      disabled={index >= activiteCount}
                    />
                  </td>
                ))}
                <td className="py-2 px-4 border-b border-r">
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="24"
                    value={userStat.ts}
                    readOnly
                    className="border rounded px-2 py-1 w-full bg-gray-100"
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
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>
              </tr>
            ))}
          <tr className="font-bold">
            <td className="py-2 px-4 border-b border-r">Totaux</td>
            {totals.act.map((total, index) => (
              <td key={index} className="py-2 px-4 border-b border-r">
                {total}
              </td>
            ))}
            <td className="py-2 px-4 border-b border-r">{totals.ts}</td>
            <td className="py-2 px-4 border-b">{totals.td}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StatsGrid;
