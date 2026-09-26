import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import FileUrlInput from '../components/FileUrlInput';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Star,
  Calendar,
  User,
  Image as ImageIcon,
} from 'lucide-react';

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailNews, setDetailNews] = useState(null);

  // Form state
  const initialForm = {
    title: '',
    summary: '',
    content: '',
    category: 'Ilmiy tadqiqot',
    publishedDate: new Date().toISOString().split('T')[0],
    imageUrl: '',
    author: "Ma'mun Universiteti Matbuot xizmati",
    isFeatured: false,
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/news?limit=50');
      if (res.data.success) {
        setNewsList(res.data.data);
      }
    } catch (err) {
      toast.error("Yangiliklarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleOpenAdd = () => {
    setEditingNews(null);
    setFormData(initialForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title || '',
      summary: item.summary || '',
      content: item.content || '',
      category: item.category || 'Ilmiy tadqiqot',
      publishedDate: item.publishedDate
        ? new Date(item.publishedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      imageUrl: item.imageUrl || '',
      author: item.author || "Ma'mun Universiteti Matbuot xizmati",
      isFeatured: item.isFeatured || false,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.summary || !formData.content) {
      toast.error("Sarlavha, qisqa mazmun va batafsil matnni kiriting");
      return;
    }

    setSubmitting(true);
    try {
      if (editingNews) {
        const res = await axiosClient.put(`/news/${editingNews._id}`, formData);
        if (res.data.success) {
          toast.success("Yangilik tahrirlandi!");
          setIsFormOpen(false);
          fetchNews();
        }
      } else {
        const res = await axiosClient.post('/news', formData);
        if (res.data.success) {
          toast.success("Yangi yangilik chop etildi!");
          setIsFormOpen(false);
          fetchNews();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Saqlashda xatolik");
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
      const res = await axiosClient.delete(`/news/${deletingId}`);
      if (res.data.success) {
        toast.success("Yangilik o'chirildi");
        setIsDeleteOpen(false);
        fetchNews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredNews = newsList.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Yangiliklar va E'lonlar Boshqaruvi"
        subtitle="Ma'mun Universiteti ilmiy yangiliklarini joylash, tahrirlash va o'chirish (CRUD)"
        onRefresh={fetchNews}
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Yangilik sarlavhasi bo'yicha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input w-full pl-10"
            />
          </div>

          <button onClick={handleOpenAdd} className="admin-btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Yangilik Chop Etish
          </button>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <span className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Yangiliklar yuklanmoqda...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 border border-slate-800">
            <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">Hech qanday yangilik topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news) => (
              <div
                key={news._id}
                className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  {news.imageUrl && (
                    <div className="h-40 w-full overflow-hidden relative">
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                        {news.category}
                      </span>
                      {news.isFeatured && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-300" /> Muhim
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug hover:text-indigo-300 transition">
                      {news.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{news.summary}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{new Date(news.publishedDate).toLocaleDateString()}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDetailNews(news);
                        setIsDetailOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Ko'rish"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(news)}
                      className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(news._id)}
                      className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingNews ? "Yangilikni Tahrirlash" : "Yangi Yangilik Chop Etish"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Yangilik Sarlavhasi *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masalan, Xalqaro ilmiy konferensiya bo'lib o'tdi"
              className="admin-input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kategoriya</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ilmiy tadqiqot / Anjuman"
                className="admin-input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <FileUrlInput
                label="Rasm (Image URL) / Fayl yuklash"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                placeholder="https://storage.mamun.university/..."
                accept="image/*"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Qisqa Mazmuni (Summary) *</label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              rows={2}
              placeholder="Bosh sahifada ko'rinadigan qisqa matn..."
              className="admin-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Batafsil Matni (Content) *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              placeholder="Yangilikning to'liq matni..."
              className="admin-input w-full font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Muallif / Manbaa</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="admin-input w-full"
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
              id="isFeaturedCheck"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isFeaturedCheck" className="text-xs font-semibold text-slate-200">
              Asosiy yangilik (Featured - Bosh sahifada ajratib ko'rsatish)
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
              ) : editingNews ? (
                "Saqlash"
              ) : (
                "Chop Etish"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {detailNews && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Yangilik Tafsilotlari"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div>
              <span className="text-indigo-400 font-bold uppercase">{detailNews.category}</span>
              <h3 className="text-lg font-bold text-white mt-1">{detailNews.title}</h3>
              <p className="text-slate-500 mt-0.5">
                {new Date(detailNews.publishedDate).toLocaleDateString()} • {detailNews.author}
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-medium leading-relaxed">
              {detailNews.summary}
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-2">
              <h4 className="font-bold text-white text-sm">To'liq matn:</h4>
              <p className="whitespace-pre-line">{detailNews.content}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        message="Haqiqatan ham ushbu yangilikni o'chirmoqchimisiz?"
      />
    </div>
  );
};

export default News;
