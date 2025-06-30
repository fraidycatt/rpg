// src/context/AuthContext.tsx

'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useMemo, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
// import { useRouter } from 'next/navigation'; // <-- REMOVE THIS

interface User {
  userId: number;
  username: string;
  flarum_id: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  login: (token: string) => void; // The function signature is the same
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // const router = useRouter(); // <-- REMOVE THIS

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
      localStorage.removeItem('jwt_token');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // FIX: The login function no longer handles routing. It only sets state.
  const login = useCallback((newToken: string) => {
    try {
        const decodedUser: User = jwtDecode(newToken);
        localStorage.setItem('jwt_token', newToken);
        setUser(decodedUser);
        setToken(newToken);
        // router.push('/'); // <-- REMOVE THIS
    } catch (error) {
        console.error("Failed to process new token during login:", error);
    }
  }, []); // No dependencies needed now

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  // This part remains the same, providing a stable context value.
  const authContextValue = useMemo(() => ({
    user,
    token,
    authLoading,
    login,
    logout
  }), [user, token, authLoading, login, logout]);

  return (
    <AuthContext.Provider value={authContextValue}>
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