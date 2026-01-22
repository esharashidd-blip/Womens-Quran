import { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth, type AuthState } from '@/hooks/use-supabase-auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
  signInWithApple: () => Promise<{ provider: string; url: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<object>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
