import React, { useRef, useEffect } from 'react';
import { ArrowUp, SlidersHorizontal, Award, Search, Square } from 'lucide-react';

export type ComposerTool = 'advanced' | 'grader' | 'search';

interface ChatComposerProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onOpenTool: (tool: ComposerTool) => void;
  activeTool: ComposerTool | null;
}

const TOOL_CHIPS: Array<{ id: ComposerTool; label: string; icon: React.ElementType }> = [
  { id: 'advanced', label: 'Options avancées', icon: SlidersHorizontal },
  { id: 'grader', label: 'Corriger un devoir', icon: Award },
  { id: 'search', label: 'Chercher un cours', icon: Search },
];

export const ChatComposer: React.FC<ChatComposerProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  onOpenTool,
  activeTool,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to a max height, then scroll internally
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) onSend();
    }
  };

  return (
    <div
      className="sticky bottom-0 inset-x-0 z-30 bg-gradient-to-t from-slate-50 dark:from-slate-950 from-60% to-transparent pt-4"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-2">
        {/* Tool chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {TOOL_CHIPS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onOpenTool(id)}
              className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                activeTool === id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Composer bar */}
        <div className="flex items-end gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg shadow-slate-900/5 dark:shadow-black/30 px-2 py-2 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre sujet, exercice ou question…"
            className="flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none max-h-40 leading-relaxed"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!value.trim() || isLoading}
            aria-label="Envoyer"
            className="shrink-0 w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Square className="w-3.5 h-3.5 fill-current" />
            ) : (
              <ArrowUp className="w-4.5 h-4.5" strokeWidth={2.5} />
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 px-2 pb-1">
          Déclic peut faire des erreurs. Vérifiez les points importants avant un examen.
        </p>
      </div>
    </div>
  );
};
