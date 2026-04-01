import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import AppLayout from '../components/AppLayout';
import { Shield, Users, Search, ChevronDown, UserCheck, UserX } from 'lucide-react';

const ROLE_COLORS = {
  admin: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  analyst: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  viewer: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' },
};

const STATUS_COLORS = {
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  inactive: { bg: 'bg-red-500/15', text: 'text-red-400' },
};

const AdminPanel = () => {
  const { user, checkingAuth } = useAuth();
  const { isDark, t } = useTheme();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (!checkingAuth && (!user || user.role !== 'admin')) {
      navigate('/dashboard');
      toast.error('Access denied. Admin privileges required.');
    }
  }, [user, checkingAuth, navigate]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);

      const res = await axios.get(`/api/v1/users?${params.toString()}`, { withCredentials: true });
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterRole, filterStatus]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [fetchUsers, user]);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === user._id) {
      toast.error("You can't change your own role");
      return;
    }
    setUpdatingUser(userId);
    try {
      await axios.patch(`/api/v1/users/${userId}/role`, { role: newRole }, { withCredentials: true });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    if (userId === user._id) {
      toast.error("You can't change your own status");
      return;
    }
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setUpdatingUser(userId);
    try {
      await axios.patch(`/api/v1/users/${userId}/status`, { status: newStatus }, { withCredentials: true });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingUser(null);
    }
  };

  if (checkingAuth || !user || user.role !== 'admin') {
    return (
      <div className={`min-h-screen ${t.background} flex items-center justify-center`}>
        <div className="animate-shimmer w-16 h-16 rounded-xl" />
      </div>
    );
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    analysts: users.filter(u => u.role === 'analyst').length,
    viewers: users.filter(u => u.role === 'viewer').length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  };

  return (
    <AppLayout>
      {/* ── Page Header ── */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-7 h-7 text-purple-400" />
          <h1 className={`text-3xl font-bold ${t.text.primary} tracking-tight`}>
            Admin Panel
          </h1>
        </div>
        <p className={`${t.text.secondary} text-sm mt-1`}>
          Manage users, roles, and access control
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-white' },
          { label: 'Admins', value: stats.admins, color: 'text-purple-400' },
          { label: 'Analysts', value: stats.analysts, color: 'text-blue-400' },
          { label: 'Viewers', value: stats.viewers, color: 'text-gray-400' },
          { label: 'Active', value: stats.active, color: 'text-emerald-400' },
          { label: 'Inactive', value: stats.inactive, color: 'text-red-400' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`${t.card} border rounded-xl p-4 animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <p className={`text-xs ${t.text.muted} uppercase tracking-wider`}>{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1 text-tabular`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className={`${t.card} border rounded-xl p-4 mb-6 animate-fade-in-up`} style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.text.muted}`} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${t.input} w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`${t.input} px-3 py-2.5 rounded-lg border text-sm focus:outline-none cursor-pointer`}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${t.input} px-3 py-2.5 rounded-lg border text-sm focus:outline-none cursor-pointer`}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className={`${t.card} border rounded-xl overflow-hidden animate-fade-in-up`} style={{ animationDelay: '0.15s' }}>
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-shimmer w-full h-64 rounded-lg" />
          </div>
        ) : users.length === 0 ? (
          <div className={`text-center py-12 ${t.text.muted}`}>
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No users found matching your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'bg-[#0B0E13]/60' : 'bg-gray-50'}>
                  <th className={`text-left px-6 py-3.5 text-xs font-medium uppercase tracking-wider ${t.text.muted}`}>User</th>
                  <th className={`text-left px-6 py-3.5 text-xs font-medium uppercase tracking-wider ${t.text.muted}`}>Role</th>
                  <th className={`text-left px-6 py-3.5 text-xs font-medium uppercase tracking-wider ${t.text.muted}`}>Status</th>
                  <th className={`text-left px-6 py-3.5 text-xs font-medium uppercase tracking-wider ${t.text.muted}`}>Joined</th>
                  <th className={`text-right px-6 py-3.5 text-xs font-medium uppercase tracking-wider ${t.text.muted}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {users.map((u, i) => {
                  const isSelf = u._id === user._id;
                  const roleColor = ROLE_COLORS[u.role] || ROLE_COLORS.viewer;
                  const statusColor = STATUS_COLORS[u.status] || STATUS_COLORS.active;

                  return (
                    <tr
                      key={u._id}
                      className={`transition-colors duration-150 ${isDark ? 'hover:bg-[#1A1D23]/60' : 'hover:bg-gray-50/80'} ${updatingUser === u._id ? 'opacity-50' : ''}`}
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${roleColor.bg} ${roleColor.text}`}>
                            {u.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${t.text.primary}`}>
                              {u.username}
                              {isSelf && <span className="text-xs text-purple-400 ml-2">(you)</span>}
                            </p>
                            <p className={`text-xs ${t.text.muted}`}>{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        {isSelf ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColor.bg} ${roleColor.text} border ${roleColor.border}`}>
                            {u.role}
                          </span>
                        ) : (
                          <div className="relative">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              disabled={updatingUser === u._id}
                              className={`appearance-none ${roleColor.bg} ${roleColor.text} border ${roleColor.border} rounded-full text-xs font-medium px-3 py-1 pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/40 bg-transparent`}
                            >
                              <option value="viewer" className={isDark ? 'bg-[#1A1D23]' : 'bg-white'}>viewer</option>
                              <option value="analyst" className={isDark ? 'bg-[#1A1D23]' : 'bg-white'}>analyst</option>
                              <option value="admin" className={isDark ? 'bg-[#1A1D23]' : 'bg-white'}>admin</option>
                            </select>
                            <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${roleColor.text} pointer-events-none`} />
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {u.status}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4">
                        <p className={`text-xs ${t.text.muted}`}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        {isSelf ? (
                          <span className={`text-xs ${t.text.muted}`}>—</span>
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(u._id, u.status)}
                            disabled={updatingUser === u._id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                              u.status === 'active'
                                ? `${isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`
                                : `${isDark ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'}`
                            }`}
                          >
                            {u.status === 'active' ? (
                              <><UserX className="w-3.5 h-3.5" /> Deactivate</>
                            ) : (
                              <><UserCheck className="w-3.5 h-3.5" /> Activate</>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className={`${t.text.muted} text-xs`}>
          Zorvyn Finance — Admin Panel
        </p>
      </div>
    </AppLayout>
  );
};

export default AdminPanel;
