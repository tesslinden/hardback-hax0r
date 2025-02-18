import React from "react";
import LoginStatus from "./LoginStatus";
import ThemeToggle from "./ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      {/* Fixed position header for login and theme toggle */}
      <div className="fixed top-0 right-0 p-4 flex gap-4 items-center z-50">
        <LoginStatus />
        <ThemeToggle />
      </div>

      {/* Main content with padding to account for fixed header */}
      <div className="pt-16">{children}</div>
    </div>
  );
};

export default Layout;
