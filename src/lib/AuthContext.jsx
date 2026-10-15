import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

function mapSupabaseUser(supabaseUser) {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name || '',
    role: supabaseUser.app_metadata?.role || 'user',
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session) {
          setUser(mapSupabaseUser(session.user));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setAuthChecked(true);
        setIsLoadingAuth(false);
      } catch (error) {
        if (!mounted) return;
        setAuthError({ type: 'unknown', message: error.message });
        setAuthChecked(true);
        setIsLoadingAuth(false);
      }
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setUser(mapSupabaseUser(session.user));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
      setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const checkUserAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(mapSupabaseUser(session.user));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
      setIsLoadingAuth(false);
    } catch (error) {
      setAuthError({ type: 'auth_required', message: error.message });
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const navigateToLogin = useCallback(() => {
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
