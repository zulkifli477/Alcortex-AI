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
  IdCard,
  Zap,
  Dna,
  Heart,
  Scale,
  Wind,
  Droplets,
  FileText,
  AlertCircle,
  Thermometer,
  Stethoscope,
  CheckCircle2,
  ArrowUpRight,
  Info,
  Circle,
  CheckCircle
} from 'lucide-react';
import LabInput from '../components/LabInput';
import { PatientData, DiagnosisOutput, User, SavedRecord, Vitals, SmokingLevel, AlcoholLevel } from '../types';
import { translations } from '../translations';
import { analyzePatientData } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AlcortexLogo from '../components/Logo';

const BLOOD_SUGGESTIONS = [
  'Hemoglobin', 'Hematocrit', 'WBC Count', 'Platelet Count', 'RBC Count', 'MCV', 'MCH', 'MCHC',
  'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils', 'CRP', 'HbA1c',
  'Blood Glucose (Random)', 'Blood Glucose (Fasting)', 'Creatinine', 'Urea', 'Uric Acid',
  'Sodium', 'Potassium', 'Chloride', 'ALT (SGPT)', 'AST (SGPT)', 'Bilirubin Total', 'Albumin'
];

const URINE_SUGGESTIONS = [
  'Urine Color', 'Urine Clarity', 'Specific Gravity', 'pH Urine', 'Urine Protein', 'Urine Glucose', 'Urine Ketones', 
  'Urine Bilirubin', 'Urine Blood', 'Urine Nitrite', 'Leukocyte Esterase', 'Urobilinogen'
];

const SPUTUM_SUGGESTIONS = [
  'Sputum Color', 'Sputum Consistency', 'Gram Stain (Sputum)', 'Acid-Fast Bacilli (AFB)', 'Sputum Culture', 'Epithelial Cells', 'Leukocytes (Sputum)'
];

const BLOOD_TEMPLATES = [
  { name: 'Standard Blood Panel', parameters: ['Hemoglobin', 'Hematocrit', 'WBC Count', 'Platelet Count', 'CRP', 'Blood Glucose (Random)', 'Creatinine'] },
  { name: 'Full CBC', parameters: ['Hemoglobin', 'Hematocrit', 'WBC Count', 'RBC Count', 'Platelet Count', 'MCV', 'MCH', 'MCHC'] },
  { name: 'Metabolic', parameters: ['ALT (SGPT)', 'AST (SGOT)', 'Bilirubin Total', 'Albumin', 'Urea', 'Sodium', 'Potassium'] }
];

const URINE_TEMPLATES = [
  { name: 'Standard Urine Panel', parameters: ['pH Urine', 'Specific Gravity', 'Urine Protein', 'Urine Glucose', 'Urine Nitrite', 'Leukocyte Esterase'] },
  { name: 'Complete UA', parameters: ['Urine Color', 'Urine Clarity', 'pH Urine', 'Specific Gravity', 'Urine Protein', 'Urine Glucose', 'Urine Ketones', 'Urine Blood', 'Urobilinogen'] }
];

const SPUTUM_TEMPLATES = [
  { name: 'Standard Sputum Panel', parameters: ['Sputum Color', 'Sputum Consistency', 'Gram Stain (Sputum)', 'Acid-Fast Bacilli (AFB)'] },
  { name: 'Infection Screen', parameters: ['Sputum Color', 'Gram Stain (Sputum)', 'Acid-Fast Bacilli (AFB)', 'Sputum Culture', 'Leukocytes (Sputum)'] }
];

interface DiagnosisFormProps {
  user: User;
  onSaveRecord: (record: SavedRecord) => Promise<void>;
}

type AnalysisStage = 'idle' | 'initializing' | 'processing' | 'complete';

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ user, onSaveRecord }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisOutput | null>(null);
  const [step, setStep] = useState(1);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  
  const t = translations[user.language];
  
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
      bpSystolic: '', bpDiastolic: '', heartRate: '', respiratoryRate: '',
      temperature: '', spo2: '', weight: '', height: ''
    },
    labBlood: [], labUrine: [], labSputum: []
  });

  useEffect(() => {
    if (patient.dob) {
      const birth = new Date(patient.dob);
      const today = new Date();
      if (!isNaN(birth.getTime())) {
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        setPatient(p => ({ ...p, age: age > 0 ? age : 0 }));
      }
    }
  }, [patient.dob]);

  const handleVitalChange = (key: keyof Vitals, val: string) => {
    const isDecimal = ['temperature', 'weight', 'height'].includes(key as string);
    const regex = isDecimal ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;
    if (val === '' || regex.test(val)) {
      setPatient(p => ({ ...p, vitals: { ...p.vitals, [key as any]: val } }));
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysisStage('initializing');

    try {
      await new Promise(r => setTimeout(r, 1200));
      setAnalysisStage('processing');

      const analysis = await analyzePatientData(patient, user.language);
      
      setAnalysisStage('complete');
      setResult(analysis);
      
      await new Promise(r => setTimeout(r, 800));
      
      await onSaveRecord({ id: `ALCOR-${Date.now()}`, date: new Date().toISOString(), patient, analysis });
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Neural Engine Critical Error");
      setAnalysisStage('idle');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header & Branding
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text('ALCORTEX AI', 20, 22);
    doc.setFontSize(10);
    doc.setTextColor(45, 212, 191);
    doc.text(t.reportSubtitle || 'PRECISION CLINICAL AI SUITE', 20, 32);

    doc.setTextColor(255, 255, 255);
    doc.text(`${t.pdfReportId}: ${patient.rmNo}`, pageWidth - 20, 22, { align: 'right' });
    doc.text(`${t.pdfDate}: ${new Date().toLocaleDateString()}`, pageWidth - 20, 30, { align: 'right' });

    // Section 1: Patient Profile & Identity
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text(t.pdfPatientProfile || 'PATIENT PROFILE', 20, 65);
    autoTable(doc, {
      startY: 70,
      theme: 'grid',
      body: [
        [t.fullName, patient.name.toUpperCase(), t.rmNo, patient.rmNo],
        [`${t.age}/${t.gender}`, `${patient.age}Y / ${patient.gender}`, t.bloodType, patient.bloodType],
      ],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] }
    });

    // Section 2: Narrative & Subjective Data
    doc.text(t.narrative || 'CLINICAL NARRATIVE', 20, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      theme: 'grid',
      body: [
        [t.currentComplaints, patient.complaints || '-'],
        [t.history, patient.history || '-'],
        [t.meds, patient.meds || '-'],
      ],
      styles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    // Section 3: Vitals & Lifestyle
    doc.text(t.pdfVitalsSummary || 'VITALS & LIFESTYLE', 20, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      theme: 'grid',
      head: [[t.bp, t.hr, t.temp, t.spo2, t.rr, t.weight, t.smokingHistory, t.alcoholHistory]],
      body: [[
        `${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic}`,
        patient.vitals.heartRate,
        patient.vitals.temperature,
        patient.vitals.spo2,
        patient.vitals.respiratoryRate,
        patient.vitals.weight,
        patient.smoking,
        patient.alcohol
      ]],
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [51, 65, 85] }
    });

    // Section 4: Full Laboratory Markers (Blood, Urine, Sputum)
    const renderLabTable = (title: string, data: any[]) => {
      if (data.length === 0) return;
      doc.setFontSize(10);
      doc.text(title, 20, (doc as any).lastAutoTable.finalY + 12);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        theme: 'striped',
        head: [['Parameter', 'Result', 'Unit', 'Reference Range']],
        body: data.map(r => [r.parameter, r.value, r.unit, r.referenceRange]),
        styles: { fontSize: 8 }
      });
    };

    renderLabTable(`LAB: ${t.blood}`, patient.labBlood);
    renderLabTable(`LAB: ${t.urine}`, patient.labUrine);
    renderLabTable(`LAB: ${t.sputum}`, patient.labSputum);

    // Section 5: Primary Neural Finding (AI Result)
    doc.setFillColor(37, 99, 235);
    doc.rect(20, (doc as any).lastAutoTable.finalY + 10, pageWidth - 40, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(t.pdfPrimaryFinding || 'PRIMARY NEURAL FINDING:', 25, (doc as any).lastAutoTable.finalY + 20);
    doc.setFontSize(18);
    doc.text(result.mainDiagnosis.toUpperCase(), 25, (doc as any).lastAutoTable.finalY + 32);

    // Section 6: Action Plan
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(t.pdfActionPlan || 'ACTION PLAN & THERAPEUTICS', 20, (doc as any).lastAutoTable.finalY + 50);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 55,
      theme: 'plain',
      body: [
        [t.clinicalInterpretation, result.interpretation],
        [t.managementProtocol, result.followUp],
        [t.therapeutics, result.medicationRecs],
        [t.safetyProtocol, result.safetyWarning]
      ],
      styles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } }
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(t.pdfFooter, pageWidth / 2, footerY, { align: 'center' });

    doc.save(`Alcortex_Report_V1_${patient.rmNo}.pdf`);
  };

  const SelectionButton = ({ active, onClick, label }: any) => (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
        active 
        ? `bg-gradient-to-br from-blue-600 to-teal-500 text-white border-transparent shadow-md` 
        : `bg-white text-slate-400 border-slate-50 hover:border-blue-100 hover:bg-slate-50`
      }`}
    >
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  const getSeverityStyles = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-rose-500 text-white shadow-rose-200';
      case 'severe': return 'bg-orange-500 text-white shadow-orange-200';
      case 'moderate': return 'bg-amber-500 text-white shadow-amber-200';
      case 'mild': return 'bg-blue-500 text-white shadow-blue-200';
      default: return 'bg-slate-500 text-white';
    }
  };

  const StatusStep = ({ id, label, current }: { id: AnalysisStage, label: string, current: AnalysisStage }) => {
    const isCompleted = (current === 'processing' && id === 'initializing') || 
                       (current === 'complete' && (id === 'initializing' || id === 'processing')) ||
                       (current === 'complete' && id === 'complete');
    const isActive = current === id;

    return (
      <div className={`flex items-center gap-4 transition-all duration-500 ${isCompleted || isActive ? 'opacity-100' : 'opacity-20'}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-teal-500 text-white' : isActive ? 'bg-blue-500 text-white animate-pulse' : 'bg-white/10'}`}>
          {isCompleted ? <CheckCircle size={14} /> : <Circle size={8} fill="currentColor" />}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-400'}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-32 px-4 md:px-0">
      <div className="bg-white p-3 md:p-4 rounded-[28px] md:rounded-[32px] border border-slate-100 shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-slate-50 w-full">
           <div className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-700" style={{ width: `${(step/4)*100}%` }}></div>
        </div>
        {[
          { id: 1, label: t.identity, icon: IdCard },
          { id: 2, label: t.narrative, icon: History },
          { id: 3, label: t.lab, icon: Microscope },
          { id: 4, label: t.result, icon: CheckCircle2 }
        ].map(s => (
          <div key={s.id} className={`flex-1 flex flex-col items-center gap-1.5 md:gap-2 py-1 md:py-2 transition-all ${step === s.id ? 'opacity-100 scale-105' : 'opacity-25'}`}>
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${step === s.id ? 'bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
              <s.icon size={step === s.id ? 20 : 18} />
            </div>
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="animate-fade-in">
        {step === 1 && (
          <div className="bg-white p-6 md:p-12 rounded-[40px] md:rounded-[48px] shadow-2xl border border-slate-100 space-y-10">
            <div className="flex items-center gap-5 border-b border-slate-50 pb-6 md:pb-8">
               <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                  <UserIcon size={window.innerWidth >= 768 ? 28 : 24} />
               </div>
               <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{t.clinicalEnrollment}</h3>
                  <p className="text-[8px] md:text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em] md:tracking-[0.3em]">{t.demographicInit}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-10">
              <div className="space-y-3 md:space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.fullName}</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] md:rounded-3xl px-6 md:px-8 py-4 md:py-5 font-bold text-lg text-slate-900 focus:bg-white focus:border-blue-500/20 outline-none transition-all shadow-inner placeholder:text-slate-200" 
                  value={patient.name} 
                  onChange={e => setPatient({...patient, name: e.target.value})} 
                  placeholder="..." 
                />
              </div>
              <div className="space-y-3 md:space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.medicalRecordId}</label>
                <input 
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] md:rounded-3xl px-6 md:px-8 py-4 md:py-5 font-bold text-lg text-slate-900 focus:bg-white focus:border-blue-500/20 outline-none transition-all shadow-inner placeholder:text-slate-200" 
                  value={patient.rmNo} 
                  onChange={e => setPatient({...patient, rmNo: e.target.value})} 
                  placeholder="RM-XXX-XXX" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.birthDate}</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-[24px] md:rounded-3xl px-5 md:px-6 py-4 md:py-5 font-bold text-slate-900 outline-none" 
                    value={patient.dob} 
                    onChange={e => setPatient({...patient, dob: e.target.value})} 
                  />
                </div>
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">{t.calculatedAge}</label>
                  <div className="w-full bg-blue-600 rounded-[24px] md:rounded-3xl px-5 md:px-6 py-4 md:py-5 font-black text-white text-center text-xl shadow-lg leading-tight flex items-center justify-center">{patient.age}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.gender}</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-[24px] md:rounded-3xl px-5 md:px-6 py-4 md:py-5 font-bold text-slate-900 cursor-pointer outline-none" 
                    value={patient.gender} 
                    onChange={e => setPatient({...patient, gender: e.target.value as any})}
                  >
                    <option value="Male">{t.male || "Male"}</option>
                    <option value="Female">{t.female || "Female"}</option>
                    <option value="Other">{t.other || "Other"}</option>
                  </select>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.bloodType}</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-[24px] md:rounded-3xl px-5 md:px-6 py-4 md:py-5 font-bold text-slate-900 cursor-pointer outline-none" 
                    value={patient.bloodType} 
                    onChange={e => setPatient({...patient, bloodType: e.target.value})}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 md:pt-6">
              <button 
                onClick={() => setStep(2)} 
                className="w-full md:w-auto bg-slate-900 text-white px-10 md:px-16 py-5 md:py-6 rounded-[24px] md:rounded-3xl font-black uppercase text-xs tracking-[0.2em] md:tracking-[0.3em] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-4 group"
              >
                {t.forwardToNarrative} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-7 space-y-6 md:space-y-8">
              <div className="bg-white p-6 md:p-10 rounded-[40px] md:rounded-[48px] shadow-xl border border-slate-100 space-y-8 h-full">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Stethoscope size={24} /></div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{t.clinicalNarrative}</h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity size={12} className="text-blue-500" /> {t.currentComplaints}
                    </label>
                    <textarea 
                      rows={4} 
                      className="w-full bg-slate-50 border-2 border-transparent rounded-[28px] md:rounded-[32px] p-6 text-lg font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500/20 transition-all shadow-inner placeholder:text-slate-200" 
                      value={patient.complaints} 
                      onChange={e => setPatient({...patient, complaints: e.target.value})} 
                      placeholder="..." 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <History size={12} className="text-teal-500" /> {t.history}
                    </label>
                    <textarea 
                      rows={4} 
                      className="w-full bg-slate-50 border-2 border-transparent rounded-[28px] md:rounded-[32px] p-6 text-lg font-bold text-slate-900 outline-none focus:bg-white focus:border-teal-500/20 transition-all shadow-inner placeholder:text-slate-200" 
                      value={patient.history} 
                      onChange={e => setPatient({...patient, history: e.target.value})} 
                      placeholder="..." 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Pill size={12} className="text-rose-500" /> {t.meds}
                    </label>
                    <textarea 
                      rows={3} 
                      className="w-full bg-slate-50 border-2 border-transparent rounded-[28px] md:rounded-[32px] p-6 text-lg font-bold text-slate-900 outline-none focus:bg-white focus:border-rose-500/20 transition-all shadow-inner placeholder:text-slate-200" 
                      value={patient.meds} 
                      onChange={e => setPatient({...patient, meds: e.target.value})} 
                      placeholder="..." 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6 md:space-y-8">
              <div className="bg-white p-6 md:p-10 rounded-[40px] md:rounded-[48px] shadow-xl border border-slate-100 space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="p-3 bg-rose-50 rounded-xl text-rose-500"><Zap size={24} /></div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{t.physiologicalGrid}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {[
                    { k: 'bpSystolic', l: t.bp || 'Systolic', u: 'mmHg', r: '90-120', i: Heart, c: 'text-rose-500' }, 
                    { k: 'bpDiastolic', l: t.bp || 'Diastolic', u: 'mmHg', r: '60-80', i: Heart, c: 'text-rose-500' },
                    { k: 'heartRate', l: t.hr || 'Pulse', u: 'bpm', r: '60-100', i: Activity, c: 'text-blue-500' }, 
                    { k: 'temperature', l: t.temp || 'Temp', u: '°C', r: '36.5-37.5', i: Thermometer, c: 'text-orange-500' },
                    { k: 'spo2', l: t.spo2 || 'O2 Sat', u: '%', r: '95-100', i: Wind, c: 'text-teal-500' }, 
                    { k: 'respiratoryRate', l: t.rr || 'Resp', u: '/min', r: '12-20', i: Activity, c: 'text-indigo-500' },
                    { k: 'weight', l: t.weight || 'Weight', u: 'kg', r: 'BMI Ref', i: Scale, c: 'text-slate-500' }, 
                    { k: 'height', l: t.height || 'Height', u: 'cm', r: 'Ref: cm', i: Scale, c: 'text-slate-500' }
                  ].map(v => (
                    <div key={v.k} className="bg-slate-50 p-4 md:p-5 rounded-[24px] md:rounded-[28px] border-2 border-transparent hover:border-slate-100 transition-all group">
                      <div className="flex justify-between items-start opacity-40 mb-1">
                        <v.i size={12} className={v.c} /> 
                        <div className="text-right">
                          <span className="text-[7px] font-black uppercase tracking-widest block leading-tight">{v.u}</span>
                          <span className="text-[6px] font-bold text-slate-500 italic block leading-tight">Ref: {v.r}</span>
                        </div>
                      </div>
                      <input 
                        className="w-full bg-transparent p-0 text-lg md:text-xl font-black text-slate-900 outline-none" 
                        value={(patient.vitals as any)[v.k]} 
                        onChange={e => handleVitalChange(v.k as any, e.target.value)} 
                        placeholder="0" 
                      />
                      <p className="text-[8px] font-black text-slate-400 uppercase mt-1">{v.l}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-50 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.lifestyleFactors}: {t.smokingHistory}</label>
                    <div className="flex flex-wrap md:flex-nowrap gap-2">
                      {(['None', 'Passive', 'Active', 'Heavy'] as SmokingLevel[]).map(l => (
                        <SelectionButton key={l} active={patient.smoking === l} onClick={() => setPatient({...patient, smoking: l})} label={t[l.toLowerCase()] || l} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.lifestyleFactors}: {t.alcoholHistory}</label>
                    <div className="flex flex-wrap md:flex-nowrap gap-2">
                      {(['None', 'Occasional', 'Active', 'Heavy'] as AlcoholLevel[]).map(l => (
                        <SelectionButton key={l} active={patient.alcohol === l} onClick={() => setPatient({...patient, alcohol: l})} label={t[l.toLowerCase()] || l} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="p-3 md:p-4 text-slate-400 hover:text-slate-800 transition-all"><ChevronLeft size={24}/></button>
                  <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">{t.nextLabs}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
             <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <LabInput 
                  title={t.blood} 
                  results={patient.labBlood} 
                  setResults={v => setPatient({...patient, labBlood: v})} 
                  suggestions={BLOOD_SUGGESTIONS}
                  templates={BLOOD_TEMPLATES}
                />
                <LabInput 
                  title={t.urine} 
                  results={patient.labUrine} 
                  setResults={v => setPatient({...patient, labUrine: v})} 
                  suggestions={URINE_SUGGESTIONS}
                  templates={URINE_TEMPLATES}
                />
                <LabInput 
                  title={t.sputum} 
                  results={patient.labSputum} 
                  setResults={v => setPatient({...patient, labSputum: v})} 
                  suggestions={SPUTUM_SUGGESTIONS}
                  templates={SPUTUM_TEMPLATES}
                />
             </div>

             <div className="space-y-6 md:space-y-8">
                <div className="bg-slate-900 p-8 md:p-10 rounded-[40px] md:rounded-[48px] text-white shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[450px] md:min-h-[500px]">
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><AlcortexLogo size={250} /></div>
                   <div className="flex items-center gap-3 mb-8"><Dna size={20} className="text-teal-400 animate-pulse" /><h4 className="text-lg md:text-xl font-black tracking-tight uppercase">ALCORTEX AI</h4></div>
                   <p className="text-sm opacity-60 mb-10 leading-relaxed font-medium">{t.neuralAnalyzing}</p>
                   
                   <div className="flex-1 space-y-8">
                      <div className="space-y-6">
                        <StatusStep id="initializing" label={t.statusInitializing} current={analysisStage} />
                        <StatusStep id="processing" label={t.statusProcessing} current={analysisStage} />
                        <StatusStep id="complete" label={t.statusComplete} current={analysisStage} />
                      </div>

                      <div className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                        <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase opacity-40"><span>System Integrity</span><span>Stable</span></div>
                        <div className="flex justify-between text-[9px] md:text-[10px] font-black uppercase opacity-40"><span>Markers Found</span><span>{patient.labBlood.length + patient.labUrine.length + patient.labSputum.length}</span></div>
                      </div>

                      {error && <div className="p-4 md:p-5 bg-rose-500/20 border border-rose-500/50 rounded-2xl text-[10px] font-bold text-rose-300 flex items-center gap-3"><AlertCircle size={14}/> {error}</div>}
                   </div>

                   <button 
                    onClick={handleAnalyze} 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-500 py-5 md:py-6 rounded-[20px] md:rounded-3xl font-black uppercase text-xs tracking-[0.3em] md:tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 mt-10"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : <AlcortexLogo size={20} />}
                     {loading ? t.processing : t.runAnalysis}
                   </button>
                   <button onClick={() => setStep(2)} className="w-full py-4 text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-all">{t.backToHistory}</button>
                </div>
             </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="space-y-8 md:space-y-10">
             <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden text-white border border-white/5">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none"><AlcortexLogo size={400} /></div>
                
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                   <div className="relative group">
                     <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full scale-125 group-hover:scale-150 transition-transform"></div>
                     <div className="w-32 h-32 md:w-40 md:h-40 rounded-[48px] bg-white/5 backdrop-blur-xl flex items-center justify-center text-white shadow-3xl border border-white/20 relative z-10">
                        <div className="text-center">
                           <p className="text-[10px] font-black text-teal-400 uppercase mb-1 tracking-widest">{t.confidence}</p>
                           <p className="text-4xl font-black text-white">{(result.confidenceScore * 100).toFixed(0)}<span className="text-lg opacity-40">%</span></p>
                        </div>
                     </div>
                   </div>

                   <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                        <span className="px-5 py-1.5 rounded-full bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg shadow-blue-600/20">{t.certiMedAnalysis}</span>
                        <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-lg ${getSeverityStyles(result.severity)}`}>
                          {t[result.severity.toLowerCase()] || result.severity} Risk Profile
                        </span>
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.1] mb-6 drop-shadow-sm">
                        {result.mainDiagnosis}
                      </h2>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-6 opacity-60">
                        <div className="flex items-center gap-2">
                           <ShieldAlert size={16} className="text-teal-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Validated Findings</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Info size={16} className="text-blue-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Protocol Verified</span>
                        </div>
                      </div>
                   </div>

                   <button onClick={exportPDF} className="bg-white text-slate-900 p-8 md:p-10 rounded-[40px] shadow-2xl hover:scale-105 active:scale-95 transition-all relative z-10 group border border-white/20">
                     <Download size={window.innerWidth >= 768 ? 40 : 32} className="group-hover:translate-y-1 transition-transform" />
                   </button>
                </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                <div className="lg:col-span-2 space-y-8 md:space-y-10">
                   <div className="bg-white p-10 md:p-12 rounded-[48px] shadow-xl border border-slate-100 space-y-10 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-16 -mt-16 transition-all group-hover:bg-blue-50"></div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><FileText size={24}/></div>
                        <h4 className="font-black text-2xl text-slate-800 uppercase tracking-tight">{t.clinicalInterpretation}</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-xl font-medium whitespace-pre-wrap relative z-10">{result.interpretation}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-50 relative z-10">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Activity size={14} className="text-blue-600" />
                            <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t.managementProtocol}</h5>
                          </div>
                          <div className="bg-blue-50/50 p-6 rounded-[32px] text-sm font-bold text-slate-700 leading-relaxed border border-blue-100/30">
                            {result.followUp}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <Pill size={14} className="text-teal-600" />
                             <h5 className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{t.therapeutics}</h5>
                          </div>
                          <div className="bg-teal-50/50 p-6 rounded-[32px] text-sm font-bold text-slate-700 leading-relaxed border border-teal-100/30">
                            {result.medicationRecs}
                          </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 flex flex-col h-full">
                      <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-100 rounded-xl text-slate-800"><Stethoscope size={18} /></div>
                           <h4 className="font-black text-[12px] text-slate-800 uppercase tracking-widest">{t.differentialDiagnostics}</h4>
                        </div>
                        <span className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-black text-slate-500 uppercase">Top 3</span>
                      </div>

                      <div className="space-y-6 flex-1">
                        {result.differentials.map((d, i) => (
                          <div key={i} className="group relative">
                             <div className="flex justify-between items-start mb-3">
                               <div>
                                  <span className="px-3 py-1 rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 border border-slate-100 uppercase mb-2 inline-block">
                                    {d.icd10}
                                  </span>
                                  <h5 className="font-black text-slate-800 text-md leading-tight group-hover:text-blue-600 transition-colors">
                                    {d.diagnosis}
                                  </h5>
                               </div>
                               <div className="text-right">
                                  <p className="text-sm font-black text-slate-800">{(d.confidence * 100).toFixed(0)}%</p>
                                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Certainty</p>
                               </div>
                             </div>

                             <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mb-2 border border-slate-100">
                                <div 
                                  className={`h-full transition-all duration-1000 ease-out delay-200 ${
                                    d.confidence > 0.7 ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 
                                    d.confidence > 0.4 ? 'bg-gradient-to-r from-teal-500 to-teal-400' :
                                    'bg-gradient-to-r from-slate-400 to-slate-300'
                                  }`}
                                  style={{ width: `${d.confidence * 100}%` }}
                                ></div>
                             </div>
                             
                             <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all">
                               <button className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1">
                                 Explore Protocol <ArrowUpRight size={10} />
                               </button>
                             </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-10 pt-8 border-t border-slate-50">
                        <div className="bg-rose-50 p-6 rounded-[32px] border border-rose-100 flex gap-4 items-start shadow-sm shadow-rose-100/50">
                          <ShieldAlert size={24} className="text-rose-500 shrink-0" />
                          <div>
                            <h5 className="text-[9px] font-black text-rose-800 uppercase tracking-widest mb-1.5">{t.safetyProtocol}</h5>
                            <p className="text-[11px] text-rose-700 font-bold leading-relaxed">{result.safetyWarning}</p>
                          </div>
                        </div>
                      </div>
                   </div>

                   <button onClick={() => setStep(1)} className="w-full bg-slate-100 text-slate-400 py-6 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-inner active:scale-95">
                     {t.startNewSession}
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisForm;