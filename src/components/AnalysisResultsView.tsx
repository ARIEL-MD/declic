import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Layers, 
  BookOpen, 
  Compass, 
  Copy, 
  Check, 
  FileText, 
  ListOrdered, 
  ShieldCheck, 
  Sparkles, 
  Lightbulb, 
  Target,
  GraduationCap,
  Volume2,
  VolumeX,
  Printer,
  ChevronDown,
  ChevronUp,
  Quote,
  Library,
  BookMarked,
  LayoutGrid,
  AlignLeft,
  Search,
  PenTool,
  Award
} from 'lucide-react';
import { MethodologyAnalysisResult, AssistanceLevel, SubPartData, DevelopmentPartData } from '../types';
import { StructuredExamRenderer, parseExamIntoExercises } from './StructuredExamRenderer';
import { formatMathSymbols } from '../utils/mathFormatter';

interface AnalysisResultsViewProps {
  result: MethodologyAnalysisResult;
  subjectTitle: string;
}

export const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({
  result,
  subjectTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'copie_integrale' | 'structured_redaction' | 'citations_index' | 'assistance_levels' | 'step_by_step' | 'four_pillars' | 'rubric'>('copie_integrale');
  const [selectedAssistanceLevel, setSelectedAssistanceLevel] = useState<AssistanceLevel>(5);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('all');
  const [paragraphViewMode, setParagraphViewMode] = useState<'triad' | 'full' | 'both'>('both');
  const [copieDisplayMode, setCopieDisplayMode] = useState<'clean' | 'annotated'>('clean');

  const fullRedactionText = result.level5FullRedaction || result.fullSynthesizedResponse;

  // Note: result.isFallback stays available on the payload for logs/analytics, but is
  // intentionally never surfaced in the UI — same continuity principle as ChatGPT silently
  // downgrading to a lighter model instead of showing an outage banner.
  const fallbackBanner = null;

  // Reliable structured resolution sent directly by the AI as JSON for Maths / Physique-Chimie / SVT
  // (see structuredScientificResolution). When present, this is passed straight into
  // StructuredExamRenderer instead of letting it re-parse the free-text redaction, which is what
  // used to produce messy, hard-to-follow displays when the raw text didn't perfectly match the
  // expected format.
  const scientificExercises = (result.structuredScientificResolution || [])
    .filter((ex) => ex && (ex.questions?.length || ex.introContext))
    .map((ex, exIdx) => ({
      id: `sci-ex-${exIdx + 1}`,
      title: ex.title || `Exercice ${exIdx + 1}`,
      points: ex.points || undefined,
      introContext: ex.introContext || undefined,
      questions: (ex.questions || []).map((q) => ({
        raw: [q.titleOrPrompt, ...(q.steps || []), q.finalAnswer].filter(Boolean).join('\n'),
        numberLabel: q.numberLabel,
        titleOrPrompt: q.titleOrPrompt || undefined,
        steps: (q.steps || []).map((s) => formatMathSymbols(s)),
        finalAnswer: q.finalAnswer ? formatMathSymbols(q.finalAnswer) : undefined,
      })),
    }));

  const isForeignLanguage = /allemand|deutsch|german|anglais|english|espagnol|spanish|español/i.test(
    (result.disciplineIdentified || '') + ' ' + subjectTitle + ' ' + (result.exerciseTypeIdentified || '')
  );

  const isLanguageOrDirectExam = /allemand|deutsch|german|anglais|english|espagnol|spanish|español|physique|chimie|svt|biologie|g[ée]ologie|r[ée]sum[ée]|texte argumentatif|situation d'évaluation|bepc|compr[ée]hension|exercices?|questions?/i.test(
    (result.disciplineIdentified || '') + ' ' + subjectTitle + ' ' + (result.exerciseTypeIdentified || '')
  );

  const isMath = isLanguageOrDirectExam || /math[ée]matiques?|maths?|calcul|fonction|suite|intégrale|primitive|dérivée|complexe|probabilité|barycentre|matrice|vecteur|équation|ln\(|exp\(|u_n|f\(x\)|limite|polyn[ôo]me|trigonom[ée]tr|pythagore|thal[èe]s|fraction|géométrie|arithmétique|factoriser|démontrer/i.test(
    (result.disciplineIdentified || '') + ' ' + subjectTitle + ' ' + (result.exerciseTypeIdentified || '')
  );

  const renderStructuredExamBlocks = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-3 font-sans">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }

          // Main Section Title (I-, II-, III-, PARTIE, AUFGABEN, SPRACHPRAXIS, READING COMPREHENSION, etc.)
          if (/^([I|V|X]+[\-\.\s]|PARTIE|AUFGABEN|SPRACHKOMPETENZ|SPRACHPRAXIS|TEXTVERSTÄNDNIS|READING COMPREHENSION|COMPRÉHENSION|COMPETENCIA|EXPRESIÓN|RÉDACTION|FREIE PRODUKTION)/i.test(trimmed)) {
            return (
              <div 
                key={idx} 
                className="mt-6 mb-3 px-4 py-2.5 rounded-xl bg-indigo-950/40 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold text-sm sm:text-base flex items-center gap-2 shadow-sm"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <span>{trimmed.replace(/^#+\s*/, '')}</span>
              </div>
            );
          }

          // Sub-Section Heading (A., B., C., 1., etc. like "A. Wie heißt es im Text?", "B. Antworte auf die Fragen!")
          if (/^([A-Z]\.|\bSection\b|\bExercice\b|\bAufgabe\b|\bQuestion\b)/i.test(trimmed)) {
            return (
              <div 
                key={idx} 
                className="mt-4 mb-2 px-3.5 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm bg-amber-500" />
                  {trimmed}
                </span>
                <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">Partie d'examen</span>
              </div>
            );
          }

          // Individual Question item (1., 2., 3., a-, b-, etc.)
          if (/^(\d+[\.\)]|[a-d][\.\-\)])\s+/i.test(trimmed)) {
            const isAnswerLine = /➜|=>|->|Réponse|Antwort|Citation|Justification|Begründung/i.test(trimmed);
            return (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border text-xs sm:text-sm leading-relaxed transition-all ${
                  isAnswerLine 
                    ? 'bg-emerald-950/20 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-900 dark:text-emerald-200 ml-2 sm:ml-4' 
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {trimmed.match(/^(\d+[\.\)]|[a-d][\.\-\)])/)?.[0] || '•'}
                  </span>
                  <div className="flex-1">
                    {renderEnrichedText(trimmed.replace(/^(\d+[\.\)]|[a-d][\.\-\)])\s+/, ''))}
                  </div>
                </div>
              </div>
            );
          }

          // Direct answer arrow or justification
          if (/^(➜|=>|->|Begründung:|Justification:)/i.test(trimmed)) {
            return (
              <div 
                key={idx} 
                className="my-1.5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-medium flex items-start gap-2 ml-3 sm:ml-6 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  {renderEnrichedText(trimmed)}
                </div>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 px-1">
              {renderEnrichedText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderEnrichedText = (text: string) => {
    if (!text) return null;
    return formatMathSymbols(text);
  };

  const handleCopy = (textToCopy?: string) => {
    navigator.clipboard.writeText(textToCopy || fullRedactionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(fullRedactionText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const structured = result.structuredRedaction;

  // Extract individual clean paragraphs for the ready-to-hand-in examination paper
  const introParagraph = structured?.introduction?.fullText || 
    `${structured?.introduction?.amorce || ''} ${structured?.introduction?.definitionTension || ''} ${structured?.introduction?.problematique || ''} ${structured?.introduction?.annoncePlan || ''}`.trim();

  const part1Chapeau = structured?.development?.part1?.thesisOverview?.trim();
  const part1SubParagraphs = (structured?.development?.part1?.subParts || []).map((sp) => {
    return sp.fullText || `${sp.argument} ${sp.explication} ${sp.illustration ? `Comme l'illustre ${sp.illustration.auteur} dans ${sp.illustration.oeuvre} : « ${sp.illustration.citation} ». ${sp.illustration.analyseIllustration}` : ''}`.trim();
  });
  const part1Fallback = (!part1SubParagraphs.length && structured?.development?.part1?.fullText) ? [structured.development.part1.fullText] : [];

  const transition1Paragraph = structured?.development?.transition1?.trim();

  const part2Chapeau = structured?.development?.part2?.thesisOverview?.trim();
  const part2SubParagraphs = (structured?.development?.part2?.subParts || []).map((sp) => {
    return sp.fullText || `${sp.argument} ${sp.explication} ${sp.illustration ? `Comme l'illustre ${sp.illustration.auteur} dans ${sp.illustration.oeuvre} : « ${sp.illustration.citation} ». ${sp.illustration.analyseIllustration}` : ''}`.trim();
  });
  const part2Fallback = (!part2SubParagraphs.length && structured?.development?.part2?.fullText) ? [structured.development.part2.fullText] : [];

  const transition2Paragraph = structured?.development?.transition2?.trim();
  const part3Chapeau = structured?.development?.part3?.thesisOverview?.trim();
  const part3SubParagraphs = (structured?.development?.part3?.subParts || []).map((sp) => {
    return sp.fullText || `${sp.argument} ${sp.explication} ${sp.illustration ? `Comme l'illustre ${sp.illustration.auteur} dans ${sp.illustration.oeuvre} : « ${sp.illustration.citation} ». ${sp.illustration.analyseIllustration}` : ''}`.trim();
  });
  const part3Fallback = (!part3SubParagraphs.length && structured?.development?.part3?.fullText) ? [structured.development.part3.fullText] : [];

  const conclusionParagraph = structured?.conclusion?.fullText || 
    `${structured?.conclusion?.bilanSynthese || ''} ${structured?.conclusion?.reponseDefinitive || ''} ${structured?.conclusion?.elargissement || ''}`.trim();

  // Generate 100% clean continuous redaction string (for copying / rendering ready to submit)
  const getCleanReadyToSubmitEssay = (withIndentation = true): string => {
    if (isMath) {
      const raw = result.level5FullRedaction || result.fullSynthesizedResponse || '';
      const parsed = parseExamIntoExercises(raw);
      if (parsed && parsed.length > 0) {
        return parsed.map((ex) => {
          let str = `===================================================\n`;
          str += `${ex.title.toUpperCase()} ${ex.points ? `(${ex.points})` : ''}\n`;
          str += `===================================================\n\n`;
          if (ex.introContext) str += `${ex.introContext}\n\n`;
          ex.questions.forEach((q) => {
            str += `${q.numberLabel} ${q.titleOrPrompt || ''}\n`;
            if (q.steps && q.steps.length > 0) {
              q.steps.forEach((st) => {
                str += `   • ${st}\n`;
              });
            }
            if (q.finalAnswer) {
              str += `   ➜ RÉSULTAT FINAL : ${q.finalAnswer}\n`;
            }
            str += '\n';
          });
          return str.trim();
        }).join('\n\n\n');
      }
      return raw.trim();
    }

    const indentPrefix = withIndentation ? "    " : "";
    const blocks: string[] = [];

    // 1. Introduction
    if (introParagraph) {
      blocks.push(`${indentPrefix}${introParagraph}`);
    }

    // 2. Développement - Axe 1
    const p1List: string[] = [];
    if (part1Chapeau) {
      p1List.push(`${indentPrefix}${part1Chapeau}`);
    }
    const p1Subs = part1SubParagraphs.length > 0 ? part1SubParagraphs : part1Fallback;
    p1Subs.forEach(p => {
      if (p) p1List.push(`${indentPrefix}${p}`);
    });
    if (p1List.length > 0) {
      blocks.push(p1List.join("\n\n"));
    }

    // 3. Transition 1
    if (transition1Paragraph) {
      blocks.push(`${indentPrefix}${transition1Paragraph}`);
    }

    // 4. Développement - Axe 2
    const p2List: string[] = [];
    if (part2Chapeau) {
      p2List.push(`${indentPrefix}${part2Chapeau}`);
    }
    const p2Subs = part2SubParagraphs.length > 0 ? part2SubParagraphs : part2Fallback;
    p2Subs.forEach(p => {
      if (p) p2List.push(`${indentPrefix}${p}`);
    });
    if (p2List.length > 0) {
      blocks.push(p2List.join("\n\n"));
    }

    // 5. Transition 2 & Axe 3 (if applicable)
    if (transition2Paragraph) {
      blocks.push(`${indentPrefix}${transition2Paragraph}`);
    }
    if (part3Chapeau || part3SubParagraphs.length > 0 || part3Fallback.length > 0) {
      const p3List: string[] = [];
      if (part3Chapeau) p3List.push(`${indentPrefix}${part3Chapeau}`);
      const p3Subs = part3SubParagraphs.length > 0 ? part3SubParagraphs : part3Fallback;
      p3Subs.forEach(p => {
        if (p) p3List.push(`${indentPrefix}${p}`);
      });
      if (p3List.length > 0) blocks.push(p3List.join("\n\n"));
    }

    // 6. Conclusion
    if (conclusionParagraph) {
      blocks.push(`${indentPrefix}${conclusionParagraph}`);
    }

    if (blocks.length > 0) {
      return blocks.join("\n\n\n");
    }

    // Fallback on fullRedactionText
    return (result.level5FullRedaction || result.fullSynthesizedResponse || '')
      .replace(/^#+\s+.*$/gm, '')
      .replace(/^\*\*(I|II|III|A|B|C|1|2|3|4|5|INTRODUCTION|DÉVELOPPEMENT|CONCLUSION|PREMIÈRE PARTIE|DEUXIÈME PARTIE|TROISIÈME PARTIE|TRANSITION).*?\*\*$/gim, '')
      .replace(/^(I|II|III|A|B|C|1|2|3)\.\s+.*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const cleanEssayText = getCleanReadyToSubmitEssay(true);
  const wordCount = cleanEssayText ? cleanEssayText.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 180));

  // Extract all citations and works from the development parts
  const collectAllIllustrations = () => {
    const illustrations: Array<{
      partTitle: string;
      subPartLetter: string;
      argument: string;
      auteur: string;
      oeuvre: string;
      citation: string;
      analyseIllustration: string;
    }> = [];

    const parts: Array<DevelopmentPartData | undefined> = [
      structured?.development?.part1,
      structured?.development?.part2,
      structured?.development?.part3,
    ];

    parts.forEach((part, pIdx) => {
      if (!part) return;
      const partName = part.title || `Partie ${pIdx + 1}`;

      if (Array.isArray(part.subParts) && part.subParts.length > 0) {
        part.subParts.forEach((sp) => {
          if (sp.illustration) {
            illustrations.push({
              partTitle: partName,
              subPartLetter: sp.subPartLetter || 'A',
              argument: sp.argument || '',
              auteur: sp.illustration.auteur || 'Auteur classique',
              oeuvre: sp.illustration.oeuvre || 'Œuvre de référence',
              citation: sp.illustration.citation || '',
              analyseIllustration: sp.illustration.analyseIllustration || '',
            });
          }
        });
      }
    });

    return illustrations;
  };

  const allIllustrations = collectAllIllustrations();

  // Helper to render subparts cleanly
  const renderSubPartContent = (subPart: SubPartData, idx: number) => {
    return (
      <div key={idx} className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 sm:p-5 space-y-4 hover:border-slate-700 transition-colors">
        {/* Subpart Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-indigo-950 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-800">
              {subPart.subPartLetter || `§${idx + 1}`}
            </span>
            <h4 className="text-sm font-bold text-white">
              {subPart.title || `Sous-partie ${subPart.subPartLetter}`}
            </h4>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Triade Académique
          </span>
        </div>

        {/* TRIAD VIEW (Argument + Explication + Illustration) */}
        {(paragraphViewMode === 'triad' || paragraphViewMode === 'both') && (
          <div className="space-y-3">
            {/* 1. L'ARGUMENT */}
            <div className="bg-slate-950/90 p-3.5 rounded-xl border border-indigo-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>1. L'ARGUMENT (Idée Directrice) :</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-medium pl-5 leading-relaxed">
                {subPart.argument}
              </p>
            </div>

            {/* 2. L'EXPLICATION */}
            <div className="bg-slate-950/90 p-3.5 rounded-xl border border-amber-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>2. L'EXPLICATION (Raisonnement Conceptuel) :</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 pl-5 leading-relaxed">
                {subPart.explication}
              </p>
            </div>

            {/* 3. L'ILLUSTRATION (Auteur + Œuvre + Citation + Analyse) */}
            {subPart.illustration && (
              <div className="bg-slate-950/95 p-4 rounded-xl border border-emerald-900/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-950/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Quote className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>3. L'ILLUSTRATION & CITATION CANONIQUE :</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {subPart.illustration.auteur}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 italic">
                      {subPart.illustration.oeuvre}
                    </span>
                  </div>
                </div>

                {/* Citation Textuelle */}
                {subPart.illustration.citation && (
                  <div className="bg-emerald-950/30 p-3 rounded-lg border-l-4 border-emerald-500 text-xs sm:text-sm text-emerald-100 font-serif italic">
                    {subPart.illustration.citation}
                  </div>
                )}

                {/* Analyse de la citation */}
                {subPart.illustration.analyseIllustration && (
                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">Portée :</span>
                    <span>{subPart.illustration.analyseIllustration}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FULL REDACTED PARAGRAPH */}
        {(paragraphViewMode === 'full' || paragraphViewMode === 'both') && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlignLeft className="w-3 h-3 text-indigo-400" />
                Paragraphe rédigé en continu (Texte intégral de la copie) :
              </span>
              <button
                onClick={() => handleCopy(subPart.fullText)}
                className="text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                title="Copier ce paragraphe"
              >
                <Copy className="w-3 h-3" />
                Copier le paragraphe
              </button>
            </div>
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 text-slate-200 text-xs sm:text-sm leading-relaxed font-serif whitespace-pre-line">
              {subPart.fullText}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDevelopmentPart = (part: DevelopmentPartData, partKey: string, badgeNumber: number) => {
    const isExpanded = expandedSection === partKey || expandedSection === 'all';

    return (
      <div key={partKey} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div 
          onClick={() => setExpandedSection(isExpanded ? null : partKey)}
          className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-indigo-900/60 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-700 shrink-0">
              {badgeNumber}
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                {part.title || `Partie ${badgeNumber}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                {part.thesisOverview || 'Argumentation structurée en sous-parties canoniques'}
              </p>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>

        {isExpanded && (
          <div className="p-5 space-y-5">
            {/* SubParts List */}
            {Array.isArray(part.subParts) && part.subParts.length > 0 ? (
              <div className="space-y-4">
                {part.subParts.map((sp, idx) => renderSubPartContent(sp, idx))}
              </div>
            ) : (
              /* Fallback for simple string subparts */
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="font-bold text-indigo-400 block mb-1">A. Sous-partie A :</span>
                    <p className="text-slate-300">{part.subPartA}</p>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="font-bold text-indigo-400 block mb-1">B. Sous-partie B :</span>
                    <p className="text-slate-300">{part.subPartB}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/70 text-slate-200 text-xs sm:text-sm leading-relaxed font-serif whitespace-pre-line">
                  {part.fullText}
                </div>
              </div>
            )}

            {/* Transition */}
            {partKey === 'part1' && structured?.development?.transition1 && (
              <div className="bg-indigo-950/40 border border-indigo-900/60 p-3.5 rounded-xl text-xs text-indigo-200">
                <span className="font-bold text-indigo-300 block mb-1">Transition rédigée (Partie I ➔ Partie II) :</span>
                <p className="italic">« {structured.development.transition1} »</p>
              </div>
            )}

            {partKey === 'part2' && structured?.development?.transition2 && (
              <div className="bg-indigo-950/40 border border-indigo-900/60 p-3.5 rounded-xl text-xs text-indigo-200">
                <span className="font-bold text-indigo-300 block mb-1">Transition rédigée (Partie II ➔ Partie III) :</span>
                <p className="italic">« {structured.development.transition2} »</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="analysis-results-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden space-y-6 transition-colors">
      {fallbackBanner && <div className="p-4 pb-0">{fallbackBanner}</div>}
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-50 via-indigo-50/50 to-slate-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-6 border-b border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/60 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {result.exerciseTypeIdentified || (isMath ? 'Exercice & Problème de Mathématiques' : 'Dissertation Académique')}
            </span>
            {isMath ? (
              <>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800/60 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  Résolution Intégrale Pas à Pas (Tous Calculs Détaillés)
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Guide Méthode « Comment Faire »
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Triade Académique Intégrale (Argument + Explication + Illustration)
                </span>
                {allIllustrations.length > 0 && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {allIllustrations.length} Citations & Œuvres d'Auteurs
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeech}
              title={isSpeaking ? "Arrêter la lecture audio" : "Écouter la lecture de la rédaction"}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isSpeaking 
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse' 
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              <span>{isSpeaking ? 'Arrêter' : 'Écouter'}</span>
            </button>

            <button
              onClick={handlePrint}
              title="Imprimer ou enregistrer en PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              onClick={() => handleCopy()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier tout'}</span>
            </button>
          </div>
        </div>

        {/* Subject Highlight */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sujet de Rédaction Traité :</span>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-1">« {subjectTitle} »</h2>
        </div>

        {/* Conceptual Disambiguation - shows which meaning of an ambiguous term was retained */}
        {result.conceptualDisambiguation?.hasAmbiguousTerm && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl p-3.5 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Terme ambigu détecté : « {result.conceptualDisambiguation.term} »
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Sens possibles : {result.conceptualDisambiguation.possibleMeanings.join(' • ')}
            </p>
            <p className="text-xs text-slate-800 dark:text-slate-200">
              <strong>Sens retenu ici :</strong> {result.conceptualDisambiguation.retainedMeaning}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 italic">
              {result.conceptualDisambiguation.justification}
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-500 mt-1">
              Ce sens ne correspond pas à ce que tu attendais ? Reformule le sujet en précisant le sens voulu entre parenthèses (ex : « ... (mythe = illusion) »).
            </p>
          </div>
        )}

        {/* Pedagogical Transfer Summary */}
        <div className="bg-slate-100/90 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-300 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <span>Règle Méthodologique Fondamentale Appliquée :</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-300 leading-relaxed">
            {result.pedagogicalTransferExplanation}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
        {[
          { id: 'copie_integrale', label: isMath ? 'Copie d\'Examen Détaillée' : 'Copie Intégrale In Extenso', icon: FileText },
          { id: 'structured_redaction', label: isMath ? 'Guide "Comment Faire" & Méthode' : 'Décomposition & Triades (3x3)', icon: LayoutGrid },
          { id: 'citations_index', label: isMath ? 'Formules & Théorèmes de Cours' : `Index des Auteurs (${allIllustrations.length})`, icon: Library },
          { id: 'assistance_levels', label: '5 Niveaux d\'Aide', icon: Layers },
          { id: 'step_by_step', label: isMath ? 'Calculs & Étapes' : 'Démarche Pas-à-Pas', icon: ListOrdered },
          { id: 'four_pillars', label: isMath ? 'Piliers Mathématiques' : 'Cartographie des 4 Piliers', icon: BookOpen },
          { id: 'rubric', label: 'Grille d’Auto-Évaluation', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-500 text-white bg-slate-800/40 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="p-6 pt-0 space-y-6">

        {/* ========================================================
            TAB 0: COPIE INTÉGRALE IN EXTENSO (PRÊTE À RENDRE)
           ======================================================== */}
        {activeTab === 'copie_integrale' && (
          <div className="space-y-6">
            {/* Reading Toolbar & Copy Actions */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {/* View Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Mode de lecture :</span>
                <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
                  <button
                    onClick={() => setCopieDisplayMode('clean')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      copieDisplayMode === 'clean'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Copie d'examen authentique en texte continu sans titres de parties ni numéros"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Copie Prête à Rendre (0 Titre/0 Balise)</span>
                  </button>
                  <button
                    onClick={() => setCopieDisplayMode('annotated')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      copieDisplayMode === 'annotated'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Texte intégral continu avec repères discrets dans la marge"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Copie Guidée (Repères en Marge)</span>
                  </button>
                </div>

                {/* Word count & Read time pill */}
                <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px] font-sans pl-2">
                  <span>~{wordCount} mots</span>
                  <span>•</span>
                  <span>⏱️ ~{readTimeMinutes} min de lecture</span>
                </div>
              </div>

              {/* Primary Copy Action & Utilities */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(cleanEssayText)}
                  className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Copier la copie complète nettoyée avec alinéas et sauts de ligne, prête à coller"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copié dans le presse-papier !' : 'Copier la Copie Prête à Rendre'}</span>
                </button>

                <button
                  onClick={handleSpeech}
                  title={isSpeaking ? "Arrêter la lecture" : "Écouter la lecture de la copie"}
                  className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isSpeaking 
                      ? 'bg-amber-600/20 border-amber-500/50 text-amber-300 animate-pulse' 
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={handlePrint}
                  title="Imprimer ou enregistrer en PDF la copie d'examen"
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Examination Paper Canvas (Clean Academic Paper - fully contrast optimized) */}
            <div className="rounded-2xl p-6 sm:p-12 font-serif text-sm sm:text-base leading-relaxed sm:leading-loose transition-colors shadow-lg border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800">
              
              {/* Examination Sheet Academic Header */}
              <div className="text-center pb-8 mb-8 border-b border-slate-200 dark:border-slate-800/80 font-sans space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider pb-2 border-b border-dashed border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <span>{result.disciplineIdentified ? `ÉPREUVE OFFICIELLE : ${result.disciplineIdentified.toUpperCase()}` : (isMath ? "ÉPREUVE SCIENTIFIQUE / TECHNIQUE" : "EXAMEN DU BACCALAURÉAT / BEPC")}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700">
                    COPIE OFFICIELLE DU CANDIDAT (20/20)
                  </span>
                  <span>NORME ACADÉMIQUE OFFICIELLE</span>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest block mb-1 text-indigo-700 dark:text-indigo-400">
                    {isMath ? "Énoncé du Sujet / Exercices Traités" : "Énoncé du Sujet Traité"}
                  </span>
                  <h1 className="text-base sm:text-xl font-bold max-w-3xl mx-auto leading-snug text-slate-900 dark:text-white">
                    « {subjectTitle} »
                  </h1>
                </div>

                {copieDisplayMode === 'clean' && (
                  <p className="text-[11px] italic font-medium text-slate-600 dark:text-slate-400">
                    {isMath 
                      ? "Corrigé officiel intégral prêt à être recopié (questions numérotées, étapes de raisonnement et réponses fidèles aux consignes)."
                      : "Texte intégral continu prêt à être recopié sur la copie d'examen (sans titres intermédiaires, structuré par les alinéas et les sauts de 2 lignes réglementaires)."}
                  </p>
                )}
              </div>

              {/* THE ESSAY / MATH RESOLUTION BODY */}
              {isMath ? (
                <div className="space-y-4">
                  <StructuredExamRenderer
                    rawText={fullRedactionText || cleanEssayText}
                    subjectTitle={subjectTitle}
                    onCopy={handleCopy}
                    structuredExercises={scientificExercises}
                  />
                </div>
              ) : (
                <div className="space-y-6 text-slate-900 dark:text-slate-100">

                  {/* 1. INTRODUCTION */}
                  <div className="relative group">
                    {copieDisplayMode === 'annotated' && (
                      <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-sans font-bold uppercase tracking-wide border bg-indigo-100 dark:bg-indigo-950/80 text-indigo-950 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700">
                        <span>1. INTRODUCTION (Amorce + Citation du sujet + Explication + Problématique + Annonce de plan)</span>
                      </div>
                    )}

                    <p className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                      {renderEnrichedText(introParagraph)}
                    </p>
                  </div>

                  {/* SAUT DE 2 LIGNES ENTRE INTRODUCTION ET DÉVELOPPEMENT */}
                  <div className="py-4 flex items-center justify-center gap-3 select-none" aria-hidden="true">
                    <span className="h-px w-20 bg-slate-200 dark:bg-slate-800"></span>
                    <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                      [ Saut de 2 lignes — Entrée dans le développement ]
                    </span>
                    <span className="h-px w-20 bg-slate-200 dark:bg-slate-800"></span>
                  </div>

                  {/* 2. DÉVELOPPEMENT - AXE I */}
                  <div className="space-y-5">
                    {copieDisplayMode === 'annotated' && (
                      <div className="mb-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-sans font-bold uppercase tracking-wide border bg-indigo-100 dark:bg-indigo-950/80 text-indigo-950 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700">
                        <span>2. PREMIÈRE PARTIE : THÈSE / EXPLICATION (Chapeau + 3 Arguments A, B, C)</span>
                      </div>
                    )}

                    {/* Chapeau Axe 1 */}
                    {part1Chapeau && (
                      <p className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                        {renderEnrichedText(part1Chapeau)}
                      </p>
                    )}

                    {/* Sous-parties Axe 1 */}
                    {part1SubParagraphs.length > 0 ? (
                      part1SubParagraphs.map((subPText, sIdx) => (
                        <p key={sIdx} className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                          {renderEnrichedText(subPText)}
                        </p>
                      ))
                    ) : (
                      part1Fallback.map((p, idx) => (
                        <p key={idx} className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                          {renderEnrichedText(p)}
                        </p>
                      ))
                    )}
                  </div>

                  {/* SAUT DE 2 LIGNES ENTRE AXE I ET TRANSITION */}
                  <div className="py-3 flex items-center justify-center gap-3 select-none" aria-hidden="true">
                    <span className="h-px w-16 bg-slate-200 dark:bg-slate-800"></span>
                    <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                      [ Saut de ligne ]
                    </span>
                    <span className="h-px w-16 bg-slate-200 dark:bg-slate-800"></span>
                  </div>

                  {/* 3. TRANSITION MAJEURE INTER-PARTIES */}
                  {transition1Paragraph && (
                    <div>
                      {copieDisplayMode === 'annotated' && (
                        <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-sans font-bold uppercase tracking-wide border bg-sky-100 dark:bg-sky-950/80 text-sky-950 dark:text-sky-200 border-sky-300 dark:border-sky-700">
                          <span>Transition Charnière (Bilan Axe I ➔ Question ouvrant l'Axe II)</span>
                        </div>
                      )}
                      <p className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                        {renderEnrichedText(transition1Paragraph)}
                      </p>
                    </div>
                  )}

                  {/* SAUT DE 2 LIGNES ENTRE TRANSITION ET AXE II */}
                  <div className="py-3 flex items-center justify-center gap-3 select-none" aria-hidden="true">
                    <span className="h-px w-16 bg-slate-200 dark:bg-slate-800"></span>
                    <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                      [ Saut de ligne ]
                    </span>
                    <span className="h-px w-16 bg-slate-200 dark:bg-slate-800"></span>
                  </div>

                  {/* 4. DÉVELOPPEMENT - AXE II */}
                  <div className="space-y-5">
                    {copieDisplayMode === 'annotated' && (
                      <div className="mb-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-sans font-bold uppercase tracking-wide border bg-indigo-100 dark:bg-indigo-950/80 text-indigo-950 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700">
                        <span>3. DEUXIÈME PARTIE : DISCUSSION / ANTITHÈSE (Chapeau + 3 Arguments A, B, C)</span>
                      </div>
                    )}

                    {/* Chapeau Axe 2 */}
                    {part2Chapeau && (
                      <p className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                        {renderEnrichedText(part2Chapeau)}
                      </p>
                    )}

                    {/* Sous-parties Axe 2 */}
                    {part2SubParagraphs.length > 0 ? (
                      part2SubParagraphs.map((subPText, sIdx) => (
                        <p key={sIdx} className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                          {renderEnrichedText(subPText)}
                        </p>
                      ))
                    ) : (
                      part2Fallback.map((p, idx) => (
                        <p key={idx} className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                          {renderEnrichedText(p)}
                        </p>
                      ))
                    )}
                  </div>

                  {/* AXE III (SI PRÉSENT DANS PLAN EN 3 PARTIES) */}
                  {structured?.development?.part3 && (
                    <div className="space-y-5 pt-4">
                      {transition2Paragraph && (
                        <div className="py-2">
                          <p className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                            {renderEnrichedText(transition2Paragraph)}
                          </p>
                        </div>
                      )}

                      {part3Chapeau && (
                        <p className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                          {renderEnrichedText(part3Chapeau)}
                        </p>
                      )}

                      {part3SubParagraphs.map((subPText, sIdx) => (
                        <p key={sIdx} className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                          {renderEnrichedText(subPText)}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* SAUT DE 2 LIGNES ENTRE DÉVELOPPEMENT ET CONCLUSION */}
                  <div className="py-4 flex items-center justify-center gap-3 select-none" aria-hidden="true">
                    <span className="h-px w-20 bg-slate-200 dark:bg-slate-800"></span>
                    <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                      [ Saut de 2 lignes — Entrée dans la conclusion ]
                    </span>
                    <span className="h-px w-20 bg-slate-200 dark:bg-slate-800"></span>
                  </div>

                  {/* 5. CONCLUSION */}
                  <div>
                    {copieDisplayMode === 'annotated' && (
                      <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-sans font-bold uppercase tracking-wide border bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700">
                        <span>4. CONCLUSION (Bilan Axe I + Bilan Axe II + Prise de position personnelle sans synthèse artificielle)</span>
                      </div>
                    )}

                    <p className="text-justify leading-relaxed sm:leading-loose whitespace-pre-line font-medium indent-8 sm:indent-12">
                      {renderEnrichedText(conclusionParagraph)}
                    </p>
                  </div>

                </div>
              )}

              {/* End of Paper Sign-off */}
              <div className="mt-10 pt-6 border-t flex flex-wrap items-center justify-between gap-2 text-xs font-sans border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-emerald-900 dark:text-emerald-400">Fin de la Rédaction — Devoir Conforme aux Canons Officiels</span>
                </div>
                <button
                  onClick={() => handleCopy(cleanEssayText)}
                  className="text-xs font-bold hover:underline flex items-center gap-1 text-indigo-900 dark:text-indigo-400 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier cette copie prête à rendre</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 1: STRUCTURED IN EXTENSO REDACTION & TRIADS / MATH METHOD
           ======================================================== */}
        {activeTab === 'structured_redaction' && (
          <div className="space-y-6">
            {isMath ? (
              /* MATH METHODOLOGY & "COMMENT FAIRE" GUIDE */
              <div className="space-y-6">
                {/* Banner Guide Méthodologique */}
                <div className="bg-sky-950/40 border border-sky-900/60 p-5 rounded-2xl flex items-start gap-3.5 text-xs text-sky-200">
                  <Lightbulb className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Guide Méthodologique « Comment Faire » (Toutes Classes)</h3>
                    <p className="text-sky-300/90 leading-relaxed">
                      Voici la stratégie intellectuelle, les formules requises, les étapes sans saut de calcul et les réflexes d'auto-contrôle pour maîtriser ce type d'exercice et obtenir 20/20.
                    </p>
                  </div>
                </div>

                {/* 5 Cards of the Math Guide */}
                <div className="space-y-5">
                  {/* 1. Comment aborder le sujet */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-sky-900/60 text-sky-300 font-bold text-xs flex items-center justify-center border border-sky-700 shrink-0">
                        1
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">Comment aborder ce sujet (Démarche Intellectuelle & Réflexes)</h4>
                        <p className="text-[11px] text-slate-400">Analyse de l'énoncé, ensemble de validité et identification du cadre</p>
                      </div>
                    </div>
                    <div className="p-5 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
                      <p>
                        <strong>Démarche recommandée :</strong> Avant de vous lancer dans les calculs, lisez l'intégralité de l'énoncé. Identifiez les objets mathématiques (nombres, suites, fonctions, vecteurs, figures géométriques) et déterminez l'ensemble de référence (<span className="text-sky-300 font-mono">ℝ, ℂ, ℕ, ℤ</span>).
                      </p>
                      <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                        <strong className="text-amber-400 block text-xs">Point de vigilance initial :</strong>
                        <p className="text-slate-300 text-xs">
                          Toujours poser les conditions d'existence (dénominateur non nul, quantité sous la racine positive ou nulle, argument du logarithme strictement positif) avant toute transformation algébrique.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Formules et Théorèmes Clés */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-900/60 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-700 shrink-0">
                        2
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">Formules de Cours & Théorèmes Clés Indispensables</h4>
                        <p className="text-[11px] text-slate-400">Les outils théoriques mobilisés pour résoudre cet exercice</p>
                      </div>
                    </div>
                    <div className="p-5 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
                      <p>
                        Pour résoudre cet exercice avec un maximum de rigueur, appliquez systématiquement les théorèmes du programme en citant explicitement leurs hypothèses avant tout calcul.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-indigo-900/40 text-xs space-y-1">
                          <span className="font-bold text-indigo-400 block">Règle de rédaction mathématique :</span>
                          <p className="text-slate-300">Toujours écrire la formule littérale avant d'effectuer l'application numérique.</p>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-indigo-900/40 text-xs space-y-1">
                          <span className="font-bold text-indigo-400 block">Connecteurs déductifs :</span>
                          <p className="text-slate-300">Enchaîner vos lignes avec « Soit », « On sait que », « Or », « D'où », « Par conséquent ».</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Démonstrations et Calculs Détaillés Pas à Pas */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-900/60 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-700 shrink-0">
                          3
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">Résolution Détaillée Pas à Pas (Sans Saut d'Étape)</h4>
                          <p className="text-[11px] text-slate-400">Toutes les questions résolues avec explications complètes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(cleanEssayText)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copier la résolution
                      </button>
                    </div>
                    <div className="p-4 sm:p-5 bg-slate-950/70 border-t border-slate-800">
                      <StructuredExamRenderer
                        rawText={fullRedactionText || cleanEssayText}
                        paperTheme="dark"
                        subjectTitle={subjectTitle}
                        onCopy={handleCopy}
                        structuredExercises={scientificExercises}
                      />
                    </div>
                  </div>

                  {/* 4. Les Pièges Classiques à Éviter */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-rose-900/60 text-rose-300 font-bold text-xs flex items-center justify-center border border-rose-700 shrink-0">
                        4
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">Les Pièges Classiques à Éviter à l'Examen</h4>
                        <p className="text-[11px] text-slate-400">Erreurs fréquentes relevées par les jurys et correcteurs</p>
                      </div>
                    </div>
                    <div className="p-5 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2.5 font-sans">
                      <ul className="list-disc list-inside space-y-1.5 text-xs text-rose-200/90 bg-rose-950/20 p-4 rounded-lg border border-rose-900/40">
                        <li><strong>Erreurs de signes dans les développements :</strong> Attention au signe négatif devant une parenthèse ou une fraction.</li>
                        <li><strong>Oubli des conditions d'existence :</strong> Résoudre une équation sans vérifier si les solutions appartiennent au domaine de validité.</li>
                        <li><strong>Confusion entre valeur exacte et valeur approchée :</strong> Conserver les valeurs exactes avec les fractions, racines, $\pi$, $e$ et $\ln$, sauf consigne explicite d'arrondi.</li>
                        <li><strong>Démonstration incomplète :</strong> Conclure sans avoir vérifié toutes les hypothèses du théorème appliqué.</li>
                      </ul>
                    </div>
                  </div>

                  {/* 5. Méthode d'Auto-Contrôle */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-900/60 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-700 shrink-0">
                        5
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">Méthode d'Auto-Contrôle & Vérification du Résultat</h4>
                        <p className="text-[11px] text-slate-400">Comment vérifier vous-même vos résultats avant de rendre votre copie</p>
                      </div>
                    </div>
                    <div className="p-5 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
                      <p>
                        Avant de clore l'épreuve, appliquez ces 3 réflexes d'auto-contrôle :
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                          <span className="font-bold text-amber-400 block">1. Réinjection test</span>
                          <p className="text-slate-300">Réinjectez la solution trouvée dans l'équation de départ pour vous assurer de l'égalité.</p>
                        </div>
                        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                          <span className="font-bold text-amber-400 block">2. Ordre de grandeur</span>
                          <p className="text-slate-300">Vérifiez la cohérence géométrique (longueur positive, probabilité entre 0 et 1, angle aigu &lt; 90°).</p>
                        </div>
                        <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-1">
                          <span className="font-bold text-amber-400 block">3. Réponse à la consigne</span>
                          <p className="text-slate-300">Assurez-vous que le résultat final est clairement encadré avec l'unité requise le cas échéant.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* HUMANITIES TRIAD REDACTION VIEW */
              <>
                {/* View Mode Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      Affichage des paragraphes :
                    </span>
                    <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
                      <button
                        onClick={() => setParagraphViewMode('both')}
                        className={`px-2.5 py-1 rounded font-medium transition-all ${
                          paragraphViewMode === 'both'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Vue Complète (Triade + Paragraphe)
                      </button>
                      <button
                        onClick={() => setParagraphViewMode('triad')}
                        className={`px-2.5 py-1 rounded font-medium transition-all ${
                          paragraphViewMode === 'triad'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Triade Décomposée Seule
                      </button>
                      <button
                        onClick={() => setParagraphViewMode('full')}
                        className={`px-2.5 py-1 rounded font-medium transition-all ${
                          paragraphViewMode === 'full'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Texte Rédigé Seul
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'all' ? null : 'all')}
                      className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                    >
                      {expandedSection === 'all' ? 'Tout replier' : 'Tout déplier'}
                    </button>
                  </div>
                </div>

                {/* Pedagogical Banner on the Triad */}
                <div className="bg-indigo-950/30 border border-indigo-900/50 p-4 rounded-xl flex items-start gap-3 text-xs text-indigo-200">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Règle de correction officielle :</strong>
                    <span>Chaque paragraphe de développement suit impérativement le triptyque : <strong>1. Argument</strong> (Idée directrice) ➔ <strong>2. Explication</strong> (Analyse logique) ➔ <strong>3. Illustration</strong> (Nom de l'auteur, titre exact de l'œuvre et citation textuelle commentée).</span>
                  </div>
                </div>

                {/* Structured Sections */}
                <div className="space-y-5">
                  
                  {/* 1. INTRODUCTION */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div 
                      onClick={() => setExpandedSection(expandedSection === 'intro' ? null : 'intro')}
                      className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-900/60 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-700 shrink-0">
                          1
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white">INTRODUCTION (4 Phases Obligatoires)</h3>
                          <p className="text-[11px] text-slate-400">Accroche / Définition & Tension / Problématique / Annonce de plan</p>
                        </div>
                      </div>
                      {expandedSection === 'intro' || expandedSection === 'all' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {(expandedSection === 'intro' || expandedSection === 'all') && (
                      <div className="p-5 space-y-4">
                        {structured?.introduction && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                              <span className="font-bold text-indigo-400 block">① Amorce / Accroche :</span>
                              <p className="text-slate-300 leading-relaxed">{structured.introduction.amorce}</p>
                            </div>
                            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                              <span className="font-bold text-indigo-400 block">② Définition & Tension des termes :</span>
                              <p className="text-slate-300 leading-relaxed">{structured.introduction.definitionTension}</p>
                            </div>
                            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-900/50 space-y-1">
                              <span className="font-bold text-amber-400 block">③ Problématique formulée sous forme d'aporie :</span>
                              <p className="text-slate-200 font-medium leading-relaxed">{structured.introduction.problematique}</p>
                            </div>
                            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-900/50 space-y-1">
                              <span className="font-bold text-emerald-400 block">④ Annonce explicite du plan :</span>
                              <p className="text-slate-300 leading-relaxed">{structured.introduction.annoncePlan}</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Texte de l'Introduction rédigé en continu :</span>
                            <button
                              onClick={() => handleCopy(structured?.introduction?.fullText)}
                              className="text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copier
                            </button>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/70 text-slate-200 text-xs sm:text-sm leading-relaxed font-serif whitespace-pre-line">
                            {structured?.introduction?.fullText || result.stepByStepBreakdown[0]?.content || fullRedactionText}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. DÉVELOPPEMENT - PARTIE I */}
                  {structured?.development?.part1 && renderDevelopmentPart(structured.development.part1, 'part1', 2)}

                  {/* 3. DÉVELOPPEMENT - PARTIE II */}
                  {structured?.development?.part2 && renderDevelopmentPart(structured.development.part2, 'part2', 3)}

                  {/* 4. DÉVELOPPEMENT - PARTIE III */}
                  {structured?.development?.part3 && renderDevelopmentPart(structured.development.part3, 'part3', 4)}

                  {/* 5. CONCLUSION */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div 
                      onClick={() => setExpandedSection(expandedSection === 'conclusion' ? null : 'conclusion')}
                      className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-900/60 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-700 shrink-0">
                          5
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white">CONCLUSION (3 Temps Canoniques)</h3>
                          <p className="text-[11px] text-slate-400">Bilan des acquis / Réponse définitive / Élargissement de portée</p>
                        </div>
                      </div>
                      {expandedSection === 'conclusion' || expandedSection === 'all' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {(expandedSection === 'conclusion' || expandedSection === 'all') && (
                      <div className="p-5 space-y-4">
                        {structured?.conclusion && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                              <span className="font-bold text-emerald-400 block">① Bilan synthétique :</span>
                              <p className="text-slate-300 leading-relaxed">{structured.conclusion.bilanSynthese}</p>
                            </div>
                            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                              <span className="font-bold text-emerald-400 block">② Réponse définitive au sujet :</span>
                              <p className="text-slate-300 leading-relaxed">{structured.conclusion.reponseDefinitive}</p>
                            </div>
                            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                              <span className="font-bold text-emerald-400 block">③ Élargissement prospectif :</span>
                              <p className="text-slate-300 leading-relaxed">{structured.conclusion.elargissement}</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Texte de la Conclusion rédigé en continu :</span>
                            <button
                              onClick={() => handleCopy(structured?.conclusion?.fullText)}
                              className="text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copier
                            </button>
                          </div>
                          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/70 text-slate-200 text-xs sm:text-sm leading-relaxed font-serif whitespace-pre-line">
                            {structured?.conclusion?.fullText || result.stepByStepBreakdown[result.stepByStepBreakdown.length - 1]?.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================
            TAB: CITATIONS & AUTHORS INDEX / MATH THEOREMS
           ======================================================== */}
        {activeTab === 'citations_index' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Library className="w-4 h-4 text-amber-400" />
                {isMath ? "Index des Formules & Théorèmes de Cours Mobilisés" : "Index Précis des Auteurs, Œuvres et Citations Mobilisés"}
              </h3>
              <p className="text-xs text-slate-400">
                {isMath 
                  ? "Fiche mémo des théorèmes, définitions et propriétés mathématiques indispensables pour cette résolution."
                  : "Fiche mémo pour vos révisions : chaque référence est contextualisée avec son œuvre d'origine et la démonstration associée."}
              </p>
            </div>

            {isMath ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-300 font-bold text-xs flex items-center justify-center border border-sky-800">1</span>
                    <h4 className="text-sm font-bold text-white">Domaine de Définition & Conditions d'Existence</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Toujours préciser l'ensemble de validité avant d'entamer une résolution : dénominateurs non nuls, racines positives, arguments de fonctions définies.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-800">2</span>
                    <h4 className="text-sm font-bold text-white">Théorèmes & Propriétés d'Analyse / Algèbre</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Citer nommément chaque théorème appliqué (TVI, Dérivation, Intégration, Théorème de Pythagore/Thalès, Récurrence) et vérifier ses hypothèses.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-800">3</span>
                    <h4 className="text-sm font-bold text-white">Règles de Calcul & Simplifications</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Détailler chaque étape de calcul intermédiaire. Privilégier les valeurs exactes simplifiées (fractions irréductibles, racines simplifiées).
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-800">4</span>
                    <h4 className="text-sm font-bold text-white">Encadrement & Conclusion Finale</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Encadrer ou mettre en évidence chaque solution finale avec sa conclusion explicite et son interprétation géométrique ou contextuelle.
                  </p>
                </div>
              </div>
            ) : allIllustrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allIllustrations.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-indigo-800/60 transition-colors shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-800">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{item.auteur}</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 italic">
                        {item.oeuvre}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-300">Localisation :</span>
                      <span>{item.partTitle} (Sous-partie {item.subPartLetter})</span>
                    </div>

                    {item.citation && (
                      <div className="bg-slate-900/90 p-3 rounded-lg border-l-4 border-amber-500 text-xs text-amber-100 font-serif italic">
                        {item.citation}
                      </div>
                    )}

                    <div className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="font-bold text-indigo-400 block text-[11px]">Argument soutenu :</span>
                      <p>{item.argument}</p>
                    </div>

                    {item.analyseIllustration && (
                      <div className="text-xs text-emerald-300/90 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40">
                        <strong className="text-emerald-400 block text-[11px] mb-0.5">Portée doctrinale :</strong>
                        <p>{item.analyseIllustration}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
                Aucune illustration spécifique extraite. Consultez l'onglet « Rédaction » pour le texte intégral.
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: 5 ASSISTANCE LEVELS SELECTOR
           ======================================================== */}
        {activeTab === 'assistance_levels' && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Pédagogie Progressive : Choisissez le niveau d'autonomie
              </h3>
              <p className="text-xs text-slate-400">
                Ne consultez que le niveau dont vous avez besoin pour stimuler votre réflexion personnelle avant de lire la rédaction intégrale.
              </p>

              {/* 5 Levels Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {[
                  { level: 1 as AssistanceLevel, title: "1. Indice", subtitle: "Pour démarrer" },
                  { level: 2 as AssistanceLevel, title: "2. Méthode", subtitle: "Règles à appliquer" },
                  { level: 3 as AssistanceLevel, title: "3. Guidage", subtitle: "Questions pas-à-pas" },
                  { level: 4 as AssistanceLevel, title: "4. Plan Détaillé", subtitle: "Arguments & axes" },
                  { level: 5 as AssistanceLevel, title: "5. Rédaction", subtitle: "In Extenso" },
                ].map((item) => (
                  <button
                    key={item.level}
                    onClick={() => setSelectedAssistanceLevel(item.level)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedAssistanceLevel === item.level
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/30'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.title}</span>
                    <span className={`text-[10px] block ${selectedAssistanceLevel === item.level ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {item.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Level Content Output */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
              {selectedAssistanceLevel === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Lightbulb className="w-5 h-5" />
                    Niveau 1 : Indice pour démarrer
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800">
                    {result.level1Hint || "Prenez le temps d'identifier les deux significations opposées de l'énoncé. Quelle est la première évidence et pourquoi pose-t-elle problème ?"}
                  </p>
                </div>
              )}

              {selectedAssistanceLevel === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Compass className="w-5 h-5" />
                    Niveau 2 : Méthodologie du Référentiel
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800 whitespace-pre-line">
                    {result.level2Methodology || result.fasciculeMethodologyActivated.description}
                  </p>
                </div>
              )}

              {selectedAssistanceLevel === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <ListOrdered className="w-5 h-5" />
                    Niveau 3 : Guidage Pas-à-Pas
                  </div>
                  <div className="space-y-2">
                    {(result.level3GuidanceSteps || []).map((step, idx) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAssistanceLevel === 4 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <FileText className="w-5 h-5" />
                    Niveau 4 : Plan Détaillé Structuré en Triades
                  </div>
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-line">
                    {result.level4DetailedOutline || structured?.planSummary || "Plan en 3 axes avec sous-parties rédigées."}
                  </div>
                </div>
              )}

              {selectedAssistanceLevel === 5 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                      <GraduationCap className="w-5 h-5" />
                      Niveau 5 : Rédaction Intégrale In Extenso
                    </div>
                    <button
                      onClick={() => handleCopy()}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                  <div className="p-6 bg-slate-900/70 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-serif whitespace-pre-line">
                    {fullRedactionText}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: STEP-BY-STEP BREAKDOWN
           ======================================================== */}
        {activeTab === 'step_by_step' && (
          <div className="space-y-4">
            {result.stepByStepBreakdown.map((step, index) => (
              <div 
                key={index}
                className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/40">
                      {step.stepNumber}
                    </span>
                    <h3 className="text-sm font-bold text-white">{step.stepTitle}</h3>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {step.sourceTags.map((tag, tagIdx) => {
                      const isMethod = tag.toLowerCase().includes('méthode') || tag.toLowerCase().includes('regle');
                      const isFascicule = tag.toLowerCase().includes('fascicule');
                      return (
                        <span
                          key={tagIdx}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            isMethod
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-700/60'
                              : isFascicule
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                          }`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-indigo-300 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-900/50 flex items-start gap-2">
                  <span className="font-bold text-indigo-400 whitespace-nowrap">Règle du référentiel :</span>
                  <span>{step.methodologyRuleApplied}</span>
                </div>

                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800/60">
                  {step.content}
                </div>

                {step.pedagogicalTip && (
                  <div className="text-xs text-amber-300/90 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/30 flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">Conseil pour l'élève : </span>
                      <span>{step.pedagogicalTip}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ========================================================
            TAB 4: FOUR PILLARS TRACEABILITY
           ======================================================== */}
        {activeTab === 'four_pillars' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pilier 1 : Méthodologies du Référentiel */}
            <div className="bg-slate-950 border border-indigo-900/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                1. Méthodologies du Référentiel Mobilisées
              </div>
              <p className="text-xs text-slate-400">
                Les structures logiques et démarches imposées par le référentiel de référence :
              </p>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.sourceDecomposition.fasciculeMethodologies.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-800/40">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pilier 2 : Connaissances du Référentiel */}
            <div className="bg-slate-950 border border-cyan-900/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                2. Connaissances du Référentiel Utilisées
              </div>
              <p className="text-xs text-slate-400">
                Notions, définitions et repères directement issus du document de cours :
              </p>
              {result.sourceDecomposition.fasciculeKnowledgeUsed.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-200">
                  {result.sourceDecomposition.fasciculeKnowledgeUsed.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/40">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-lg border border-slate-800 italic">
                  Aucune connaissance factuelle brute n'a été réutilisée car le sujet porte sur un domaine inédit ; seule la méthode a été transférée.
                </div>
              )}
            </div>

            {/* Pilier 3 : Nouveau Sujet Élève */}
            <div className="bg-slate-950 border border-amber-900/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Target className="w-4 h-4" />
                3. Nouveau Sujet Fourni par l'Élève
              </div>
              <p className="text-xs text-slate-400">
                L'objet d'étude extérieur au référentiel à résoudre :
              </p>
              <div className="bg-amber-950/30 p-3.5 rounded-lg border border-amber-800/40 text-xs text-amber-100 font-medium">
                « {subjectTitle} »
              </div>
              <p className="text-[11px] text-slate-400">
                Type identifié : <strong className="text-slate-200">{result.exerciseTypeIdentified}</strong>
              </p>
            </div>

            {/* Pilier 4 : Connaissances Générales Complémentaires */}
            <div className="bg-slate-950 border border-emerald-900/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                4. Connaissances Complémentaires Nécessaires
              </div>
              <p className="text-xs text-slate-400">
                Auteurs, faits historiques, théories et exemples externes mobilisés pour alimenter la méthode :
              </p>
              <ul className="space-y-2 text-xs text-slate-200">
                {result.sourceDecomposition.externalKnowledgeMobilized.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: EVALUATION RUBRIC & AUTONOMY
           ======================================================== */}
        {activeTab === 'rubric' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Grille d'Évaluation du Référentiel & Clés d'Autonomie
              </h3>
              <p className="text-xs text-slate-400">
                Chaque critère ci-dessous est issu des exigences méthodologiques du référentiel. Utilisez-les pour vous auto-évaluer lors d'un examen réel.
              </p>
            </div>

            <div className="space-y-3">
              {result.evaluationCriteria.map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-indigo-950 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-800">
                        {idx + 1}
                      </span>
                      {item.criterion}
                    </h4>
                    {item.fasciculeOrigin && (
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                        Exigence Référentiel
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 pl-7">{item.description}</p>
                  <div className="text-xs text-emerald-300 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30 ml-7 flex items-start gap-2">
                    <span className="font-semibold text-emerald-400 whitespace-nowrap">Clé pour l'examen :</span>
                    <span>{item.tipsForAutonomy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

