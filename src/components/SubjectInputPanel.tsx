import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Camera,
  Languages,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Trash2,
  BrainCircuit,
  PenTool,
  GraduationCap
} from 'lucide-react';
import { Fascicule, AcademicSerie } from '../types';
import { detectSubjectMetadata, detectDisciplineWithAI, SubjectDetectionResult } from '../utils/subjectDetector';
import { ScientificWhiteboard } from './ScientificWhiteboard';

interface SubjectInputPanelProps {
  currentFascicule: Fascicule;
  onSubmit: (
    subject: string,
    exerciseType: string,
    mode: string,
    planStructure: string,
    disciplineLabel?: string,
    serie?: string,
    serieLabel?: string
  ) => void;
  isLoading: boolean;
  subjectInput: string;
  setSubjectInput: (val: string) => void;
}

const ACADEMIC_SERIES_OPTIONS: Array<{ id: AcademicSerie; label: string; shortLabel: string; desc: string }> = [
  { id: 'auto', label: '✨ Auto-détection (selon énoncé)', shortLabel: '✨ Auto', desc: 'Détecte automatiquement votre série et niveau scolaire' },
  { id: 'tle_a2', label: '🎓 Terminale A2 (Programme A2)', shortLabel: 'Tle A2', desc: 'Programme officiel A2 : Mayer, Moindres Carrés A2, polynômes, exp/ln A2, suites, probabilités' },
  { id: 'tle_a1', label: '🎓 Terminale A1 (Littéraire A1)', shortLabel: 'Tle A1', desc: 'Programme de mathématiques et sciences pour la série littéraire A1' },
  { id: 'tle_d', label: '🔬 Terminale D (Sciences D)', shortLabel: 'Tle D', desc: 'Programme officiel Série D : sciences expérimentales, analyse & probabilités' },
  { id: 'tle_c', label: '📐 Terminale C (Maths C)', shortLabel: 'Tle C', desc: 'Programme officiel Série C : rigueur approfondie, arithmétique & géométrie' },
  { id: 'tle_e', label: '⚙️ Terminale E / TI', shortLabel: 'Tle E/TI', desc: 'Programme officiel séries technologiques et industrielles' },
  { id: '1ere_a', label: '📚 Première A (Littéraire)', shortLabel: '1ère A', desc: 'Programme officiel de 1ère A' },
  { id: '1ere_c_d', label: '📚 Première C / D', shortLabel: '1ère C/D', desc: 'Programme officiel de 1ère C et D' },
  { id: '2nde_a', label: '📚 Seconde A', shortLabel: '2nde A', desc: 'Programme officiel de 2nde A' },
  { id: '2nde_c', label: '📚 Seconde C', shortLabel: '2nde C', desc: 'Programme officiel de 2nde C' },
  { id: '3e_bepc', label: '📝 3ᵉ / BEPC', shortLabel: '3e BEPC', desc: 'Programme officiel de 3e et méthodologie examen BEPC' },
  { id: 'college_6e_4e', label: '🏫 Collège (6ᵉ - 5ᵉ - 4ᵉ)', shortLabel: 'Collège', desc: 'Initiation et consolidation du premier cycle' },
  { id: 'superieur', label: '🏛️ Supérieur / Université', shortLabel: 'Supérieur', desc: 'Licence, CPGE, BTS, DUT, Université' },
];

interface TranslationData {
  sourceLanguageDetected: string;
  translatedText: string;
  literalTranslation?: string;
  keyVocabulary: Array<{ termSource: string; termTarget: string; categoryOrContext: string }>;
  grammaticalNotes: string[];
}

export const SubjectInputPanel: React.FC<SubjectInputPanelProps> = ({
  currentFascicule,
  onSubmit,
  isLoading,
  subjectInput,
  setSubjectInput,
}) => {
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [selectedSerieOverride, setSelectedSerieOverride] = useState<AcademicSerie>('auto');
  
  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<TranslationData | null>(null);
  const [showTranslationBox, setShowTranslationBox] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Auto-Detection (instant local pass, keyed by regex/keywords)
  const localDetection: SubjectDetectionResult = useMemo(() => {
    return detectSubjectMetadata(subjectInput);
  }, [subjectInput]);

  // Semantic AI refinement: identifies the discipline the way a human expert would (meaning,
  // not just keywords) — crucial for Maths / Physique-Chimie / SVT whichever the class level.
  const [aiConfirmedResult, setAiConfirmedResult] = useState<SubjectDetectionResult | null>(null);
  const [isAiDetecting, setIsAiDetecting] = useState(false);

  useEffect(() => {
    setAiConfirmedResult(null);
    const text = subjectInput.trim();
    if (text.length < 6) {
      setIsAiDetecting(false);
      return;
    }

    const controller = new AbortController();
    setIsAiDetecting(true);
    const timer = setTimeout(async () => {
      const aiResult = await detectDisciplineWithAI(text, controller.signal);
      if (controller.signal.aborted) return;
      setIsAiDetecting(false);
      if (aiResult) {
        setAiConfirmedResult(detectSubjectMetadata(text, aiResult.discipline));
      }
    }, 700); // debounce: wait for the user to pause typing before calling the AI

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [subjectInput]);

  // Final detection used across the panel: AI-confirmed result when available, else instant local guess.
  const detectionResult: SubjectDetectionResult = aiConfirmedResult || localDetection;

  // Active Series based on override or auto-detection
  const activeSerieInfo = useMemo(() => {
    if (selectedSerieOverride !== 'auto') {
      const match = ACADEMIC_SERIES_OPTIONS.find((s) => s.id === selectedSerieOverride);
      return {
        serie: selectedSerieOverride,
        serieLabel: match ? match.label : selectedSerieOverride,
        isCustom: true,
      };
    }
    return {
      serie: detectionResult.serie,
      serieLabel: detectionResult.serieLabel,
      isCustom: false,
    };
  }, [selectedSerieOverride, detectionResult]);

  const handleTranslate = async () => {
    if (!subjectInput.trim()) return;
    setIsTranslating(true);
    setTranslationResult(null);

    try {
      const res = await fetch('/api/translate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: subjectInput,
          sourceLang: detectionResult.discipline === 'allemand' ? 'de' : detectionResult.discipline === 'anglais' ? 'en' : detectionResult.discipline === 'espagnol' ? 'es' : 'auto',
          targetLang: 'fr'
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTranslationResult(data.data);
        setShowTranslationBox(true);
      }
    } catch (err) {
      console.error("Translation error", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectInput.trim() || isLoading) return;

    onSubmit(
      subjectInput,
      detectionResult.exerciseType,
      'comprehensive',
      '2_axes',
      detectionResult.disciplineLabel,
      activeSerieInfo.serie,
      activeSerieInfo.serieLabel
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningOCR(true);
    setOcrError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/ocr-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
            }),
          });
          const data = await res.json();
          if (data.success && data.text) {
            setSubjectInput(data.text);
          } else {
            setOcrError(data.error || "Impossible de lire le texte de l'image.");
          }
        } catch (err: any) {
          setOcrError("Erreur lors de l'analyse OCR.");
        } finally {
          setIsScanningOCR(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setOcrError("Erreur de chargement du fichier.");
      setIsScanningOCR(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm dark:shadow-xl space-y-4 transition-colors">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Text Input Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label htmlFor="subject-input-textarea" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Saisissez votre sujet, devoir ou exercice :</span>
            </label>
            
            {/* Quick Actions (OCR, Translate & Clear) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Clear button if text exists */}
              {subjectInput.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSubjectInput('')}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer"
                  title="Effacer le texte saisi"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Effacer</span>
                </button>
              )}

              {/* Translate button */}
              <button
                type="button"
                onClick={handleTranslate}
                disabled={!subjectInput.trim() || isTranslating}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition-colors disabled:opacity-50 cursor-pointer"
                title="Traduire immédiatement en français et analyser le vocabulaire clé"
              >
                {isTranslating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span>{isTranslating ? 'Traduction...' : 'Traduire en français'}</span>
              </button>

              {/* Tableau d'écriture & Clavier Scientifique */}
              <button
                type="button"
                onClick={() => setIsWhiteboardOpen(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer"
                title="Ouvrir le tableau d'écriture manuscrite et clavier scientifique (+∞, cos, sin, intégrales, vecteurs, chimie)"
              >
                <PenTool className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Tableau d'Écriture (+∞, cos...)</span>
              </button>

              {/* OCR Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanningOCR}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                title="Scanner une photo de devoir ou feuille d'exercice"
              >
                {isScanningOCR ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                )}
                <span>{isScanningOCR ? 'Scan...' : 'Scanner (Photo)'}</span>
              </button>

              <span className="text-xs text-slate-500 font-mono">
                {subjectInput.length} car.
              </span>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="subject-input-textarea"
              rows={5}
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              placeholder="Collez ou écrivez ici l'énoncé de votre devoir (Mathématiques, Physique-Chimie, SVT, Philosophie, Français, Histoire-Géo, Anglais, Allemand, Espagnol...)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Academic Series & Grade Level Selection Bar */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Niveau & Série scolaire (Adaptation stricte au programme) :</span>
              </span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Programme appliqué :</span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  {activeSerieInfo.serieLabel}
                </span>
              </div>
            </div>

            {/* Quick Series Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {ACADEMIC_SERIES_OPTIONS.map((opt) => {
                const isSelected = selectedSerieOverride === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedSerieOverride(opt.id)}
                    title={opt.desc}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white font-semibold shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {opt.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live discipline detection badge */}
          {subjectInput.trim().length >= 6 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  aiConfirmedResult
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/70 text-indigo-800 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title={detectionResult.explanation}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                Matière détectée : <strong>{detectionResult.disciplineLabel}</strong>
                {isAiDetecting && (
                  <RefreshCw className="w-3 h-3 animate-spin text-indigo-500 dark:text-indigo-400 ml-0.5" />
                )}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {detectionResult.exerciseType}
              </span>
            </div>
          )}

          {ocrError && (
            <p className="text-xs text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
              {ocrError}
            </p>
          )}

          {/* Instant Translation Box */}
          {translationResult && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Traduction Française & Lexique Utile ({translationResult.sourceLanguageDetected})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTranslationBox(!showTranslationBox)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs cursor-pointer"
                >
                  {showTranslationBox ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showTranslationBox && (
                <div className="space-y-3 pt-1 text-sm text-slate-800 dark:text-slate-200">
                  <div className="bg-white dark:bg-slate-950/70 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">Traduction en français :</p>
                    <p className="leading-relaxed text-slate-900 dark:text-slate-100 italic">« {translationResult.translatedText} »</p>
                  </div>

                  {translationResult.keyVocabulary && translationResult.keyVocabulary.length > 0 && (
                    <div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1.5">Lexique clé (Wortschatz / Vocabulaire) :</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {translationResult.keyVocabulary.map((v, i) => (
                          <div key={i} className="bg-white dark:bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between shadow-xs">
                            <span className="font-semibold text-amber-700 dark:text-amber-300">{v.termSource}</span>
                            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1"><ArrowRight className="w-3 h-3 text-slate-400" /> {v.termTarget}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {translationResult.grammaticalNotes && translationResult.grammaticalNotes.length > 0 && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                      <p className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" /> Remarques grammaticales pour la rédaction :</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                        {translationResult.grammaticalNotes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={!subjectInput.trim() || isLoading}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Résolution & Rédaction en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Traiter et Rédiger la Copie Intégrale</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Scientific Handwriting & Formula Whiteboard Modal */}
      <ScientificWhiteboard
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        onInsertText={(textToInsert) => {
          setSubjectInput((prev) => (prev ? prev + ' ' + textToInsert : textToInsert));
        }}
      />
    </div>
  );
};
