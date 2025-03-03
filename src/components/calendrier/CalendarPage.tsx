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
import { TabPlanifChantier, TabPlanifActivites } from "../../models/JournalFormModel";
import { FaMapMarkerAlt, FaBuilding, FaClock, FaExclamationTriangle, FaStickyNote, FaListUl } from 'react-icons/fa';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  extendedProps: {
    planifChantier: TabPlanifChantier;
    activites: {
      id: number;
      nom: string;
    }[];
    lieuName: string;
    entrepriseName: string;
    plageHoraire: string;
    signalisationName: string;
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
  const [planifChantier, setPlanifChantier] = useState<TabPlanifChantier[]>([]);
  const [planifActivites, setPlanifActivites] = useState<TabPlanifActivites[]>([]);
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

  // Nouvelle fonction pour charger les planifications
  const loadPlanifications = async (projectId: number) => {
    try {
      const planifChantierData = await getPlanifChantierByProjet(projectId);
      setPlanifChantier(planifChantierData);
      
      if (planifChantierData && planifChantierData.length > 0) {
        // Charger les activités pour toutes les planifications
        const activitesPromises = planifChantierData.map((planif: TabPlanifChantier) => 
          getPlanifActivites(planif.id).then(activites => {
            return activites;
          })
        );
        
        const allActivites = await Promise.all(activitesPromises);
        // Fusionner toutes les activités en une seule liste
        const mergedActivites = allActivites.flat();
        setPlanifActivites(mergedActivites);
      } else {
        setPlanifActivites([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des planifications:", error);
      setPlanifChantier([]);
      setPlanifActivites([]);
    }
  };

  // Charger les planifications quand le projet change
  useEffect(() => {
    if (localSelectedProject) {
      loadPlanifications(localSelectedProject);
    }
  }, [localSelectedProject]);

  // Mettre à jour les événements quand les planifications changent
  useEffect(() => {
    if (planifChantier.length > 0 && planifActivites && activites) {
      // Regrouper les activités par planifID
      const activitesByPlanif = planifActivites.reduce((acc, curr) => {
        if (!acc[curr.planifID]) {
          acc[curr.planifID] = [];
        }
        const activiteInfo = curr.activiteID ? activites.find(act => act.id === curr.activiteID) : null;
        if (activiteInfo && curr.activiteID) {
          acc[curr.planifID].push({
            id: curr.activiteID,
            nom: activiteInfo.nom
          });
        }
        return acc;
      }, {} as { [key: number]: { id: number; nom: string; }[] });

      // Créer un événement par planification
      const formattedEvents = planifChantier.map(planif => {
        const planifActivites = activitesByPlanif[planif.id] || [];
        
        // Vérification et parsing de la date
        let eventDate;
        try {
          // Vérifier si la date est au format ISO
          if (planif.date.includes('T')) {
            eventDate = new Date(planif.date);
          } else {
            // Si la date est au format YYYY-MM-DD
            eventDate = parseISO(planif.date);
          }
          
          if (isNaN(eventDate.getTime())) {
            console.error('Date invalide pour planif:', planif.id);
            return null;
          }
        } catch (error) {
          console.error('Erreur de parsing de date pour planif:', planif.id, error);
          return null;
        }

        const lieuName = lieux?.find((l) => l.id === planif.lieuID)?.nom || "Inconnu";
        const entrepriseName = sousTraitants?.find((st) => st.id === planif.defaultEntrepriseId)?.nom || "Inconnu";
        const signalisationName = signalisations?.find((sig) => sig.id === planif.signalisationId)?.nom || "Inconnu";

        // Créer un titre qui montre le nombre d'activités
        const title = `${planifActivites.length} activité${planifActivites.length > 1 ? 's' : ''}`;

        return {
          id: String(planif.id),
          title,
          start: eventDate,
          allDay: true,
          extendedProps: {
            planifChantier: planif,
            activites: planifActivites,
            lieuName,
            entrepriseName,
            plageHoraire: `${planif.hrsDebut} - ${planif.hrsFin}`,
            signalisationName,
          },
        };
      }).filter(event => event !== null);

      console.log('Événements formatés:', formattedEvents);
      setEvents(formattedEvents as CalendarEvent[]);
    }
  }, [planifChantier, planifActivites, activites, lieux, sousTraitants, signalisations]);

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
    const eventId = clickInfo.event.extendedProps.planifChantier.id;
    navigate(`/journal-chantier/${eventId}`);
  };

  const handleEventMouseEnter = (mouseEnterInfo: any) => {
    const rect = mouseEnterInfo.el.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculer la position du popup
    let x = rect.right + 10; // Par défaut, à droite de l'événement
    let y = rect.top;

    // Si le popup dépasse à droite de l'écran
    if (x + 320 > viewportWidth) { // 320px est la largeur max du popup
      x = rect.left - 330; // Placer à gauche de l'événement
    }

    // Si le popup dépasse en bas de l'écran
    if (y + 400 > viewportHeight) { // 400px est une hauteur estimée du popup
      y = viewportHeight - 420; // Laisser un peu d'espace en bas
    }

    setSelectedEvent({
      event: mouseEnterInfo.event,
      position: { x, y }
    });
  };

  const handleEventMouseLeave = () => {
    setSelectedEvent(null);
  };

  const renderEventContent = (eventInfo: any) => {
    const { extendedProps } = eventInfo.event;
    return (
      <div className="event-content">
        <div className="event-title">
          <FaListUl />
          {eventInfo.event.title}
        </div>
        <div className="event-details">
          <FaMapMarkerAlt />
          {extendedProps.lieuName}
        </div>
        <div className="event-details">
          <FaClock />
          {extendedProps.plageHoraire}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 bg-blue-800 text-white p-3 rounded">
        Calendrier de Chantier
      </h1>
      <div className="mb-4 flex items-center space-x-2">
        <label htmlFor="project-select" className="text-gray-700 font-medium">
          Projet :
        </label>
        <select
          id="project-select"
          value={localSelectedProject !== null ? localSelectedProject : ""}
          onChange={(e) => setLocalSelectedProject(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
          className="ml-2 p-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Confirmer
        </button>
      </div>
      <div className="calendar-container">
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
          eventColor="#3b82f6"
          displayEventTime={false}
          eventTextColor="#ffffff"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
        />
      </div>
      {selectedEvent && (
        <div
          className="event-popup"
          style={{
            left: selectedEvent.position.x,
            top: selectedEvent.position.y,
          }}
        >
          <div className="popup-header">
            <h3><FaListUl className="inline-block mr-2 mb-1" />Activités planifiées</h3>
          </div>

          <div className="activities-section">
            <ul className="activities-list">
              {selectedEvent.event.extendedProps.activites.map((act: any) => (
                <li key={act.id}>{act.nom}</li>
              ))}
            </ul>
          </div>

          <div className="info-section">
            <div className="info-item">
              <label><FaMapMarkerAlt className="inline-block mr-2 text-blue-600" />Lieu :</label>
              <span>{selectedEvent.event.extendedProps.lieuName}</span>
            </div>
            <div className="info-item">
              <label><FaBuilding className="inline-block mr-2 text-blue-600" />Entreprise :</label>
              <span>{selectedEvent.event.extendedProps.entrepriseName}</span>
            </div>
            <div className="info-item">
              <label><FaClock className="inline-block mr-2 text-blue-600" />Plage Horaire :</label>
              <span>{selectedEvent.event.extendedProps.plageHoraire}</span>
            </div>
            <div className="info-item">
              <label><FaExclamationTriangle className="inline-block mr-2 text-blue-600" />Signalisation :</label>
              <span>{selectedEvent.event.extendedProps.signalisationName}</span>
            </div>
            {selectedEvent.event.extendedProps.planifChantier.note && (
              <div className="info-item">
                <label><FaStickyNote className="inline-block mr-2 text-blue-600" />Notes :</label>
                <span>{selectedEvent.event.extendedProps.planifChantier.note}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
