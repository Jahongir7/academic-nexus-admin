import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@mamun.edu.uz');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success(`Xush kelibsiz, ${result.user.name}!`);
      navigate('/');
    } else {
      toast.error(result.message || "Tizimga kirishda xatolik");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl relative z-10 border border-slate-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-4">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Academic Nexus</h1>
          <p className="text-xs text-indigo-300 font-semibold mt-1 uppercase tracking-widest">
            Ma'mun Universiteti Admin Paneli
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Boshqaruv tizimiga kirish uchun login va parolingizni kiriting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email manzil</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mamun.edu.uz"
                className="admin-input w-full pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Parol</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="admin-input w-full pl-10"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary w-full justify-center py-3 text-sm rounded-xl font-bold"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Tizimga kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo credentials helper */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Demo kirish ma'lumotlari:
          </p>
          <div className="bg-slate-950/60 p-3 rounded-xl space-y-1 font-mono text-[11px] border border-slate-800">
            <p>
              <span className="text-indigo-400">Admin:</span> admin@mamun.edu.uz / admin123456
            </p>
            <p>
              <span className="text-cyan-400">Editor:</span> editor@mamun.edu.uz / editor123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
