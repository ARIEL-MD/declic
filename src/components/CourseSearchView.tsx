import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowRight,
  ListOrdered,
  FileCheck,
  BrainCircuit,
  Lightbulb,
  Zap,
  BookmarkPlus
} from 'lucide-react';
import { CourseSearchResult } from '../types';
import { DisciplineIcon } from './DisciplineIcon';
import { MathText } from './MathText';

interface CourseSearchViewProps {
  onSelectQuery?: (query: string) => void;
}

export function CourseSearchView({ onSelectQuery }: CourseSearchViewProps) {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<CourseSearchResult | null>(null);
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const handleSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery || query).trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);
    setCheckedItems({});

    try {
      const response = await fetch('/api/search-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la recherche (${response.status})`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setSearchResult(data.data);
      } else if (data.data) {
        setSearchResult(data.data);
      } else if (data.chapterTitle) {
        setSearchResult(data);
      } else {
        throw new Error(data.error || 'Aucune donnée reçue du serveur.');
      }

      setTimeout(() => {
        const el = document.getElementById('course-search-results');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur lors de la recherche académique.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMemo = () => {
    if (!searchResult) return;
    const content = `FICHE DE RÉVISION ACADÉMIQUE CERTIFIÉE
Discipline : ${searchResult.disciplineLabel} | Niveau : ${searchResult.levelLabel}
Chapitre : ${searchResult.chapterTitle}

DÉFINITION & CADRE :
${searchResult.definitionAndScope}

CONCEPTS & FORMULES CLÉS :
${searchResult.coreConceptsAndFormulas.map(c => `• ${c.name} : ${c.formulaOrRule}\n  Explication : ${c.explanation}`).join('\n\n')}

MÉTHODE PAS À PAS :
${searchResult.stepByStepMethod.map(m => `Étape ${m.stepNumber} - ${m.title} : ${m.whatToDo}\nAstuce : ${m.reflexOrTip}`).join('\n\n')}

EXEMPLE TYPE RÉSOLU :
Énoncé : ${searchResult.solvedExample.problemStatement}
Résolution :
${searchResult.solvedExample.solutionStepByStep}
Réponse finale : ${searchResult.solvedExample.finalAnswer}

PIÈGES D'EXAMEN :
${searchResult.classicExamTraps.map(t => `• ${t}`).join('\n')}

MÉMO EXPRESS :
${searchResult.quickRevisionMemo}
`;

    navigator.clipboard.writeText(content);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner (100% Auto) */}
      <div className="bg-gradient-to-br from-indigo-50/60 via-slate-50 to-indigo-100/50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl text-indigo-700 dark:text-indigo-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Recherche de Cours & Savoir Sûr</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Vérifié & Sans Erreur
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Pose n'importe quelle question sur n'importe quel cours (Maths, Physique-Chimie, SVT, Anglais, Allemand, Espagnol, Philo, Français, Histoire-Géo). Explications pas-à-pas, formules exactes et démonstrations complètes.
                </p>
              </div>
            </div>
          </div>

          {/* Search Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative pt-1"
          >
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Posez votre question de cours ou notion (ex: Théorème de Thalès, Dérivée, Lois de Newton, Dosage pH, Méiose, Subjuntivo, Passivsatz...)"
                className="w-full pl-12 pr-36 py-3.5 sm:py-4 bg-white dark:bg-slate-950/90 border border-slate-300 dark:border-slate-700/80 hover:border-indigo-500/60 focus:border-indigo-500 rounded-2xl text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm dark:shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 sm:right-2.5 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Recherche...</span>
                  </>
                ) : (
                  <>
                    <span>Rechercher</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4 animate-pulse shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-600/30 rounded-2xl mx-auto flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BrainCircuit className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-2">
            <div className="text-base font-semibold text-slate-900 dark:text-slate-200">Recherche académique certifiée en cours...</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Vérification des théorèmes, formules exactes, règles méthodologiques et étapes de calcul selon les programmes officiels.
            </p>
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {searchResult && !isLoading && (
        <div id="course-search-results" className="space-y-6">
          {/* Main Chapter Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <DisciplineIcon discipline={searchResult.disciplineLabel} className="w-3.5 h-3.5" />
                    <span>{searchResult.disciplineLabel}</span>
                  </span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
                    {searchResult.levelLabel}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Savoir Certifié
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {searchResult.chapterTitle}
                </h2>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Recherche : <span className="text-slate-800 dark:text-slate-300 italic font-medium">"{searchResult.query}"</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyMemo}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {copiedMemo ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier la Fiche</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Definition & Framework */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Définition & Cadre Théorique Officiel</span>
              </div>
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                {searchResult.definitionAndScope}
              </p>
            </div>

            {/* Core Concepts & Formulas */}
            {searchResult.coreConceptsAndFormulas && searchResult.coreConceptsAndFormulas.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Formules Fondamentales & Règles Canoniques</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResult.coreConceptsAndFormulas.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs"
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center justify-between">
                        <span>{item.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                          Formule #{idx + 1}
                        </span>
                      </div>
                      
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-xl font-mono text-sm sm:text-base text-indigo-900 dark:text-indigo-200 overflow-x-auto font-bold">
                        <MathText text={item.formulaOrRule} />
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="font-semibold text-slate-900 dark:text-slate-400">Explication : </span>
                        <MathText text={item.explanation} />
                      </div>

                      {item.contextOrApplication && (
                        <div className="text-xs text-slate-700 dark:text-slate-400 bg-white dark:bg-slate-900/90 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 shadow-2xs">
                          <span className="font-semibold text-indigo-700 dark:text-indigo-400">Quand l'utiliser : </span>
                          <MathText text={item.contextOrApplication} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step-by-Step Practical Method */}
            {searchResult.stepByStepMethod && searchResult.stepByStepMethod.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  <ListOrdered className="w-4 h-4" />
                  <span>Méthode de Résolution Pas à Pas (Comment Faire)</span>
                </div>

                <div className="space-y-3">
                  {searchResult.stepByStepMethod.map((step) => (
                    <div 
                      key={step.stepNumber}
                      className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-sm">
                        {step.stepNumber}
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="font-semibold text-sm text-slate-900 dark:text-slate-200">
                          {step.title}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          <MathText text={step.whatToDo} />
                        </p>
                        {step.reflexOrTip && (
                          <div className="text-xs text-amber-900 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 mt-1 font-medium">
                            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span><strong>Réflexe gagnant :</strong> <MathText text={step.reflexOrTip} /></span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solved Exemplary Problem */}
            {searchResult.solvedExample && (
              <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50 to-indigo-50/70 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                    <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Exemple Type Intégralement Résolu</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Résolution sans saut de calcul
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-1.5 shadow-2xs">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Énoncé type :</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 italic">
                    « {searchResult.solvedExample.problemStatement} »
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">Démonstration & Démarche détaillée :</div>
                  <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans shadow-2xs">
                    <MathText text={searchResult.solvedExample.solutionStepByStep} />
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">Réponse finale encadrée :</span>
                  <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-500/20">
                    <MathText text={searchResult.solvedExample.finalAnswer} />
                  </span>
                </div>
              </div>
            )}

            {/* Exam Traps & Self-Check Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Traps */}
              {searchResult.classicExamTraps && searchResult.classicExamTraps.length > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Pièges Classiques d'Examen à Éviter</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-rose-900 dark:text-rose-200/90">
                    {searchResult.classicExamTraps.map((trap, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-600 dark:text-rose-400 font-bold mt-0.5">•</span>
                        <span>{trap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Checklist */}
              {searchResult.selfCheckChecklist && searchResult.selfCheckChecklist.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Checklist d'Auto-Vérification sur ta copie</span>
                  </div>
                  <div className="space-y-2">
                    {searchResult.selfCheckChecklist.map((checkText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleCheck(idx)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-2.5 transition-all cursor-pointer ${
                          checkedItems[idx]
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 line-through opacity-80'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          checkedItems[idx] ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-400 dark:border-slate-600'
                        }`}>
                          {checkedItems[idx] && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{checkText}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Revision Memo */}
            {searchResult.quickRevisionMemo && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 shadow-xs">
                <BookmarkPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-indigo-900 dark:text-indigo-300">Mémo Flash pour le Jour de l'Épreuve :</div>
                  <p className="leading-relaxed text-slate-800 dark:text-indigo-200">{searchResult.quickRevisionMemo}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
