import React from 'react';
import { X } from 'lucide-react';

interface ToolModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Fenêtre flottante générique pour les outils annexes de DÉCLIC (Options
 * avancées & scan photo, Correcteur de devoirs, Recherche de cours).
 *
 * Avant, ces outils étaient injectés comme un "tour de parole" directement
 * dans le fil de conversation (voir l'ancien `kind: 'tool'` dans App.tsx),
 * ce qui encombrait l'historique : un panneau de configuration mélangé aux
 * vraies questions/réponses, qui restait affiché entre les messages même
 * après usage.
 *
 * Ce composant les fait flotter par-dessus la conversation à la place :
 * rien n'est ajouté au fil tant que l'élève n'a pas réellement envoyé un
 * sujet, et la fenêtre se ferme d'elle-même dès l'envoi (ou via la croix).
 */
export const ToolModal: React.FC<ToolModalProps> = ({ title, onClose, children }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
