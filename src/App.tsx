import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Form from "./components/journalForm/Form";
import Header from "./components/header/Header";
import CalendarPage from "./components/calendrier/CalendarPage";
import PlanningForm from "./components/calendrier/PlanningForm";
import CreateActivity from "./components/calendrier/CreateActivity";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Form />} />
            <Route path="/:type" element={<Form />} />
            <Route path="/calendrier" element={<CalendarPage />} />
            <Route path="/planning" element={<PlanningForm />} />
            <Route path="/planning" element={<PlanningForm />} />
            <Route path="/create-activity" element={<CreateActivity />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
