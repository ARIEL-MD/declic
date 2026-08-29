/**
 * Comprehensive Math & Science Notation Formatter
 * Formats mathematical exponents, scientific units, chemical formulas, vectors, and operators
 * to authentic academic typographic standards (superscripts, subscripts, Greek symbols, etc.).
 */

const SUPERSCRIPT_CHARS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
  'n': 'ⁿ',
  'i': 'ⁱ',
  'a': 'ᵃ',
  'b': 'ᵇ',
  'c': 'ᶜ',
  'd': 'ᵈ',
  'e': 'ᵉ',
  'f': 'ᶠ',
  'g': 'ᵍ',
  'h': 'ʰ',
  'j': 'ʲ',
  'k': 'ᵏ',
  'l': 'ˡ',
  'm': 'ᵐ',
  'o': 'ᵒ',
  'p': 'ᵖ',
  'r': 'ʳ',
  's': 'ˢ',
  't': 'ᵗ',
  'u': 'ᵘ',
  'v': 'ᵛ',
  'w': 'ʷ',
  'x': 'ˣ',
  'y': 'ʸ',
  'z': 'ᶻ',
  'A': 'ᴬ',
  'B': 'ᴮ',
  'D': 'ᴰ',
  'E': 'ᴱ',
  'G': 'ᴳ',
  'H': 'ᴴ',
  'I': 'ᴵ',
  'J': 'ᴶ',
  'K': 'ᴷ',
  'L': 'ᴸ',
  'M': 'ᴹ',
  'N': 'ᴺ',
  'O': 'ᴼ',
  'P': 'ᴾ',
  'R': 'ᴿ',
  'T': 'ᵀ',
  'U': 'ᵁ',
  'V': 'ⱽ',
  'W': 'ᵂ',
};

const SUBSCRIPT_CHARS: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  '(': '₍',
  ')': '₎',
  'a': 'ₐ',
  'e': 'ₑ',
  'h': 'ₕ',
  'i': 'ᵢ',
  'j': 'ⱼ',
  'k': 'ₖ',
  'l': 'ₗ',
  'm': 'ₘ',
  'n': 'ₙ',
  'o': 'ₒ',
  'p': 'ₚ',
  'r': 'ᵣ',
  's': 'ₛ',
  't': 'ₜ',
  'u': 'ᵤ',
  'v': 'ᵥ',
  'x': 'ₓ',
};

/**
 * Converts a string to real Unicode superscript characters
 */
export function toSuperscript(str: string): string {
  if (!str) return '';
  return str
    .split('')
    .map((ch) => SUPERSCRIPT_CHARS[ch] || ch)
    .join('');
}

/**
 * Converts a string to real Unicode subscript characters
 */
export function toSubscript(str: string): string {
  if (!str) return '';
  return str
    .split('')
    .map((ch) => SUBSCRIPT_CHARS[ch] || ch)
    .join('');
}

/**
 * Transforms any caret exponent pattern (^2, ^n, ^{n+1}, ^(2x), ^(-3)) into true math superscripts.
 */
export function formatExponents(text: string): string {
  if (!text) return '';
  let out = text;

  // 1. Explicit brace/parenthesis caret exponents: ^{2x+1}, ^(n-1), 10^{-3}, e^(-x)
  out = out.replace(/\^{([^}]+)}/g, (_, exp) => toSuperscript(exp));
  out = out.replace(/\^\(([^)]+)\)/g, (_, exp) => toSuperscript(exp));

  // 2. Simple caret exponents: ^2, ^3, ^-1, ^10, ^n, ^k, ^x, ^t, ^+, ^-
  out = out.replace(/\^([0-9a-zA-Z\+\-]+)/g, (_, exp) => toSuperscript(exp));

  // 3. Units with inverse powers: mol.L-1, m.s-2, kg.m-3, g.mol-1, J.K-1
  out = out.replace(/\b(mol|kg|g|m|km|cm|mm|s|min|h|rad|cd|A|V|W|J|N|Pa|Hz|Ω)\.([a-zA-Z]+)(-[0-9]+)\b/g, (_, u1, u2, p) => {
    return `${u1}·${u2}${toSuperscript(p)}`;
  });

  // 4. Common variable & function powers written without carets in French texts:
  // e.g. "x2", "x3", "y2", "t2", "z2", "cos2(x)", "sin2(x)", "tan2(x)", "ln2(x)"
  out = out.replace(/\b(cos|sin|tan|ln|exp|ch|sh|th)([2345])\(/gi, (_, fn, p) => {
    return `${fn}${toSuperscript(p)}(`;
  });

  out = out.replace(/([xyzXYZtuTU])([23456789])(?![0-9a-zA-Z_])/g, (_, v, p) => {
    return `${v}${toSuperscript(p)}`;
  });

  // 5. Parenthesized terms followed by digit power: (x-3)2 -> (x-3)², (2x+1)3 -> (2x+1)³
  out = out.replace(/(\)[23456789])(?![0-9a-zA-Z_])/g, (m) => {
    const digit = m.slice(1);
    return `)${toSuperscript(digit)}`;
  });

  // 6. Geometry & physics dimensions: cm2, cm3, m2, m3, km2, mm2
  out = out.replace(/\b(cm|mm|km|dm|m)([23])\b/g, (_, unit, p) => {
    return `${unit}${toSuperscript(p)}`;
  });

  return out;
}

/**
 * Normalizes chemical formulas and ionic charges:
 * H3O+ -> H₃O⁺, SO4^2- -> SO₄²⁻, Fe2+ -> Fe²⁺, Cu2+ -> Cu²⁺, etc.
 */
export function formatChemicalNotations(text: string): string {
  if (!text) return '';
  let out = text;

  // Specific common ions and formulas
  out = out.replace(/\bH3O\+/g, 'H₃O⁺');
  out = out.replace(/\bHO\-/g, 'HO⁻');
  out = out.replace(/\bOH\-/g, 'OH⁻');
  out = out.replace(/\bSO4\s*2\-/g, 'SO₄²⁻');
  out = out.replace(/\bSO4\s*\^?2\-/g, 'SO₄²⁻');
  out = out.replace(/\bCO3\s*2\-/g, 'CO₃²⁻');
  out = out.replace(/\bPO4\s*3\-/g, 'PO₄³⁻');
  out = out.replace(/\bNO3\-/g, 'NO₃⁻');
  out = out.replace(/\bNH4\+/g, 'NH₄⁺');
  out = out.replace(/\bFe2\+/g, 'Fe²⁺');
  out = out.replace(/\bFe3\+/g, 'Fe³⁺');
  out = out.replace(/\bCu2\+/g, 'Cu²⁺');
  out = out.replace(/\bZn2\+/g, 'Zn²⁺');
  out = out.replace(/\bAl3\+/g, 'Al³⁺');
  out = out.replace(/\bCa2\+/g, 'Ca²⁺');
  out = out.replace(/\bMg2\+/g, 'Mg²⁺');
  out = out.replace(/\bCl\-/g, 'Cl⁻');
  out = out.replace(/\bAg\+/g, 'Ag⁺');
  out = out.replace(/\bNa\+/g, 'Na⁺');
  out = out.replace(/\bK\+/g, 'K⁺');
  out = out.replace(/\bH2O\b/g, 'H₂O');
  out = out.replace(/\bCO2\b/g, 'CO₂');
  out = out.replace(/\bO2\b/g, 'O₂');
  out = out.replace(/\bN2\b/g, 'N₂');
  out = out.replace(/\bH2\b/g, 'H₂');
  out = out.replace(/\bCH4\b/g, 'CH₄');
  out = out.replace(/\bC2H6\b/g, 'C₂H₆');
  out = out.replace(/\bC2H4\b/g, 'C₂H₄');
  out = out.replace(/\bC6H12O6\b/g, 'C₆H₁₂O₆');

  // Math sequences subscripts: u_n -> uₙ, u_{n+1} -> uₙ₊₁, v_n -> vₙ
  out = out.replace(/\bu_\{([^}]+)\}/g, (_, sub) => `u${toSubscript(sub)}`);
  out = out.replace(/\bu_([0-9a-zA-Z]+)/g, (_, sub) => `u${toSubscript(sub)}`);
  out = out.replace(/\bv_\{([^}]+)\}/g, (_, sub) => `v${toSubscript(sub)}`);
  out = out.replace(/\bv_([0-9a-zA-Z]+)/g, (_, sub) => `v${toSubscript(sub)}`);

  return out;
}

/**
 * Universal math and science normalizer for text, formulas, steps, and final results.
 */
export function formatMathSymbols(str: string): string {
  if (!str) return '';
  let out = str;

  // Clean common OCR and encoding artifacts from French academic PDF copies
  out = out
    // Arrow OCR artifacts like ÞÑ, ->, =>
    .replace(/ÞÑ/g, '➔')
    .replace(/->|-->|→/g, '➔')
    // Minus sign variants & acute accents used as minus
    .replace(/´/g, ' - ')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    // Infinity OCR artifacts (like +8 or -8 in limit contexts)
    .replace(/(?:lim|limite)\s*([a-zA-Z0-9_\(\)\s➔]+)\s*=\s*[\+\-]?8\b/gi, (m) => m.replace(/8\b/, '∞'))
    .replace(/\b([xXtTuU])\s*(?:➔|->|to)\s*([\+\-]?)8\b/g, '$1 ➔ $2∞')
    // Set memberships OCR artifacts (e.g. nPN -> n ∈ ℕ, xPR -> x ∈ ℝ)
    .replace(/\b([a-zA-Z])PN\b/g, '$1 ∈ ℕ')
    .replace(/\b([a-zA-Z])PR\b/g, '$1 ∈ ℝ')
    .replace(/\b([a-zA-Z])PZ\b/g, '$1 ∈ ℤ')
    .replace(/\b([a-zA-Z])PQ\b/g, '$1 ∈ ℚ')
    .replace(/\\mathbb{N}|\\mathbf{N}\b/g, 'ℕ')
    .replace(/\\mathbb{R}|\\mathbf{R}\b/g, 'ℝ')
    .replace(/\\mathbb{Z}|\\mathbf{Z}\b/g, 'ℤ')
    .replace(/\\mathbb{C}|\\mathbf{C}\b/g, 'ℂ')
    .replace(/\\Omega\b/g, 'Ω');

  // 1. Vectors (Only format when explicitly indicated as vector to avoid breaking normal capital words)
  out = out
    .replace(/\bvecteur\s+([A-Z]{2})\b/gi, '⃗$1')
    .replace(/\bVecteur\s+([A-Z]{2})\b/g, '⃗$1')
    .replace(/\bvec\(([A-Z]{2})\)/gi, '⃗$1')
    .replace(/\\vec{([A-Z]{2})}/g, '⃗$1')
    .replace(/\\vec{([a-zA-Z]+)}/g, '⃗$1')
    .replace(/([A-Z]{2})[\u20D7\u20D0-\u20EF]/g, '⃗$1');

  // 2. Square roots
  out = out
    .replace(/\bsqrt\(([^)]+)\)/gi, '√($1)')
    .replace(/\bsqrt([0-9a-zA-Z]+)/gi, '√$1')
    .replace(/\\sqrt{([^}]+)}/g, '√($1)');

  // 3. Exponents & powers (normal mathematical superscript representation)
  out = formatExponents(out);

  // 4. Chemical formulas & ions
  out = formatChemicalNotations(out);

  // 5. Multiplications (* -> ×)
  out = out.replace(/(\b\d+|\w|\))\s*\*\s*(\b\d+|\w|\()/g, '$1 × $2');

  // 6. Inequalities & special characters
  out = out
    .replace(/[˂﹤]/g, '<')
    .replace(/[˃﹥]/g, '>')
    .replace(/<=\s*/g, '≤ ')
    .replace(/>=\s*/g, '≥ ')
    .replace(/!=\s*/g, '≠ ')
    .replace(/~=\s*/g, '≈ ')
    .replace(/mes\s*([A-Z]{3})\s*[\^̂]?/gi, 'mes($1̂)')
    .replace(/=>|->/g, '➔');

  // 7. Limits and infinities
  out = out
    .replace(/\\infty|\+inf\b|\+infini\b/gi, '+∞')
    .replace(/-inf\b|-infini\b/gi, '-∞')
    .replace(/\blim\s*_\s*{?\s*([xXtTuU])\s*(?:->|➔|\\to)\s*(\+?∞|\-?∞|[0-9a-zA-Z]+)\s*}?/gi, 'lim ($1 ➔ $2)');

  return out;
}
