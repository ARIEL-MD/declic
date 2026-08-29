import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, RefreshCw, X, Sparkles, User, Bot, RotateCcw } from 'lucide-react';
import { ChatMessage, Fascicule } from '../types';
import { formatMathSymbols } from '../utils/mathFormatter';

interface InteractiveTutorChatProps {
  currentFascicule: Fascicule;
  currentSubject?: string;
}

export const InteractiveTutorChat: React.FC<InteractiveTutorChatProps> = ({
  currentFascicule,
  currentSubject,
}) => {
  const getWelcomeText = (subject?: string, fasc?: Fascicule) => {
    if (subject && subject.trim().length > 3) {
      const subjectExcerpt = subject.length > 80 ? subject.substring(0, 77) + '...' : subject;
      const disciplineName = fasc?.disciplineLabel || fasc?.title || 'la discipline';
      return `Bonjour ! Je suis votre tuteur méthodologique d'excellence. Je vous accompagne pour analyser, structurer et réussir votre sujet : « ${subjectExcerpt} » selon les exigences officielles de ${disciplineName}. Quelle est votre question ou votre étape de travail ?`;
    }
    return `Bonjour ! Je suis votre tuteur méthodologique d'excellence. Je réponds à toutes vos questions et vous aide à résoudre vos sujets dans toutes les disciplines (Mathématiques, Philosophie, Français, Physique-Chimie, SVT, Histoire-Géo, SES, HGGSP, Langues...) du Collège au Lycée, Bac et Supérieur. Que souhaitez-vous travailler aujourd'hui ?`;
  };

  const renderInlineStyles = (text: string) => {
    // Replace **bold** with <strong> and handle quotes/highlights
    const parts = text.split(/(\*\*[^*]+\*\*|«[^»]+»|"[^"]+")/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-indigo-950 dark:text-indigo-200">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if ((part.startsWith('«') && part.endsWith('»')) || (part.startsWith('"') && part.endsWith('"'))) {
        return (
          <span key={i} className="font-serif italic text-amber-900 dark:text-amber-300 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const renderFormattedMessage = (rawText: string, isUser: boolean) => {
    if (!rawText) return null;
    const formattedText = formatMathSymbols(rawText);

    if (isUser) {
      return <p className="leading-relaxed whitespace-pre-wrap">{formattedText}</p>;
    }

    const lines = formattedText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-0.5">
            {currentList}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      // Check for markdown headers (### or ## or #)
      const headerMatch = trimmed.match(/^#{1,4}\s*(.+)$/);
      if (headerMatch) {
        flushList();
        elements.push(
          <div
            key={`header-${index}`}
            className="font-bold text-indigo-700 dark:text-indigo-300 text-xs sm:text-[13px] mt-2.5 mb-1 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
            <span>{renderInlineStyles(headerMatch[1])}</span>
          </div>
        );
        return;
      }

      // Check for bullet list (- item, * item, • item)
      const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
      if (bulletMatch) {
        currentList.push(
          <li key={`bullet-${index}`} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-0.5 leading-none shrink-0">•</span>
            <span className="flex-1">{renderInlineStyles(bulletMatch[1])}</span>
          </li>
        );
        return;
      }

      // Check for numbered list (1. item, 2. item)
      const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
      if (numberedMatch) {
        currentList.push(
          <li key={`num-${index}`} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] shrink-0 mt-0.5">
              {numberedMatch[1]}
            </span>
            <span className="flex-1">{renderInlineStyles(numberedMatch[2])}</span>
          </li>
        );
        return;
      }

      flushList();

      // Standard paragraph
      elements.push(
        <p key={`p-${index}`} className="leading-relaxed text-slate-800 dark:text-slate-200">
          {renderInlineStyles(trimmed)}
        </p>
      );
    });

    flushList();
    return <div className="space-y-1.5">{elements}</div>;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'tutor',
      text: getWelcomeText(currentSubject, currentFascicule),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when current subject or fascicule changes if chat only has the welcome message
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'welcome',
            sender: 'tutor',
            text: getWelcomeText(currentSubject, currentFascicule),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [currentSubject, currentFascicule]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'tutor',
        text: getWelcomeText(currentSubject, currentFascicule),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMsg].map((m) => ({ role: m.sender, content: m.text })),
          fasciculeContext: {
            title: currentFascicule.title,
            discipline: currentFascicule.discipline,
            disciplineLabel: currentFascicule.disciplineLabel,
            methodology: currentFascicule.methodologyOverview,
            knowledge: currentFascicule.coreKnowledgeExcerpt,
          },
          subjectContext: currentSubject || 'Discussion méthodologique générale multidisciplinaire',
        }),
      });

      const data = await response.json();
      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: data.reply || "J'ai bien analysé votre demande selon les règles académiques.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      const errorReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: "Désolé, une erreur s'est produite lors de la consultation méthodologique. Veuillez réessayer.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic contextual quick prompts based on active subject or discipline
  const isScientific = 
    currentFascicule?.discipline === 'mathematiques' || 
    currentFascicule?.discipline === 'physique_chimie' || 
    currentFascicule?.discipline === 'svt' ||
    Boolean(currentSubject && /[=+\-*/^√Δπ]|\b(calcul|dérivée|suite|intégrale|théorème|équation|fonction)\b/i.test(currentSubject));

  const quickPrompts = isScientific
    ? [
        "Comment justifier rigoureusement les étapes de calcul ?",
        "Rappelle-moi la formule ou le théorème clé",
        "Quels sont les pièges d'examen à éviter ?",
      ]
    : [
        "Comment formuler une problématique percutante ?",
        "Quels auteurs ou repères clés mobiliser ?",
        "Comment réussir ma transition dialectique ?",
      ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          id="btn-open-tutor-chat"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl hover:shadow-indigo-500/30 transition-all cursor-pointer border border-indigo-400/30 group"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-semibold tracking-wide">Tuteur Méthodologique</span>
        </button>
      )}

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[85vh] animate-in slide-in-from-bottom-5 transition-colors">
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Tuteur Méthodologique IA</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {currentSubject ? `Accompagnement : ${currentFascicule.disciplineLabel || 'Toutes disciplines'}` : 'Toutes disciplines (Maths, Philo, Français, Sciences...)'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Réinitialiser la conversation"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Fermer le tuteur"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-slate-950/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'tutor' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-700/50">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed shadow-xs text-xs ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 rounded-tl-none shadow-sm'
                  }`}
                >
                  {renderFormattedMessage(msg.text, msg.sender === 'user')}
                  <div
                    className={`text-[9px] mt-2 ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                    } text-right font-sans`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs pl-8">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>Le tuteur analyse votre question...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="whitespace-nowrap px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              placeholder="Posez une question méthodologique..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

