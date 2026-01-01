import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  IdCard, 
  Globe, 
  ArrowRight,
  Apple,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { User, Language, AuthProvider } from '../types';
import SentinelBot from '../components/SentinelBot';
import { translations } from '../translations';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [botState, setBotState] = useState<'idle' | 'typing' | 'secure' | 'success'>('idle');
  const [socialLoading, setSocialLoading] = useState<AuthProvider | null>(null);
  const [oauthModal, setOauthModal] = useState<AuthProvider | null>(null);
  const [oauthEmail, setOauthEmail] = useState('');
  const [isVerifyingOAuth, setIsVerifyingOAuth] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    professionId: '',
    language: Language.EN,
    password: '',
    confirmPassword: ''
  });

  const t = translations[formData.language];

  const generateToken = () => {
    return 'alcortex_' + btoa(Math.random().toString()).slice(0, 32);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBotState('success');
    setSocialLoading('Email');
    
    // Simulate secure validation
    setTimeout(() => {
      const user: User = {
        name: formData.name || 'Dr. Practitioner',
        email: formData.email,
        professionId: formData.professionId || 'SIP-8821',
        language: formData.language,
        provider: 'Email',
        token: generateToken()
      };
      onLogin(user);
    }, 1500);
  };

  const triggerOAuth = (provider: AuthProvider) => {
    setSocialLoading(provider);
    setBotState('secure');
    
    // Simulate opening the provider popup
    setTimeout(() => {
      setOauthModal(provider);
      setOauthEmail('');
    }, 600);
  };

  const handleOAuthLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthEmail) return;

    setIsVerifyingOAuth(true);
    setBotState('typing');

    // Simulate Provider Verification
    setTimeout(() => {
      const providerPrefix = oauthModal?.slice(0, 1) || 'X';
      const mockUser: User = {
        name: oauthEmail.split('@')[0].charAt(0).toUpperCase() + oauthEmail.split('@')[0].slice(1),
        email: oauthEmail,
        professionId: `SIP-${providerPrefix}-${Math.floor(Math.random() * 9000) + 1000}`,
        language: formData.language,
        provider: oauthModal as AuthProvider,
        token: generateToken()
      };
      
      setIsVerifyingOAuth(false);
      setOauthModal(null);
      setBotState('success');
      
      setTimeout(() => {
        onLogin(mockUser);
      }, 800);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#2dd4bf 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      
      <div className="w-full max-w-md relative mt-40">
        {/* Cyber Bear Mascot */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-56 z-20 transition-all duration-500 transform drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]">
           <SentinelBot state={botState} />
        </div>

        {/* Main Form Card */}
        <div className="relative z-10 bg-slate-900/80 backdrop-blur-3xl border border-white/10 p-8 pt-40 rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] border-b-blue-500/30">
          <div className="flex flex-col items-center mb-10 text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">
              {mode === 'login' ? t.authTitleLogin : mode === 'register' ? t.authTitleRegister : t.forgotKey}
            </h2>
            <div className="h-1 w-12 bg-blue-500 mt-2 rounded-full"></div>
            <p className="text-slate-400 text-[9px] mt-4 px-6 leading-relaxed opacity-60 font-bold uppercase tracking-widest">
              {socialLoading 
                ? `ESTABLISHING HANDSHAKE WITH ${socialLoading.toUpperCase()} CORE...`
                : (mode === 'login' ? t.authSubtitleLogin : t.authSubtitleRegister)}
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode !== 'forgot' && (
              <div className="space-y-3">
                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 transition-all outline-none font-bold"
                        placeholder={t.fullName}
                        value={formData.name}
                        onFocus={() => setBotState('typing')}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="relative group">
                      <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 transition-all outline-none font-bold"
                        placeholder="ID / STR"
                        value={formData.professionId}
                        onFocus={() => setBotState('typing')}
                        onChange={e => setFormData({...formData, professionId: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 transition-all outline-none font-bold"
                    placeholder={t.emailLabel}
                    value={formData.email}
                    onFocus={() => setBotState('typing')}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 transition-all outline-none font-bold"
                    placeholder={t.passwordLabel}
                    onFocus={() => setBotState('secure')}
                    required
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={!!socialLoading}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px] disabled:opacity-50"
            >
              {socialLoading === 'Email' ? <Loader2 size={16} className="animate-spin" /> : mode === 'login' ? t.loginBtn : t.registerBtn}
              {socialLoading !== 'Email' && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-[1px] bg-white/5 flex-1"></div>
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t.orContinueWith}</span>
            <div className="h-[1px] bg-white/5 flex-1"></div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { id: 'Google' as AuthProvider, icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )},
              { id: 'Apple' as AuthProvider, icon: <Apple size={20} className="text-white" /> },
              { id: 'Microsoft' as AuthProvider, icon: (
                <svg className="w-5 h-5" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
              )}
            ].map((prov) => (
              <button 
                key={prov.id}
                onClick={() => triggerOAuth(prov.id)}
                disabled={!!socialLoading}
                className="flex items-center justify-center p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30"
              >
                {socialLoading === prov.id ? <Loader2 size={16} className="animate-spin text-blue-400" /> : prov.icon}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
             <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
               {mode === 'login' ? t.newUser : t.existingUser} <span className="text-blue-400 ml-1">{mode === 'login' ? t.registerBtn : t.secureLogin}</span>
             </button>
          </div>
        </div>
      </div>

      {/* OAuth Handshake Modal Simulation */}
      {oauthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" />
          
          <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Gateway</span>
              </div>
              <button 
                onClick={() => { setOauthModal(null); setSocialLoading(null); setBotState('idle'); }}
                className="text-slate-300 hover:text-slate-500 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
                {oauthModal === 'Google' && (
                  <svg className="w-10 h-10" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {oauthModal === 'Apple' && <Apple size={40} className="text-slate-900" />}
                {oauthModal === 'Microsoft' && (
                  <svg className="w-10 h-10" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                )}
              </div>

              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Sign in with {oauthModal}</h3>
              <p className="text-xs text-slate-400 font-medium mb-8">Use your {oauthModal} account to access Alcortex AI.</p>

              <form onSubmit={handleOAuthLogin} className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email or phone</label>
                  <input 
                    type="text"
                    autoFocus
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter account identity"
                    value={oauthEmail}
                    onChange={(e) => setOauthEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit"
                    disabled={isVerifyingOAuth}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px] shadow-lg disabled:opacity-50"
                  >
                    {isVerifyingOAuth ? <Loader2 size={16} className="animate-spin" /> : 'Next'}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => { setOauthEmail(''); }}
                    className="w-full py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    Forgot email?
                  </button>
                </div>
              </form>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                 By continuing, {oauthModal} will share your verified metadata with Alcortex Clinical Services.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;