import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { parseISO } from "date-fns";
import "./CalendarPage.scss";
import { getPlanifChantierByProjet, getPlanifActivites } from "../../services/JournalService";
import { Planif, PlanifActivite } from "../../models/JournalFormModel";
import { Sun, Moon, Building2, MapPin, AlertTriangle, Clock, Calendar, Users, Info, CheckCircle, Circle, X, Beaker } from "lucide-react";
import { Badge } from "../ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  extendedProps: {
    planif: Planif;
    activites: PlanifActivite[];
    lieuName: string;
    entrepriseName: string;
    plageHoraire: string;
    signalisationName: string;
    isNightShift: boolean;
  };
}

const CalendarPage: React.FC = () => {
  const {
    projects,
    selectedProject,
    selectProject,
    activites,
    lieux,
    sousTraitants,
    signalisations
  } = useAuth();
  const [localSelectedProject, setLocalSelectedProject] = useState<number | null>(
    selectedProject ? selectedProject.ID : null
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [planifications, setPlanifications] = useState<Planif[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Essayer d'abord de récupérer l'objet projet complet depuis localStorage
    const savedProject = localStorage.getItem("selectedProject");
    const savedProjectId = localStorage.getItem("selectedProjectId");
    
    if (savedProject) {
      try {
        const parsedProject = JSON.parse(savedProject);
        const project = projects?.find((p) => p.ID === parsedProject.ID);
        if (project) {
          selectProject(project);
          setLocalSelectedProject(project.ID);
          return; // Sortir si nous avons trouvé le projet
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du projet depuis localStorage dans CalendarPage:', error);
      }
    }
    
    // Si nous n'avons pas pu utiliser l'objet projet, essayer avec l'ID uniquement
    if (savedProjectId) {
      const project = projects?.find((p) => p.ID === Number(savedProjectId));
      if (project) {
        selectProject(project);
        setLocalSelectedProject(project.ID);
      }
    }
  }, [projects, selectProject]);

  // Fonction pour déterminer si une activité est de nuit
  const isNightShift = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 17 || hour < 7;
  };

  // Fonction pour charger les planifications
  const loadPlanifications = async (projectId: number) => {
    try {
      const planifData = await getPlanifChantierByProjet(projectId);
      
      if (planifData && Array.isArray(planifData)) {
        // Convertir les données au nouveau format Planif
        const formattedPlanifs = planifData.map(planif => {
          // Créer les PlanifActivites à partir des activités reçues
          const planifActivites: PlanifActivite[] = planif.activites && Array.isArray(planif.activites) ? 
            planif.activites.map((a: any) => ({
              ID: a.id || 0,
              PlanifID: a.planifID || planif.id || 0,
              debut: a.hrsDebut || planif.hrsDebut || "08:00",
              fin: a.hrsFin || planif.hrsFin || "17:00",
              signalisation: a.signalisationID || 0,
              lieuId: a.lieuID || 0,
              qteLab: a.qteLab || 0,
              activiteId: a.activiteID || 0,
              sousTraitantId: a.sousTraitantID || planif.defaultEntrepriseId || 0,
              isComplete: a.isComplete || false
            })) : [];
          
          // Créer l'objet Planif avec les propriétés correctes
          return {
            ID: planif.id || 0,
            ProjetID: planif.projetID || projectId,
            HrsDebut: planif.hrsDebut || "08:00",
            HrsFin: planif.hrsFin || "17:00",
            defaultEntreprise: planif.defaultEntrepriseId || 0,
            note: planif.note || '',
            Date: planif.date || new Date().toISOString().split('T')[0],
            PlanifActivites: planifActivites
          } as Planif;
        });
        
        setPlanifications(formattedPlanifs);
        createCalendarEvents(formattedPlanifs);
      } else {
        console.warn("Aucune planification reçue ou format incorrect");
        setPlanifications([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des planifications:", error);
      setPlanifications([]);
    }
  };

  // Charger les planifications quand le projet change
  useEffect(() => {
    if (localSelectedProject) {
      loadPlanifications(localSelectedProject);
    }
  }, [localSelectedProject]);

  // Créer les événements du calendrier à partir des planifications
  const createCalendarEvents = (planifs: Planif[]) => {
    if (!planifs.length || !activites || !lieux || !sousTraitants || !signalisations) {
      setEvents([]);
      return;
    }

    const formattedEvents = planifs.map(planif => {
      // Vérification et parsing de la date
      let eventDate;
      try {
        // Vérifier si la date est au format ISO
        if (planif.Date.includes('T')) {
          eventDate = new Date(planif.Date);
        } else {
          // Si la date est au format YYYY-MM-DD
          eventDate = parseISO(planif.Date);
        }
        
        if (isNaN(eventDate.getTime())) {
          console.error('Date invalide pour planif:', planif.ID);
          return null;
        }
      } catch (error) {
        console.error('Erreur de parsing de date pour planif:', planif.ID, error);
        return null;
      }

      // Déterminer si c'est un shift de nuit
      const nightShift = isNightShift(planif.HrsDebut);

      // Récupérer les informations associées
      const lieuName = lieux?.find((l) => {
        // Trouver le lieu principal (le premier lieu des activités ou celui par défaut)
        const firstActivite = planif.PlanifActivites[0];
        return l.id === (firstActivite ? firstActivite.lieuId : 0);
      })?.nom || "Inconnu";
      
      const entrepriseName = sousTraitants?.find((st) => st.id === planif.defaultEntreprise)?.nom || "Inconnu";
      
      // Créer un titre qui inclut l'ID de la planification
      const title = `Planif #${planif.ID}`;

      return {
        id: String(planif.ID),
        title,
        start: eventDate,
        allDay: true,
        extendedProps: {
          planif: planif,
          activites: planif.PlanifActivites,
          lieuName,
          entrepriseName,
          plageHoraire: `${planif.HrsDebut} - ${planif.HrsFin}`,
          signalisationName: signalisations?.find((sig) => {
            // Trouver la signalisation principale (la première des activités)
            const firstActivite = planif.PlanifActivites[0];
            return sig.id === (firstActivite ? firstActivite.signalisation : 0);
          })?.nom || "Inconnu",
          isNightShift: nightShift
        },
      };
    }).filter(event => event !== null);

    setEvents(formattedEvents as CalendarEvent[]);
  };

  const handleConfirmSelection = () => {
    const selected = projects?.find(
      (project) => project.ID === localSelectedProject
    );
    if (selected) {
      // La fonction selectProject dans AuthContext s'occupe déjà de stocker
      // le projet et son ID dans localStorage
      selectProject(selected);
    }
  };

  const [selectedEvent, setSelectedEvent] = useState<{
    event: any;
    position: { x: number; y: number };
  } | null>(null);

  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.extendedProps.planif.ID;
    navigate(`/journal-chantier/${eventId}`);
  };

  const handleEventMouseEnter = (mouseEnterInfo: any) => {
    const rect = mouseEnterInfo.el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupHeight = 450; // Hauteur estimée du popup
    const popupWidth = 420; // Largeur estimée du popup
    
    // Calculer la position initiale du popup
    let x = rect.right + 10; // Par défaut, à droite de l'événement
    let y = rect.top;
    
    // Vérifier si le popup dépasse à droite de l'écran
    if (x + popupWidth > viewportWidth) {
      x = Math.max(10, rect.left - popupWidth - 10); // Placer à gauche avec une marge minimale
    }
    
    // Vérifier si le popup dépasse en bas de l'écran
    if (y + popupHeight > viewportHeight) {
      // Calculer combien d'espace est disponible en haut et en bas
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;
      
      if (spaceAbove > spaceBelow) {
        // Plus d'espace en haut, positionner au-dessus
        y = Math.max(10, rect.top - popupHeight);
      } else {
        // Plus d'espace en bas, ajuster pour qu'il reste dans la vue
        y = Math.max(10, viewportHeight - popupHeight - 10);
      }
    }
    
    // Vérifier si le popup dépasse en haut de l'écran
    if (y < 10) {
      y = 10; // Laisser une marge minimale en haut
    }
    
    setSelectedEvent({
      event: mouseEnterInfo.event,
      position: { x, y }
    });
  };

  const handleEventMouseLeave = () => {
    setSelectedEvent(null);
  };

  // Fonction pour générer une classe CSS de couleur basée sur l'heure
  const getTimeColorClass = (heure: string) => {
    const hour = parseInt(heure.split(':')[0]);
    return hour >= 17 || hour < 7 ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800";
  };

  const renderEventContent = (eventInfo: any) => {
    const { extendedProps } = eventInfo.event;
    const TimeIcon = extendedProps.isNightShift ? Moon : Sun;
    const timeIconColor = extendedProps.isNightShift ? "text-indigo-500" : "text-amber-500";
    const bgColor = extendedProps.isNightShift ? "bg-indigo-100" : "bg-amber-50";

    return (
      <div className={`event-content p-1 rounded ${bgColor} hover:shadow-md transition-all duration-200`}>
        <div className="event-title flex items-center font-medium">
          <TimeIcon className={`mr-2 ${timeIconColor}`} size={18} />
          <span>{eventInfo.event.title}</span>
          <Badge className="ml-2 text-xs" variant="outline">
            {extendedProps.activites.length} activité{extendedProps.activites.length > 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="event-details flex items-center text-gray-700 mt-1">
          <Clock className="mr-1 text-blue-500" size={16} />
          <span className="text-sm">{extendedProps.plageHoraire}</span>
        </div>
      </div>
    );
  };

  // Fonction pour obtenir le nom de l'activité à partir de son ID
  const getActiviteName = (activiteId: number) => {
    return activites?.find(a => a.id === activiteId)?.nom || "Activité inconnue";
  };

  // Fonction pour obtenir le nom du lieu à partir de son ID
  const getLieuName = (lieuId: number) => {
    return lieux?.find(l => l.id === lieuId)?.nom || "Lieu inconnu";
  };

  // Fonction pour obtenir le nom de la signalisation à partir de son ID
  const getSignalisationName = (signalisationId: number) => {
    return signalisations?.find(s => s.id === signalisationId)?.nom || "Signalisation inconnue";
  };

  // Fonction pour obtenir le nom du sous-traitant à partir de son ID
  const getSousTraitantName = (sousTraitantId: number) => {
    return sousTraitants?.find(st => st.id === sousTraitantId)?.nom || "Entreprise inconnue";
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 bg-blue-700 text-white p-4 rounded-lg shadow-md flex items-center">
        <Calendar className="mr-3" size={24} />
        Calendrier de Chantier
      </h1>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor="project-select" className="text-gray-700 font-medium flex items-center">
            <Building2 className="mr-2 text-blue-600" size={20} />
            Projet :
          </label>
          <select
            id="project-select"
            value={localSelectedProject !== null ? localSelectedProject : ""}
            onChange={(e) => setLocalSelectedProject(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
          >
            {projects &&
              projects.map((project) => (
                <option key={project.ID} value={project.ID}>
                  {project.NumeroProjet}
                </option>
              ))}
          </select>
          <button
            onClick={handleConfirmSelection}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Confirmer
          </button>
        </div>
      </div>
      
      <div className="calendar-container bg-white p-4 rounded-lg shadow-md">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale={frLocale}
          events={events}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          eventMouseEnter={handleEventMouseEnter}
          eventMouseLeave={handleEventMouseLeave}
          editable={false}
          selectable={false}
          eventColor="#f0f9ff" // Couleur de fond très légère
          eventBorderColor="#3b82f6" // Bordure bleue
          displayEventTime={false}
          eventTextColor="#1e3a8a" // Texte bleu foncé
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          height="auto"
          dayMaxEvents={3}
          buttonText={{
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            list: "Liste"
          }}
        />
      </div>

      {/* Popup d'information sur l'événement au survol */}
      {selectedEvent && (
        <div
          className="event-popup absolute bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
          style={{
            top: `${selectedEvent.position.y}px`,
            left: `${selectedEvent.position.x}px`,
            width: "400px",
          }}
        >
          {/* En-tête du popup avec le fond bleu */}
          <div className="bg-blue-600 text-white p-4">
            <h3 className="text-xl font-bold flex items-center">
              <Calendar className="mr-2" size={20} />
              Planif #{selectedEvent.event.extendedProps.planif.ID}
            </h3>
            <div className="flex items-center mt-2">
              <Clock className="mr-2" size={16} />
              <span>{selectedEvent.event.extendedProps.plageHoraire}</span>
              <Badge className="ml-3 text-xs" variant="secondary">
                {selectedEvent.event.extendedProps.activites.length} activité{selectedEvent.event.extendedProps.activites.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          
          {/* Commentaire global */}
          {selectedEvent.event.extendedProps.planif.note && (
            <div className="p-4 bg-yellow-50 border-y border-yellow-200">
              <div className="flex items-start mb-2">
                <Info className="mr-2 text-yellow-600 mt-1" size={18} />
                <h4 className="text-lg font-medium text-yellow-800">Commentaire global</h4>
              </div>
              <p className="text-gray-700 text-left">{selectedEvent.event.extendedProps.planif.note}</p>
            </div>
          )}
          
          {/* Liste des activités */}
          <div className="p-4">
            {selectedEvent.event.extendedProps.activites.map((activite: PlanifActivite, index: number) => {
              const isNight = isNightShift(activite.debut);
              const timeColorClass = getTimeColorClass(activite.debut);
              
              return (
                <div key={activite.ID || index} className="mb-4 border-b border-gray-200 pb-3 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold flex items-center">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 mr-2 text-xs">
                        {index + 1}
                      </div>
                      {getActiviteName(activite.activiteId)}
                    </h5>
                    <Badge className={timeColorClass}>
                      {isNight ? (
                        <Moon className="mr-1" size={14} />
                      ) : (
                        <Sun className="mr-1" size={14} />
                      )}
                      {activite.debut} - {activite.fin}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="mr-1 text-blue-500" size={14} />
                      <span className="text-sm">{getLieuName(activite.lieuId)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <AlertTriangle className="mr-1 text-amber-500" size={14} />
                      <span className="text-sm">{getSignalisationName(activite.signalisation)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="mr-1 text-green-500" size={14} />
                      <span className="text-sm">{getSousTraitantName(activite.sousTraitantId || selectedEvent.event.extendedProps.planif.defaultEntreprise)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      {activite.qteLab ? (
                        <>
                          <Beaker className="mr-1 text-green-500" size={14} />
                          <span className="text-sm">{activite.qteLab}</span>
                        </>
                      ) : (
                        <>
                          <Beaker className="mr-1 text-gray-400" size={14} />
                          <span className="text-sm">Aucun</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;