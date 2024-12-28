import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./MainPage"; // We'll create this from your existing App component
import EntryPage from "./EntryPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
