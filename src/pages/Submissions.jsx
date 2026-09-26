import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import {
  Inbox,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  FileText,
  User,
  Mail,
  Phone,
  Building2,
  ExternalLink,
  MessageSquare,
  Filter,
} from 'lucide-react';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const toast = useToast();

  // Status edit modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetSub, setTargetSub] = useState(null);
  const [newStatus, setNewStatus] = useState('accepted');
  const [comments, setComments] = useState('');
  const [updating, setUpdating] = useState(false);

  // Detail modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailSub, setDetailSub] = useState(null);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let url = '/submissions?limit=100';
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const res = await axiosClient.get(url);
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      toast.error("Topshirilgan maqolalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  const handleOpenStatusModal = (sub, defaultNextStatus) => {
    setTargetSub(sub);
    setNewStatus(defaultNextStatus || sub.status);
    setComments(sub.comments || '');
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!targetSub) return;

    setUpdating(true);
    try {
      const res = await axiosClient.patch(`/submissions/${targetSub._id}/status`, {
        status: newStatus,
        comments,
      });
      if (res.data.success) {
        toast.success(`Maqola holati '${newStatus}' holatiga o'zgartirildi`);
        setIsStatusModalOpen(false);
        fetchSubmissions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Statusni o'zgartirishda xatolik");
    } finally {
      setUpdating(false);
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
      const res = await axiosClient.delete(`/submissions/${deletingId}`);
      if (res.data.success) {
        toast.success("Topshirilgan maqola so'rovi o'chirildi");
        setIsDeleteOpen(false);
        fetchSubmissions();
      }
    } catch (err) {
      toast.error("O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.articleTitle.toLowerCase().includes(search.toLowerCase()) ||
      s.authorName.toLowerCase().includes(search.toLowerCase()) ||
      s.authorEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Topshirilgan Maqolalar (Submissions)"
        subtitle="Mualliflar yuborgan maqolalarni ko'rib chiqish, taqriz qilish va maqomini o'zgartirish"
        onRefresh={fetchSubmissions}
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Maqola sarlavhasi yoki muallif bo'yicha..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input w-full pl-10"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusFilter === '' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('under_review')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusFilter === 'under_review' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setStatusFilter('accepted')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusFilter === 'accepted' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusFilter === 'rejected' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <span className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">So'rovlar yuklanmoqda...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 border border-slate-800">
            <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">Hech qanday maqola so'rovi topilmadi</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Maqola Sarlavhasi</th>
                    <th className="py-3.5 px-4">Muallif & Muassasa</th>
                    <th className="py-3.5 px-4">Jurnal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Sana</th>
                    <th className="py-3.5 px-4 text-right">Amallar & Taqriz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug">{sub.articleTitle}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{sub.category}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-100 block">{sub.authorName}</span>
                        <span className="text-[10px] text-slate-400 block">{sub.authorEmail}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                          {sub.institution}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-300">
                        {sub.journalId?.shortTitle || 'Jurnal'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border ${
                            sub.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : sub.status === 'under_review'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : sub.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setDetailSub(sub);
                              setIsDetailOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Batafsil ko'rish"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Action Status change buttons */}
                          {sub.status === 'pending' && (
                            <button
                              onClick={() => handleOpenStatusModal(sub, 'under_review')}
                              className="px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-semibold text-[11px]"
                            >
                              Taqrizga berish
                            </button>
                          )}
                          {(sub.status === 'pending' || sub.status === 'under_review') && (
                            <>
                              <button
                                onClick={() => handleOpenStatusModal(sub, 'accepted')}
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
                                title="Qabul qilish"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenStatusModal(sub, 'rejected')}
                                className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition"
                                title="Rad etish"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleOpenDelete(sub._id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-500/20 transition"
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

      {/* Change Status Modal */}
      {targetSub && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title="Maqola Maqomini O'zgartirish"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-white text-sm mb-1">{targetSub.articleTitle}</p>
              <p className="text-slate-400">Muallif: {targetSub.authorName}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Yangi holat / status *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="admin-input w-full bg-slate-900 text-sm"
              >
                <option value="pending">Pending (Kutilmoqda)</option>
                <option value="under_review">Under Review (Taqriz jarayonida)</option>
                <option value="accepted">Accepted (Qabul qilindi / Nashrga tayyor)</option>
                <option value="rejected">Rejected (Rad etildi)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tahririyat izohi / Taqrizchi xulosasi</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder="Muallifga yuboriladigan izoh va taqriz natijalari..."
                className="admin-input w-full"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="admin-btn-secondary"
                disabled={updating}
              >
                Bekor qilish
              </button>
              <button type="submit" className="admin-btn-primary" disabled={updating}>
                {updating ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Statusni Yangilash"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Submission Detail Modal */}
      {detailSub && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title="Topshirilgan Maqola Tafsilotlari"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div>
              <h3 className="text-base font-bold text-white">{detailSub.articleTitle}</h3>
              <p className="text-indigo-400 font-semibold mt-0.5">Kategoriya: {detailSub.category}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Muallif:
                </span>
                <span className="font-semibold text-white text-sm block">{detailSub.authorName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Tashkilot / OTМ:
                </span>
                <span className="font-semibold text-white block">{detailSub.institution}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email:
                </span>
                <span className="font-semibold text-slate-200 block">{detailSub.authorEmail}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Telefon:
                </span>
                <span className="font-semibold text-slate-200 block">{detailSub.authorPhone}</span>
              </div>
            </div>

            <div className="space-y-1 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-white">Annotatsiya:</h4>
              <p className="leading-relaxed text-slate-300">{detailSub.abstract}</p>
            </div>

            {detailSub.fileUrl && (
              <div className="pt-2">
                <a
                  href={detailSub.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn-primary inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Maqola Faylini Ko'rish / Yuklab Olish
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
        message="Haqiqatan ham ushbu topshirilgan maqola so'rovini o'chirmoqchimisiz?"
      />
    </div>
  );
};

export default Submissions;
