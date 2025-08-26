// components/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter, usePathname } from 'next/navigation';

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
}

// Create the context
const AuthContext = createContext<AuthContextType>({ user: null });

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Logic for redirection
      if (!user && pathname !== '/login') {
        router.push('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, pathname]);

  // Show a loading screen or nothing while checking auth state
  if (loading || (!user && pathname !== '/login')) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Render children if user is logged in or is on the login page
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);