import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Ruler, Info, Copy, Check, History, Save, Trash2, ArrowUpRight, Calculator, Settings2, Command } from 'lucide-react';
import TapeMeasure from './components/TapeMeasure';
import { decimalToFraction, formatFraction, FractionResult } from './utils/measurements';

interface HistoryItem {
  id: number;
  decimal: number;
  fraction: string;
  timestamp: Date;
}

type Precision = 16 | 32 | 64;

const App = () => {
  const [inputValue, setInputValue] = useState<string>("5.375");
  const [precision, setPrecision] = useState<Precision>(16);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Evaluate input (Basic Math Parser)
  const parsedValue = useMemo(() => {
    if (!inputValue.trim()) return NaN;
    try {
        // Allow basic math chars only for safety: 0-9, . + - * / ( )
        if (/[^0-9.\+\-\*\/\(\)\s]/.test(inputValue)) return NaN;
        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${inputValue}`)();
        return typeof result === 'number' && isFinite(result) ? result : NaN;
    } catch (e) {
        return NaN;
    }
  }, [inputValue]);

  const isValid = !isNaN(parsedValue) && parsedValue >= 0;
  
  // Calculate fraction details
  const fractionData = useMemo(() => {
    if (!isValid) return null;
    return decimalToFraction(parsedValue, precision);
  }, [parsedValue, isValid, precision]);

  const fractionString = fractionData ? formatFraction(fractionData) : "---";

  const handleCopy = () => {
    if (fractionString) {
      navigator.clipboard.writeText(fractionString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToHistory = () => {
    if (isValid && fractionData) {
        const newItem: HistoryItem = {
            id: Date.now(),
            decimal: parsedValue,
            fraction: formatFraction(fractionData),
            timestamp: new Date()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
    }
  };

  const handleClearHistory = () => {
      setHistory([]);
  };

  const loadFromHistory = (val: number) => {
      setInputValue(val.toString());
  };

  // Keyboard Nudging and Shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        if (isValid) {
            // Replace math expression with evaluated result for clarity, or just blur
            // setInputValue(parsedValue.toString());
            handleSaveToHistory();
        }
    }
    
    if (isValid) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const step = 1 / precision;
            setInputValue((prev) => {
                const current = parseFloat(parsedValue.toFixed(4));
                return (current + step).toFixed(4); // Keep it clean
            });
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const step = 1 / precision;
            setInputValue((prev) => {
                const current = parseFloat(parsedValue.toFixed(4));
                return Math.max(0, current - step).toFixed(4);
            });
        }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col font-sans text-neutral-200 selection:bg-lime-500/30 selection:text-lime-200">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 p-6 shadow-xl sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-lime-400 p-2 rounded-md text-neutral-950 shadow-[0_0_15px_rgba(163,230,53,0.3)]">
              <Ruler size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-mono">Precision Tape</h1>
              <p className="text-lime-400 text-xs font-mono uppercase tracking-widest">CAD Converter</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
              {/* Precision Toggle */}
              <div className="flex items-center gap-2 bg-neutral-800 p-1 rounded-lg border border-neutral-700">
                <div className="px-2 text-xs font-mono text-neutral-400 flex items-center gap-1">
                    <Settings2 size={12} /> PRECISION:
                </div>
                {[16, 32, 64].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPrecision(p as Precision)}
                        className={`px-3 py-1 text-xs font-bold font-mono rounded transition-all ${
                            precision === p 
                            ? 'bg-lime-500 text-neutral-950 shadow-sm' 
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                        }`}
                    >
                        1/{p}"
                    </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-4 text-xs font-mono text-neutral-500 border-l border-neutral-800 pl-6">
                 <span>V 2.1.0</span>
              </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 flex flex-col gap-8">
        
        {/* Top Section: Inputs & Results */}
        <div className="grid md:grid-cols-12 gap-6">
            
            {/* Input & Display (Left Side) */}
            <div className="md:col-span-8 flex flex-col gap-6">
                <div className="bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 p-8 flex flex-col gap-8 relative overflow-hidden group/panel">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity duration-500 group-hover/panel:opacity-100 opacity-50"></div>

                    <div className="flex flex-col md:flex-row gap-8 items-stretch">
                        <div className="flex-1 min-w-0">
                            <label htmlFor="decimalInput" className="flex items-center justify-between text-xs font-bold text-lime-400 mb-3 uppercase tracking-wider font-mono">
                                <span>Input Expression</span>
                                <span className="text-neutral-600 flex items-center gap-1 text-[10px] bg-neutral-800/50 px-2 py-0.5 rounded">
                                    <Calculator size={10} /> MATH ENABLED
                                </span>
                            </label>
                            <div className="relative group">
                                <input
                                    ref={inputRef}
                                    id="decimalInput"
                                    type="text"
                                    value={inputValue}
                                    onKeyDown={handleKeyDown}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full text-4xl md:text-5xl font-mono font-bold text-white bg-transparent border-b-2 border-neutral-700 focus:border-lime-400 outline-none py-3 transition-all placeholder-neutral-800"
                                    placeholder="0.00 or 1/2"
                                    autoComplete="off"
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end pointer-events-none">
                                     <span className="text-xl text-neutral-600 font-mono">IN</span>
                                     <div className="flex items-center gap-1 text-[10px] text-neutral-700 mt-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                                        <Command size={10} />
                                        <span>USE ARROWS TO NUDGE</span>
                                     </div>
                                </div>
                            </div>
                            {!isValid && inputValue.trim() !== "" && (
                                <p className="text-red-400 text-xs mt-2 font-mono">Invalid expression</p>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px bg-neutral-800 self-stretch"></div>

                        {/* Result Big Display */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <label className="text-xs font-bold text-lime-400 mb-1 uppercase tracking-wider font-mono">
                                Nearest 1/{precision}"
                            </label>
                            <div className="flex items-center justify-between">
                                <span className="text-5xl md:text-6xl font-bold text-white break-all font-mono">
                                    {fractionString}
                                </span>
                                <button 
                                onClick={handleCopy}
                                className="p-3 text-neutral-400 hover:text-lime-400 hover:bg-lime-950/30 rounded-lg transition-all border border-transparent hover:border-lime-900"
                                title="Copy Result"
                                >
                                {copied ? <Check size={24} className="text-lime-500" /> : <Copy size={24} />}
                                </button>
                            </div>
                            
                            {/* Precision Delta */}
                            {fractionData && Math.abs(fractionData.error) > (1 / (precision * 20)) && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-amber-500 bg-amber-950/20 px-3 py-1.5 rounded border border-amber-900/50 w-fit">
                                    <Info size={12} />
                                    <span className="font-mono">
                                    Diff: {fractionData.error > 0 ? '+' : '-'}{Math.abs(fractionData.error).toFixed(5)}"
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
                        <button 
                            onClick={handleSaveToHistory}
                            disabled={!isValid}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed group border border-neutral-700 hover:border-neutral-600"
                        >
                            <Save size={16} className="text-lime-500 group-hover:scale-110 transition-transform" />
                            <span>Log Measurement</span>
                        </button>
                    </div>
                </div>

                {/* Visualizer */}
                <div className="space-y-4">
                    <div className="flex items-end justify-between px-2">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-lime-500 rounded-full inline-block"></span>
                            Visual Check
                        </h2>
                        <div className="text-xs font-mono text-neutral-500 flex gap-4 opacity-70">
                        <span className="flex items-center gap-1.5">
                            <span className="block w-2 h-4 bg-neutral-800 border-l border-r border-lime-400/50"></span> 1
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="block w-2 h-3 bg-neutral-800 border-l border-r border-lime-400/50"></span> 1/2
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="block w-2 h-2 bg-neutral-800 border-l border-r border-lime-400/50"></span> 1/4
                        </span>
                         <span className="flex items-center gap-1.5">
                            <span className="block w-2 h-1.5 bg-neutral-800 border-l border-r border-lime-400/50"></span> 1/8
                        </span>
                        </div>
                    </div>
                    
                    {isValid ? (
                        <TapeMeasure value={parsedValue} precision={precision} />
                    ) : (
                        <div className="h-[200px] w-full bg-neutral-900 rounded-lg border-4 border-neutral-800 flex flex-col gap-2 items-center justify-center text-neutral-600">
                           <Ruler size={48} className="opacity-20" />
                           <p>Enter a value to visualize</p>
                        </div>
                    )}
                    <p className="text-xs text-neutral-600 font-mono text-center">
                        Tip: You can calculate in the input field. Try typing "5 + 3/8"
                    </p>
                </div>
            </div>

            {/* Sidebar (Right Side) */}
            <div className="md:col-span-4 flex flex-col gap-6">
                
                {/* History Panel */}
                <div className="bg-neutral-900 rounded-2xl shadow-xl border border-neutral-800 flex flex-col overflow-hidden max-h-[400px]">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center sticky top-0">
                        <h3 className="text-sm font-bold text-lime-400 uppercase tracking-wider flex items-center gap-2">
                            <History size={16} /> Recent Logs
                        </h3>
                        {history.length > 0 && (
                            <button onClick={handleClearHistory} className="text-neutral-500 hover:text-red-400 transition-colors p-1" title="Clear History">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="text-center py-8 text-neutral-600 text-sm italic">
                                No measurements logged yet.
                            </div>
                        ) : (
                            history.map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => loadFromHistory(item.decimal)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-neutral-800 group border border-transparent hover:border-neutral-700 transition-all flex items-center justify-between"
                                >
                                    <div>
                                        <div className="text-lime-300 font-mono font-bold text-lg">{item.fraction}</div>
                                        <div className="text-neutral-500 text-xs font-mono">{item.decimal}"</div>
                                    </div>
                                    <ArrowUpRight size={16} className="text-neutral-600 group-hover:text-lime-400 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Common Conversions Grid */}
                <div className="bg-neutral-900 rounded-2xl shadow-xl border border-neutral-800 p-4">
                    <h3 className="text-sm font-bold text-lime-400 uppercase tracking-wider mb-4 px-2">
                        Common Fractions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                        { dec: 0.125, frac: "1/8", w: "12.5%" },
                        { dec: 0.25, frac: "1/4", w: "25%" },
                        { dec: 0.375, frac: "3/8", w: "37.5%" },
                        { dec: 0.5, frac: "1/2", w: "50%" },
                        { dec: 0.625, frac: "5/8", w: "62.5%" },
                        { dec: 0.75, frac: "3/4", w: "75%" },
                        { dec: 0.875, frac: "7/8", w: "87.5%" },
                        { dec: 0.0625, frac: "1/16", w: "6.25%" },
                        ].map((item) => (
                            <