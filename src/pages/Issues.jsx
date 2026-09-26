import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Star,
  Calendar,
  BookOpen,
  FileText,
  Filter,
} from 'lucide-react';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const initialForm = {
    journalId: '',
    volume: '',
    season: '1-son',
    year: new Date().getFullYear(),
    articlesCount: 0,
    isCurrent: false,
    publishedDate: new Date().toISOString().split('T')[0],
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchJournals = async () => {
    try {
      const res = await axiosClient.get('/journals');
      if (res.data.success) {
        setJournals(res.data.data);
      }
    } catch (err) {
      toast.error("Jurnallarni yuklashda xatolik");
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      let url = '/issues';
      if (selectedJournal) {
        url = `/issues/journal/${selectedJournal}`;
      }
      const res = await axiosClient.get(url);
      if (res.data.success) {
        setIssues(res.data.data);
      }
    } catch (err) {
      toast.error("Jildlar va sonlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [selectedJournal]);

  const handleOpenAdd = () => {
    setEditingIssue(null);
    setFormData({
      ...initialForm,
      journalId: selectedJournal || (journals[0] ? journals[0]._id : ''),
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (issue) => {
    setEditingIssue(issue);
    setFormData({
      journalId: issue.journalId?._id || issue.journalId || '',
      volume: issue.volume || '',
      season: issue.season || '',
      year: issue.year || new Date().getFullYear(),
      articlesCount: issue.articlesCount || 0,
      isCurrent: issue.isCurrent || false,
      publishedDate: issue.publishedDate
        ? new Date(issue.publishedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.journalId || !formData.volume || !formData.year) {
      toast.error("Jurnal, Jild/Son va Yil ma'lumotlarini kiriting");
      return;
    }

    setSubmitting(true);
    try {
      if (editingIssue) {
        const res = await axiosClient.put(`/issues/${editingIssue._id}`, formData);
        if (res.data.success) {
          toast.success("Son ma'lumoti tahrirlandi!");
          setIsFormOpen(false);
          fetchIssues();
        }
      } else {
        const res = await axiosClient.post('/issues', formData);
        if (res.data.success) {
          toast.success("Yangi son yaratildi!");
          setIsFormOpen(false);
          fetchIssues();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Saqlashda xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetCurrent = async (id) => {
    try {
      const res = await axiosClient.put(`/issues/${id}/set-current`);
      if (res.data.success) {
        toast.success("Joriy nashr deb belgilandi!");
        fetchIssues();
      }
    } catch (err) {
      toast.error("Joriy deb belgilashda xatolik");
    }
  };

  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await axiosClient.delete(`/issues/${deletingId}`);
      if (res.data.success) {
        toast.success("Son o'chirildi");
        setIsDeleteOpen(false);
        fetchIssues();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Jurnal Jildlari va Sonlari (Issues)"
        subtitle="Jurnallarning har bir sonini yaratish, tahrirlash va joriy nashr etib belgilash (CRUD)"
        onRefresh={fetchIssues}
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Filter & Action controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-80">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedJournal}
              onChange={(e) => setSelectedJournal(e.target.value)}
              className="admin-input w-full bg-slate-900"
            >
              <option value="">Barcha jurnallar</option>
              {journals.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} ({j.shortTitle})
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleOpenAdd} className="admin-btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Yangi Son Yaratish
          </button>
        </div>

        {/* Issues List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <span className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Jurnal sonlari yuklanmoqda...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 border border-slate-800">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">Hech qanday jurnal soni topilmadi</p>
            <p className="text-xs text-slate-500 mt-1">Yangi jild yoki son yaratish tugmasini bosing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => {
              const journalObj =
                typeof issue.journalId === 'object'
                  ? issue.journalId
                  : journals.find((j) => j._id === issue.journalId);

              return (
                <div
                  key={issue._id}
                  className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition ${
                    issue.isCurrent
                      ? 'border-indigo-500/60 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-indigo-400 truncate max-w-[180px]">
                        {journalObj?.title || 'Jurnal'}
                      </span>
                      {issue.isCurrent ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Star className="w-3 h-3 fill-emerald-300" /> Joriy Nashr
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetCurrent(issue._id)}
                          className="text-[11px] text-slate-400 hover:text-indigo-300 underline font-medium"
                        >
                          Joriy qilish
                        </button>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Volume {issue.volume} {issue.season && `(${issue.season})`}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {issue.year} yil
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" /> {issue.articlesCount || 0} maqola
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Sana: {new Date(issue.publishedDate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(issue)}
                        className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(issue._id)}
                        className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingIssue ? "Son/Jildni Tahrirlash" : "Yangi Son/Jild Yaratish"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tegishli Jurnal *</label>
            <select
              value={formData.journalId}
              onChange={(e) => setFormData({ ...formData, journalId: e.target.value })}
              className="admin-input w-full bg-slate-900"
              required
            >
              <option value="">Jurnalni tanlang...</option>
              {journals.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} ({j.shortTitle})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Jild/Son ma'lumoti (Volume) *</label>
              <input
                type="text"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                placeholder="masalan, Vol 12, Issue 1"
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mavsum/Qism (Season)</label>
              <input
                type="text"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                placeholder="masalan, Bahor / 1-son"
                className="admin-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chop etilgan yil *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2026 })}
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chop etilgan sana</label>
              <input
                type="date"
                value={formData.publishedDate}
                onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                className="admin-input w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isCurrentCheck"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isCurrentCheck" className="text-xs font-semibold text-slate-200">
              Jurnalning Joriy Nashri (Current Issue) deb belgilash
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="admin-btn-secondary"
              disabled={submitting}
            >
              Bekor qilish
            </button>
            <button type="submit" className="admin-btn-primary" disabled={submitting}>
              {submitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : editingIssue ? (
                "Saqlash"
              ) : (
                "Yaratish"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        message="Haqiqatan ham ushbu jurnal sonini o'chirmoqchimisiz?"
      />
    </div>
  );
};

export default Issues;
