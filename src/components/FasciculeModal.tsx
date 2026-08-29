import React, { useState } from 'react';
import { X, BookOpen, Check, Edit3, Sparkles, Target, ArrowRight } from 'lucide-react';
import { Fascicule } from '../types';
import { DEFAULT_FASCICULES } from '../data/defaultFascicules';
import { DisciplineIcon } from './DisciplineIcon';

interface FasciculeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFascicule: Fascicule;
  onSelectFascicule: (fascicule: Fascicule) => void;
  customFasciculeText: string;
  setCustomFasciculeText: (text: string) => void;
}

export const FasciculeModal: React.FC<FasciculeModalProps> = ({
  isOpen,
  onClose,
  selectedFascicule,
  onSelectFascicule,
  customFasciculeText,
  setCustomFasciculeText,
}) => {
  const [tab, setTab] = useState<'preset' | 'custom'>('preset');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Bibliothèque des Référentiels Méthodologiques</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Canons académiques officiels, grilles d'évaluation et règles de rédaction (BEPC & BAC)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-4 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 text-xs font-medium bg-slate-50/50 dark:bg-transparent">
          <button
            onClick={() => setTab('preset')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              tab === 'preset'
                ? 'border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Référentiels Officiels par Discipline ({DEFAULT_FASCICULES.length})</span>
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-2 ${
              tab === 'custom'
                ? 'border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-white font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Importer mon Propre Référentiel / Cours</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700 dark:text-slate-300">
          {tab === 'preset' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_FASCICULES.map((fascicule) => {
                const isSelected = selectedFascicule.id === fascicule.id;
                return (
                  <div
                    key={fascicule.id}
                    onClick={() => {
                      onSelectFascicule(fascicule);
                    }}
                    className={`cursor-pointer rounded-xl p-4.5 border transition-all space-y-3 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
                          <DisciplineIcon discipline={fascicule.discipline} className="w-3.5 h-3.5" />
                          <span>{fascicule.disciplineLabel}</span>
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800/80">
                            <Check className="w-3.5 h-3.5" /> Référentiel Actif
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{fascicule.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{fascicule.summary}</p>
                    </div>

                    <div className="text-xs bg-white dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1.5 shadow-2xs">
                      <div className="font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Règles méthodologiques clés :</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{fascicule.methodologyOverview}</p>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{fascicule.sampleNewUntreatedSubjects.length} sujets de Bac disponibles</span>
                      </span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                      >
                        {isSelected ? '✓ Activé' : (
                          <span className="flex items-center gap-1">
                            <span>Activer</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                  <Edit3 className="w-4 h-4" />
                  Intégrer vos propres règles méthodologiques
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Collez ci-dessous le texte ou les consignes de votre propre référentiel de cours (méthode de dissertation, étapes d'analyse, grille d'évaluation spécifique).
                  L'assistant en extraira les règles pour traiter n'importe quel nouveau sujet.
                </p>
              </div>

              <textarea
                value={customFasciculeText}
                onChange={(e) => setCustomFasciculeText(e.target.value)}
                placeholder="Exemple : 
MÉTHODOLOGIE OFFICIELLE DU COURS :
1. Introduction : Accroche littéraire, Présentation de l'auteur et de l'œuvre, Problématique sous forme d'interrogation directe, Annonce du plan thématique en deux parties.
2. Développement : Plan en deux parties avec pour chaque sous-partie : Idée directrice + Citation commentée + Analyse lexicale.
3. Conclusion : Synthèse des axes sans répétition + Élargissement vers une autre œuvre du même courant."
                className="w-full h-64 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (customFasciculeText.trim()) {
                      onSelectFascicule({
                        id: 'custom-fascicule',
                        title: 'Référentiel Personnalisé de l\'Utilisateur',
                        discipline: 'Personnalisé',
                        badgeColor: 'purple',
                        summary: 'Référentiel sur mesure renseigné par l\'élève ou l\'enseignant.',
                        methodologyOverview: customFasciculeText,
                        methodologySteps: [
                          {
                            name: 'Méthodologie personnalisée',
                            description: 'Règles spécifiques extraites du texte renseigné.',
                            keyRules: ['Application stricte des consignes du référentiel personnalisé']
                          }
                        ],
                        coreKnowledgeExcerpt: 'Connaissances et exemples mentionnés dans le texte utilisateur.',
                        sampleInBookletSubjects: ['Exemples mentionnés dans le texte personnalisé'],
                        sampleNewUntreatedSubjects: [
                          'Sujet inédit au choix',
                          'Analyse d\'un cas non documenté'
                        ]
                      });
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
                >
                  Appliquer ce référentiel personnalisé
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
          <span>Référentiel actif : <strong className="text-slate-900 dark:text-white">{selectedFascicule.title}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
