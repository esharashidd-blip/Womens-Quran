import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string | undefined;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

function mapSupabaseUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    firstName: user.user_metadata?.display_name || user.user_metadata?.first_name || user.user_metadata?.full_name?.split(" ")[0] || null,
    lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || null,
    profileImageUrl: user.user_metadata?.avatar_url || null,
  };
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(mapSupabaseUser(session?.user ?? null));
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(mapSupabaseUser(session?.user ?? null));
        setIsLoading(false);

        // Invalidate queries when auth state changes
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          queryClient.invalidateQueries();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const logout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const updateDisplayName = async (displayName: string) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    });
    if (error) throw error;
    setUser(mapSupabaseUser(data.user));
    return data;
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    logout,
    login,
    signUp,
    loginWithGoogle,
    updateDisplayName,
  };
}
