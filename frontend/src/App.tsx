import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./MainPage"; // We'll create this from your existing App component
import EntryPage from "./EntryPage";
import config from "./config";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import Layout from "./components/Layout";

const App: React.FC = () => {
  useEffect(() => {
    document.title = config.title; // set the title of the page (tab title in chrome)
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<EntryPage />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
