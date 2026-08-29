import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SubjectInputPanel } from './components/SubjectInputPanel';
import { AnalysisResultsView } from './components/AnalysisResultsView';
import { HomeworkGraderView } from './components/HomeworkGraderView';
import { CourseSearchView } from './components/CourseSearchView';
import { ToolModal } from './components/ToolModal';
import { ChatComposer, ComposerTool } from './components/ChatComposer';
import {
  UserBubble,
  AssistantCard,
  LoadingTurn,
} from './components/ConversationTurns';
import { DEFAULT_FASCICULES } from './data/defaultFascicules';
import { Fascicule, MethodologyAnalysisResult } from './types';
import { detectSubjectMetadata } from './utils/subjectDetector';

type Turn =
  | { id: string; role: 'user'; kind: 'text'; text: string }
  | { id: string; role: 'assistant'; kind: 'loading'; label?: string }
  | { id: string; role: 'assistant'; kind: 'analysis'; result: MethodologyAnalysisResult; subjectTitle: string }
  | { id: string; role: 'assistant'; kind: 'error'; message: string };

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const WELCOME_TEXT =
  "Bonjour ! Je suis Déclic, votre tuteur méthodologique. Décrivez-moi votre sujet, exercice ou devoir (Mathématiques, Philosophie, Français, Physique-Chimie, SVT, Histoire-Géo, Langues…) et je vous rédige une réponse complète et conforme aux exigences officielles. Vous pouvez aussi scanner une photo, corriger un devoir ou chercher un cours ci-dessous.";

export default function App() {
  const [selectedFascicule, setSelectedFascicule] = useState<Fascicule>(DEFAULT_FASCICULES[0]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme_mode');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [isDarkMode]);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [composerValue, setComposerValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<ComposerTool | null>(null);
  const [lastSubject, setLastSubject] = useState('');
  const [academicProfile, setAcademicProfile] = useState<{
    serie?: string;
    serieLabel?: string;
    level?: string;
  }>({});

  const feedEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

  const runAnalysis = async (
    subject: string,
    exerciseType: string,
    mode: string = 'comprehensive',
    planStructure: string = '2_axes',
    detectedDisciplineLabel?: string,
    serie?: string,
    serieLabel?: string,
    // Image jointe par l'élève (figure, schéma, tableau, photo du sujet...).
    // Transmise telle quelle au serveur pour cette seule requête : elle n'est
    // conservée nulle part côté client une fois la requête envoyée, ni côté
    // serveur au-delà du traitement (voir /api/analyze-exercise).
    imageBase64?: string,
    imageMimeType?: string
  ) => {
    if (!subject.trim() || isLoading) return;

    setIsLoading(true);
    setLastSubject(subject);
    setActiveTool(null);

    const userTurnId = uid();
    const loadingTurnId = uid();
    setTurns((prev) => [
      ...prev,
      { id: userTurnId, role: 'user', kind: 'text', text: subject },
      { id: loadingTurnId, role: 'assistant', kind: 'loading' },
    ]);
    setComposerValue('');

    const detection = detectSubjectMetadata(subject);
    const matchedFasc =
      DEFAULT_FASCICULES.find((f) => f.id === detection.recommendedFasciculeId) || DEFAULT_FASCICULES[0];
    setSelectedFascicule(matchedFasc);
    setAcademicProfile({
      serie: serie || detection.serie,
      serieLabel: serieLabel || detection.serieLabel,
      level: detection.level,
    });

    try {
      const res = await fetch('/api/analyze-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fasciculeTitle: matchedFasc.title,
          fasciculeMethodology: matchedFasc.methodologyOverview,
          fasciculeKnowledge: matchedFasc.coreKnowledgeExcerpt,
          subjectTopic: subject,
          exerciseType: exerciseType || detection.exerciseType,
          discipline: detectedDisciplineLabel || detection.disciplineLabel,
          mode,
          planStructure,
          serie: serie || detection.serie,
          serieLabel: serieLabel || detection.serieLabel,
          level: detection.level,
          imageBase64,
          imageMimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible de traiter l'exercice.");
      }

      setTurns((prev) => [
        ...prev.filter((t) => t.id !== loadingTurnId),
        { id: uid(), role: 'assistant', kind: 'analysis', result: data.data, subjectTitle: subject },
      ]);
    } catch (err: any) {
      console.error(err);
      setTurns((prev) => [
        ...prev.filter((t) => t.id !== loadingTurnId),
        {
          id: uid(),
          role: 'assistant',
          kind: 'error',
          message: err.message || "Une erreur est survenue lors de l'analyse méthodologique.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSend = () => {
    const text = composerValue.trim();
    if (!text) return;
    const detection = detectSubjectMetadata(text);
    runAnalysis(text, detection.exerciseType, 'comprehensive', '2_axes', detection.disciplineLabel, detection.serie, detection.serieLabel);
  };

  const handleOpenTool = (tool: ComposerTool) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  };

  const closeToolModal = () => setActiveTool(null);

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
      <Header isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((prev) => !prev)} />

      {/* Conversation feed */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-0 sm:px-4 py-5 sm:py-8 space-y-5">
          {/* Welcome bubble */}
          <AssistantCard>
            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">{WELCOME_TEXT}</p>
            </div>
          </AssistantCard>

          {turns.map((turn) => {
            if (turn.kind === 'text') {
              return <UserBubble key={turn.id} text={turn.text} />;
            }
            if (turn.kind === 'loading') {
              return <LoadingTurn key={turn.id} label={turn.label} />;
            }
            if (turn.kind === 'error') {
              return (
                <AssistantCard key={turn.id}>
                  <div className="px-4 py-3 text-sm text-rose-700 dark:text-rose-300 leading-relaxed">
                    <span className="font-semibold">Erreur lors du traitement — </span>
                    {turn.message}
                  </div>
                </AssistantCard>
              );
            }
            if (turn.kind === 'analysis') {
              return (
                <AssistantCard key={turn.id}>
                  <AnalysisResultsView result={turn.result} subjectTitle={turn.subjectTitle} />
                </AssistantCard>
              );
            }
            return null;
          })}

          <div ref={feedEndRef} />
        </div>
      </main>

      {activeTool && (
        <ToolModal
          title={
            {
              advanced: 'Options avancées & scan photo',
              grader: 'Correcteur de devoirs — Note / 20',
              search: 'Recherche de cours & savoir sûr',
            }[activeTool]
          }
          onClose={closeToolModal}
        >
          {activeTool === 'advanced' && (
            <SubjectInputPanel
              currentFascicule={selectedFascicule}
              onSubmit={runAnalysis}
              isLoading={isLoading}
              subjectInput={composerValue}
              setSubjectInput={setComposerValue}
            />
          )}
          {activeTool === 'grader' && (
            <HomeworkGraderView
              currentFascicule={selectedFascicule}
              currentSubject={lastSubject}
              academicProfile={academicProfile}
            />
          )}
          {activeTool === 'search' && (
            <CourseSearchView
              onSelectQuery={(q) => {
                closeToolModal();
                const detection = detectSubjectMetadata(q);
                runAnalysis(q, detection.exerciseType, 'comprehensive', '2_axes', detection.disciplineLabel, detection.serie, detection.serieLabel);
              }}
            />
          )}
        </ToolModal>
      )}

      <ChatComposer
        value={composerValue}
        onChange={setComposerValue}
        onSend={handleQuickSend}
        isLoading={isLoading}
        onOpenTool={handleOpenTool}
        activeTool={activeTool}
      />
    </div>
  );
}
