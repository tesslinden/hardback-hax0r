import React, { createContext, useContext, useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export interface User {
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
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser); // as User;
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <GoogleOAuthProvider
      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
    >
      <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

/*
  useAuth is a custom hook that provides access to the AuthContext
*/
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
