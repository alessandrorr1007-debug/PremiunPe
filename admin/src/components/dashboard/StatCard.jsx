import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, count, subtitle, icon: Icon, color = 'brand' }) {
  const [displayCount, setDisplayCount] = useState(0);

  // Animación suave de conteo numérico
  useEffect(() => {
    let start = 0;
    const end = parseInt(count, 10) || 0;
    if (end === 0) {
      setDisplayCount(0);
      return;
    }
    const duration = 600; // ms
    const stepTime = Math.max(20, Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setDisplayCount(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [count]);

  const colorStyles = {
    brand: {
      bg: 'bg-white/[0.05] border-borderCream text-cream',
      num: 'text-cream',
    },
    emerald: {
      bg: 'bg-lime/15 border-lime/30 text-lime',
      num: 'text-lime',
    },
    rose: {
      bg: 'bg-rocoto/15 border-rocoto/30 text-rocoto',
      num: 'text-rocoto',
    },
    purple: {
      bg: 'bg-aji/15 border-aji/30 text-aji',
      num: 'text-aji',
    },
  };

  const style = colorStyles[color] || colorStyles.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[20px] bg-[#121216]/90 border border-borderCream p-5 shadow-admin-card flex flex-col justify-between hover:border-cream/20 transition-all text-left group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted">{title}</span>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${style.bg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <span className={`text-3xl font-extrabold tracking-tight font-sora tabular-nums block ${style.num}`}>
          {displayCount}
        </span>
        {subtitle && (
          <p className="text-[11px] text-muted mt-1.5 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
