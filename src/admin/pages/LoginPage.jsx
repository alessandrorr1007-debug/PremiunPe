import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Eye, EyeOff, ShieldCheck, Clock, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Rate limiting / Cooldown tras 4 intentos fallidos consecutivos
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef(null);

  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (cooldownSeconds > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cooldownTimerRef.current);
  }, [cooldownSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldownSeconds > 0 || submitting) return;

    setErrorMessage('');

    if (!username || !password) {
      setErrorMessage('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    try {
      setSubmitting(true);
      await login(username, password);
      setFailedAttempts(0);
      navigate('/admin', { replace: true });
    } catch (err) {
      console.error('Error de autenticación administrativa:', err);
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= 4) {
        setCooldownSeconds(15);
        setErrorMessage('Demasiados intentos erróneos. Espera 15 segundos.');
      } else {
        const errorText = err.message?.toLowerCase().includes('credenciales')
          ? 'Usuario o contraseña incorrectos. Verifica tus credenciales.'
          : (err.message || 'Error al iniciar sesión. Intenta nuevamente.');
        setErrorMessage(errorText);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-night text-cream p-4 relative overflow-hidden select-none font-inter">
      {/* Halo de luz ambiente cálido */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[400px] bg-aji/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Botón flotante para regresar a la tienda */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-borderCream text-xs text-muted hover:text-cream transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-aji" />
          <span>Volver a la tienda</span>
        </Link>
      </div>

      <main className="w-full max-w-[420px] relative z-10">
        <div className="rounded-[24px] bg-[#121216]/95 border border-borderCream p-8 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          {/* Logo y Encabezado */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-2xl bg-aji text-night flex items-center justify-center font-sora font-extrabold text-2xl mx-auto mb-4 shadow-[0_0_20px_rgba(0,0,0,0.45)]">
              P
            </div>
            <h1 className="text-2xl font-sora font-bold text-cream tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-xs text-muted mt-1.5">
              Gestión del catálogo y precios de <span className="text-cream font-semibold">PremiumPe</span>
            </p>
          </div>

          {/* Aviso de seguridad */}
          <div className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-borderCream text-xs text-muted flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-aji shrink-0 mt-0.5" />
            <span>
              Ingresa con tus credenciales de administrador autorizadas.
            </span>
          </div>

          {/* Alerta de Error */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-rocoto/15 border border-rocoto/30 text-xs text-cream flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rocoto shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Alerta de Cooldown / Bloqueo temporal */}
          {cooldownSeconds > 0 && (
            <div className="mb-6 p-3 rounded-xl bg-aji/15 border border-aji/30 text-xs text-cream flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-aji shrink-0 animate-spin" />
              <span>Bloqueado temporalmente. Espera {cooldownSeconds}s para volver a intentar.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 text-left">
                Usuario o Correo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  disabled={submitting || cooldownSeconds > 0}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-borderCream text-cream placeholder-muted/60 text-xs sm:text-sm focus:outline-none focus:border-aji transition-all min-h-[44px]"
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
                  placeholder="••••••••••••"
                  disabled={submitting || cooldownSeconds > 0}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-borderCream text-cream placeholder-muted/60 text-xs sm:text-sm focus:outline-none focus:border-aji transition-all min-h-[44px]"
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
              disabled={submitting || cooldownSeconds > 0}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-aji text-night font-sora font-bold text-xs sm:text-sm shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-night/30 border-t-night rounded-full animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <span>Iniciar Sesión en Admin</span>
              )}
            </button>
          </form>

          {/* Enlace para volver a la tienda pública */}
          <div className="mt-6 pt-5 border-t border-borderCream text-center">
            <Link
              to="/"
              className="text-xs text-muted hover:text-cream transition-colors inline-flex items-center gap-1.5"
            >
              <span>Ver tienda pública</span>
              <span className="text-aji">↗</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
