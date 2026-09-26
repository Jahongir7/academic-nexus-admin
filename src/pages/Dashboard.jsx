import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Layers,
  FileText,
  Inbox,
  Newspaper,
  Users,
  Eye,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    journals: 0,
    issues: 0,
    articles: 0,
    submissions: 0,
    pendingSubmissions: 0,
    news: 0,
    users: 0,
    totalViews: 0,
    totalDownloads: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [journalsRes, issuesRes, articlesRes, submissionsRes, newsRes, usersRes] = await Promise.allSettled([
        axiosClient.get('/journals'),
        axiosClient.get('/issues'),
        axiosClient.get('/articles?limit=100'),
        axiosClient.get('/submissions?limit=50'),
        axiosClient.get('/news'),
        axiosClient.get('/users'),
      ]);

      let journalsCount = journalsRes.status === 'fulfilled' ? journalsRes.value.data.total || journalsRes.value.data.count || 0 : 0;
      let issuesCount = issuesRes.status === 'fulfilled' ? issuesRes.value.data.count || 0 : 0;
      
      let articlesData = articlesRes.status === 'fulfilled' ? articlesRes.value.data.data || [] : [];
      let articlesCount = articlesRes.status === 'fulfilled' ? articlesRes.value.data.total || articlesData.length : 0;
      
      let submissionsData = submissionsRes.status === 'fulfilled' ? submissionsRes.value.data.data || [] : [];
      let submissionsCount = submissionsRes.status === 'fulfilled' ? submissionsRes.value.data.total || submissionsData.length : 0;
      let pendingCount = submissionsData.filter((s) => s.status === 'pending').length;

      let newsCount = newsRes.status === 'fulfilled' ? newsRes.value.data.total || newsRes.value.data.count || 0 : 0;
      let usersCount = usersRes.status === 'fulfilled' ? usersRes.value.data.total || usersRes.value.data.count || 0 : 0;

      let totalViews = articlesData.reduce((acc, a) => acc + (a.views || 0), 0);
      let totalDownloads = articlesData.reduce((acc, a) => acc + (a.downloads || 0), 0);

      setStats({
        journals: journalsCount,
        issues: issuesCount,
        articles: articlesCount,
        submissions: submissionsCount,
        pendingSubmissions: pendingCount,
        news: newsCount,
        users: usersCount,
        totalViews,
        totalDownloads,
      });

      setRecentSubmissions(submissionsData.slice(0, 5));
      setRecentArticles(articlesData.slice(0, 5));
    } catch (err) {
      toast.error("Dashboard ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Mock trend data for charts based on real counts
  const submissionTrend = [
    { month: 'Jan', submissions: Math.max(2, Math.floor(stats.submissions * 0.15)) },
    { month: 'Feb', submissions: Math.max(4, Math.floor(stats.submissions * 0.25)) },
    { month: 'Mar', submissions: Math.max(3, Math.floor(stats.submissions * 0.2)) },
    { month: 'Apr', submissions: Math.max(6, Math.floor(stats.submissions * 0.4)) },
    { month: 'May', submissions: Math.max(8, Math.floor(stats.submissions * 0.6)) },
    { month: 'Jun', submissions: stats.submissions || 12 },
  ];

  const categoryDistribution = [
    { name: 'Aniqlash fanlar', value: 35 },
    { name: 'Ijtimoiy-gumanitar', value: 25 },
    { name: 'Tibbiyot', value: 20 },
    { name: 'Texnika', value: 20 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4'];

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Boshqaruv Paneli (Dashboard)"
        subtitle="Ma'mun Universiteti Academic Nexus platformasi statistikasi va umumiy ko'rinish"
        onRefresh={fetchDashboardData}
      />

      <main className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Pending Action Banner */}
        {stats.pendingSubmissions > 0 && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-amber-200 text-sm">
                  {stats.pendingSubmissions} ta maqola ko'rib chiqilishini kutmoqda!
                </h4>
                <p className="text-xs text-amber-300/80">
                  Mualliflar tomonidan yuborilgan yangi ilmiy maqolalarni tekshirish va maqom tayinlash talab etiladi.
                </p>
              </div>
            </div>
            <Link
              to="/submissions"
              className="admin-btn-primary bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shrink-0 py-2 px-4 shadow-none"
            >
              Ko'rib chiqish <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Jurnallar"
            value={stats.journals}
            icon={BookOpen}
            color="indigo"
            badgeText="Aktiv jurnallar"
          />
          <StatCard
            title="Nashr qilingan Maqolalar"
            value={stats.articles}
            icon={FileText}
            color="emerald"
            badgeText={`${stats.totalViews} ko'rishlar`}
          />
          <StatCard
            title="Topshirilgan Maqolalar"
            value={stats.submissions}
            icon={Inbox}
            color="amber"
            badgeText={`${stats.pendingSubmissions} kutilmoqda`}
          />
          <StatCard
            title="Yuklab olishlar"
            value={stats.totalDownloads}
            icon={Download}
            color="cyan"
            badgeText="PDF yuklanishlar"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" /> Topshiriqlar dinamikasi
                </h3>
                <p className="text-xs text-slate-400">Oylar bo'yicha yuborilgan maqolalar dinamikasi</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                2026 yildagi holat
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={submissionTrend}>
                  <defs>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSub)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Maqolalar yo'nalishi</h3>
              <p className="text-xs text-slate-400 mb-4">Sohalar bo'yicha ulushlar</p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              {categoryDistribution.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Submissions & Articles Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-amber-400" /> Oxirgi topshirilgan maqolalar
              </h3>
              <Link to="/submissions" className="text-xs text-indigo-400 hover:underline font-semibold">
                Barchasi →
              </Link>
            </div>

            {recentSubmissions.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Topshirilgan maqolalar hozircha mavjud emas.</p>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition"
                  >
                    <div className="truncate">
                      <h4 className="text-sm font-semibold text-white truncate">{sub.articleTitle}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sub.authorName} • <span className="text-slate-500">{sub.institution}</span>
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase shrink-0 ${
                        sub.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : sub.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : sub.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Articles */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" /> Oxirgi nashr etilgan maqolalar
              </h3>
              <Link to="/articles" className="text-xs text-indigo-400 hover:underline font-semibold">
                Barchasi →
              </Link>
            </div>

            {recentArticles.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Chop etilgan maqolalar topilmadi.</p>
            ) : (
              <div className="space-y-3">
                {recentArticles.map((art) => (
                  <div
                    key={art._id}
                    className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition"
                  >
                    <div className="truncate">
                      <h4 className="text-sm font-semibold text-white truncate">{art.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {art.authors} • <span className="text-indigo-400">{art.category}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-indigo-400" /> {art.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5 text-cyan-400" /> {art.downloads || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
