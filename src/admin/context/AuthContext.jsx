import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_EMAIL = 'admin@premiumpe.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase es la única fuente de autenticación administrativa
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch(() => { setSession(null); setUser(null); setLoading(false); });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      localStorage.removeItem('premiumpe_demo_admin');
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password) => {
    const trimmedId = (identifier || '').trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedId === 'admin' || trimmedId === 'cheridecheros' ? ADMIN_EMAIL : trimmedId,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user?.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        throw new Error(`Acceso denegado. La cuenta no cuenta con permisos administrativos.`);
      }

      setUser(data.user);
      setSession(data.session);
      return data.user;
    }

    throw new Error('Supabase no está configurado en esta publicación. Contacta al administrador.');
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error al desloguear de Supabase:', err);
      }
    }
    localStorage.removeItem('premiumpe_demo_admin');
    setUser(null);
    setSession(null);
  };

  const isAdmin = Boolean(supabase && session?.user?.email?.toLowerCase() === ADMIN_EMAIL);

  const value = {
    user,
    session,
    loading,
    isAdmin,
    adminEmail: user?.email || ADMIN_EMAIL,
    isSupabaseActive: isSupabaseConfigured(),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
