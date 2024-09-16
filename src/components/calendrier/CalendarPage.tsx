import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "./CalendarPage.scss";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  extendedProps: {
    projectName: string;
    status: "empty" | "complete";
    notes: string;
  };
}

const CalendarPage: React.FC = () => {
  const {
    projects,
    selectedProject,
    selectProject,
    activitesPlanif,
    activites,
    lieux,
    sousTraitants,
    signalisations,
  } = useAuth();
  const [localSelectedProject, setLocalSelectedProject] = useState<
    number | null
  >(selectedProject ? selectedProject.ID : null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const navigate = useNavigate(); // Utilisation de useNavigate pour la redirection

  useEffect(() => {
    const savedProjectId = localStorage.getItem("selectedProjectId");
    if (savedProjectId) {
      const project = projects?.find((p) => p.ID === Number(savedProjectId));
      if (project) {
        selectProject(project);
        setLocalSelectedProject(project.ID);
      }
    }
  }, [projects, selectProject]);

  useEffect(() => {
    if (activitesPlanif && activites && localSelectedProject) {
      const filteredActivities = activitesPlanif.filter(
        (activity) => activity.date
      );

      const formattedEvents = filteredActivities.map((activity) => {
        const relatedActivity = activites.find(
          (act) => act.id === activity.activiteID
        );
        const nomActivite = relatedActivity ? relatedActivity.nom : "Inconnu";
        const lieuName =
          lieux?.find((l) => l.id === activity.lieuID)?.nom || "Inconnu";
        const entrepriseName =
          sousTraitants?.find((st) => st.id === activity.defaultEntrepriseId)
            ?.nom || "Inconnu";
        const signalisationName =
          signalisations?.find((sig) => sig.id === activity.signalisationId)
            ?.nom || "Inconnu";

        return {
          id: String(activity.id),
          title: nomActivite,
          start: new Date(activity.date!),
          extendedProps: {
            projectName: relatedActivity ? relatedActivity.nom : "Sans projet", // Ajouté projectName
            status: "empty" as "empty" | "complete", // Ajouté status
            lieuName,
            entrepriseName,
            plageHoraire: `${activity.hrsDebut} - ${activity.hrsFin}`,
            signalisationName,
            notes: activity.note || "",
          },
        };
      });

      setEvents(formattedEvents);
    }
  }, [
    activitesPlanif,
    activites,
    lieux,
    sousTraitants,
    signalisations,
    localSelectedProject,
  ]);

  const handleConfirmSelection = () => {
    const selected = projects?.find(
      (project) => project.ID === localSelectedProject
    );
    if (selected) {
      selectProject(selected);
      localStorage.setItem("selectedProjectId", String(selected.ID));
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    let title = prompt("Please enter the name of the activity");
    let projectName = prompt("Please enter the name of the project");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect();

    if (title && projectName) {
      const newEvent: CalendarEvent = {
        id: String(events.length + 1),
        title,
        start: selectInfo.start,
        end: selectInfo.end,
        extendedProps: {
          projectName,
          status: "empty",
          notes: "",
        },
      };

      setEvents([...events, newEvent]);
      calendarApi.addEvent(newEvent as any);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const eventId = clickInfo.event.id;
    navigate(`/journal-chantier/${eventId}`); // Rediriger vers la page spécifique avec l'ID de l'activité planifiée
  };

  const renderEventContent = (eventInfo: any) => {
    const { extendedProps } = eventInfo.event;

    return (
      <div className="relative group">
        <span className="truncate block">{eventInfo.event.title}</span>
        <div className="absolute hidden group-hover:block bg-white text-gray-900 text-sm border border-gray-300 p-2 rounded-md shadow-lg z-10 w-64">
          <p className="truncate">
            <strong>Activité:</strong> {eventInfo.event.title}
          </p>
          <p className="truncate">
            <strong>Lieu:</strong> {extendedProps.lieuName}
          </p>
          <p className="truncate">
            <strong>Entreprise:</strong> {extendedProps.entrepriseName}
          </p>
          <p className="truncate">
            <strong>Plage Horaire:</strong> {extendedProps.plageHoraire}
          </p>
          <p className="truncate">
            <strong>Signalisation:</strong> {extendedProps.signalisationName}
          </p>
          {extendedProps.notes && (
            <p className="truncate">
              <strong>Notes:</strong> {extendedProps.notes}
            </p>
          )}
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
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick} // Utiliser handleEventClick pour rediriger sur le clic
        eventContent={renderEventContent} // Utilise renderEventContent pour afficher le contenu personnalisé
        editable={true}
        droppable={true}
        selectable={true}
        eventColor="#007bff"
        displayEventTime={false}
        eventTextColor="#ffffff"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
      />
    </div>
  );
};

export default CalendarPage;
