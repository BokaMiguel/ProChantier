import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import frLocale from "@fullcalendar/core/locales/fr";

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
      <h1 className="text-2xl font-bold mb-4 bg-blue-500 text-white p-3 rounded">
        Calendrier de Chantier
      </h1>
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
