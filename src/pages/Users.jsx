import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  Building2,
  Mail,
  Lock,
  Filter,
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const toast = useToast();
  const { user: currentUser } = useAuth();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form state
  const initialForm = {
    name: '',
    email: '',
    password: '',
    role: 'author',
    institution: "Ma'mun Universiteti",
    orcid: '',
    avatarUrl: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/users?limit=100';
      if (roleFilter) url += `&role=${roleFilter}`;
      const res = await axiosClient.get(url);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData(initialForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'author',
      institution: u.institution || '',
      orcid: u.orcid || '',
      avatarUrl: u.avatarUrl || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Ism va email kiritilishi shart");
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      toast.error("Yangi foydalanuvchi uchun parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        const res = await axiosClient.put(`/users/${editingUser._id}`, formData);
        if (res.data.success) {
          toast.success("Foydalanuvchi ma'lumotlari yangilandi!");
          setIsFormOpen(false);
          fetchUsers();
        }
      } else {
        const res = await axiosClient.post('/users', formData);
        if (res.data.success) {
          toast.success("Yangi foydalanuvchi yaratildi!");
          setIsFormOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (id) => {
    if (currentUser && currentUser._id === id) {
      toast.error("O'zingizning admin hisobingizni o'chira olmaysiz");
      return;
    }
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await axiosClient.delete(`/users/${deletingId}`);
      if (res.data.success) {
        toast.success("Foydalanuvchi o'chirildi");
        setIsDeleteOpen(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.institution && u.institution.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Foydalanuvchilar va Xodimlar (Users & Staff)"
        subtitle="Platformadagi barcha foydalanuvchilar, muharrirlar va mualliflarni boshqarish (CRUD)"
        onRefresh={fetchUsers}
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ism, email yoki tashkilot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input w-full pl-10"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="admin-input w-full sm:w-48 bg-slate-900"
            >
              <option value="">Barcha rollar</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor (Muharrir)</option>
              <option value="author">Author (Muallif)</option>
              <option value="reviewer">Reviewer (Taqrizchi)</option>
            </select>
          </div>

          <button onClick={handleOpenAdd} className="admin-btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Yangi Foydalanuvchi
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <span className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Foydalanuvchilar yuklanmoqda...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 border border-slate-800">
            <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">Hech qanday foydalanuvchi topilmadi</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Foydalanuvchi</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Roli (Role)</th>
                    <th className="py-3.5 px-4">Tashkilot / OTМ</th>
                    <th className="py-3.5 px-4">Ro'yxatdan o'tgan</th>
                    <th className="py-3.5 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">{u.name}</span>
                            {u.orcid && <span className="text-[10px] text-emerald-400 font-mono">ORCID: {u.orcid}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : u.role === 'editor'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : u.role === 'reviewer'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">{u.institution || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(u._id)}
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

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingUser ? "Foydalanuvchini Tahrirlash" : "Yangi Foydalanuvchi Yaratish"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ism-Sharif *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Prof. Jamshid Karimov"
              className="admin-input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Manzili *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@mamun.edu.uz"
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tizimdag Roli (Role) *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="admin-input w-full bg-slate-900"
              >
                <option value="author">Author (Muallif)</option>
                <option value="editor">Editor (Muharrir)</option>
                <option value="reviewer">Reviewer (Taqrizchi)</option>
                <option value="admin">Admin (Administrator)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Parol {editingUser && "(Faqat o'zgartirmoqchi bo'lsangiz kiriting)"}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="admin-input w-full"
              required={!editingUser}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tashkilot / Muassasa</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="Ma'mun Universiteti"
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ORCID ID</label>
              <input
                type="text"
                value={formData.orcid}
                onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                placeholder="0000-0002-1825-0097"
                className="admin-input w-full"
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
              ) : editingUser ? (
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
        message="Haqiqatan ham ushbu foydalanuvchini o'chirmoqchimisiz?"
      />
    </div>
  );
};

export default Users;
