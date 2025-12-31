import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, History, Activity, Microscope, Download, ShieldAlert,
  Loader2, ChevronRight, ChevronLeft, Pill, IdCard, Heart, Wind, Droplets,
  Scale, Stethoscope, Calendar, CheckCircle2, FileText, Thermometer,
  XCircle, Zap
} from 'lucide-react';
import LabInput from '../components/LabInput';
import { PatientData, DiagnosisOutput, User, SavedRecord, Vitals } from '../types';
import { translations } from '../translations';
import { apiService } from '../frontend/services/api';
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
  const [result, setResult] = useState<DiagnosisOutput | null>(null);
  const [step, setStep] = useState(1);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  
  const t = translations[user.language] || translations['English'];
  
  const [patient, setPatient] = useState<PatientData>({
    name: '', rmNo: '', dob: '', age: 0, gender: 'Male', bloodType: 'A+',
    history: '', meds: '', allergies: '', smoking: 'None', alcohol: 'None',
    activity: 'Moderate', complaints: '',
    vitals: {
      bpSystolic: '', bpDiastolic: '', heartRate: '', respiratoryRate: '',
      temperature: '', spo2: '', weight: '', height: ''
    },
    labBlood: [], labUrine: [], labSputum: []
  });

  useEffect(() => {
    const draft = localStorage.getItem('alcortex_patient_draft');
    if (draft) {
      try { setPatient(JSON.parse(draft)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (patient.name || patient.complaints) {
        localStorage.setItem('alcortex_patient_draft', JSON.stringify(patient));
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [patient]);

  useEffect(() => {
    if (patient.dob) {
      const birthDate = new Date(patient.dob);
      const today = new Date();
      if (!isNaN(birthDate.getTime())) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        setPatient(prev => ({ ...prev, age: age >= 0 ? age : 0 }));
      }
    }
  }, [patient.dob]);

  const handleVitalChange = (key: keyof Vitals, value: string) => {
    const isDecimal = ['temperature', 'weight', 'height'].includes(key);
    const regex = isDecimal ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;
    if (value === '' || regex.test(value)) {
      setPatient(prev => ({ ...prev, vitals: { ...prev.vitals, [key]: value } }));
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      // Menggunakan apiService (OpenAI Backend) sebagai pengganti Gemini
      const analysis = await apiService.analyzePatient(patient, user.language);
      setResult(analysis);
      await onSaveRecord({ id: 'ALCOR-' + Date.now(), date: new Date().toISOString(), patient: JSON.parse(JSON.stringify(patient)), analysis });
      localStorage.removeItem('alcortex_patient_draft');
      setStep(4);
    } catch (err: any) {
      setError("AI Engine Error: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Branding
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text('ALCORTEX AI', 20, 22);
    doc.setFontSize(10);
    doc.setTextColor(45, 212, 191);
    doc.text(t.reportSubtitle || 'PRECISION CLINICAL DIAGNOSTIC SUITE', 20, 32);
    doc.setTextColor(255, 255, 255);
    doc.text(`REPORT ID: ${patient.rmNo}-${Date.now().toString().slice(-6)}`, pageWidth - 20, 22, { align: 'right' });
    doc.text(`DATE: ${new Date().toLocaleString()}`, pageWidth - 20, 30, { align: 'right' });

    // Patient Profile
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.text('I. PATIENT PROFILE', 20, 65);
    autoTable(doc, {
      startY: 70,
      theme: 'grid',
      body: [
        ['Name:', patient.name.toUpperCase(), 'RM Number:', patient.rmNo],
        ['Age:', `${patient.age} Y`, 'Gender:', patient.gender],
        ['Blood Type:', patient.bloodType, 'DOB:', patient.dob]
      ],
      styles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 }, 2: { fontStyle: 'bold', cellWidth: 30 } }
    });

    // Subjective Data
    doc.text('II. CLINICAL NARRATIVES', 20, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      theme: 'grid',
      body: [
        ['Main Complaints:', patient.complaints || '-'],
        ['Medical History:', patient.history || '-'],
        ['Meds & Allergies:', `${patient.meds} / ${patient.allergies}`]
      ],
      styles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    // Vitals
    doc.text('III. VITALS & LIFESTYLE', 20, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      theme: 'grid',
      head: [['BP', 'HR', 'Temp', 'SpO2', 'RR', 'Weight', 'Smoking', 'Alcohol']],
      body: [[
        `${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic}`,
        patient.vitals.heartRate,
        `${patient.vitals.temperature}°C`,
        `${patient.vitals.spo2}%`,
        patient.vitals.respiratoryRate,
        `${patient.vitals.weight}kg`,
        patient.smoking,
        patient.alcohol
      ]],
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [51, 65, 85] }
    });

    const renderLab = (title: string, data: any[]) => {
      if (data.length === 0) return;
      doc.setFontSize(14);
      doc.text(title, 20, (doc as any).lastAutoTable.finalY + 15);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        theme: 'striped',
        head: [['Parameter', 'Result', 'Unit', 'Ref. Range']],
        body: data.map(r => [r.parameter, r.value, r.unit, r.referenceRange]),
        styles: { fontSize: 8 }
      });
    };

    renderLab(`IV. BLOOD PANEL RESULTS`, patient.labBlood);
    renderLab(`V. URINE ANALYSIS RESULTS`, patient.labUrine);
    renderLab(`VI. SPUTUM ANALYSIS RESULTS`, patient.labSputum);

    // AI Analysis Result
    doc.setFillColor(37, 99, 235);
    doc.rect(20, (doc as any).lastAutoTable.finalY + 10, pageWidth - 40, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('PRIMARY AI DIAGNOSIS:', 25, (doc as any).lastAutoTable.finalY + 20);
    doc.setFontSize(18);
    doc.text(result.mainDiagnosis.toUpperCase(), 25, (doc as any).lastAutoTable.finalY + 32);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 55,
      theme: 'plain',
      body: [
        ['Interpretation:', result.interpretation],
        ['Differentials:', result.differentials.map(d => `${d.icd10} ${d.diagnosis} (${(d.confidence*100).toFixed(0)}%)`).join('\n')],
        ['Action Plan:', result.followUp],
        ['Therapeutics:', result.medicationRecs]
      ],
      styles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(t.pdfFooter, pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });

    doc.save(`Alcortex_Report_${patient.rmNo}.pdf`);
  };

  const ChipGroup = ({ label, options, value, onChange }: any) => (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: any) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
              value === opt.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex justify-between items-center px-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-slate-50 w-full">
           <div className="h-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-700" style={{ width: `${(step/4)*100}%` }}></div>
        </div>
        {[
          { id: 1, label: t.profile, icon: IdCard },
          { id: 2, label: t.history, icon: History },
          { id: 3, label: t.lab, icon: Microscope },
          { id: 4, label: t.intelligence, icon: Stethoscope }
        ].map(s => (
          <div key={s.id} className={`flex flex-col items-center gap-2 transition-all ${step === s.id ? 'opacity-100 scale-105' : 'opacity-25'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${step === s.id ? 'bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
              <s.icon size={20} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="animate-fade-in">
        {step === 1 && (
          <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-xl space-y-10">
            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                    <UserIcon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t.profile} Pasien</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Clinical Demographics Initialization</p>
                  </div>
               </div>
               {isDraftSaved && <span className="px-4 py-2 bg-teal-50 text-teal-600 text-[10px] font-black rounded-xl animate-pulse">Draft Tersimpan</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.patientName}</label>
                <input className="w-full bg-slate-50 border-2 border-transparent rounded-3xl px-8 py-5 font-bold text-lg text-slate-800 focus:bg-white focus:border-blue-500/20 outline-none transition-all" value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} placeholder="..." />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.rmNo}</label>
                <input className="w-full bg-slate-50 border-2 border-transparent rounded-3xl px-8 py-5 font-bold text-lg text-slate-800 focus:bg-white focus:border-blue-500/20 outline-none transition-all" value={patient.rmNo} onChange={e => setPatient({...patient, rmNo: e.target.value})} placeholder="RM-XXXX" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tanggal Lahir</label>
                  <input type="date" className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 font-bold text-slate-800 outline-none" value={patient.dob} onChange={e => setPatient({...patient, dob: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Umur</label>
                  <div className="w-full bg-blue-600 rounded-3xl px-6 py-5 font-black text-white text-center text-xl shadow-lg">{patient.age} Y</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.gender}</label>
                  <select className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 font-bold text-slate-800 outline-none" value={patient.gender} onChange={e => setPatient({...patient, gender: e.target.value as any})}>
                    <option value="Male">Laki-laki</option>
                    <option value="Female">Perempuan</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.bloodType}</label>
                  <select className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 font-bold text-slate-800 outline-none" value={patient.bloodType} onChange={e => setPatient({...patient, bloodType: e.target.value})}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <button onClick={() => setStep(2)} className="bg-slate-900 text-white px-16 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-4 group">
                {t.next} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white p-10 rounded-[48px] shadow-xl border border-slate-100 space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><History size={24} /></div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{t.historyExplorer}</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity size={12} className="text-blue-500" /> {t.complaints}</label>
                  <textarea rows={4} className="w-full bg-slate-50 border-2 border-transparent rounded-[32px] p-6 text-lg font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500/20 transition-all" value={patient.complaints} onChange={e => setPatient({...patient, complaints: e.target.value})} placeholder="..." />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><History size={12} className="text-teal-500" /> {t.history}</label>
                  <textarea rows={4} className="w-full bg-slate-50 border-2 border-transparent rounded-[32px] p-6 text-lg font-bold text-slate-800 outline-none focus:bg-white focus:border-teal-500/20 transition-all" value={patient.history} onChange={e => setPatient({...patient, history: e.target.value})} placeholder="..." />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Pill size={12} className="text-rose-500" /> {t.meds} & Alergi</label>
                  <textarea rows={3} className="w-full bg-slate-50 border-2 border-transparent rounded-[32px] p-6 text-lg font-bold text-slate-800 outline-none focus:bg-white focus:border-rose-500/20 transition-all" value={patient.meds} onChange={e => setPatient({...patient, meds: e.target.value})} placeholder="..." />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-10 rounded-[48px] shadow-xl border border-slate-100 space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-500"><Activity size={24} /></div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{t.vitals} Grid</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { k: 'bpSystolic', l: 'Systolic', u: 'mmHg', i: Heart, c: 'text-rose-500' },
                  { k: 'bpDiastolic', l: 'Diastolic', u: 'mmHg', i: Heart, c: 'text-rose-500' },
                  { k: 'heartRate', l: 'Pulse', u: 'bpm', i: Activity, c: 'text-blue-500' },
                  { k: 'temperature', l: 'Temp', u: '°C', i: Thermometer, c: 'text-orange-500' },
                  { k: 'spo2', l: 'O2 Sat', u: '%', i: Wind, c: 'text-teal-500' },
                  { k: 'respiratoryRate', l: 'Resp', u: '/min', i: Activity, c: 'text-indigo-500' }
                ].map(v => (
                  <div key={v.k} className="bg-slate-50 p-5 rounded-[28px] hover:bg-slate-100 transition-all">
                    <div className="flex justify-between items-start opacity-40 mb-1">
                      <v.i size={12} className={v.c} />
                      <span className="text-[8px] font-black uppercase">{v.u}</span>
                    </div>
                    <input className="w-full bg-transparent p-0 text-xl font-black text-slate-800 outline-none" value={(patient.vitals as any)[v.k]} onChange={e => handleVitalChange(v.k as any, e.target.value)} placeholder="0" />
                    <p className="text-[8px] font-black text-slate-400 uppercase mt-1">{v.l}</p>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-slate-50 space-y-6">
                <ChipGroup label={t.smokingHistory} value={patient.smoking} onChange={(v:any) => setPatient({...patient, smoking: v})} options={[{id:'None', label:t.none}, {id:'Passive', label:t.passive}, {id:'Active', label:t.active}]} />
                <ChipGroup label={t.alcoholHistory} value={patient.alcohol} onChange={(v:any) => setPatient({...patient, alcohol: v})} options={[{id:'None', label:t.none}, {id:'Occasional', label:t.occasional}, {id:'Heavy', label:t.heavy}]} />
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="p-4 text-slate-400 hover:text-slate-800 transition-all"><ChevronLeft size={24}/></button>
                <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">{t.next} LABS</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-8">
                <LabInput title={t.blood} results={patient.labBlood} setResults={v => setPatient({...patient, labBlood: v})} />
                <LabInput title={t.urine} results={patient.labUrine} setResults={v => setPatient({...patient, labUrine: v})} />
                <LabInput title={t.sputum} results={patient.labSputum} setResults={v => setPatient({...patient, labSputum: v})} />
             </div>
             <div className="space-y-8">
                <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[500px]">
                   <div className="flex items-center gap-3 mb-8"><Stethoscope size={20} className="text-teal-400" /><h4 className="text-xl font-black tracking-tight uppercase">AI DIAGNOSTIC ENGINE</h4></div>
                   <p className="text-sm opacity-60 mb-10 leading-relaxed font-medium">Analyzing subjective history, lifestyle, vitals, and laboratories via OpenAI GPT-4o Synthesis.</p>
                   <button 
                    onClick={handleAnalyze} 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-500 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 mt-10"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                     {loading ? 'PROCESSING...' : t.analyze}
                   </button>
                   <button onClick={() => setStep(2)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-all">{t.back}</button>
                </div>
             </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="space-y-10">
             <div className="bg-gradient-to-br from-blue-600 to-teal-500 p-10 rounded-[48px] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden text-white">
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
                   <div className="w-28 h-28 rounded-[40px] bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20"><AlcortexLogo size={60} /></div>
                   <div>
                      <h2 className="text-5xl font-black text-white tracking-tighter leading-tight mb-4">{result.mainDiagnosis}</h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-8">
                        <div className="flex items-center gap-2"><Activity size={16} className="text-teal-200" /><span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Confidence: <span className="text-white">{(result.confidenceScore * 100).toFixed(0)}%</span></span></div>
                        <div className="flex items-center gap-2"><ShieldAlert size={16} className="text-white/60" /><span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Severity: <span className="text-white">{result.severity}</span></span></div>
                      </div>
                   </div>
                </div>
                <button onClick={exportPDF} className="bg-white text-blue-600 p-10 rounded-[40px] shadow-2xl hover:scale-110 transition-all relative z-10">
                  <Download size={40} />
                </button>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-12 rounded-[48px] shadow-xl border border-slate-100 space-y-10">
                   <div className="flex items-center gap-4"><FileText size={24} className="text-blue-600"/><h4 className="font-black text-xl text-slate-800 uppercase tracking-tight">{t.interpretation}</h4></div>
                   <p className="text-slate-600 leading-relaxed text-xl font-medium whitespace-pre-wrap">{result.interpretation}</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-50">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Management Protocol</h5>
                        <div className="bg-blue-50/50 p-6 rounded-3xl text-sm font-bold text-slate-700">{result.followUp}</div>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Therapeutics</h5>
                        <div className="bg-teal-50/50 p-6 rounded-3xl text-sm font-bold text-slate-700">{result.medicationRecs}</div>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl">
                      <h4 className="font-black text-[10px] opacity-40 uppercase tracking-widest mb-8">Differential Stack</h4>
                      <div className="space-y-5">
                        {result.differentials.map((d, i) => (
                          <div key={i} className="p-6 bg-white/5 rounded-[32px] border border-white/10">
                             <div className="flex justify-between items-center mb-1"><span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">{d.icd10}</span><span className="text-teal-400 font-black text-sm">{(d.confidence * 100).toFixed(0)}%</span></div>
                             <p className="font-black text-md leading-tight">{d.diagnosis}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                   <button onClick={() => setStep(1)} className="w-full bg-slate-100 text-slate-400 py-6 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all">Sesi Baru</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisForm;