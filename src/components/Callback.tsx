import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const { handleCallback, isLoading } = useAuth();

  useEffect(() => {
    const handleCallbackEffect = async () => {
      try {
        await handleCallback();
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Error handling callback:", err);
        navigate("/error", { replace: true });
      }
    };

    if (!isLoading) {
      handleCallbackEffect();
    }
  }, [handleCallback, navigate, isLoading]);

  return <div>Processing authentication...</div>;
};

export default Callback;
