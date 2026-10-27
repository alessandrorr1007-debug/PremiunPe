import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_EMAIL = 'admin@premiumpe.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      const savedDemoUser = localStorage.getItem('premiumpe_demo_admin');
      if (savedDemoUser) {
        try {
          setUser(JSON.parse(savedDemoUser));
        } catch {
          localStorage.removeItem('premiumpe_demo_admin');
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user?.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        throw new Error(`Acceso denegado. Solo la cuenta ${ADMIN_EMAIL} tiene acceso administrativo.`);
      }

      setUser(data.user);
      setSession(data.session);
      return data.user;
    }

    // Modo demostración local
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === 'PremiumPe#2026!k9Q') {
      const demoUser = {
        id: 'demo-admin-id',
        email: ADMIN_EMAIL,
        user_metadata: { role: 'admin' },
      };
      localStorage.setItem('premiumpe_demo_admin', JSON.stringify(demoUser));
      setUser(demoUser);
      return demoUser;
    } else {
      throw new Error('Credenciales incorrectas o usuario no registrado.');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('premiumpe_demo_admin');
    setUser(null);
    setSession(null);
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  const value = {
    user,
    session,
    loading,
    isAdmin,
    adminEmail: ADMIN_EMAIL,
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
