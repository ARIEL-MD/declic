import React, { useState, useRef } from 'react';
import { 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Send, 
  GraduationCap, 
  BookOpen, 
  Camera, 
  Sparkles,
  TrendingUp,
  XCircle,
  HelpCircle,
  Check,
  Trash2,
  PenTool
} from 'lucide-react';
import { StudentCorrectionResult, Fascicule } from '../types';
import { ScientificWhiteboard } from './ScientificWhiteboard';

interface HomeworkGraderViewProps {
  currentFascicule: Fascicule;
  currentSubject: string;
}

export const HomeworkGraderView: React.FC<HomeworkGraderViewProps> = ({
  currentFascicule,
  currentSubject,
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StudentCorrectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const disciplineLabel = currentFascicule.disciplineLabel || "";
  const isScientificDiscipline = /math[ée]matiques?|physique|chimie|svt/i.test(disciplineLabel);
  const isLanguageDiscipline = /anglais|allemand|espagnol/i.test(disciplineLabel);

  const defaultExerciseType = isScientificDiscipline
    ? "Résolution d'exercice"
    : isLanguageDiscipline
    ? "Épreuve de langue"
    : "Dissertation";

  // Ordre fixe correspondant aux 7 clés de criteriaScores renvoyées par l'API
  // (comprehension, methodology, problematique, organisationPlan, argumentation, exemplesReferences, redactionStyle),
  // mais avec un intitulé adapté au sens réel du critère pour la discipline détectée.
  const criteriaLabels: { title: string }[] = isScientificDiscipline
    ? [
        { title: 'Compréhension de l’Énoncé' },
        { title: 'Respect de la Méthode / Formules' },
        { title: 'Identification des Questions' },
        { title: 'Organisation de la Résolution' },
        { title: 'Rigueur des Calculs' },
        { title: 'Justesse des Résultats & Unités' },
        { title: 'Présentation & Clarté' },
      ]
    : isLanguageDiscipline
    ? [
        { title: 'Compréhension de la Consigne' },
        { title: 'Respect du Format Attendu' },
        { title: 'Pertinence des Réponses' },
        { title: 'Organisation de la Production' },
        { title: 'Richesse des Idées' },
        { title: 'Grammaire & Vocabulaire' },
        { title: 'Style dans la Langue Cible' },
      ]
    : [
        { title: 'Compréhension du Sujet' },
        { title: 'Respect de la Méthode du Référentiel' },
        { title: 'Problématique & Questionnement' },
        { title: 'Organisation & Plan' },
        { title: 'Argumentation & Rigueur' },
        { title: 'Exemples & Références d’Auteurs' },
        { title: 'Rédaction, Style & Vocabulaire' },
      ];

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/correct-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectTopic: currentSubject || "Sujet de dissertation/commentaire",
          discipline: currentFascicule.disciplineLabel,
          studentSubmission: submissionText,
          exerciseType: defaultExerciseType,
          fasciculeRules: currentFascicule.methodologyOverview,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error || "Impossible d'évaluer la copie.");
      }
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion au serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningOCR(true);
    setError(null);

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
            setSubmissionText((prev) => prev ? prev + "\n\n" + data.text : data.text);
          } else {
            setError(data.error || "Impossible de transcrire la copie.");
          }
        } catch (err: any) {
          setError("Erreur lors de l'OCR de la copie.");
        } finally {
          setIsScanningOCR(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError("Erreur de chargement du fichier.");
      setIsScanningOCR(false);
    }
  };

  return (
    <div id="homework-grader-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Correcteur & Grille d'Évaluation sur 20
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Soumettez votre rédaction ou brouillon pour obtenir une notation détaillée sur 7 critères et des conseils de progression.
          </p>
        </div>

        {/* OCR Trigger */}
        <div className="flex items-center gap-2">
          {/* Tableau d'écriture & Clavier Scientifique */}
          <button
            type="button"
            onClick={() => setIsWhiteboardOpen(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-xs transition-colors cursor-pointer"
            title="Ouvrir le tableau d'écriture manuscrite et clavier scientifique (+∞, cos, sin, formules)"
          >
            <PenTool className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Tableau d'Écriture (+∞, cos...)</span>
          </button>

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
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-indigo-900/60 shadow-xs transition-colors"
          >
            {isScanningOCR ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>{isScanningOCR ? 'Scan en cours...' : 'Scanner ma copie (Photo)'}</span>
          </button>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGrade} className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-300">
            <span>Votre Brouillon, Introduction ou Devoir Complet :</span>
            <div className="flex items-center gap-2">
              {submissionText.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSubmissionText('')}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  <span>Effacer</span>
                </button>
              )}
              <span className="text-slate-500 text-[11px] font-mono">{submissionText.length} caractères</span>
            </div>
          </div>
          <textarea
            rows={5}
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Collez ici votre introduction, vos parties rédigées ou le devoir complet..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y leading-relaxed"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-800 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!submissionText.trim() || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Correction et calcul de la note...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Évaluer ma copie sur 20</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results View */}
      {result && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-6">
          {/* Note: result.isFallback stays available on the payload for logs/analytics, but is
              intentionally never surfaced in the UI — same continuity principle as ChatGPT
              silently downgrading to a lighter model instead of showing an outage banner. */}
          {/* Global Score Banner */}
          <div className="bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Note Globale Estimée</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                  {result.globalScore.toFixed(1)}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-lg font-semibold">/ 20</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic">« {result.appreciation} »</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3.5 rounded-xl max-w-sm">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Pour gagner +2 à +3 points :
              </span>
              <p className="text-xs text-amber-900 dark:text-amber-200/90 mt-1">
                {result.targetAdvice}
              </p>
            </div>
          </div>

          {/* 7 Academic Criteria Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              Détail des 7 Critères Académiques :
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {criteriaLabels.map((label, idx) => ({
                title: label.title,
                item: [
                  result.criteriaScores.comprehension,
                  result.criteriaScores.methodology,
                  result.criteriaScores.problematique,
                  result.criteriaScores.organisationPlan,
                  result.criteriaScores.argumentation,
                  result.criteriaScores.exemplesReferences,
                  result.criteriaScores.redactionStyle,
                ][idx],
              })).map((crit, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{crit.title}</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      crit.item.score >= 14 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                        : crit.item.score >= 10 
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}>
                      {crit.item.score.toFixed(1)} / 20
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{crit.item.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Points Forts */}
            <div className="bg-emerald-50/60 dark:bg-slate-950 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" />
                Ce qui est réussi (Points Forts) :
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {result.whatIsSuccessful.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Points à Améliorer */}
            <div className="bg-amber-50/60 dark:bg-slate-950 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                Points à Améliorer :
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {result.toImprove.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">!</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Remedial Advice */}
          {result.remedialTips && result.remedialTips.length > 0 && (
            <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Conseils Pratiques de Remédiation :
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200">
                {result.remedialTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Scientific Handwriting & Formula Whiteboard Modal */}
      <ScientificWhiteboard
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        onInsertText={(textToInsert) => {
          setSubmissionText((prev) => (prev ? prev + '\n' + textToInsert : textToInsert));
        }}
      />
    </div>
  );
};
