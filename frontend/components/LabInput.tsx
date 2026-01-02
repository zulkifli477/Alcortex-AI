import React from 'react';
import { Plus, Trash2, ClipboardList, Database, Sparkles, Zap, RotateCcw } from 'lucide-react';
import { LabResult } from '../types';

// Kamus Referensi Klinis Master Terintegrasi (Darah, Urin, Sputum)
export const LAB_MASTER_DATA: Record<string, { unit: string; range: string }> = {
  // --- BLOOD PANEL ---
  'Hemoglobin': { unit: 'g/dL', range: '12.0 - 16.0' },
  'Hematocrit': { unit: '%', range: '36.0 - 50.0' },
  'WBC Count': { unit: 'x10^9/L', range: '4.0 - 11.0' },
  'Platelet Count': { unit: 'x10^9/L', range: '150 - 450' },
  'RBC Count': { unit: 'x10^12/L', range: '4.2 - 5.9' },
  'MCV': { unit: 'fL', range: '80 - 100' },
  'MCH': { unit: 'pg', range: '27 - 33' },
  'MCHC': { unit: 'g/dL', range: '32 - 36' },
  'Neutrophils': { unit: '%', range: '40 - 75' },
  'Lymphocytes': { unit: '%', range: '20 - 45' },
  'Monocytes': { unit: '%', range: '2 - 8' },
  'Eosinophils': { unit: '%', range: '1 - 4' },
  'Basophils': { unit: '%', range: '0 - 1' },
  'CRP': { unit: 'mg/L', range: '0.0 - 5.0' },
  'HbA1c': { unit: '%', range: '4.0 - 5.6' },
  'Blood Glucose (Random)': { unit: 'mg/dL', range: '70 - 140' },
  'Blood Glucose (Fasting)': { unit: 'mg/dL', range: '70 - 99' },
  'Creatinine': { unit: 'mg/dL', range: '0.6 - 1.2' },
  'Urea': { unit: 'mg/dL', range: '7 - 20' },
  'Uric Acid': { unit: 'mg/dL', range: '3.4 - 7.0' },
  'Sodium': { unit: 'mEq/L', range: '135 - 145' },
  'Potassium': { unit: 'mEq/L', range: '3.5 - 5.1' },
  'Chloride': { unit: 'mEq/L', range: '98 - 107' },
  'ALT (SGPT)': { unit: 'U/L', range: '7 - 56' },
  'AST (SGOT)': { unit: 'U/L', range: '10 - 40' },
  'Bilirubin Total': { unit: 'mg/dL', range: '0.1 - 1.2' },
  'Albumin': { unit: 'g/dL', range: '3.4 - 5.4' },

  // --- URINE PANEL ---
  'pH Urine': { unit: 'pH', range: '4.5 - 8.0' },
  'Specific Gravity': { unit: 'SG', range: '1.005 - 1.030' },
  'Urine Protein': { unit: 'Qual', range: 'Negative' },
  'Urine Glucose': { unit: 'Qual', range: 'Negative' },
  'Urine Ketones': { unit: 'Qual', range: 'Negative' },
  'Urine Bilirubin': { unit: 'Qual', range: 'Negative' },
  'Urine Blood': { unit: 'Qual', range: 'Negative' },
  'Urine Nitrite': { unit: 'Qual', range: 'Negative' },
  'Leukocyte Esterase': { unit: 'Qual', range: 'Negative' },
  'Urobilinogen': { unit: 'mg/dL', range: '0.2 - 1.0' },
  'Urine Color': { unit: 'Obs', range: 'Straw/Yellow' },
  'Urine Clarity': { unit: 'Obs', range: 'Clear' },

  // --- SPUTUM PANEL ---
  'Gram Stain (Sputum)': { unit: 'Qual', range: 'Normal Flora' },
  'Acid-Fast Bacilli (AFB)': { unit: 'Qual', range: 'Negative' },
  'Sputum Culture': { unit: 'Qual', range: 'No Pathogen Growth' },
  'Sputum Color': { unit: 'Obs', range: 'Clear/White' },
  'Sputum Consistency': { unit: 'Obs', range: 'Thin/Mucoid' },
  'Epithelial Cells': { unit: '/LPB', range: '< 10' },
  'Leukocytes (Sputum)': { unit: '/LPB', range: '< 25' }
};

const STANDARD_MEDICAL_UNITS = Array.from(new Set([
  ...Object.values(LAB_MASTER_DATA).map(v => v.unit).filter(u => u !== ''),
  'mmol/L', 'μmol/L', 'IU/L', 'Negative', 'Positive', 'Trace'
]));

interface LabTemplate {
  name: string;
  parameters: string[];
}

interface LabInputProps {
  title: string;
  results: LabResult[];
  setResults: (results: LabResult[]) => void;
  suggestions?: string[];
  templates?: LabTemplate[];
}

const LabInput: React.FC<LabInputProps> = ({ title, results, setResults, suggestions = [], templates = [] }) => {
  const listId = `suggestions-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const unitListId = `units-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  const addRow = () => setResults([...results, { parameter: '', value: '', unit: '-', referenceRange: '-' }]);
  
  const applyTemplate = (params: string[]) => {
    const newRows = params.map(p => {
      const ref = LAB_MASTER_DATA[p] || { unit: '-', range: '-' };
      return {
        parameter: p,
        value: '',
        unit: ref.unit,
        referenceRange: ref.range
      };
    });
    
    const existingParams = new Set(results.map(r => r.parameter.toLowerCase()));
    const uniqueNewRows = newRows.filter(r => !existingParams.has(r.parameter.toLowerCase()));
    
    // Clear initial empty row if it's the only one and is empty
    let currentResults = [...results];
    if (currentResults.length === 1 && !currentResults[0].parameter) {
      currentResults = [];
    }
    
    setResults([...currentResults, ...uniqueNewRows]);
  };

  const removeRow = (index: number) => setResults(results.filter((_, i) => i !== index));
  
  const clearAll = () => setResults([]);
  
  const updateRow = (index: number, field: keyof LabResult, val: string) => {
    const newResults = [...results];
    newResults[index][field] = val;

    // Auto-Populate Unit and Range when parameter is selected from Master Data
    if (field === 'parameter') {
      // Find a case-insensitive match in our master data keys
      const matchedKey = Object.keys(LAB_MASTER_DATA).find(
        key => key.toLowerCase() === val.toLowerCase()
      );

      if (matchedKey) {
        // Snap to original casing and fill associated metadata
        newResults[index].parameter = matchedKey;
        newResults[index].unit = LAB_MASTER_DATA[matchedKey].unit;
        newResults[index].referenceRange = LAB_MASTER_DATA[matchedKey].range;
      }
    }

    setResults(newResults);
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-10 shadow-xl space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner"><Database size={20} /></div>
           <div>
             <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
             <div className="flex items-center gap-2 mt-1">
               <Sparkles size={10} className="text-teal-500" />
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{results.length} markers synced • Neural Engine Active</p>
             </div>
           </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {templates?.map((tpl, i) => (
            <button
              key={i}
              onClick={() => applyTemplate(tpl.parameters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-[9px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95"
            >
              <Zap size={10} fill="currentColor" />
              {tpl.name}
            </button>
          ))}
          
          <div className="h-8 w-[1px] bg-slate-100 hidden md:block mx-1"></div>
          
          <button 
            onClick={addRow} 
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} /> Add Marker
          </button>

          {results.length > 0 && (
            <button 
              onClick={clearAll} 
              className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors"
              title="Clear All"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-50">
              <th className="pb-6 px-4">Parameter</th>
              <th className="pb-6 px-4">Result Value</th>
              <th className="pb-6 px-4">Unit</th>
              <th className="pb-6 px-4">Ref. Range</th>
              <th className="pb-6 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {results.map((row, idx) => (
              <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                <td className="py-4 px-2 relative">
                  <input 
                    list={listId}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="Search parameter..." 
                    value={row.parameter} 
                    onChange={e => updateRow(idx, 'parameter', e.target.value)} 
                  />
                </td>
                <td className="py-4 px-2">
                  <input 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl px-4 py-3 text-xs font-black text-blue-600 outline-none transition-all" 
                    placeholder="Value" 
                    value={row.value} 
                    onChange={e => updateRow(idx, 'value', e.target.value)} 
                  />
                </td>
                <td className="py-4 px-2">
                  <input 
                    list={unitListId}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-400 outline-none transition-all" 
                    placeholder="Unit" 
                    value={row.unit} 
                    onChange={e => updateRow(idx, 'unit', e.target.value)} 
                  />
                </td>
                <td className="py-4 px-2">
                  <input 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl px-4 py-3 text-xs font-bold text-slate-400 outline-none transition-all" 
                    placeholder="Range" 
                    value={row.referenceRange} 
                    onChange={e => updateRow(idx, 'referenceRange', e.target.value)} 
                  />
                </td>
                <td className="py-4 text-center">
                  <button 
                    onClick={() => removeRow(idx)} 
                    className="text-slate-200 hover:text-rose-500 transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px] opacity-30">
                  <ClipboardList size={40} className="mx-auto mb-4" />
                  No Data Markers in this Panel
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <datalist id={listId}>
        {Object.keys(LAB_MASTER_DATA).map((param, i) => (
          <option key={i} value={param} />
        ))}
      </datalist>

      <datalist id={unitListId}>
        {STANDARD_MEDICAL_UNITS.map((u, i) => (
          <option key={i} value={u} />
        ))}
      </datalist>
    </div>
  );
};

export default LabInput;
