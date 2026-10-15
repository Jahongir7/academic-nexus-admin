import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import FileUrlInput from '../components/FileUrlInput';
import CreatableSelect from '../components/CreatableSelect';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import {
  FolderArchive,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Globe,
  FileText,
  Search,
  ExternalLink,
  Download,
  Eye,
  Sparkles,
  Tag,
} from 'lucide-react';

const EVENT_TYPE_OPTIONS = ['respublika', 'xalqaro'];

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');

  const toast = useToast();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const initialForm = {
    title: '',
    eventLocation: '',
    eventDate: '',
    eventType: 'respublika',
    doi: '',
    description: '',
    fileUrl: '',
    coverImage: '',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  // Fetch collections
  const fetchCollections = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedEventType && selectedEventType !== 'all') params.eventType = selectedEventType;
      params.all = 'true';

      const res = await axiosClient.get('/collections', { params });
      if (res.data.success) {
        setCollections(res.data.data || []);
      }
    } catch (err) {
      toast.error("To'plamlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCollections();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedEventType]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingCollection(null);
    setFormData(initialForm);
    setIsFormOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (col) => {
    setEditingCollection(col);
    setFormData({
      title: col.title || '',
      eventLocation: col.eventLocation || '',
      eventDate: col.eventDate || '',
      eventType: col.eventType || 'respublika',
      doi: col.doi || '',
      description: col.description || '',
      fileUrl: col.fileUrl || '',
      coverImage: col.coverImage || '',
      isActive: col.isActive !== undefined ? col.isActive : true,
    });
    setIsFormOpen(true);
  };

  // Submit form (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.warning("To'plam sarlavhasi kiritilishi shart");
    }
    if (!formData.eventType.trim()) {
      return toast.warning("Kategoriya (tadbir shakli) tanlanishi shart");
    }
    if (!formData.eventLocation.trim()) {
      return toast.warning("O'tkazilgan joyi kiritilishi shart");
    }
    if (!formData.eventDate.trim()) {
      return toast.warning("O'tkazilgan vaqti kiritilishi shart");
    }
    if (!formData.fileUrl.trim()) {
      return toast.warning("To'plam fayli yuklanishi shart");
    }

    setSubmitting(true);
    try {
      if (editingCollection) {
        const res = await axiosClient.put(`/collections/${editingCollection._id}`, formData);
        if (res.data.success) {
          toast.success("To'plam muvaffaqiyatli yangilandi");
          setIsFormOpen(false);
          fetchCollections();
        }
      } else {
        const res = await axiosClient.post('/collections', formData);
        if (res.data.success) {
          toast.success("Yangi to'plam yaratildi");
          setIsFormOpen(false);
          fetchCollections();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Amalni bajarishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete modal
  const handleOpenDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await axiosClient.delete(`/collections/${deletingId}`);
      if (res.data.success) {
        toast.success("To'plam o'chirildi");
        setIsDeleteOpen(false);
        setDeletingId(null);
        fetchCollections();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getEventTypeLabel = (type) => {
    if (type === 'xalqaro') return 'Xalqaro';
    if (type === 'respublika') return 'Respublika';
    return type;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-indigo-400" />
            To'plamlar
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Ilmiy anjuman va konferensiyalar to'plamlari boshqaruvi</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition duration-150"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi to'plam qo'shish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="To'plam sarlavhasi, joyi, izoh bo'yicha qidiruv..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Kategoriya (eventType) Filter */}
        <div className="md:col-span-4 relative">
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer appearance-none"
          >
            <option value="all">Barcha kategoriyalar</option>
            <option value="respublika">Respublika miqyosida</option>
            <option value="xalqaro">Xalqaro miqyosida</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <span className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs font-medium">To'plamlar yuklanmoqda...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <FolderArchive className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-300">To'plamlar topilmadi</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hozircha hech qanday to'plam kiritilmagan yoki qidiruvingiz bo'yicha mos natija yo'q.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi to'plam qo'shish</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">To'plam sarlavhasi</th>
                  <th className="px-4 py-3.5">Kategoriya</th>
                  <th className="px-4 py-3.5">Joyi & Vaqti</th>
                  <th className="px-4 py-3.5">Fayl & DOI</th>
                  <th className="px-4 py-3.5 text-center">Statistika</th>
                  <th className="px-5 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {collections.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition">
                    {/* Title */}
                    <td className="px-5 py-4 max-w-xs sm:max-w-md">
                      <div className="flex items-start gap-3">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt=""
                            className="w-10 h-13 object-cover rounded border border-slate-700 shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-12 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                            <FolderArchive className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm line-clamp-2">{item.title}</p>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Kategoriya (eventType) */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {item.eventType === 'xalqaro' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <Globe className="w-3 h-3" />
                          Xalqaro
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Sparkles className="w-3 h-3" />
                          Respublika
                        </span>
                      )}
                    </td>

                    {/* Location & Date */}
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{item.eventLocation}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{item.eventDate}</span>
                        </div>
                      </div>
                    </td>

                    {/* File & DOI */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {item.fileUrl && (
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Faylni ochish</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {item.doi && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                            DOI: {item.doi}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3 text-slate-400">
                        <span className="flex items-center gap-1" title="Ko'rishlar">
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          {item.views || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Yuklab olishlar">
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          {item.downloads || 0}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal (Add / Edit) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCollection ? "To'plamni tahrirlash" : "Yangi to'plam qo'shish"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sarlavhasi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Sarlavhasi <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masalan: Raqamli iqtisodiyot va innovatsion texnologiyalar konferensiyasi materiallari"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Kategoriya (eventType) — CreatableSelect */}
          <CreatableSelect
            label="Kategoriya (Tadbir shakli)"
            options={EVENT_TYPE_OPTIONS}
            value={formData.eventType}
            onChange={(val) => setFormData({ ...formData, eventType: val })}
            placeholder="Tanlang yoki yangi kiriting (respublika, xalqaro)"
            required
          />

          {/* O'tkazilgan joyi va O'tkazilgan vaqti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                O'tkazilgan joyi <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.eventLocation}
                  onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                  placeholder="Masalan: Urganch shahri, Ma'mun Universiteti"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                O'tkazilgan vaqti <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  placeholder="Masalan: 2024-yil 25-oktyabr yoki 2024-10-25"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* DOI */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              DOI (Raqamli identifikator, ixtiyoriy)
            </label>
            <input
              type="text"
              value={formData.doi}
              onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
              placeholder="Masalan: 10.5281/zenodo.1234567"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Izoh */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Izoh (To'plam tavsifi yoki annotatsiyasi)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="To'plam haqida qisqacha izoh yoki yo'nalishlar..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>

          {/* Fayl (FileUrlInput) */}
          <FileUrlInput
            label="To'plam fayli (PDF / DOC)"
            value={formData.fileUrl}
            onChange={(val) => setFormData({ ...formData, fileUrl: val })}
            placeholder="Faylni yuklang yoki havola kiriting (https://...)"
            required
            folder="collections_doc"
            prefix="col"
            accept=".pdf,.doc,.docx"
          />

          {/* Muqova rasmi (FileUrlInput) */}
          <FileUrlInput
            label="Muqova rasmi (ixtiyoriy)"
            value={formData.coverImage}
            onChange={(val) => setFormData({ ...formData, coverImage: val })}
            placeholder="Muqova rasmini yuklang yoki havola kiriting"
            required={false}
            folder="collections_cover"
            prefix="col_cover"
            accept="image/*"
          />

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              {submitting && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{editingCollection ? "O'zgarishlarni saqlash" : "Yaratish"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="To'plamni o'chirish"
        message="Haqiqatan ham ushbu to'plamni o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
        loading={deleteLoading}
      />
    </div>
  );
};

export default Collections;
