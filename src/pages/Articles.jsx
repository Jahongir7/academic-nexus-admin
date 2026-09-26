import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import FileUrlInput from '../components/FileUrlInput';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Download,
  ExternalLink,
  BookOpen,
  Filter,
  User,
  Hash,
} from 'lucide-react';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [journals, setJournals] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedJournal, setSelectedJournal] = useState('');

  const toast = useToast();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailArticle, setDetailArticle] = useState(null);

  // Form state
  const initialForm = {
    journalId: '',
    issueId: '',
    title: '',
    authors: '',
    pages: '10-25',
    category: 'Ilmiy tadqiqot',
    abstract: '',
    keywords: 'Matematika, Fizika, Algoritm',
    doi: '10.5281/zenodo.123456',
    pdfUrl: 'https://example.com/sample.pdf',
    status: 'published',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchJournalsAndIssues = async () => {
    try {
      const [jRes, iRes] = await Promise.all([axiosClient.get('/journals'), axiosClient.get('/issues')]);
      if (jRes.data.success) setJournals(jRes.data.data);
      if (iRes.data.success) setIssues(iRes.data.data);
    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/articles?limit=100');
      if (res.data.success) {
        setArticles(res.data.data);
      }
    } catch (err) {
      toast.error("Maqolalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalsAndIssues();
    fetchArticles();
  }, []);

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormData({
      ...initialForm,
      journalId: selectedJournal || (journals[0] ? journals[0]._id : ''),
      issueId: issues[0] ? issues[0]._id : '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (art) => {
    setEditingArticle(art);
    setFormData({
      journalId: art.journalId?._id || art.journalId || '',
      issueId: art.issueId?._id || art.issueId || '',
      title: art.title || '',
      authors: art.authors || '',
      pages: art.pages || '',
      category: art.category || '',
      abstract: art.abstract || '',
      keywords: Array.isArray(art.keywords) ? art.keywords.join(', ') : art.keywords || '',
      doi: art.doi || '',
      pdfUrl: art.pdfUrl || '',
      status: art.status || 'published',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.journalId ||
      !formData.issueId ||
      !formData.title ||
      !formData.authors ||
      !formData.abstract ||
      !formData.pdfUrl
    ) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        keywords: formData.keywords
          ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
      };

      if (editingArticle) {
        const res = await axiosClient.put(`/articles/${editingArticle._id}`, payload);
        if (res.data.success) {
          toast.success("Maqola tahrirlandi!");
          setIsFormOpen(false);
          fetchArticles();
        }
      } else {
        const res = await axiosClient.post('/articles', payload);
        if (res.data.success) {
          toast.success("Yangi maqola nashr qilindi!");
          setIsFormOpen(false);
          fetchArticles();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
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
      const res = await axiosClient.delete(`/articles/${deletingId}`);
      if (res.data.success) {
        toast.success("Maqola muvaffaqiyatli o'chirildi");
        setIsDeleteOpen(false);
        fetchArticles();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredArticles = articles.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.authors.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchJournal = selectedJournal ? (a.journalId?._id || a.journalId) === selectedJournal : true;
    return matchSearch && matchJournal;
  });

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Maqolalar Boshqaruvi (Articles)"
        subtitle="Chop etilgan ilmiy maqolalar ro'yxati, yangi maqola chop etish va tahrirlash (CRUD)"
        onRefresh={fetchArticles}
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Actions & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Sarlavha, muallif, kategoriya..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input w-full pl-10"
              />
            </div>

            <div className="relative w-full sm:w-60">
              <select
                value={selectedJournal}
                onChange={(e) => setSelectedJournal(e.target.value)}
                className="admin-input w-full bg-slate-900"
              >
                <option value="">Barcha jurnallar</option>
                {journals.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.shortTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={handleOpenAdd} className="admin-btn-primary w-full md:w-auto shrink-0">
            <Plus className="w-4 h-4" /> Yangi Maqola Qo'shish
          </button>
        </div>

        {/* Articles Table */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <span className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Maqolalar yuklanmoqda...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 border border-slate-800">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">Hech qanday maqola topilmadi</p>
            <p className="text-xs text-slate-500 mt-1">Qidiruv mezonlarini o'zgartiring yoki yangi maqola chop eting.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Maqola Sarlavhasi</th>
                    <th className="py-3.5 px-4">Mualliflar</th>
                    <th className="py-3.5 px-4">Jurnal & Son</th>
                    <th className="py-3.5 px-4">Kategoriya</th>
                    <th className="py-3.5 px-4 text-center">Statistika</th>
                    <th className="py-3.5 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredArticles.map((art) => (
                    <tr key={art._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug">{art.title}</h4>
                        {art.doi && <span className="text-[10px] text-slate-500 font-mono">DOI: {art.doi}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-200 block truncate max-w-[160px]">{art.authors}</span>
                        <span className="text-[10px] text-slate-500">Sahifalar: {art.pages}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold">
                          {art.journalId?.shortTitle || 'Jurnal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-emerald-400">{art.category}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-3 text-slate-400">
                          <span className="flex items-center gap-1" title="Ko'rishlar">
                            <Eye className="w-3.5 h-3.5 text-indigo-400" /> {art.views || 0}
                          </span>
                          <span className="flex items-center gap-1" title="Yuklanmalar">
                            <Download className="w-3.5 h-3.5 text-cyan-400" /> {art.downloads || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setDetailArticle(art);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Ko'rish"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(art)}
                            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(art._id)}
                            className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingArticle ? "Maqolani Tahrirlash" : "Yangi Maqola Chop Etish"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tegishli Son (Issue) *</label>
              <select
                value={formData.issueId}
                onChange={(e) => setFormData({ ...formData, issueId: e.target.value })}
                className="admin-input w-full bg-slate-900"
                required
              >
                <option value="">Son/Jildni tanlang...</option>
                {issues
                  .filter((i) => !formData.journalId || (i.journalId?._id || i.journalId) === formData.journalId)
                  .map((i) => (
                    <option key={i._id} value={i._id}>
                      Volume {i.volume} ({i.year})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Maqola Sarlavhasi *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masalan, Zamonaviy sun'iy intellekt texnologiyalarining ilmiy tahlili"
              className="admin-input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mualliflar ismi-sharifi *</label>
              <input
                type="text"
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                placeholder="A. Karimov, B. Alimov"
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sahifalar oralig'i *</label>
              <input
                type="text"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                placeholder="12-28"
                className="admin-input w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kategoriya *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ilmiy tadqiqot / Texnika"
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">DOI kodi</label>
              <input
                type="text"
                value={formData.doi}
                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                placeholder="10.5281/zenodo.123456"
                className="admin-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Annotatsiya (Abstract) *</label>
            <textarea
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              rows={4}
              placeholder="Maqolaning qisqacha mazmuni va ilmiy xulosasi..."
              className="admin-input w-full"
              required
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kalit so'zlar (vergul bilan)</label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Algoritm, Model, Tahlil"
                className="admin-input w-full"
              />
            </div>
            <div>
              <FileUrlInput
                label="Maqola PDF Fayli / Havola"
                value={formData.pdfUrl}
                onChange={(url) => setFormData({ ...formData, pdfUrl: url })}
                placeholder="https://storage.mamun.university/..."
                accept=".pdf,.doc,.docx"
                required
              />
            </div>
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
              ) : editingArticle ? (
                "Saqlash"
              ) : (
                "Chop Etish"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {detailArticle && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Maqola Batafsil Ma'lumotlari"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div>
              <h3 className="text-base font-bold text-white leading-snug">{detailArticle.title}</h3>
              <p className="text-indigo-400 font-medium mt-1">Mualliflar: {detailArticle.authors}</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-200">Annotatsiya:</h4>
              <p className="leading-relaxed text-slate-300">{detailArticle.abstract}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Kategoriya:</span>
                <span className="font-semibold text-white">{detailArticle.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sahifalar:</span>
                <span className="font-semibold text-white">{detailArticle.pages}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ko'rishlar:</span>
                <span className="font-semibold text-indigo-400">{detailArticle.views || 0}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Yuklanmalar:</span>
                <span className="font-semibold text-cyan-400">{detailArticle.downloads || 0}</span>
              </div>
            </div>

            {detailArticle.pdfUrl && (
              <div className="pt-2">
                <a
                  href={detailArticle.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn-primary inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> PDF Hujjatni Ochish
                </a>
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
        message="Haqiqatan ham ushbu maqolani o'chirmoqchimisiz?"
      />
    </div>
  );
};

export default Articles;
