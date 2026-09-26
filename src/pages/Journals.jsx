import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import FileUrlInput from '../components/FileUrlInput';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  CheckCircle,
  XCircle,
  Hash,
  Globe,
  Award,
} from 'lucide-react';

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailJournal, setDetailJournal] = useState(null);

  // Form state
  const initialForm = {
    title: '',
    shortTitle: '',
    slug: '',
    field: '',
    issn: '',
    eIssn: '',
    description: '',
    frequency: 'Yiliga 4 son',
    founded: '2020',
    coverUrl: '',
    coverClass: 'journal-cover-cobalt',
    editor: '',
    country: "O'zbekiston",
    language: "O'zbek, Rus, Ingliz",
    reviewDays: 42,
    acceptanceRate: '34%',
    indexedIn: 'Google Scholar, CrossRef, DOAJ',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/journals');
      if (res.data.success) {
        setJournals(res.data.data);
      }
    } catch (err) {
      toast.error("Jurnallarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  // Handle Form open for Add/Edit
  const handleOpenAdd = () => {
    setEditingJournal(null);
    setFormData(initialForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (j) => {
    setEditingJournal(j);
    setFormData({
      title: j.title || '',
      shortTitle: j.shortTitle || '',
      slug: j.slug || '',
      field: j.field || '',
      issn: j.issn || '',
      eIssn: j.eIssn || '',
      description: j.description || '',
      frequency: j.frequency || 'Yiliga 4 son',
      founded: j.founded || '2020',
      coverUrl: j.coverUrl || '',
      coverClass: j.coverClass || 'journal-cover-cobalt',
      editor: j.editor || '',
      country: j.country || "O'zbekiston",
      language: j.language || "O'zbek, Rus, Ingliz",
      reviewDays: j.reviewDays || 42,
      acceptanceRate: j.acceptanceRate || '34%',
      indexedIn: Array.isArray(j.indexedIn) ? j.indexedIn.join(', ') : j.indexedIn || '',
      isActive: j.isActive !== undefined ? j.isActive : true,
    });
    setIsFormOpen(true);
  };

  // Form Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.shortTitle || !formData.field || !formData.issn || !formData.description) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        indexedIn: formData.indexedIn
          ? formData.indexedIn.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (editingJournal) {
        const res = await axiosClient.put(`/journals/${editingJournal._id}`, payload);
        if (res.data.success) {
          toast.success("Jurnal muvaffaqiyatli tahrirlandi!");
          setIsFormOpen(false);
          fetchJournals();
        }
      } else {
        const res = await axiosClient.post('/journals', payload);
        if (res.data.success) {
          toast.success("Yangi jurnal yaratildi!");
          setIsFormOpen(false);
          fetchJournals();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Amalni bajarishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler
  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await axiosClient.delete(`/journals/${deletingId}`);
      if (res.data.success) {
        toast.success("Jurnal muvaffaqiyatli o'chirildi");
        setIsDeleteOpen(false);
        fetchJournals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredJournals = journals.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.shortTitle.toLowerCase().includes(search.toLowerCase()) ||
      j.field.toLowerCase().includes(search.toLowerCase()) ||
      j.issn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Jurnallar Boshqaruvi"
        subtitle="Akademik jurnallar ro'yxati, yangi jurnal qo'shish va tahrirlash (CRUD)"
        onRefresh={fetchJournals}
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Jurnal nomi, soha yoki ISSN bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input w-full pl-10"
            />
          </div>

          <button onClick={handleOpenAdd} className="admin-btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Yangi Jurnal Yaratish
          </button>
        </div>

        {/* Journals Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <span className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3"></span>
            <p className="text-sm">Jurnallar yuklanmoqda...</p>
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 border border-slate-800">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">Hech qanday jurnal topilmadi</p>
            <p className="text-xs text-slate-500 mt-1">Yangi jurnal qo'shing yoki qidiruv sozlamalarini tekshiring.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJournals.map((j) => (
              <div
                key={j._id}
                className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {j.field}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        j.isActive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {j.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {j.isActive ? 'Aktiv' : 'Nofaol'}
                    </span>
                  </div>

                  <div className="flex gap-4 items-start mb-3">
                    {j.coverUrl ? (
                      <img src={j.coverUrl} alt="" className="w-14 h-20 object-cover rounded-lg border border-slate-700 shrink-0" />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-white leading-snug hover:text-indigo-400 transition">
                        {j.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        Qisqa nomi: <span className="text-slate-200">{j.shortTitle}</span>
                      </p>
                    </div>
                  </div>

                  <div className="my-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5" /> ISSN:
                      </span>
                      <span className="font-mono text-slate-200">{j.issn}</span>
                    </div>
                    {j.eIssn && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">e-ISSN:</span>
                        <span className="font-mono text-slate-200">{j.eIssn}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Bosh muharrir:</span>
                      <span className="truncate max-w-[140px] text-slate-200">{j.editor || 'Biriktirilmagan'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Taqriz vaqti:</span>
                      <span className="text-indigo-300">{j.reviewDays} kun</span>
                    </div>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setDetailJournal(j);
                      setIsDetailOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Tafsilotlar
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(j)}
                      className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(j._id)}
                      className="p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Journal Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingJournal ? "Jurnalni Tahrirlash" : "Yangi Jurnal Yaratish"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Jurnal nomi *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="masalan, Mamun Science Bulletin"
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Qisqa nomi *</label>
              <input
                type="text"
                value={formData.shortTitle}
                onChange={(e) => setFormData({ ...formData, shortTitle: e.target.value })}
                placeholder="masalan, MSB"
                className="admin-input w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Soha/Yo'nalish *</label>
              <input
                type="text"
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                placeholder="masalan, Aniq fanlar"
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ISSN *</label>
              <input
                type="text"
                value={formData.issn}
                onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                placeholder="2782-1234"
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">e-ISSN</label>
              <input
                type="text"
                value={formData.eIssn}
                onChange={(e) => setFormData({ ...formData, eIssn: e.target.value })}
                placeholder="2782-5678"
                className="admin-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Jurnal Tavsifi *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Jurnal maqsadi, qamrovi va ilmiy yo'nalishi haqida batafsil..."
              className="admin-input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nashr davriyligi</label>
              <input
                type="text"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="Yiliga 4 son"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bosh muharrir</label>
              <input
                type="text"
                value={formData.editor}
                onChange={(e) => setFormData({ ...formData, editor: e.target.value })}
                placeholder="Prof. A. Ahmedov"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Taqriz muddati (kun)</label>
              <input
                type="number"
                value={formData.reviewDays}
                onChange={(e) => setFormData({ ...formData, reviewDays: parseInt(e.target.value) || 30 })}
                className="admin-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Indekslangan bazalar (vergul bilan)</label>
              <input
                type="text"
                value={formData.indexedIn}
                onChange={(e) => setFormData({ ...formData, indexedIn: e.target.value })}
                placeholder="Google Scholar, CrossRef, DOAJ"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Muqova uslubi / rangi</label>
              <select
                value={formData.coverClass}
                onChange={(e) => setFormData({ ...formData, coverClass: e.target.value })}
                className="admin-input w-full bg-slate-900"
              >
                <option value="journal-cover-cobalt">Cobalt Blue</option>
                <option value="journal-cover-emerald">Emerald Green</option>
                <option value="journal-cover-purple">Royal Purple</option>
                <option value="journal-cover-ruby">Ruby Red</option>
              </select>
            </div>
          </div>

          <div>
            <FileUrlInput
              label="Jurnal Muqova Rasmi (Cover Image)"
              value={formData.coverUrl}
              onChange={(url) => setFormData({ ...formData, coverUrl: url })}
              placeholder="https://storage.mamun.university/..."
              accept="image/*"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-semibold text-slate-200">
              Jurnal faol (Saytda ko'rinadi)
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
              ) : editingJournal ? (
                "Saqlash"
              ) : (
                "Yaratish"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {detailJournal && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Jurnal Ma'lumotlari: ${detailJournal.shortTitle}`}
        >
          <div className="space-y-4 text-sm text-slate-300">
            <div>
              <h4 className="font-bold text-white text-lg">{detailJournal.title}</h4>
              <p className="text-xs text-indigo-400 font-semibold">{detailJournal.field}</p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {detailJournal.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">ISSN:</span>
                <span className="font-semibold text-white">{detailJournal.issn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">e-ISSN:</span>
                <span className="font-semibold text-white">{detailJournal.eIssn || 'Noyob'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Bosh muharrir:</span>
                <span className="font-semibold text-white">{detailJournal.editor || 'Belgilanmagan'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Qabul darajasi:</span>
                <span className="font-semibold text-emerald-400">{detailJournal.acceptanceRate}</span>
              </div>
            </div>

            {Array.isArray(detailJournal.indexedIn) && detailJournal.indexedIn.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Indekslangan Bazalar
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {detailJournal.indexedIn.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        message="Haqiqatan ham ushbu jurnalni va unga tegishli barcha ma'lumotlarni o'chirib tashlamoqchimisiz?"
      />
    </div>
  );
};

export default Journals;
