
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Search, ClipboardList, AlertCircle } from 'lucide-react';
import { LabResult } from '../types';

interface LabInputProps {
  title: string;
  results: LabResult[];
  setResults: (results: LabResult[]) => void;
}

const COMMON_LAB_PARAMETERS = [
  // Blood
  "Hemoglobin", "Leukocytes (WBC)", "Platelets", "Hematocrit", "Erythrocytes (RBC)",
  "MCV", "MCH", "MCHC", "RDW", "Neutrophils", "Lymphocytes", "Monocytes", "Eosinophils", "Basophils",
  "Glucose (Fast)", "Glucose (PP)", "HbA1c", "Creatinine", "Urea (BUN)", "Uric Acid",
  "Cholesterol (Total)", "HDL Cholesterol", "LDL Cholesterol", "Triglycerides",
  "ALT (SGPT)", "AST (SGOT)", "Albumin", "Total Protein", "Bilirubin (Total)",
  "Sodium (Na)", "Potassium (K)", "Chloride (Cl)", "Calcium (Ca)",
  "TSH", "FT4", "C-Reactive Protein (CRP)",
  // Urine
  "Urine Color", "Urine Clarity", "Urine pH", "Specific Gravity", "Protein (Urine)", 
  "Glucose (Urine)", "Ketones (Urine)", "Bilirubin (Urine)", "Urobilinogen", 
  "Nitrite", "Leukocyte Esterase", "Blood (Urine)", "Urine Sediment", "RBC (Urine)", "WBC (Urine)",
  // Sputum
  "Sputum Color", "Sputum Consistency", "AFB (Acid-Fast Bacilli)", "Gram Stain", 
  "Sputum Culture", "Sensitivity", "KOH Prep", "Sputum Cytology"
];

const STANDARD_LAB_SETS: Record<string, LabResult[]> = {
  "Blood": [
    { parameter: 'Hemoglobin', value: '', unit: 'g/dL', referenceRange: '13.5-17.5' },
    { parameter: 'Leukocytes (WBC)', value: '', unit: '10^3/uL', referenceRange: '4.5-11.0' },
    { parameter: 'Platelets', value: '', unit: '10^3/uL', referenceRange: '150-450' },
    { parameter: 'Hematocrit', value: '', unit: '%', referenceRange: '41-50' }
  ],
  "Urine": [
    { parameter: 'Specific Gravity', value: '', unit: '-', referenceRange: '1.005-1.030' },
    { parameter: 'Urine pH', value: '', unit: '-', referenceRange: '4.5-8.0' },
    { parameter: 'Protein (Urine)', value: '', unit: '-', referenceRange: 'Negative' },
    { parameter: 'Glucose (Urine)', value: '', unit: '-', referenceRange: 'Negative' },
    { parameter: 'Nitrite', value: '', unit: '-', referenceRange: 'Negative' }
  ],
  "Sputum": [
    { parameter: 'AFB (Acid-Fast Bacilli)', value: '', unit: '-', referenceRange: 'Negative' },
    { parameter: 'Gram Stain', value: '', unit: '-', referenceRange: '-' },
    { parameter: 'Sputum Color', value: '', unit: '-', referenceRange: 'Clear/White' },
    { parameter: 'Sputum Consistency', value: '', unit: '-', referenceRange: 'Mucoid' }
  ]
};

const LabInput: React.FC<LabInputProps> = ({ title, results, setResults }) => {
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addRow = () => {
    setResults([...results, { parameter: '', value: '', unit: '', referenceRange: '' }]);
  };

  const removeRow = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const loadTemplate = () => {
    const key = Object.keys(STANDARD_LAB_SETS).find(k => title.toLowerCase().includes(k.toLowerCase()));
    if (key && STANDARD_LAB_SETS[key]) {
      const isEmpty = results.length === 0 || (results.length === 1 && !results[0].parameter);
      if (isEmpty) {
        setResults([...STANDARD_LAB_SETS[key]]);
      } else {
        setResults([...results, ...STANDARD_LAB_SETS[key]]);
      }
    }
  };

  const validateValue = (val: string) => {
    if (!val) return true;
    // Allow numbers, decimals, Negative, Positive, Clear, Cloudy, and categorical signs like +, ++
    const numericOrCategorical = /^-?\d*\.?\d*$|^Negative$|^Positive$|^Clear$|^Cloudy$|^\+*$/i;
    return numericOrCategorical.test(val);
  };

  const validateUnit = (val: string) => {
    if (!val) return true;
    // Standard units allow letters, numbers, %, /, ^, -, ., and spaces
    const unitRegex = /^[a-zA-Z0-9%\/\^\-\.\s]*$/;
    return unitRegex.test(val);
  };

  const updateRow = (index: number, field: keyof LabResult, val: string) => {
    const newResults = [...results];
    newResults[index][field] = val;
    setResults(newResults);

    if (field === 'parameter') {
      const filtered = COMMON_LAB_PARAMETERS.filter(p => 
        p.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setActiveSuggestionIndex(index);
      setShowSuggestions(val.length > 0 && filtered.length > 0);
    }
  };

  const selectSuggestion = (index: number, suggestion: string) => {
    updateRow(index, 'parameter', suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
           <h3 className="text-lg font-bold text-slate-800">{title}</h3>
           <div className="h-4 w-[1px] bg-slate-200"></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{results.length} markers</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={loadTemplate}
            title="Load standard template"
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <ClipboardList size={14} />
            Template
          </button>
          <button 
            type="button"
            onClick={addRow}
            className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto min-h-[150px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="pb-3 pr-2 font-black text-[10px] uppercase tracking-widest">Parameter</th>
              <th className="pb-3 pr-2 font-black text-[10px] uppercase tracking-widest">Value</th>
              <th className="pb-3 pr-2 font-black text-[10px] uppercase tracking-widest">Unit</th>
              <th className="pb-3 pr-2 font-black text-[10px] uppercase tracking-widest">Ref. Range</th>
              <th className="pb-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {results.map((row, idx) => {
              const valueValid = validateValue(row.value);
              const unitValid = validateUnit(row.unit);

              return (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 pr-2 relative min-w-[180px]">
                    <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2 border border-transparent focus-within:border-teal-500/30 focus-within:bg-white transition-all">
                      <Search size={12} className="text-slate-300 mr-2" />
                      <input
                        className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-xs font-bold text-slate-700"
                        placeholder="Search parameter..."
                        value={row.parameter}
                        onFocus={() => {
                          if (row.parameter) {
                            const filtered = COMMON_LAB_PARAMETERS.filter(p => 
                              p.toLowerCase().includes(row.parameter.toLowerCase())
                            );
                            setFilteredSuggestions(filtered);
                            setActiveSuggestionIndex(idx);
                            setShowSuggestions(filtered.length > 0);
                          }
                        }}
                        onChange={(e) => updateRow(idx, 'parameter', e.target.value)}
                      />
                    </div>
                    {showSuggestions && activeSuggestionIndex === idx && (
                      <div 
                        ref={dropdownRef}
                        className="absolute z-50 left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden custom-scrollbar ring-4 ring-slate-900/5 animate-fade-in"
                      >
                        {filteredSuggestions.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-tight hover:bg-teal-50 text-slate-600 border-b border-slate-50 last:border-0 hover:text-teal-600 transition-colors"
                            onClick={() => selectSuggestion(idx, suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-2 relative">
                    <div className="relative">
                      <input
                        className={`w-full bg-slate-50 border rounded-lg px-3 py-2 focus:ring-2 transition-all text-xs font-bold text-slate-700 outline-none ${
                          valueValid 
                            ? 'border-transparent focus:ring-teal-500/20 focus:border-teal-500/50 focus:bg-white' 
                            : 'border-rose-300 bg-rose-50/50 focus:ring-rose-500/20 focus:border-rose-500 text-rose-700'
                        }`}
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) => updateRow(idx, 'value', e.target.value)}
                      />
                      {!valueValid && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-500" title="Invalid clinical value format">
                          <AlertCircle size={12} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pr-2 relative">
                    <div className="relative">
                      <input
                        className={`w-full bg-slate-50 border rounded-lg px-3 py-2 focus:ring-2 transition-all text-xs text-slate-500 outline-none ${
                          unitValid 
                            ? 'border-transparent focus:ring-teal-500/20 focus:border-teal-500/50 focus:bg-white' 
                            : 'border-rose-300 bg-rose-50/50 focus:ring-rose-500/20 focus:border-rose-500 text-rose-700'
                        }`}
                        placeholder="Unit"
                        value={row.unit}
                        onChange={(e) => updateRow(idx, 'unit', e.target.value)}
                      />
                      {!unitValid && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-500" title="Invalid unit characters">
                          <AlertCircle size={12} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      className="w-full bg-slate-50 border border-transparent rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/50 focus:bg-white transition-all text-xs text-slate-400"
                      placeholder="Range"
                      value={row.referenceRange}
                      onChange={(e) => updateRow(idx, 'referenceRange', e.target.value)}
                    />
                  </td>
                  <td className="py-2 text-right">
                    <button 
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                   <div className="flex flex-col items-center gap-2">
                      <ClipboardList size={24} className="opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No data points added</p>
                      <button onClick={loadTemplate} className="text-blue-500 hover:underline text-[10px] font-bold">Load {title} Template</button>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabInput;
