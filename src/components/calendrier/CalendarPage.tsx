import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "./CalendarPage.scss"; // Assurez-vous d'importer le fichier CSS

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
  const { projects, selectedProject, selectProject } = useAuth();
  const [localSelectedProject, setLocalSelectedProject] = useState<
    number | null
  >(selectedProject ? selectedProject.ID : null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

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

  const handleDateSelect = (selectInfo: any) => {
    let title = prompt("Please enter the name of the activity");
    let projectName = prompt("Please enter the name of the project");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

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
    const event = clickInfo.event;
    if (
      window.confirm(
        `Are you sure you want to delete the event '${event.title}'`
      )
    ) {
      event.remove();
      setEvents(events.filter((evt) => evt.id !== event.id));
    }
  };

  const handleConfirmSelection = () => {
    const selected = projects?.find(
      (project) => project.ID === localSelectedProject
    );
    if (selected) {
      selectProject(selected);
      localStorage.setItem("selectedProjectId", String(selected.ID));
    }
  };

  const updateCalendarTitle = (dateInfo: any) => {
    const titleElement = document.querySelector(".fc-toolbar-title");
    if (titleElement) {
      const date = new Date(dateInfo.start);
      const formattedMonth = format(date, "MMMM yyyy", { locale: fr });
      const capitalizedTitle =
        formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);
      titleElement.innerHTML = capitalizedTitle;
    }
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
        eventClick={handleEventClick}
        editable={true}
        droppable={true}
        selectable={true}
        eventColor="#007bff"
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
