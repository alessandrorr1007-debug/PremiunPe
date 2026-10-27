import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../admin/context/AuthContext';
import { Lock, User, Eye, EyeOff, X, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setErrorMessage('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Ingresa usuario y contraseña.');
      return;
    }

    try {
      setSubmitting(true);
      await login(username, password);
      onClose();
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setErrorMessage('Credenciales incorrectas. Verifica tu usuario y contraseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-3xl bg-surface/95 border border-borderCream p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-10 font-inter text-cream overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-aji/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-cream hover:bg-ink/5 transition-all cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-aji text-night flex items-center justify-center font-sora font-extrabold text-2xl mx-auto mb-3 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
              P
            </div>
            <h2 className="text-xl font-sora font-bold text-cream">
              Acceso Administrativo
            </h2>
            <p className="text-xs text-muted mt-1">
              Ingresa tus credenciales para configurar catálogo y precios
            </p>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rocoto/15 border border-rocoto/30 text-xs text-cream flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rocoto shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 text-left">
                Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink/[0.04] border border-borderCream text-cream placeholder-muted/60 text-xs sm:text-sm focus:outline-none focus:border-aji transition-all min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 text-left">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={submitting}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-ink/[0.04] border border-borderCream text-cream placeholder-muted/60 text-xs sm:text-sm focus:outline-none focus:border-aji transition-all min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-cream p-1 rounded cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-aji text-night font-sora font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ingresar al Panel Admin</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-borderCream/60 text-center text-[11px] text-muted">
            <span>Solo personal autorizado de PremiumPe</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
