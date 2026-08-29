import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calculator, 
  Copy, 
  Check, 
  Sparkles, 
  Sigma, 
  ArrowRight, 
  BookmarkCheck, 
  Layers, 
  GraduationCap, 
  Maximize2, 
  FileCheck 
} from 'lucide-react';
import { formatMathSymbols } from '../utils/mathFormatter';
export { formatMathSymbols };

interface StructuredQuestion {
  raw: string;
  numberLabel: string;
  titleOrPrompt?: string;
  steps: string[];
  justification?: string;
  finalAnswer?: string;
}

interface StructuredExercise {
  id: string;
  title: string;
  points?: string;
  introContext?: string;
  questions: StructuredQuestion[];
}

interface StructuredExamRendererProps {
  rawText: string;
  paperTheme?: 'paper' | 'dark';
  subjectTitle?: string;
  onCopy?: (text: string) => void;
  /**
   * When provided (non-empty), this pre-structured data (returned directly by the AI as JSON,
   * see `structuredScientificResolution`) is rendered as-is instead of re-parsing `rawText`
   * with the fragile free-text regex parser below. This is the reliable path for
   * Mathématiques / Physique-Chimie / SVT: it guarantees one calculation or reasoning step
   * per line, correctly separated questions, and a clearly boxed final answer, regardless of
   * how the raw text happens to be formatted.
   */
  structuredExercises?: StructuredExercise[];
}

/**
 * Strips residual markdown artifacts (hashes, bold markers, trailing colons, markdown dividers)
 */
export function cleanMarkdownNoise(str: string): string {
  if (!str) return '';
  return str
    .replace(/#+/g, '') // remove all hashes (#, ##, ###) anywhere
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold**
    .replace(/\*([^*]+)\*/g, '$1') // *italic*
    .replace(/__([^_]+)__/g, '$1') // __bold__
    .replace(/^[-*•]\s+/g, '') // bullet markers
    .replace(/\s*:\s*\*{2,}/g, '') // trailing :**
    .replace(/\*{2,}\s*:\s*/g, '') // trailing **:
    .replace(/\*{2,}/g, '') // any leftover **
    .replace(/\*{1,}/g, '') // any leftover *
    .replace(/^[=\-_]{3,}$/gm, '') // horizontal rules
    .trim();
}

/**
 * Extracts and cleans the final answer string from any prefix or markdown noise
 */
export function cleanFinalAnswer(str: string): string {
  if (!str) return '';
  let cleaned = str
    .replace(/#+/g, '')
    .replace(/\*{1,}/g, '')
    .replace(/__+/g, '')
    .trim();

  // Strip prefixes like "➜ Résultat final :", "Résultat :", "Conclusion :", etc.
  cleaned = cleaned.replace(/^(?:➜|=>|->|>|•|-)?\s*(?:Résultat\s*final|Résultat|Conclusion|Réponse|Verdict|Solution)[\s:]*/i, '');
  
  // Clean trailing punctuation or colons
  cleaned = cleaned.replace(/^[:\-–\s]+/, '').replace(/[:\-–\s]+$/, '').trim();

  return formatMathSymbols(cleaned);
}

/**
 * Parses raw unformatted or Markdown-rich text into a structured array of exercises.
 * Safe against breaking mathematical expressions like (-2 - 3 ; -1 - 2) or √(25 + 9) or x > 6.
 */
export function parseExamIntoExercises(rawText: string): StructuredExercise[] {
  if (!rawText || !rawText.trim()) return [];

  // Word used to detect a NEW exercise header. Requires an explicit number/numeral so that
  // ordinary prose mentioning "cet exercice" never triggers a false split.
  const HEADER_KEYWORDS = "EXERCICE|Exercice|AUFGABE|Aufgabe|SITUATION D'ÉVALUATION|Situation d'évaluation|PROBLÈME|Problème|PARTIE|Partie|SECTION|Section";

  // Normalize newlines and clean standalone divider lines
  let text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^[ \t]*#+[ \t]*$/gm, '') // remove standalone ### lines
    .replace(/^[ \t]*[-=_]{3,}[ \t]*$/gm, ''); // remove --- / === lines

  // Guard against the model running two exercises together on the same physical line, or
  // gluing the header directly onto the tail of the previous exercise's last sentence
  // (e.g. "...donc S = {3}. EXERCICE 2 (4 points) Soit un triangle ABC..."). Force every
  // exercise header onto its own fresh line before splitting, wherever it appears.
  // Deliberately case-SENSITIVE (matches "EXERCICE"/"Exercice", not lowercase "exercice"): a
  // real header is always capitalized, whereas casual back-references like "comme dans
  // l'exercice 2" are lowercase and must NOT be treated as a new block.
  const midLineHeaderSplitter = new RegExp(
    `([^\\n])([ \\t]*)(?=(?:${HEADER_KEYWORDS})\\s*(?:\\d+|[IVX]{1,4})\\b)`,
    'g'
  );
  text = text.replace(midLineHeaderSplitter, '$1\n');

  // Exercise header detector. The trailing group now greedily captures whatever follows on
  // the same line (statement text, not just a title after ":" or "-"), so a header is never
  // missed just because the exercise statement starts right after it without a separator.
  const exerciseHeaderRegex = /^(?:#+\s*)?(?:EXERCICE|Exercice|AUFGABE|Aufgabe|SITUATION D'ÉVALUATION|Situation d'évaluation|PROBLÈME|Problème|PARTIE|Partie|SECTION|Section)\s*(\d+|[A-ZIVX]+)?(?:\s*\(([^)]+)\))?\s*(?:[:\-–]\s*)?(.*)$/i;

  const rawLines = text.split('\n');

  // Phase 1: Group lines into raw exercise blocks
  interface RawBlock {
    title: string;
    points?: string;
    lines: string[];
  }

  const rawBlocks: RawBlock[] = [];
  let currentBlock: RawBlock | null = null;

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines or pure punctuation/hashes
    const strippedLine = cleanMarkdownNoise(trimmed);
    if (!strippedLine && /^(?:#+|-{3,}|={3,}|_{3,})$/.test(trimmed)) {
      continue;
    }

    const exMatch = trimmed.match(exerciseHeaderRegex);

    if (exMatch) {
      if (currentBlock && (currentBlock.lines.length > 0 || currentBlock.points)) {
        rawBlocks.push(currentBlock);
      }
      const num = exMatch[1] || `${rawBlocks.length + 1}`;
      const pts = exMatch[2] ? cleanMarkdownNoise(exMatch[2]) : undefined;
      const trailing = exMatch[3] ? cleanMarkdownNoise(exMatch[3]) : '';

      // Short trailing text right after the header (e.g. "EXERCICE 2 : Équations du second degré")
      // is a title. Anything longer, or anything that already looks like a statement (contains a
      // digit, an "=" sign, or a second sentence), is the actual exercise statement/first question
      // and must stay in the block's body so it doesn't get silently dropped or attached to the
      // wrong exercise.
      const looksLikeStatement = /\d|[=<>]/.test(trailing) || /[.!?]\s+\S/.test(trailing);
      const isShortTitle = trailing.length > 0 && trailing.length <= 50 && !looksLikeStatement;
      const customTitle = isShortTitle ? trailing : '';

      currentBlock = {
        title: `Exercice ${num}${customTitle ? ` : ${customTitle}` : ''}`,
        points: pts,
        lines: []
      };

      if (trailing && !isShortTitle) {
        currentBlock.lines.push(trailing);
      }
    } else {
      if (!currentBlock) {
        currentBlock = {
          title: 'Exercice 1',
          lines: []
        };
      }
      if (trimmed.length > 0) {
        currentBlock.lines.push(rawLine);
      }
    }
  }

  if (currentBlock && (currentBlock.lines.length > 0 || currentBlock.points)) {
    rawBlocks.push(currentBlock);
  }

  // If there are multiple blocks and the first one is an empty phantom "Exercice 1", drop it
  if (rawBlocks.length > 1) {
    const firstNonEmpty = rawBlocks[0].lines.filter(l => cleanMarkdownNoise(l).length > 0);
    if (firstNonEmpty.length === 0) {
      rawBlocks.shift();
    }
  }

  // Phase 2: Parse questions inside each exercise block
  const structuredExercises: StructuredExercise[] = [];

  // Question header regex: Matches strict line beginnings like "1) a)", "1)", "a)", "Question 1)", "Question a)"
  const questionHeaderRegex = /^(?:#+\s*)?(?:\*{0,2})(?:Question\s+)?(?:(\d{1,2}\s*[\)\.]\s*[a-d]\s*[\)\.])|(\d{1,2}\s*[\)\.])|([a-d]\s*[\)\.])|\(([0-9]{1,2})\)|\(([a-d])\))(?:\*{0,2})\s*(.*)$/i;

  rawBlocks.forEach((block, bIdx) => {
    // Filter out lines that are only hashes or noise
    const cleanBlockLines = block.lines.filter(l => {
      const clean = cleanMarkdownNoise(l.trim());
      return clean.length > 0 && !/^(?:#+|-{3,}|={3,}|_{3,})$/.test(clean);
    });

    if (cleanBlockLines.length === 0 && !block.points) {
      return; // Skip empty block
    }

    const questions: StructuredQuestion[] = [];
    const introLines: string[] = [];
    let currentQ: StructuredQuestion | null = null;

    for (let j = 0; j < block.lines.length; j++) {
      const line = block.lines[j];
      const trimmed = line.trim();
      if (!trimmed) continue;

      const cleanLine = cleanMarkdownNoise(trimmed);
      if (!cleanLine || /^(?:#+|-{3,}|={3,}|_{3,})$/.test(cleanLine)) {
        continue;
      }

      // Check if line is a math statement that starts with a variable/calculation rather than a question
      // (e.g. "EF = ...", "B(x) = ...", "3000 < ...", "Pour x > 6 ...", "On a ...")
      const isMathFormula = /^(?:[A-Za-z_]\w*\s*(?:\([^)]*\))?\s*[=<>≤≥≈]|√|\d+\s*[<>=]|\(\s*[-+\d]|Pour\s+x|On\s+sait|Or\s+|Donc\s+|D'o[ùu]|Les\s+points|Le\s+triangle|Le\s+point)/i.test(cleanLine);

      const qMatch = !isMathFormula ? trimmed.match(questionHeaderRegex) : null;

      if (qMatch) {
        const label = qMatch[1] || qMatch[2] || qMatch[3] || qMatch[4] || qMatch[5] || `${questions.length + 1})`;
        const promptRaw = qMatch[6] || '';
        const cleanPrompt = cleanMarkdownNoise(promptRaw).replace(/^:\s*/, '').trim();

        // Handle case where previous question was just a number like "1)" with no steps, and this one is "a)" -> merge into "1) a)"
        if (currentQ && currentQ.steps.length === 0 && !currentQ.finalAnswer && !currentQ.titleOrPrompt && /^[a-d]\s*[\)\.]/i.test(label)) {
          currentQ.numberLabel = `${currentQ.numberLabel} ${label.trim()}`;
          currentQ.titleOrPrompt = cleanPrompt ? formatMathSymbols(cleanPrompt) : undefined;
          continue;
        }

        if (currentQ) {
          questions.push(currentQ);
        }

        currentQ = {
          raw: trimmed,
          numberLabel: label.trim(),
          titleOrPrompt: cleanPrompt ? formatMathSymbols(cleanPrompt) : undefined,
          steps: []
        };
      } else if (currentQ) {
        // Line belongs to active question
        // Check if line is a final answer
        if (/^(?:➜|=>|->|Résultat\s*final|Résultat|Conclusion|Réponse)/i.test(cleanLine) || /➜\s*Résultat/i.test(trimmed)) {
          const ans = cleanFinalAnswer(cleanLine);
          if (ans) {
            currentQ.finalAnswer = ans;
          }
        } else if (/^S\s*=\s*(\[[^\]]+\]|\{[^}]+\})/i.test(cleanLine)) {
          // Explicit solution set
          const formattedSet = formatMathSymbols(cleanLine);
          currentQ.finalAnswer = formattedSet;
          currentQ.steps.push(formattedSet);
        } else {
          // Step line
          const formatted = formatMathSymbols(cleanLine);

          // If the line contains an inline "➜ Résultat final :" at the end, split and extract
          if (/➜|\=\>|Résultat\s*final\s*:/i.test(formatted)) {
            const parts = formatted.split(/➜|\=\>|Résultat\s*final\s*:/i);
            const stepPart = cleanMarkdownNoise(parts[0]);
            if (stepPart) {
              currentQ.steps.push(formatMathSymbols(stepPart));
            }
            if (parts[1]) {
              const finalAns = cleanFinalAnswer(parts[1]);
              if (finalAns) {
                currentQ.finalAnswer = finalAns;
              }
            }
          } else {
            currentQ.steps.push(formatted);
          }
        }
      } else {
        // Belongs to exercise intro/context before question 1
        if (cleanLine) {
          introLines.push(formatMathSymbols(cleanLine));
        }
      }
    }

    if (currentQ) {
      questions.push(currentQ);
    }

    // Filter out phantom empty questions (questions with no steps, no prompt, and no answer)
    const validQuestions = questions.filter(q => {
      const hasSteps = q.steps.length > 0;
      const hasAnswer = Boolean(q.finalAnswer && q.finalAnswer.trim().length > 0);
      const hasPrompt = Boolean(q.titleOrPrompt && q.titleOrPrompt.trim().length > 0);
      return hasSteps || hasAnswer || hasPrompt;
    });

    // If no questions were split, build a single clean resolution block
    if (validQuestions.length === 0 && cleanBlockLines.length > 0) {
      const allSteps = cleanBlockLines.map(l => formatMathSymbols(cleanMarkdownNoise(l))).filter(Boolean);
      validQuestions.push({
        raw: allSteps.join('\n'),
        numberLabel: '1)',
        titleOrPrompt: 'Résolution méthodique',
        steps: allSteps,
        finalAnswer: undefined
      });
    }

    const cleanIntroText = introLines.join('\n').trim();
    const hasValidIntro = cleanIntroText.length > 0 && cleanMarkdownNoise(cleanIntroText).length > 0;

    if (validQuestions.length > 0 || hasValidIntro) {
      structuredExercises.push({
        id: `ex-${bIdx + 1}`,
        title: block.title,
        points: block.points,
        introContext: hasValidIntro ? cleanIntroText : undefined,
        questions: validQuestions
      });
    }
  });

  return structuredExercises;
}

export const StructuredExamRenderer: React.FC<StructuredExamRendererProps> = ({
  rawText,
  paperTheme = 'paper',
  subjectTitle,
  onCopy,
  structuredExercises,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeLayout, setActiveLayout] = useState<'cards' | 'exam_sheet'>('cards');

  // Prefer the AI's own structured JSON (reliable, one step per array item) whenever it's
  // available; only fall back to the fragile free-text regex parser when it isn't.
  const exercises = (structuredExercises && structuredExercises.length > 0)
    ? structuredExercises
    : parseExamIntoExercises(rawText);

  const isDark = paperTheme === 'dark';

  const handleCopyExercise = (exercise: StructuredExercise) => {
    let output = `=== ${exercise.title.toUpperCase()} ${exercise.points ? `(${exercise.points})` : ''} ===\n\n`;
    if (exercise.introContext) {
      output += `${exercise.introContext}\n\n`;
    }
    exercise.questions.forEach((q) => {
      output += `${q.numberLabel} ${q.titleOrPrompt || ''}\n`;
      if (q.steps && q.steps.length > 0) {
        q.steps.forEach((st) => {
          output += `   • ${st}\n`;
        });
      }
      if (q.finalAnswer) {
        output += `   ➜ RÉSULTAT : ${q.finalAnswer}\n`;
      }
      output += '\n';
    });

    navigator.clipboard.writeText(output.trim());
    setCopiedIndex(exercise.id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyQuestion = (q: StructuredQuestion, qKey: string) => {
    let output = `${q.numberLabel} ${q.titleOrPrompt || ''}\n`;
    if (q.steps.length > 0) {
      q.steps.forEach((st) => {
        output += `   ${st}\n`;
      });
    }
    if (q.finalAnswer) {
      output += `   ➜ Résultat : ${q.finalAnswer}\n`;
    }

    navigator.clipboard.writeText(output.trim());
    setCopiedIndex(qKey);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (exercises.length === 0) {
    return (
      <div className={`p-6 text-center italic ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
        Aucun contenu d'exercice à afficher.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-toolbar for display modes */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold flex items-center gap-1.5 ${
            isDark ? 'text-slate-200' : 'text-slate-900'
          }`}>
            <Calculator className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            {exercises.length} Exercice{exercises.length > 1 ? 's résolus' : ' résolu'} avec rigueur
          </span>
        </div>

        <div className={`inline-flex rounded-lg p-1 border text-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveLayout('cards')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              activeLayout === 'cards'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vue Par Blocs Structurés</span>
          </button>
          <button
            onClick={() => setActiveLayout('exam_sheet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              activeLayout === 'exam_sheet'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Vue Copie Manuscrite Prête à Rendre</span>
          </button>
        </div>
      </div>

      {/* RENDER MODE 1: CARDS VIEW */}
      {activeLayout === 'cards' && (
        <div className="space-y-6">
          {exercises.map((ex, exIdx) => (
            <div
              key={ex.id || exIdx}
              className={`rounded-2xl border transition-all overflow-hidden shadow-sm ${
                isDark
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Exercise Header Banner */}
              <div
                className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                    <Sigma className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      <span>{ex.title}</span>
                      {ex.points && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isDark
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                            : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}>
                          {ex.points}
                        </span>
                      )}
                    </h3>
                    <span className={`text-[11px] font-medium ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {ex.questions.length} question{ex.questions.length > 1 ? 's traitées' : ' traitée'} pas à pas
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyExercise(ex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    copiedIndex === ex.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
                  }`}
                  title="Copier le corrigé complet de cet exercice"
                >
                  {copiedIndex === ex.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === ex.id ? 'Copié !' : 'Copier l\'exercice'}</span>
                </button>
              </div>

              {/* Context / Enoncé if present */}
              {ex.introContext && (
                <div
                  className={`p-3.5 sm:p-4 text-xs sm:text-sm border-b leading-relaxed ${
                    isDark
                      ? 'bg-slate-950/80 border-slate-800 text-slate-200 font-sans'
                      : 'bg-slate-50/80 border-slate-200 text-slate-900 font-sans'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Données & Énoncé de l'exercice :
                  </div>
                  <p className="whitespace-pre-line font-medium">{ex.introContext}</p>
                </div>
              )}

              {/* Questions List */}
              <div className="p-4 sm:p-6 space-y-5">
                {/* Quick answers banner if all questions are Vrai/Faux or single-verdict */}
                {ex.questions.length > 1 && ex.questions.every(q => /vrai|faux/i.test(q.finalAnswer || '')) && (
                  <div className={`p-3.5 sm:p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                    isDark
                      ? 'bg-indigo-950/40 border-indigo-800/60'
                      : 'bg-indigo-50/80 border-indigo-200'
                  }`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isDark ? 'text-indigo-300' : 'text-indigo-900'
                      }`}>
                        Correction Vérifiée :
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {ex.questions.map((q, idx) => {
                          const isVrai = /vrai/i.test(q.finalAnswer || '');
                          return (
                            <span
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg font-bold text-xs sm:text-sm font-mono border shadow-2xs ${
                                isVrai
                                  ? isDark
                                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                                    : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                  : isDark
                                    ? 'bg-rose-950/90 text-rose-300 border-rose-700'
                                    : 'bg-rose-100 text-rose-950 border-rose-300'
                              }`}
                            >
                              {q.numberLabel} {isVrai ? 'VRAI' : 'FAUX'}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const copyText = ex.questions.map(q => `${q.numberLabel} ${/vrai/i.test(q.finalAnswer || '') ? 'VRAI' : 'FAUX'}`).join('\n');
                        navigator.clipboard.writeText(copyText);
                        setCopiedIndex(`${ex.id}-all-answers`);
                        setTimeout(() => setCopiedIndex(null), 2500);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        isDark
                          ? 'bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border-indigo-700'
                          : 'bg-white hover:bg-indigo-100 text-indigo-950 border-indigo-300'
                      }`}
                    >
                      {copiedIndex === `${ex.id}-all-answers` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === `${ex.id}-all-answers` ? 'Copié !' : 'Copier les réponses'}</span>
                    </button>
                  </div>
                )}

                {ex.questions.map((q, qIdx) => {
                  const qKey = `${ex.id}-q-${qIdx}`;
                  const isVraiFaux = /^(?:\d+[\.\)]\s*)?(?:vrai|faux)$/i.test((q.finalAnswer || '').trim());
                  const isVrai = /vrai/i.test(q.finalAnswer || '');
                  const isFaux = /faux/i.test(q.finalAnswer || '');

                  return (
                    <div
                      key={qKey}
                      className={`p-4 sm:p-5 rounded-xl border transition-colors space-y-3.5 ${
                        isDark
                          ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Question Header */}
                      <div className={`flex flex-wrap items-center justify-between gap-2 pb-2 border-b ${
                        isDark ? 'border-slate-800' : 'border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className={`px-2.5 py-1 rounded-lg font-bold text-xs border shrink-0 ${
                            isDark
                              ? 'bg-indigo-950 text-indigo-200 border-indigo-700'
                              : 'bg-indigo-100 text-indigo-950 border-indigo-300'
                          }`}>
                            Question {q.numberLabel}
                          </span>
                          {q.titleOrPrompt && (
                            <span className={`text-xs sm:text-sm font-bold truncate ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`} title={q.titleOrPrompt}>
                              {q.titleOrPrompt}
                            </span>
                          )}
                        </div>

                        {/* Inline Verdict Badge for VRAI/FAUX */}
                        {isVraiFaux && (
                          <span className={`px-3 py-1 rounded-full font-bold text-xs sm:text-sm font-mono border shadow-2xs ${
                            isVrai
                              ? isDark
                                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                                : 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              : isDark
                                ? 'bg-rose-950/90 text-rose-300 border-rose-700'
                                : 'bg-rose-100 text-rose-950 border-rose-300'
                          }`}>
                            {isVrai ? '✔ VRAI' : '✖ FAUX'}
                          </span>
                        )}

                        <button
                          onClick={() => handleCopyQuestion(q, qKey)}
                          className={`text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                          }`}
                          title="Copier cette réponse uniquement"
                        >
                          {copiedIndex === qKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedIndex === qKey ? 'Copié' : 'Copier'}</span>
                        </button>
                      </div>

                      {/* Step by step resolution (Rendered ONLY if there are genuine calculation/reasoning steps) */}
                      {q.steps && q.steps.length > 0 && (
                        <div className="space-y-2.5">
                          <div className={`text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                            isDark ? 'text-indigo-300' : 'text-indigo-900'
                          }`}>
                            <BookmarkCheck className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`} />
                            <span>Démarche & Calculs Pas à Pas :</span>
                          </div>

                          <div className="space-y-2">
                            {q.steps.map((st, sIdx) => {
                              const trimmedStep = st.trim();
                              const isPureMath = /^(?:[A-Za-z_]\w*\s*(?:\([^)]*\))?\s*[=<>≤≥≈]|√|\d+\s*[<>=]|[-+\d\(]|S\s*=)/i.test(trimmedStep);
                              const isRuleOrText = /^(?:Or\b|Donc\b|D'o[ùu]\b|D'apr[èe]s\b|On sait\b|Par hypoth[èe]se\b|Comme\b|Soit\b|Le triangle\b|Le point\b|Les points\b|Propri[ée]t[ée]\b|Th[ée]or[èe]me\b|Formule\b|Donn[ée]es\b)/i.test(trimmedStep);

                              if (isRuleOrText) {
                                return (
                                  <div
                                    key={sIdx}
                                    className={`p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 ${
                                      isDark
                                        ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-100'
                                        : 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-medium'
                                    }`}
                                  >
                                    <span className="text-indigo-500 font-bold shrink-0 mt-0.5">ℹ️</span>
                                    <div className="flex-1 whitespace-pre-line">{trimmedStep}</div>
                                  </div>
                                );
                              }

                              if (isPureMath) {
                                return (
                                  <div
                                    key={sIdx}
                                    className={`px-3.5 py-2.5 rounded-lg border font-mono text-sm sm:text-base leading-relaxed flex items-center justify-between shadow-2xs ${
                                      isDark
                                        ? 'bg-slate-900/90 border-slate-700/80 text-white'
                                        : 'bg-white border-slate-300 text-slate-950'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 flex-1 overflow-x-auto">
                                      <span className={`text-xs font-bold select-none ${
                                        isDark ? 'text-indigo-400' : 'text-indigo-700'
                                      }`}>
                                        ▸
                                      </span>
                                      <span className="font-semibold tracking-wide whitespace-pre-wrap">{trimmedStep}</span>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={sIdx}
                                  className={`px-3 py-2 rounded-lg border text-xs sm:text-sm leading-relaxed flex items-start gap-2 ${
                                    isDark
                                      ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                                      : 'bg-white border-slate-200 text-slate-900'
                                  }`}
                                >
                                  <span className={`text-xs font-bold select-none mt-0.5 ${
                                    isDark ? 'text-slate-400' : 'text-slate-600'
                                  }`}>
                                    •
                                  </span>
                                  <div className="flex-1 whitespace-pre-line font-medium">{trimmedStep}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Boxed Final Result */}
                      {q.finalAnswer && (
                        <div className={`mt-3 p-4 rounded-xl border-2 flex items-start sm:items-center gap-3 shadow-xs ${
                          isFaux
                            ? isDark
                              ? 'bg-rose-950/80 border-rose-600 text-rose-100'
                              : 'bg-rose-50/90 border-rose-500 text-rose-950'
                            : isDark
                              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                              : 'bg-emerald-50/90 border-emerald-600 text-emerald-950'
                        }`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                            isFaux
                              ? isDark ? 'bg-rose-500 text-slate-950' : 'bg-rose-700 text-white'
                              : isDark ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-700 text-white'
                          }`}>
                            {isFaux ? <span className="font-black text-sm">✕</span> : <CheckCircle2 className="w-4 h-4 font-bold" />}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className={`text-[11px] font-bold uppercase tracking-wider ${
                              isFaux
                                ? isDark ? 'text-rose-300' : 'text-rose-900'
                                : isDark ? 'text-emerald-300' : 'text-emerald-900'
                            }`}>
                              {isVraiFaux ? 'Réponse Validée (À Reporter sur la copie) :' : 'Résultat Final Validé (À Encadrer sur la copie) :'}
                            </div>
                            <div className={`text-sm sm:text-lg font-bold font-mono tracking-wide ${
                              isFaux
                                ? isDark ? 'text-rose-200' : 'text-rose-950'
                                : isDark ? 'text-emerald-200' : 'text-emerald-950'
                            }`}>
                              {q.finalAnswer}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER MODE 2: EXAM SHEET (MANUSCRIPT READY) */}
      {activeLayout === 'exam_sheet' && (
        <div
          className={`p-6 sm:p-10 rounded-2xl border font-sans leading-relaxed space-y-8 shadow-md ${
            isDark
              ? 'bg-slate-950 text-slate-100 border-slate-800'
              : 'bg-white text-slate-900 border-slate-200'
          }`}
        >
          {exercises.map((ex, exIdx) => (
            <div key={exIdx} className={`space-y-5 pb-8 border-b-2 border-dashed last:border-0 last:pb-0 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              {/* Exercise Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-indigo-500/20">
                <div className={`font-bold text-base sm:text-lg uppercase tracking-wide flex items-center gap-2 ${
                  isDark ? 'text-indigo-300' : 'text-indigo-900'
                }`}>
                  <span className="underline underline-offset-4 decoration-2 decoration-indigo-500">{ex.title}</span>
                  {ex.points && (
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isDark ? 'text-amber-300 bg-amber-950/80 border border-amber-700' : 'text-amber-950 bg-amber-100 border border-amber-300'
                    }`}>
                      {ex.points}
                    </span>
                  )}
                </div>
              </div>

              {ex.introContext && (
                <div className={`p-3 rounded-lg border text-xs sm:text-sm italic font-medium leading-relaxed ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {ex.introContext}
                </div>
              )}

              {/* Questions */}
              <div className="space-y-6">
                {ex.questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-2.5 pl-3 sm:pl-5 border-l-3 border-indigo-600">
                    <div className={`font-bold text-sm sm:text-base flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{q.numberLabel}</span>
                      {q.titleOrPrompt && <span>{q.titleOrPrompt}</span>}
                    </div>

                    {/* Step calculations */}
                    {q.steps.length > 0 && (
                      <div className="space-y-1.5 pl-2 sm:pl-4">
                        {q.steps.map((st, sIdx) => {
                          const isPureMath = /^(?:[A-Za-z_]\w*\s*(?:\([^)]*\))?\s*[=<>≤≥≈]|√|\d+\s*[<>=]|[-+\d\(]|S\s*=)/i.test(st.trim());
                          return (
                            <div
                              key={sIdx}
                              className={`text-xs sm:text-sm leading-relaxed ${
                                isPureMath
                                  ? 'font-mono font-bold text-slate-950 dark:text-white py-0.5'
                                  : 'text-slate-700 dark:text-slate-300 font-medium'
                              }`}
                            >
                              {isPureMath ? `   ${st}` : st}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Boxed final result */}
                    {q.finalAnswer && (
                      <div className="mt-3 pl-2 sm:pl-4">
                        <div className={`inline-block px-4 py-2 rounded-lg border-2 font-bold font-mono text-sm sm:text-base shadow-xs ${
                          isDark
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                            : 'bg-emerald-50 border-emerald-600 text-emerald-950'
                        }`}>
                          <span className="font-sans text-xs font-bold mr-2 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                            Conclusion :
                          </span>
                          {q.finalAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
