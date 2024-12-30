import React, { createContext, useContext, useState, useEffect } from "react";
import { isValidUUID } from "./utils/validation";

interface User {
  guid: string;
  googleId: string; // Google's user ID
  email: string;
  name: string;
  createdAt: string; // ISO date string
  lastLogin: string; // ISO date string
}

interface AuthContextType {
  isAuthenticated: boolean;

  // Stores user data, can be any type or null
  // The 'any' type is flexible but not type-safe - in production you'd want to define a specific User interface
  user: User | null;

  // A function that takes user data as a parameter and returns nothing (void)
  // The (userData: any) part defines the parameter and its type
  // The => void part indicates the return type
  login: (userData: User) => void;

  // A function that takes no parameters and returns nothing
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/*
  AuthProvider wraps the entire application and provides authentication state and functions
*/
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser); // as User;
      if (isValidUUID(parsedUser.guid)) {
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (userData: User) => {
    if (isValidUUID(userData.guid)) {
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      console.error("Invalid UUID format in user data");
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/*
useAuth is a custom hook that provides access to the AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
