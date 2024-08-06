import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleCallback } from "../services/AuthService";

const Callback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback()
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        console.error("Error handling callback:", err);
        navigate("/error"); // Rediriger vers une page d'erreur ou afficher un message d'erreur
      });
  }, [handleCallback, navigate]);

  return <div>Loading...</div>;
};

export default Callback;
