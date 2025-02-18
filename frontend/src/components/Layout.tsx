import React from "react";
import LoginStatus from "./LoginStatus";
import ThemeToggle from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <div className="top-right-corner-container">
        <LoginStatus />
        <ThemeToggle />
      </div>
      <div className="main-content">{children}</div>
    </div>
  );
};

export default Layout;
