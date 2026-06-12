/**
 * useTheme — Manages dark/light mode with localStorage persistence.
 *
 * Priority order:
 *   1. localStorage value (user's manual choice)
 *   2. system prefers-color-scheme
 *   3. default: 'light'
 *
 * Applies `data-theme="dark"` or `data-theme="light"` on <html>.
 * CSS variables respond to [data-theme="dark"] selector.
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'exd_theme';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch (_) {}

  // Fall back to system preference
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  // Also update the meta theme-color for Android Chrome address bar
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#0f172a' : '#2563eb');
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme on mount and change
  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }, [theme]);

  // Listen for system preference changes (if user hasn't manually set it)
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      // Only follow system if user hasn't manually chosen
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDark = theme === 'dark';

  return { theme, toggleTheme, isDark };
}

export default useTheme;
