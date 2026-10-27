import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutos
const WARNING_LIMIT_MS = 28 * 60 * 1000;    // 28 minutos (2 min antes)

export default function InactivityGuard() {
  const { user, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const resetActivity = () => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(120);
    }
  };

  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleEvent = () => resetActivity();

    events.forEach((ev) => window.addEventListener(ev, handleEvent, { passive: true }));

    // Check interval every 5 seconds
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= INACTIVITY_LIMIT_MS) {
        clearInterval(timerRef.current);
        logout();
      } else if (elapsed >= WARNING_LIMIT_MS) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.ceil((INACTIVITY_LIMIT_MS - elapsed) / 1000));
        setSecondsRemaining(remaining);
      } else {
        setShowWarning(false);
      }
    }, 5000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleEvent));
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [user, logout, showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-[24px] bg-cardBg border border-aji/40 p-6 shadow-2xl text-cream space-y-4">
        <div className="flex items-center gap-3 text-aji">
          <div className="w-10 h-10 rounded-xl bg-aji/15 border border-aji/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-aji" />
          </div>
          <div>
            <h3 className="font-sora font-bold text-base text-cream">Inactividad detectada</h3>
            <p className="text-xs text-muted">Seguridad del panel administrativo</p>
          </div>
        </div>

        <p className="text-sm text-cream/90 leading-relaxed font-sans">
          Tu sesión se cerrará automáticamente en{' '}
          <span className="font-mono font-bold text-aji tabular-nums">
            {secondsRemaining}s
          </span>{' '}
          por motivos de seguridad.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => logout()}
            className="px-4 py-2.5 rounded-xl text-xs font-sora font-semibold text-muted hover:text-cream transition-colors min-h-[44px]"
          >
            Cerrar sesión ahora
          </button>
          <button
            onClick={resetActivity}
            className="px-5 py-2.5 rounded-xl admin-button-primary text-xs font-sora font-bold min-h-[44px]"
          >
            Continuar conectado
          </button>
        </div>
      </div>
    </div>
  );
}
