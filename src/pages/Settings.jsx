import React, { useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axiosClient from '../api/axiosClient';
import { User, ShieldCheck, Database, Server, Key, Save } from 'lucide-react';

const Settings = () => {
  const { user, login } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [orcid, setOrcid] = useState(user?.orcid || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const payload = { name, email, institution, orcid };
      if (password) payload.password = password;

      const res = await axiosClient.put(`/users/${user._id}`, payload);
      if (res.data.success) {
        toast.success("Profil ma'lumotlaringiz yangilandi!");
        localStorage.setItem('academic_nexus_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Profilni yangilashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Tizim Sozlamalari & Admin Profili"
        subtitle="Administrator profilini va platforma backend ulagichlarini boshqarish"
      />

      <main className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Admin Profile Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Administrator Profili</h3>
              <p className="text-xs text-slate-400">Shaxsiy ma'lumotlar va parolni tahrirlash</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ism-Sharif</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Manzil</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tashkilot / Universitet</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">ORCID ID</label>
                <input
                  type="text"
                  value={orcid}
                  onChange={(e) => setOrcid(e.target.value)}
                  className="admin-input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Yangi Parol (Agar o'zgartirmoqchi bo'lsangiz)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Yangi parol..."
                className="admin-input w-full max-w-md"
              />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="admin-btn-primary">
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Profilni Saqlash
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* System & API Status */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Tizim va Server Sozlamalari</h3>
              <p className="text-xs text-slate-400">Backend API integratsiyasi va MongoDB ma'lumotlar bazasi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                REST API Ulagich (Base URL)
              </span>
              <p className="font-mono text-indigo-300 font-bold">http://localhost:5000/api/v1</p>
              <p className="text-slate-400 text-[11px]">
                Backend Express.js serveriga biriktirilgan va CORS xavfsizlik protokoli faol.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                Ma'lumotlar Bazasi (MongoDB)
              </span>
              <p className="font-mono text-emerald-400 font-bold">MongoDB Atlas Cloud Cluster</p>
              <p className="text-slate-400 text-[11px]">
                Academic Nexus MongoDB Atlas bazasiga muvaffaqiyatli ulangan.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
