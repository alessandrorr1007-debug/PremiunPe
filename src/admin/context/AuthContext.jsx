import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ADMIN_EMAIL = 'admin@premiumpe.com';
const AuthContext = createContext(null);
const hasAdminIdentity = user => user?.email?.toLowerCase() === ADMIN_EMAIL &&
  Boolean(user.email_confirmed_at);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;
    let revision = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const current = ++revision;
      if (!nextSession) {
        setSession(null);
        setLoading(false);
        return;
      }

      // A stored browser session cannot authorize the panel until Auth verifies it.
      setTimeout(async () => {
        try {
          const { data, error } = await supabase.auth.getUser(nextSession.access_token);
          if (current === revision) {
            setSession(!error && hasAdminIdentity(data.user) ? { ...nextSession, user: data.user } : null);
          }
        } catch {
          if (current === revision) setSession(null);
        } finally {
          if (current === revision) setLoading(false);
        }
      }, 0);
    });

    return () => {
      revision++;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (!supabase) throw new Error('El acceso administrativo requiere configurar Supabase.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw new Error('No se pudo iniciar sesión.');
    if (!hasAdminIdentity(data.user)) {
      await supabase.auth.signOut({ scope: 'local' });
      throw new Error('La cuenta no tiene acceso administrativo.');
    }
    setSession(data.session);
    return data.user;
  };

  const logout = async () => {
    setSession(null);
    await supabase?.auth.signOut({ scope: 'local' });
  };

  const user = session?.user ?? null;
  const value = {
    user,
    session,
    loading,
    isAdmin: hasAdminIdentity(user),
    adminEmail: user?.email || ADMIN_EMAIL,
    isSupabaseActive: isSupabaseConfigured(),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  return context;
}
