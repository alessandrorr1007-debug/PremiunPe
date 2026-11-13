import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_EMAIL = 'admin@premiumpe.com';

// Credenciales autorizadas para acceso administrativo
const LOCAL_CREDENTIALS = [
  { username: 'cheridecheros', password: 'Pool', email: 'cheridecheros@premiumpe.com' },
  { username: 'cheridecheros@premiumpe.com', password: 'Pool', email: 'cheridecheros@premiumpe.com' },
  { username: 'admin@premiumpe.com', password: 'PremiumPe#2026!k9Q', email: ADMIN_EMAIL },
  { username: 'admin', password: 'PremiumPe#2026!k9Q', email: ADMIN_EMAIL }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Si Supabase está configurado, escuchar cambios de sesión
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
      // 1. Verificar si hay sesión demo guardada
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

  const login = async (identifier, password) => {
    const trimmedId = (identifier || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

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

    // 1. Verificación directa contra credenciales locales
    const matchedCred = LOCAL_CREDENTIALS.find(
      (c) => c.username.toLowerCase() === trimmedId && c.password === trimmedPass
    );

    if (matchedCred) {
      const adminUser = {
        id: 'admin-cheridecheros',
        email: matchedCred.email,
        username: matchedCred.username,
        user_metadata: { role: 'admin', name: 'Administrador' },
      };
      localStorage.setItem('premiumpe_demo_admin', JSON.stringify(adminUser));
      setUser(adminUser);
      return adminUser;
    }

    throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.');
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

  const isAdmin = supabase ? session?.user?.email === ADMIN_EMAIL : Boolean(
    user && (
      user.email === ADMIN_EMAIL ||
      user.email === 'cheridecheros@premiumpe.com' ||
      user.username === 'cheridecheros' ||
      user.user_metadata?.role === 'admin'
    )
  );

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
