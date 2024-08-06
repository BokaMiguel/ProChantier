import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";
import { useAuth } from "../../context/AuthContext";
import { Project } from "../../models/UserModels";

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
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Faire rampe",
      start: new Date(),
      extendedProps: {
        projectName: "Projet A",
        status: "empty",
        notes: "",
      },
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [selectedProject, setSelectedProject] = useState<string>("2024-1232");
  const { user: currentUser } = useAuth(); // Utiliser useAuth pour accéder aux données du contexte

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
          notes: "", // Initialize notes with an empty string
        },
      };

      setEvents([...events, newEvent]);
      calendarApi.addEvent(newEvent as any);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event as unknown as CalendarEvent);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 bg-blue-800 text-white p-3 rounded">
        Calendrier de Chantier
      </h1>

      {/* Button for project selection */}
      <div className="mb-4 flex items-center space-x-2">
        <label htmlFor="project-select" className="text-gray-700 font-medium">
          Projet :
        </label>
        <select
          id="project-select"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {/* {currentUser &&
            currentUser.projects &&
            currentUser.projects.map((project: Project) => (
              <option key={project.ID} value={project.ID}>
                {project.NumeroProjet}
              </option>
            ))} */}
        </select>
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
