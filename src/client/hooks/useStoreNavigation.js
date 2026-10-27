import { useEffect, useRef, useState } from 'react';

const sections = ['catalogo', 'como-comprar', 'por-que-nosotros', 'preguntas'];

export function useStoreNavigation(menuOpen, closeMenu) {
  const [activeSection, setActiveSection] = useState('');
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let active = '';
      sections.forEach(id => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= 140) active = id;
      });
      setActiveSection(active);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        closeMenu(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = event => {
      if (!headerRef.current?.contains(event.target)) closeMenu(false);
    };
    const desktop = window.matchMedia('(min-width: 1280px)');
    const onResize = () => { if (desktop.matches) closeMenu(false); };
    const onFocus = event => {
      if (!headerRef.current?.contains(event.target)) closeMenu(false);
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocus);
    desktop.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocus);
      desktop.removeEventListener('change', onResize);
    };
  }, [menuOpen, closeMenu]);

  return { activeSection, headerRef, menuButtonRef };
}
