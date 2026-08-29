import React from 'react';
import { Sparkles, User, RefreshCw, X } from 'lucide-react';

export const UserBubble: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex justify-end gap-2 sm:gap-2.5 px-3 sm:px-0">
    <div className="max-w-[85%] sm:max-w-[75%] bg-indigo-600 text-white rounded-3xl rounded-tr-lg px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words">
      {text}
    </div>
    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
      <User className="w-3.5 h-3.5" />
    </div>
  </div>
);

export const AssistantAvatar: React.FC = () => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-teal-400 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
    <Sparkles className="w-3.5 h-3.5" />
  </div>
);

export const AssistantCard: React.FC<{
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
  bare?: boolean;
}> = ({ title, onClose, children, bare = false }) => (
  <div className="flex gap-2 sm:gap-2.5 px-3 sm:px-0">
    <AssistantAvatar />
    <div className="min-w-0 flex-1">
      {(title || onClose) && (
        <div className="flex items-center justify-between mb-1.5 pl-0.5">
          {title && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {title}
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
      <div
        className={
          bare
            ? ''
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-tl-lg shadow-sm overflow-hidden'
        }
      >
        {children}
      </div>
    </div>
  </div>
);

export const AssistantTextBubble: React.FC<{ text: string }> = ({ text }) => (
  <AssistantCard>
    <p className="px-4 py-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
      {text}
    </p>
  </AssistantCard>
);

export const LoadingTurn: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex gap-2 sm:gap-2.5 px-3 sm:px-0">
    <AssistantAvatar />
    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-tl-lg px-4 py-2.5 shadow-sm">
      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
      <span>{label || 'Analyse méthodologique en cours…'}</span>
    </div>
  </div>
);
