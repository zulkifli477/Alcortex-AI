import React, { useState } from 'react';
import { 
  Image as ImageIcon, Upload, Cpu, CheckCircle2, Loader2, AlertTriangle
} from 'lucide-react';
import { apiService } from '../frontend/services/api';
import { PatientData, DiagnosisOutput, User } from '../types';
import { translations } from '../translations';
import AlcortexLogo from '../components/Logo';

interface ImagingPageProps {
  user: User;
}

const ImagingPage: React.FC<ImagingPageProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DiagnosisOutput | null>(null);
  const t = translations[user.language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const mockPatient: PatientData = {
        name: 'Imaging Analysis', rmNo: 'IMG-' + Date.now(), dob: '', age: 0, gender: 'Other',
        bloodType: 'Unknown', history: 'Visual imaging analysis requested.', meds: '', allergies: '',
        smoking: 'None', alcohol: 'None', activity: '', complaints: 'Radiological findings analysis.',
        vitals: { bpSystolic: '', bpDiastolic: '', heartRate: '', respiratoryRate: '', temperature: '', spo2: '', weight: '', height: '' },
        labBlood: [], labUrine: [], labSputum: []
      };
      
      // Menggunakan apiService yang terhubung ke OpenAI GPT-4o Vision di backend
      const res = await apiService.analyzePatient(mockPatient, user.language, image);
      setAnalysis(res);
    } catch (err) {
      alert("Imaging analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Upload size={20} />
            </div>
            {t.radiologyIntake}
          </h3>
          
          <div className={`relative border-2 border-dashed rounded-[40px] h-96 flex flex-col items-center justify-center transition-all ${image ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
            {image ? (
              <>
                <img src={image} alt="preview" className="h-full w-full object-contain p-6" />
                <button onClick={() => setImage(null)} className="absolute top-6 right-6 bg-rose-500 text-white p-3 rounded-2xl shadow-xl hover:bg-rose-600 transition-colors">&times;</button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center p-10 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6"><ImageIcon size={32} className="text-slate-300" /></div>
                <span className="text-slate-800 font-bold text-lg">{t.uploadRadiograph}</span>
                <span className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-medium">{t.scanSupport}</span>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            )}
          </div>

          <button disabled={!image || loading} onClick={handleAnalyze} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black flex items-center justify-center gap-4 hover:shadow-2xl transition-all uppercase tracking-widest text-sm">
            {loading ? <Loader2 className="animate-spin" /> : <AlcortexLogo size={20} />}
            {loading ? t.processingVision : t.initiateScan}
          </button>
        </div>

        <div className="space-y-8">
          {!analysis ? (
             <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm"><AlertTriangle size={32} className="text-slate-200" /></div>
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t.waitingInput}</h4>
                <p className="text-slate-300 text-sm mt-3">{t.waitingInputDesc}</p>
             </div>
          ) : (
            <div className="animate-fade-in space-y-8">
               <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{t.visualDiagnostic}</span>
                  <h3 className="text-3xl font-black mt-4 tracking-tight">{analysis.mainDiagnosis}</h3>
                  <div className="flex gap-6 mt-10">
                    <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/5">
                      <p className="text-[10px] opacity-60 font-black uppercase">{t.confidence}</p>
                      <p className="text-xl font-black text-teal-300">{(analysis.confidenceScore * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/5">
                      <p className="text-[10px] opacity-60 font-black uppercase">{t.severity}</p>
                      <p className="text-xl font-black text-blue-300">{analysis.severity}</p>
                    </div>
                  </div>
               </div>
               <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">{t.imagingInterpretation}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{analysis.interpretation}</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagingPage;