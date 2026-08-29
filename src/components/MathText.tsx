import React from 'react';

/**
 * MathText — rendu visuel léger des expressions mathématiques dans du texte
 * généré par l'IA, SANS dépendance externe (pas de KaTeX/MathJax à installer).
 *
 * Problème résolu : sans ce composant, une fraction comme \frac{3}{4} ou 3/4
 * s'affichait platement sur une seule ligne ("3/4"), ce qui peut perdre un
 * jeune élève (confusion avec une division, une date, un simple slash...).
 * Ici, on affiche une vraie fraction empilée : numérateur au-dessus d'une
 * barre horizontale, dénominateur en dessous — comme au tableau.
 *
 * Formats reconnus dans le texte de l'IA :
 * - \frac{a}{b}                → fraction empilée
 * - \sqrt{a}                   → racine carrée avec le radical visuel
 * - a^{n} ou a^n (exposant)    → exposant en position haute (ex: x², x^{10})
 * - a_{n} ou a_n (indice)      → indice en position basse (ex: u_n, x_1)
 *
 * Les systemInstruction des routes IA (server.ts) demandent explicitement à
 * l'IA d'utiliser la notation \frac{a}{b} pour toute fraction, afin que ce
 * composant puisse la détecter de façon fiable. Un repli simple "a/b" (deux
 * nombres courts séparés par un slash) est aussi géré au cas où l'IA ne
 * suit pas la consigne à la lettre.
 */

type Token =
  | { type: 'text'; value: string }
  | { type: 'frac'; num: string; den: string }
  | { type: 'sqrt'; content: string }
  | { type: 'sup'; base: string; exp: string }
  | { type: 'sub'; base: string; sub: string };

// Extrait un groupe {...} bien parenthésé à partir de l'index donné
// (gère les accolades imbriquées, ex: \frac{x^{2}}{3}).
function extractBraceGroup(str: string, startIndex: number): { content: string; endIndex: number } | null {
  if (str[startIndex] !== '{') return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return { content: str.slice(startIndex + 1, i), endIndex: i };
      }
    }
  }
  return null;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let buffer = '';

  const flushBuffer = () => {
    if (buffer) {
      tokens.push({ type: 'text', value: buffer });
      buffer = '';
    }
  };

  while (i < input.length) {
    // \frac{num}{den}
    if (input.startsWith('\\frac{', i)) {
      const numGroup = extractBraceGroup(input, i + 5);
      if (numGroup) {
        const denGroup = extractBraceGroup(input, numGroup.endIndex + 1);
        if (denGroup) {
          flushBuffer();
          tokens.push({ type: 'frac', num: numGroup.content, den: denGroup.content });
          i = denGroup.endIndex + 1;
          continue;
        }
      }
    }

    // \sqrt{contenu}
    if (input.startsWith('\\sqrt{', i)) {
      const group = extractBraceGroup(input, i + 5);
      if (group) {
        flushBuffer();
        tokens.push({ type: 'sqrt', content: group.content });
        i = group.endIndex + 1;
        continue;
      }
    }

    // Exposant : base^{exp} ou base^chiffre (1 caractère simple)
    if (input[i] === '^' && buffer.length > 0) {
      const baseMatch = buffer.match(/([A-Za-z0-9\)\]])$/);
      if (baseMatch) {
        const base = baseMatch[1];
        buffer = buffer.slice(0, -1);
        if (input[i + 1] === '{') {
          const group = extractBraceGroup(input, i + 1);
          if (group) {
            flushBuffer();
            tokens.push({ type: 'sup', base, exp: group.content });
            i = group.endIndex + 1;
            continue;
          }
        } else if (/[A-Za-z0-9]/.test(input[i + 1] || '')) {
          flushBuffer();
          tokens.push({ type: 'sup', base, exp: input[i + 1] });
          i += 2;
          continue;
        }
      }
    }

    // Indice : base_{n} ou base_n
    if (input[i] === '_' && buffer.length > 0) {
      const baseMatch = buffer.match(/([A-Za-z0-9\)\]])$/);
      if (baseMatch) {
        const base = baseMatch[1];
        buffer = buffer.slice(0, -1);
        if (input[i + 1] === '{') {
          const group = extractBraceGroup(input, i + 1);
          if (group) {
            flushBuffer();
            tokens.push({ type: 'sub', base, sub: group.content });
            i = group.endIndex + 1;
            continue;
          }
        } else if (/[A-Za-z0-9]/.test(input[i + 1] || '')) {
          flushBuffer();
          tokens.push({ type: 'sub', base, sub: input[i + 1] });
          i += 2;
          continue;
        }
      }
    }

    buffer += input[i];
    i += 1;
  }

  flushBuffer();
  return tokens;
}

// Repli : détecte une fraction "simple" en texte brut du type 3/4, -7/12,
// x/2... quand l'IA n'a pas utilisé la notation \frac{a}{b}. Volontairement
// prudent : n'accepte que des expressions courtes (chiffres/lettre isolée +
// parenthèses simples) pour ne jamais casser une vraie date (ex: 12/05) ou
// une note sur 20 (ex: 14/20) qui doivent, elles, rester en ligne.
const SIMPLE_FRACTION_RE = /(?<![\d/])(-?\(?[\dA-Za-z]{1,4}\)?)\/(\(?[\dA-Za-z]{1,4}\)?)(?!\d*\/\d)/g;
const LOOKS_LIKE_DATE_OR_SCORE = (num: string, den: string) =>
  // "14/20" (note), "12/2024" (date) : dénominateur "rond" typique d'une
  // note ou d'une année → on laisse tel quel, ce n'est pas une fraction
  // mathématique à empiler visuellement.
  /^(10|20|100)$/.test(den) || den.length === 4;

function renderPlainTextWithSimpleFractions(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;
  SIMPLE_FRACTION_RE.lastIndex = 0;

  while ((match = SIMPLE_FRACTION_RE.exec(text)) !== null) {
    const [full, num, den] = match;
    if (LOOKS_LIKE_DATE_OR_SCORE(num, den)) continue;

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<Fraction key={`${keyPrefix}-sf-${idx++}`} num={num.replace(/[()]/g, '')} den={den.replace(/[()]/g, '')} />);
    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
}

const Fraction: React.FC<{ num: string; den: string }> = ({ num, den }) => (
  <span className="inline-flex flex-col items-center align-middle mx-0.5 text-[0.92em] leading-none">
    <span className="px-1 pb-0.5 border-b border-current">{num}</span>
    <span className="px-1 pt-0.5">{den}</span>
  </span>
);

const renderInline = (value: string, keyPrefix: string): React.ReactNode => {
  const withFractions = renderPlainTextWithSimpleFractions(value, keyPrefix);
  return withFractions;
};

export const MathText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  if (!text) return null;
  const tokens = tokenize(text);

  const rendered = tokens.map((token, idx) => {
    const key = `mt-${idx}`;
    switch (token.type) {
      case 'frac':
        return <Fraction key={key} num={token.num} den={token.den} />;
      case 'sqrt':
        return (
          <span key={key} className="inline-flex items-start align-middle mx-0.5">
            <span className="mr-0.5">√</span>
            <span className="border-t border-current pt-0.5">{token.content}</span>
          </span>
        );
      case 'sup':
        return (
          <React.Fragment key={key}>
            {token.base}
            <sup>{token.exp}</sup>
          </React.Fragment>
        );
      case 'sub':
        return (
          <React.Fragment key={key}>
            {token.base}
            <sub>{token.sub}</sub>
          </React.Fragment>
        );
      case 'text':
      default:
        return <React.Fragment key={key}>{renderInline(token.value, key)}</React.Fragment>;
    }
  });

  return <span className={className}>{rendered}</span>;
};

export default MathText;
