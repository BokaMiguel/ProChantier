import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Form from "./components/journalForm/Form";
import CalendarPage from "./components/calendrier/CalendarPage";
import PlanningForm from "./components/calendrier/PlanningForm";
import Sidebar from "./components/header/Sidebar";
import Footer from "./components/footer/Footer";
//import Rapport from "./components/sections/rapport/journal/Rapport";
import Gestion from "./components/sections/gestions/Gestions";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Callback from "./components/Callback";

const AppContent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Chargement en cours...</div>;
  }

  return (
    <div className="App flex">
      <Sidebar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/planning" element={<PlanningForm />} />
          {/* <Route path="/rapport" element={<Rapport />} /> */}
          <Route path="/gestions" element={<Gestion />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/journal-chantier" element={<Form />} />
          <Route path="/journal-chantier/:idPlanif" element={<Form />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;
