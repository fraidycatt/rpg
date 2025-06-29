// src/context/AuthContext.tsx

'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface User {
  userId: number;
  username: string;
  flarum_id: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
        const decodedUser: User = jwtDecode(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to decode token on initial load", error);
      // If token is bad, clear it out
      localStorage.removeItem('jwt_token');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    try {
        const decodedUser: User = jwtDecode(newToken);
        localStorage.setItem('jwt_token', newToken);
        setUser(decodedUser);
        setToken(newToken);
        // --- DIAGNOSTIC LOG ---
        console.log("LOGIN SUCCESS: New token set in localStorage.");
        router.push('/');
    } catch (error) {
        console.error("Failed to process new token during login:", error);
    }
  };

  const logout = () => {
    // --- THIS IS THE FIX ---
    // This more aggressive logout ensures everything is cleared.
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    // --- DIAGNOSTIC LOG ---
    console.log("LOGOUT: Token cleared from localStorage.");
    // We use a full page reload to ensure no old state remains.
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}