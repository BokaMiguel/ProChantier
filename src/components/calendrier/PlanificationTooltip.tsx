import React from "react";
import { Planif, PlanifActivite } from "../../models/JournalFormModel";
import { FaStickyNote } from 'react-icons/fa';
import { Sun, Moon, MapPin, AlertTriangle, Beaker, Clock, CheckCircle, Circle } from "lucide-react";
import { Badge } from "../ui/badge";

interface PlanificationTooltipProps {
  event: any;
  position: { x: number; y: number };
  activites: any[];
  lieux: any[];
  signalisations: any[];
}

const PlanificationTooltip: React.FC<PlanificationTooltipProps> = ({ 
  event, 
  position, 
  activites, 
  lieux, 
  signalisations 
}) => {
  const { extendedProps } = event;
  const { planif, entrepriseName, isNightShift } = extendedProps;
  const TimeIcon = isNightShift ? Moon : Sun;
  const timeIconColor = isNightShift ? "text-indigo-500" : "text-amber-500";
  
  // Get activity details
  const getActivityDetails = (activiteId: number) => {
    return activites?.find(a => a.id === activiteId)?.nom || "Activité inconnue";
  };
  
  // Get location name
  const getLocationName = (lieuId: number) => {
    return lieux?.find(l => l.id === lieuId)?.nom || "Lieu inconnu";
  };
  
  // Get signalization name
  const getSignalisationName = (signalisationId: number) => {
    return signalisations?.find(s => s.id === signalisationId)?.nom || "Signalisation inconnue";
  };
  
  return (
    <div 
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-[400px]"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        maxHeight: '450px',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center">
          <TimeIcon className={`mr-2 ${timeIconColor}`} size={20} />
          <div>
            <div className="font-bold text-lg flex items-center">
              <Badge className="mr-2 bg-blue-600">{planif.PlanifActivites.length} activité{planif.PlanifActivites.length > 1 ? 's' : ''}</Badge>
              <span>{entrepriseName}</span>
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <Clock className="mr-1" size={14} />
              <span>{planif.HrsDebut} - {planif.HrsFin}</span>
            </div>
          </div>
        </div>
        {planif.note && (
          <div className="tooltip-note flex items-start">
            <FaStickyNote className="text-amber-500 mr-1" />
            <span className="text-sm text-gray-700 italic">{planif.note}</span>
          </div>
        )}
      </div>
      
      {/* Activities List */}
      <div className="space-y-3">
        {planif.PlanifActivites.map((activite: PlanifActivite, index: number) => (
          <div key={activite.ID || index} className="p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium flex items-center">
                {activite.isComplete ? (
                  <CheckCircle className="mr-2 text-green-500" size={18} />
                ) : (
                  <Circle className="mr-2 text-gray-400" size={18} />
                )}
                <span>{getActivityDetails(activite.activiteId)}</span>
              </div>
              <Badge className={`${isNightShift ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
                {activite.debut} - {activite.fin}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="mr-1 text-blue-500" size={14} />
                <span>{getLocationName(activite.lieuId)}</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="mr-1 text-amber-500" size={14} />
                <span>{getSignalisationName(activite.signalisation)}</span>
              </div>
              {activite.qteLab && activite.qteLab > 0 && (
                <div className="flex items-center">
                  <Beaker className="mr-1 text-purple-500" size={14} />
                  <span>{activite.qteLab}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanificationTooltip;
