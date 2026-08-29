import { AcademicSerie } from '../types';

/**
 * Liste unique des séries/profils académiques (Côte d'Ivoire), partagée entre
 * SubjectInputPanel (résolution d'exercice) et HomeworkGraderView (correction
 * de devoir), afin que les deux fonctionnalités adaptent identiquement leurs
 * méthodes au niveau réel de l'élève (ex: ne jamais appliquer une méthode de
 * Terminale C à une copie de 6e ou de Terminale A2).
 */
export const ACADEMIC_SERIES_OPTIONS: Array<{
  id: AcademicSerie;
  label: string;
  shortLabel: string;
  desc: string;
}> = [
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
