import React from "react";
import { useNavigate } from "react-router-dom";

const EntryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl mb-8">Welcome to Hardback Hacker</h1>
      <button className="button" onClick={() => navigate("/main")}>
        Enter Application
      </button>
    </div>
  );
};

export default EntryPage;
