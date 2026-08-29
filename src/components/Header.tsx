import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header
      className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 z-30 shadow-xs transition-colors"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-3xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between gap-2">
        {/* Logo textuel unifié & Slogan */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="tracking-tight font-black select-none text-base sm:text-xl font-sans text-indigo-600 dark:text-white transition-colors shrink-0">
            DÉCLIC
          </span>
          <div className="h-3.5 w-px bg-slate-300 dark:bg-slate-700 shrink-0 hidden xs:block" />
          <span className="text-[11px] sm:text-sm font-semibold text-slate-500 dark:text-slate-300 tracking-tight truncate hidden xs:inline">
            Comprendre. Enfin.
          </span>
        </div>

        {/* Action Controls */}
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 sm:gap-1.5 text-xs font-semibold rounded-full sm:rounded-lg border transition-all shadow-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
          title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          aria-label={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              <span className="hidden sm:inline">Mode Clair</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Mode Sombre</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
