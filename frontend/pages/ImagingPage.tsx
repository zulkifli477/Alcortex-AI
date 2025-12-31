
import React, { useState } from 'react';
import { 
  Image as ImageIcon, Upload, Loader2, AlertTriangle, Download, CheckCircle2
} from 'lucide-react';
import { apiService } from '../services/api';
import { PatientData, DiagnosisOutput, User } from '../../types';
import { translations } from '../../translations';
import AlcortexLogo from '../../components/Logo';

const ImagingPage: React.FC<{ user: User }> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DiagnosisOutput | null>(null);
  const t = translations[user.language];

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const mockPatient: PatientData = {
        name: 'Imaging Analysis', rmNo: 'IMG-' + Date.now().toString().slice(-4), dob: '', age: 0, gender: 'Other',
        bloodType: 'Unknown', history: 'Radiology Scan requested for visual analysis.', meds: '', allergies: '',
        smoking: 'None', alcohol: 'None', activity: '', complaints: 'Analyzing radiological patterns.',
        vitals: { bpSystolic: '', bpDiastolic: '', heartRate: '', respiratoryRate: '', temperature: '', spo2: '', weight: '', height: '' },
        labBlood: [], labUrine: [], labSputum: []
      };
      
      // Mengirimkan imageUri ke API
      const res = await apiService.analyzePatient(mockPatient, user.language, image);
      setAnalysis(res);
    } catch (err) { 
      console.error(err);
      alert("Neural Vision Analysis failed. Please try a different scan."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20 animate-fade-in">
      <div className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-xl space-y-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Upload size={20}/></div>
          Radiology Intake
        </h3>
        <div className={`border-2 border-dashed rounded-[40px] h-96 flex flex-col items-center justify-center transition-all relative overflow-hidden group ${image ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200 hover:bg-slate-50'}`}>
          {image ? (
            <>
              <img src={image} className="h-full w-full object-contain p-8" alt="Clinical Scan" />
              <button onClick={() => {setImage(null); setAnalysis(null);}} className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
            </>
          ) : (
            <label className="cursor-pointer text-center p-10 w-full h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <ImageIcon size={32} className="text-slate-300" />
              </div>
              <span className="font-black text-slate-700 block uppercase tracking-widest text-xs">Upload Radiograph</span>
              <p className="text-[10px] text-slate-400 mt-2">DICOM, JPEG, OR PNG</p>
              <input type="file" className="hidden" onChange={e => {
                const reader = new FileReader();
                reader.onload = () => setImage(reader.result as string);
                if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
              }} />
            </label>
          )}
        </div>
        <button 
          onClick={handleAnalyze} 
          disabled={!image || loading} 
          className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs disabled:opacity-50 hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4"
        >
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
          {loading ? 'Processing Neural Vision...' : 'Initiate AI Scan'}
        </button>
      </div>

      <div className="space-y-8">
        {!analysis ? (
          <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-20 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-6 shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <p className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Waiting for Clinical Input</p>
            <p className="text-slate-300 text-xs mt-3 max-w-xs leading-relaxed">Scan findings will be synthesized here using Alcortex Neural V1.0</p>
          </div>
        ) : (
          <div className="bg-white p-10 md:p-12 rounded-[40px] border border-slate-100 shadow-2xl space-y-10 animate-fade-in">
            <div className="flex items-center gap-5 border-b border-slate-50 pb-8">
               <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-500/20"><AlcortexLogo size={32}/></div>
               <div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Visual Pattern Match</span>
                 <h4 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{analysis.mainDiagnosis}</h4>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
                <p className="text-2xl font-black text-blue-600">{(analysis.confidenceScore * 100).toFixed(1)}%</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Severity</p>
                <p className="text-2xl font-black text-rose-500">{analysis.severity}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Imaging Interpretation</h5>
              <p className="text-sm text-slate-500 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-3xl border border-slate-100">{analysis.interpretation}</p>
            </div>

            <div className="pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 text-teal-600">
                  <CheckCircle2 size={16}/>
                  <span className="text-[10px] font-black uppercase tracking-widest">Neural Features Verified</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagingPage;
