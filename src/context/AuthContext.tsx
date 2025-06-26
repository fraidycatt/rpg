'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

// DO NOT call useRouter() here. This is the top-level module scope.
// const router = useRouter(); 

// Define the shape of the user data we'll get from the token
interface User {
  userId: number;
  username: string;
  flarum_id: number; // Make sure this is included from our previous steps!
}

// Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  token: string | null;
  authLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

// This is the "Provider" component that will wrap our app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // --- THIS IS THE CORRECT PLACE ---
  // Call hooks at the top level, INSIDE the function component body.
  const router = useRouter();

  // This effect runs once when the app first loads
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
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    const decodedUser: User = jwtDecode(newToken);
    localStorage.setItem('jwt_token', newToken);
    setUser(decodedUser);
    setToken(newToken);
    router.push('/'); // Redirect after login
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    setToken(null);
    // This will now work because 'router' is defined in the component's scope
    router.push('/login'); 
  };

  return (
    <AuthContext.Provider value={{ user, token, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// This is a custom "hook" that makes it easy to access the context from any component
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}