import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  History, 
  Activity, 
  Microscope,
  Download,
  ShieldAlert,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Pill,
  ClipboardList,
  Thermometer,
  Heart,
  Wind,
  Droplets,
  Scale,
  MoveVertical,
  Save,
  XCircle,
  Key
} from 'lucide-react';
import LabInput from '../components/LabInput';
import { PatientData, DiagnosisOutput, LabResult, User, SavedRecord } from '../types';
import { translations } from '../translations';
import { analyzePatientData } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AlcortexLogo from '../components/Logo';

interface DiagnosisFormProps {
  user: User;
  onSaveRecord: (record: SavedRecord) => Promise<void>;
}

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ user, onSaveRecord }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeyBtn, setShowKeyBtn] = useState(false);
  const [result, setResult] = useState<DiagnosisOutput | null>(null);
  const [step, setStep] = useState(1);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  
  // FIXED: Added const to declaration to prevent ReferenceError crash
  const t = translations[user.language] || translations['English'];
  
  const [patient, setPatient] = useState<PatientData>({
    name: '',
    rmNo: '',
    dob: '',
    age: 0,
    gender: 'Male',
    bloodType: 'A+',
    history: '',
    meds: '',
    allergies: '',
    smoking: 'None',
    alcohol: 'None',
    activity: 'Moderate',
    complaints: '',
    vitals: {
      bpSystolic: '',
      bpDiastolic: '',
      heartRate: '',
      respiratoryRate: '',
      temperature: '',
      spo2: '',
      weight: '',
      height: ''
    },
    labBlood: [
      { parameter: 'Hemoglobin', value: '', unit: 'g/dL', referenceRange: '13.5-17.5' },
      { parameter: 'Leukocytes (WBC)', value: '', unit: '10^3/uL', referenceRange: '4.5-11.0' },
      { parameter: 'Platelets', value: '', unit: '10^3/uL', referenceRange: '150-450' }
    ],
    labUrine: [
      { parameter: 'Specific Gravity', value: '', unit: '-', referenceRange: '1.005-1.030' },
      { parameter: 'Protein', value: '', unit: '-', referenceRange: 'Negative' }
    ],
    labSputum: [
      { parameter: 'AFB', value: '', unit: '-', referenceRange: 'Negative' },
      { parameter: 'Gram Stain', value: '', unit: '-', referenceRange: '-' }
    ]
  });

  useEffect(() => {
    const draft = localStorage.getItem('alcortex_patient_draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setPatient(parsedDraft);
      } catch (e) {
        console.error("Failed to load patient draft", e);
      }
    }
  }, []);

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (patient.name || patient.complaints || patient.history || patient.rmNo) {
        localStorage.setItem('alcortex_patient_draft', JSON.stringify(patient));
        setIsDraftSaved(true);
        const feedbackTimeout = setTimeout(() => setIsDraftSaved(false), 2000);
        return () => clearTimeout(feedbackTimeout);
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [patient]);

  useEffect(() => {
    if (patient.dob) {
      const birthDate = new Date(patient.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setPatient(prev => ({ ...prev, age: age > 0 ? age : 0 }));
    }
  }, [patient.dob]);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        setError(null);
        setShowKeyBtn(false);
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setShowKeyBtn(false);

    try {
      const analysis = await analyzePatientData(patient, user.language);
      setResult(analysis);
      
      await onSaveRecord({
        id: 'REC-' + Date.now(),
        date: new Date().toISOString(),
        patient: { ...patient },
        analysis
      });

      localStorage.removeItem('alcortex_patient_draft');
      setStep(4);
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Analysis failed. ";
      
      const isKeyError = err.message?.includes("API_KEY") || 
                        err.message?.includes("API key") || 
                        err.message?.includes("403") || 
                        err.message?.includes("entity was not found");

      if (isKeyError) {
        errorMessage += "API Key invalid or not configured.";
        setShowKeyBtn(true);
      } else {
        errorMessage += err.message || "An unexpected error occurred.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const accentColor: [number, number, number] = [37, 99, 235];
    let yPos = 20;

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text('ALCORTEX AI', 20, 28);
    doc.setFontSize(10);
    doc.text(t.reportTitle || 'PRECISION CLINICAL DIAGNOSTIC REPORT', 20, 38);
    yPos = 55;

    doc.setTextColor(37, 99, 235);
    doc.setFontSize(14);
    doc.text(t.profile.toUpperCase(), 20, yPos);
    yPos += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const profileData = [
      [t.patientName, patient.name, t.rmNo, patient.rmNo],
      [t.age, patient.age.toString(), t.gender, patient.gender]
    ];
    autoTable(doc, {
      startY: yPos,
      body: profileData,
      theme: 'plain'
    });
    
    doc.save(`Alcortex_Report_${patient.rmNo}.pdf`);
  };

  const steps = [
    { id: 1, label: t.profile, icon: UserIcon },
    { id: 2, label: t.history, icon: History },
    { id: 3, label: t.lab, icon: Microscope },
    { id: 4, label: t.intelligence, component: <AlcortexLogo size={22} /> },
  ];

  const ChipGroup = ({ label, options, value, onChange }: { label: string, options: { id: string, label: string, color: string }[] , value: string, onChange: (id: any) => void }) => (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
              value === opt.id 
                ? `${opt.color} text-white border-transparent shadow-lg` 
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="bg-white p-4 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden flex justify-between items-center px-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-50">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-teal-400 transition-all duration-700 ease-out" 
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
        {steps.map((s) => (
          <button 
            key={s.id}
            onClick={() => s.id <= step || result ? setStep(s.id) : null}
            className={`flex flex-col items-center gap-3 py-4 transition-all ${
              step === s.id ? 'scale-110' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
               step === s.id ? 'bg-gradient-to-br from-blue-600 to-teal-400 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-50 text-slate-400'
            }`}>
              {s.icon ? <s.icon size={22} /> : s.component}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {step === 1 && (
          <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-10 animate-fade-in">
            <h3 className="text-3xl font-black text-slate-800">{t.profile}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.patientName}</label>
                  <input 
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-500/5 text-slate-700 font-bold"
                    placeholder="John Doe"
                    value={patient.name}
                    onChange={e => setPatient({...patient, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.rmNo}</label>
                    <input 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 focus:ring-4 focus:ring-blue-500/5 text-slate-700 font-bold"
                      placeholder="RM-XXXX"
                      value={patient.rmNo}
                      onChange={e => setPatient({...patient, rmNo: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.bloodType}</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold"
                      value={patient.bloodType}
                      onChange={e => setPatient({...patient, bloodType: e.target.value})}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DOB</label>
                      <input type="date" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-700" value={patient.dob} onChange={e => setPatient({...patient, dob: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.age}</label>
                      <input readOnly className="w-full bg-slate-100 border-none rounded-2xl px-6 py-5 text-center font-bold text-blue-600" value={patient.age} />
                    </div>
                 </div>
                 <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.gender}</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-bold" value={patient.gender} onChange={e => setPatient({...patient, gender: e.target.value as any})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-10 border-t">
              <button onClick={() => setStep(2)} className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-500/10">
                 {t.historyExplorer} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-10 animate-fade-in">
             <div className="flex justify-between items-end">
                <h3 className="text-3xl font-black text-slate-800">{t.historyExplorer}</h3>
                <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clinical Data Entry</span>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.complaints}</label>
                      <textarea rows={4} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-medium text-slate-700" value={patient.complaints} onChange={e => setPatient({...patient, complaints: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.history}</label>
                      <textarea rows={4} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-medium text-slate-700" value={patient.history} onChange={e => setPatient({...patient, history: e.target.value})} />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 space-y-8">
                    <div className="flex items-center gap-3">
                       <Activity className="text-blue-600" size={24} />
                       <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{t.vitals}</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Heart size={12} className="text-rose-500"/> {t.bp} (S/D)</label>
                          <div className="flex items-center bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                             <input className="w-1/2 px-3 py-4 text-center font-bold text-slate-700 outline-none" placeholder="120" value={patient.vitals.bpSystolic} onChange={e => setPatient({...patient, vitals: {...patient.vitals, bpSystolic: e.target.value}})} />
                             <span className="text-slate-300">/</span>
                             <input className="w-1/2 px-3 py-4 text-center font-bold text-slate-700 outline-none" placeholder="80" value={patient.vitals.bpDiastolic} onChange={e => setPatient({...patient, vitals: {...patient.vitals, bpDiastolic: e.target.value}})} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Activity size={12} className="text-rose-400"/> {t.hr} (bpm)</label>
                          <input className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-4 font-bold text-slate-700 text-center shadow-sm" placeholder="72" value={patient.vitals.heartRate} onChange={e => setPatient({...patient, vitals: {...patient.vitals, heartRate: e.target.value}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Thermometer size={12} className="text-orange-400"/> {t.temp} (°C)</label>
                          <input className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-4 font-bold text-slate-700 text-center shadow-sm" placeholder="36.5" value={patient.vitals.temperature} onChange={e => setPatient({...patient, vitals: {...patient.vitals, temperature: e.target.value}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Wind size={12} className="text-blue-400"/> {t.rr} (/min)</label>
                          <input className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-4 font-bold text-slate-700 text-center shadow-sm" placeholder="18" value={patient.vitals.respiratoryRate} onChange={e => setPatient({...patient, vitals: {...patient.vitals, respiratoryRate: e.target.value}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Droplets size={12} className="text-teal-400"/> SpO2 (%)</label>
                          <input className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-4 font-bold text-slate-700 text-center shadow-sm" placeholder="98" value={patient.vitals.spo2} onChange={e => setPatient({...patient, vitals: {...patient.vitals, spo2: e.target.value}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Scale size={12} className="text-slate-400"/> {t.weight} (kg)</label>
                          <input className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-4 font-bold text-slate-700 text-center shadow-sm" placeholder="70" value={patient.vitals.weight} onChange={e => setPatient({...patient, vitals: {...patient.vitals, weight: e.target.value}})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><MoveVertical size={12} className="text-slate-400"/> {t.height} (cm)</label>
                          <input className="w-full bg-white rounded-2xl border border-slate-200 px-4 py-4 font-bold text-slate-700 text-center shadow-sm" placeholder="175" value={patient.vitals.height} onChange={e => setPatient({...patient, vitals: {...patient.vitals, height: e.target.value}})} />
                       </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.meds}</label>
                    <textarea rows={3} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 font-medium text-slate-700" value={patient.meds} onChange={e => setPatient({...patient, meds: e.target.value})} />
                  </div>
                  
                  <div className="bg-white p-8 rounded-[40px] space-y-8 border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">{t.lifestyleFactors}</h4>
                    
                    <ChipGroup 
                      label={t.smokingHistory}
                      value={patient.smoking}
                      onChange={(val) => setPatient({...patient, smoking: val})}
                      options={[
                        { id: 'None', label: t.none, color: 'bg-teal-500' },
                        { id: 'Passive', label: t.passive, color: 'bg-yellow-500' },
                        { id: 'Active', label: t.active, color: 'bg-orange-500' },
                        { id: 'Heavy', label: t.heavy, color: 'bg-rose-600' }
                      ]}
                    />

                    <ChipGroup 
                      label={t.alcoholHistory}
                      value={patient.alcohol}
                      onChange={(val) => setPatient({...patient, alcohol: val})}
                      options={[
                        { id: 'None', label: t.none, color: 'bg-teal-500' },
                        { id: 'Occasional', label: t.occasional, color: 'bg-yellow-500' },
                        { id: 'Active', label: t.active, color: 'bg-orange-500' },
                        { id: 'Heavy', label: t.heavy, color: 'bg-rose-600' }
                      ]}
                    />
                  </div>
               </div>
             </div>
             
             <div className="flex justify-between pt-10 border-t">
                <button onClick={() => setStep(1)} className="text-slate-400 font-bold px-8 flex items-center gap-2 hover:text-slate-600 transition-colors"><ChevronLeft /> {t.back}</button>
                <button onClick={() => setStep(3)} className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all">{t.next}</button>
             </div>
          </div>
        )}

        {step === 3 && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
              <div className="space-y-8 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                <LabInput title={t.blood} results={patient.labBlood} setResults={v => setPatient({...patient, labBlood: v})} />
                <LabInput title={t.urine} results={patient.labUrine} setResults={v => setPatient({...patient, labUrine: v})} />
                <LabInput title={t.sputum} results={patient.labSputum} setResults={v => setPatient({...patient, labSputum: v})} />
              </div>
              <div className="bg-gradient-to-br from-blue-800 to-teal-900 rounded-[48px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center sticky top-8 h-fit">
                 <div className="absolute top-0 right-0 p-10 opacity-5"><AlcortexLogo size={320} /></div>
                 <div className="relative z-10 space-y-8">
                    <div className="w-20 h-20 bg-white/10 rounded-[28px] backdrop-blur-md flex items-center justify-center">
                      <AlcortexLogo size={48} />
                    </div>
                    <h3 className="text-4xl font-black tracking-tight">{t.intelligence} Core</h3>
                    <p className="text-slate-300 font-medium">Ready to cross-reference patient profile with laboratory findings and clinical markers.</p>
                    
                    {error && (
                      <div className="bg-rose-500/20 border border-rose-500/50 p-6 rounded-[32px] space-y-4 animate-fade-in">
                        <div className="flex items-start gap-3">
                          <XCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                          <p className="text-sm font-bold text-rose-100 leading-relaxed">{error}</p>
                        </div>
                        {showKeyBtn && (
                          <button 
                            onClick={handleSelectKey}
                            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-xs uppercase tracking-widest"
                          >
                            <Key size={14} /> {t.configAlerts || 'Configure API Key'}
                          </button>
                        )}
                      </div>
                    )}

                    <button 
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-teal-400 py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:shadow-2xl transition-all disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <AlcortexLogo size={24} />}
                      {loading ? t.neuralAnalyzing : t.analyze}
                    </button>
                 </div>
              </div>
           </div>
        )}

        {step === 4 && result && (
          <div className="space-y-10 animate-fade-in">
             <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block">{t.mainDiagnosis}</span>
                   </div>
                   <h2 className="text-5xl font-black text-slate-800">{result.mainDiagnosis}</h2>
                </div>
                <div className="flex gap-4">
                   <button onClick={exportPDF} className="bg-gradient-to-r from-blue-600 to-teal-400 text-white p-6 rounded-3xl shadow-xl hover:scale-105 transition-all">
                      <Download size={32} />
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                      <h4 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs flex items-center gap-2"><Activity size={16} /> {t.interpretation}</h4>
                      <p className="text-slate-500 leading-relaxed font-medium whitespace-pre-wrap">{result.interpretation}</p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-blue-50/50 p-10 rounded-[40px] border border-blue-100 shadow-sm">
                        <h4 className="font-black text-blue-800 mb-6 uppercase tracking-widest text-xs flex items-center gap-2"><ClipboardList size={16} /> {t.followUp}</h4>
                        <p className="text-blue-700/80 font-medium text-sm leading-relaxed whitespace-pre-wrap">{result.followUp}</p>
                      </div>
                      <div className="bg-teal-50/50 p-10 rounded-[40px] border border-teal-100 shadow-sm">
                        <h4 className="font-black text-teal-800 mb-6 uppercase tracking-widest text-xs flex items-center gap-2"><Pill size={16} /> {t.medicationRecs}</h4>
                        <p className="text-teal-700/80 font-medium text-sm leading-relaxed whitespace-pre-wrap">{result.medicationRecs}</p>
                      </div>
                   </div>

                   <div className="bg-rose-50 p-10 rounded-[40px] border border-rose-100 flex gap-6 items-start">
                      <ShieldAlert className="text-rose-600 shrink-0" size={28} />
                      <div>
                         <h4 className="font-black text-rose-800 mb-2 uppercase tracking-widest text-xs">{t.safetyWarning}</h4>
                         <p className="text-rose-600/80 font-medium text-sm">{result.safetyWarning}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl">
                      <h4 className="font-bold mb-6 text-sm opacity-60 uppercase tracking-widest">{t.differentialDiagnostics}</h4>
                      <div className="space-y-4">
                        {result.differentials.map((d, i) => (
                           <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 transition-all cursor-default">
                              <div className="flex justify-between mb-2">
                                 <span className="text-[10px] font-black text-teal-400">{d.icd10}</span>
                                 <span className="text-[10px] font-bold">{(d.confidence * 100).toFixed(0)}%</span>
                              </div>
                              <h5 className="font-bold text-sm">{d.diagnosis}</h5>
                           </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisForm;