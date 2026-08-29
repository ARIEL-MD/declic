import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Sparkles, 
  Check, 
  X, 
  Calculator, 
  Atom, 
  Maximize2, 
  Minimize2,
  HelpCircle
} from 'lucide-react';

interface ScientificWhiteboardProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string) => void;
  isDark?: boolean;
}

export const ScientificWhiteboard: React.FC<ScientificWhiteboardProps> = ({
  isOpen,
  onClose,
  onInsertText,
  isDark = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [activePaletteCategory, setActivePaletteCategory] = useState<'math' | 'physique' | 'chimie' | 'symboles'>('math');

  // Initialize canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initial background
    ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw subtle grid / squared notebook lines
    ctx.strokeStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    setHasDrawn(false);
    setRecognizedText('');
    setRecognitionError(null);
  }, [isOpen, isDark]);

  if (!isOpen) return null;

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const coords = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 4 : strokeWidth;
    ctx.strokeStyle = tool === 'eraser' 
      ? (isDark ? '#090d16' : '#ffffff') 
      : (isDark ? '#38bdf8' : '#1e3a8a');
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Redraw grid
    ctx.strokeStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    setHasDrawn(false);
    setRecognizedText('');
    setRecognitionError(null);
  };

  const handleRecognize = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    setIsRecognizing(true);
    setRecognitionError(null);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const res = await fetch('/api/ocr-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mimeType: 'image/jpeg',
          isHandwrittenScience: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        setRecognizedText(data.text.trim());
      } else {
        setRecognitionError(data.error || "Impossible d'interpréter le tracé manuscrit.");
      }
    } catch (err: any) {
      setRecognitionError("Erreur de communication lors de la reconnaissance.");
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleInsertDirectSymbol = (symbol: string) => {
    onInsertText(symbol);
  };

  const handleConfirmInsertion = () => {
    if (recognizedText) {
      onInsertText(recognizedText);
      onClose();
    }
  };

  // Curated lists of scientific keyboard formulas & symbols
  const mathSymbols = [
    { label: '+∞', val: '+∞', desc: 'Plus l\'infini' },
    { label: '-∞', val: '-∞', desc: 'Moins l\'infini' },
    { label: 'cos(x)', val: 'cos(x)', desc: 'Cosinus' },
    { label: 'sin(x)', val: 'sin(x)', desc: 'Sinus' },
    { label: 'tan(x)', val: 'tan(x)', desc: 'Tangente' },
    { label: 'ln(x)', val: 'ln(x)', desc: 'Logarithme népérien' },
    { label: 'eˣ', val: 'e^(x)', desc: 'Exponentielle' },
    { label: '√x', val: '√(x)', desc: 'Racine carrée' },
    { label: 'x²', val: 'x²', desc: 'Carré' },
    { label: 'xⁿ', val: 'x^(n)', desc: 'Puissance' },
    { label: 'lim(x→+∞)', val: 'lim(x ➔ +∞) ', desc: 'Limite' },
    { label: '∫ f(x)dx', val: '∫ f(x) dx', desc: 'Intégrale' },
    { label: '∑', val: '∑', desc: 'Somme' },
    { label: '⃗AB', val: '⃗AB', desc: 'Vecteur' },
    { label: 'f\'(x)', val: "f'(x)", desc: 'Dérivée' },
    { label: 'π', val: 'π', desc: 'Pi' },
    { label: 'θ', val: 'θ', desc: 'Thêta' },
    { label: 'α', val: 'α', desc: 'Alpha' },
    { label: 'β', val: 'β', desc: 'Bêta' },
    { label: 'Δ', val: 'Δ', desc: 'Delta / Discriminant' },
    { label: '∈', val: '∈', desc: 'Appartient à' },
    { label: '∉', val: '∉', desc: 'N\'appartient pas à' },
    { label: '⊂', val: '⊂', desc: 'Inclus dans' },
    { label: '∩', val: '∩', desc: 'Intersection' },
    { label: '∪', val: '∪', desc: 'Union' },
    { label: 'ℝ', val: 'ℝ', desc: 'Ensemble des réels' },
    { label: 'ℕ', val: 'ℕ', desc: 'Entiers naturels' },
    { label: 'ℤ', val: 'ℤ', desc: 'Entiers relatifs' },
    { label: 'ℂ', val: 'ℂ', desc: 'Nombres complexes' },
    { label: '≤', val: '≤', desc: 'Inférieur ou égal' },
    { label: '≥', val: '≥', desc: 'Supérieur ou égal' },
    { label: '≠', val: '≠', desc: 'Différent de' },
    { label: '≈', val: '≈', desc: 'Environ égal' },
    { label: 'mes(AB̂C)', val: 'mes(AB̂C)', desc: 'Mesure d\'angle' },
  ];

  const physiqueSymbols = [
    { label: 'P = m×g', val: 'P = m × g', desc: 'Poids' },
    { label: 'U = R×I', val: 'U = R × I', desc: 'Loi d\'Ohm' },
    { label: 'Ec = ½mv²', val: 'Ec = (1/2) × m × v²', desc: 'Énergie cinétique' },
    { label: 'E = m×c²', val: 'E = m × c²', desc: 'Énergie de masse' },
    { label: 'v = d/t', val: 'v = d / t', desc: 'Vitesse moyenne' },
    { label: 'ρ = m/V', val: 'ρ = m / V', desc: 'Masse volumique' },
    { label: 'λ', val: 'λ', desc: 'Longueur d\'onde' },
    { label: 'ν (nu)', val: 'ν', desc: 'Fréquence' },
    { label: 'ω', val: 'ω', desc: 'Pulsation' },
    { label: 'τ (tau)', val: 'τ', desc: 'Constante de temps' },
    { label: 'Ω (Ohm)', val: 'Ω', desc: 'Ohm' },
    { label: 'µ (micro)', val: 'µ', desc: 'Micro' },
    { label: 'g = 9.8 N/kg', val: 'g = 10 N/kg', desc: 'Intensité de la pesanteur' },
    { label: '⃗F', val: '⃗F', desc: 'Force vectorielle' },
    { label: '⃗a', val: '⃗a', desc: 'Accélération' },
    { label: '⃗v', val: '⃗v', desc: 'Vecteur vitesse' },
  ];

  const chimieSymbols = [
    { label: 'n = m/M', val: 'n = m / M', desc: 'Quantité de matière' },
    { label: 'C = n/V', val: 'C = n / V', desc: 'Concentration molaire' },
    { label: 'pH = -log[H₃O⁺]', val: 'pH = -log[H₃O⁺]', desc: 'Formule du pH' },
    { label: 'Ka = [A⁻][H₃O⁺]/[AH]', val: 'Ka = ([A⁻][H₃O⁺]) / [AH]', desc: 'Constante d\'acidité' },
    { label: 'H₃O⁺', val: 'H₃O⁺', desc: 'Ion oxonium' },
    { label: 'HO⁻', val: 'HO⁻', desc: 'Ion hydroxyde' },
    { label: 'SO₄²⁻', val: 'SO₄²⁻', desc: 'Ion sulfate' },
    { label: 'Fe²⁺ / Fe³⁺', val: 'Fe²⁺', desc: 'Ions fer' },
    { label: 'Cu²⁺', val: 'Cu²⁺', desc: 'Ion cuivre' },
    { label: 'Cl⁻', val: 'Cl⁻', desc: 'Ion chlorure' },
    { label: '➔', val: ' ➔ ', desc: 'Flèche de réaction' },
    { label: '⇄', val: ' ⇄ ', desc: 'Équilibre chimique réversible' },
    { label: 'ΔrG°', val: 'ΔrG°', desc: 'Enthalpie libre standard' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Tableau d'Écriture Manuscrite & Clavier Scientifique</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-800">
                  Maths • Physique • Chimie
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dessinez à la main vos formules (+∞, cos, sin, intégrales, vecteurs, équations chimiques) ou cliquez sur les touches scientifiques rapides.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            title="Fermer le tableau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Quick Tab Selector for Science Categories */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActivePaletteCategory('math')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                activePaletteCategory === 'math'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Mathématiques (+∞, cos, sin, lim, ∫, ⃗u)</span>
            </button>
            <button
              onClick={() => setActivePaletteCategory('physique')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                activePaletteCategory === 'physique'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              <span>Physique (Forces, Énergie, Lois, Ω, λ)</span>
            </button>
            <button
              onClick={() => setActivePaletteCategory('chimie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                activePaletteCategory === 'chimie'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Chimie (pH, Mol, Ions, Équilibres ⇄)</span>
            </button>
          </div>

          {/* Direct Clickable Science Palettes */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center justify-between">
              <span>Insertion rapide directe dans votre devoir :</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">Cliquez sur un symbole pour l'insérer</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {activePaletteCategory === 'math' && mathSymbols.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertDirectSymbol(item.val)}
                  title={item.desc}
                  className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  {item.label}
                </button>
              ))}

              {activePaletteCategory === 'physique' && physiqueSymbols.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertDirectSymbol(item.val)}
                  title={item.desc}
                  className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  {item.label}
                </button>
              ))}

              {activePaletteCategory === 'chimie' && chimieSymbols.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertDirectSymbol(item.val)}
                  title={item.desc}
                  className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Canvas Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-indigo-500" />
                  Espace de dessin & calculs manuscrits :
                </span>
              </div>

              {/* Drawing Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTool('pen')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    tool === 'pen'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Stylo"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Stylo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTool('eraser')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    tool === 'eraser'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Gomme"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Gomme</span>
                </button>

                <button
                  type="button"
                  onClick={clearCanvas}
                  className="p-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1 transition-all cursor-pointer"
                  title="Effacer tout le tableau"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Effacer</span>
                </button>
              </div>
            </div>

            {/* Canvas Element with Touch Support */}
            <div className={`relative w-full h-64 sm:h-72 rounded-2xl border-2 overflow-hidden touch-none shadow-inner ${
              isDark ? 'border-slate-700 bg-[#090d16]' : 'border-slate-300 bg-white'
            }`}>
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />

              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 text-xs text-center p-4">
                  <PenTool className="w-8 h-8 mb-2 opacity-40 animate-bounce" />
                  <p className="font-semibold">Écrivez ici au doigt, à la souris ou au stylet :</p>
                  <p className="text-[11px] opacity-75 mt-0.5">Ex: lim (x→+∞) (cos x)/x, P = m×g, [H₃O⁺], ∫ x² dx, etc.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Handwriting Recognition Result Area */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleRecognize}
              disabled={!hasDrawn || isRecognizing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-95"
            >
              {isRecognizing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Reconnaissance IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Convertir le dessin en texte & formules</span>
                </>
              )}
            </button>

            {recognizedText && (
              <div className="flex-1 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800">
                <div className="flex-1 font-mono text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                  « {recognizedText} »
                </div>
                <button
                  type="button"
                  onClick={handleConfirmInsertion}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insérer</span>
                </button>
              </div>
            )}
          </div>

          {recognitionError && (
            <p className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
              {recognitionError}
            </p>
          )}

        </div>

        {/* Modal Footer */}
        <div className={`p-3.5 border-t flex items-center justify-between ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            💡 Reconnaissance optimisée pour toutes les notations du BEPC, BAC et Prépa (Maths, Physique, Chimie, SVT).
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
