import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Key, 
  Trash2, 
  Copy, 
  Check, 
  Shield, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Lock,
  UserCheck,
  Phone,
  Building,
  RefreshCw
} from 'lucide-react';
import { AppUser } from '../types';
import { 
  loadUsers, 
  saveUsers, 
  generateRandomPassword, 
  generateSuggestedUsername 
} from '../utils/auth';

interface AdminUserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onUserListChange?: () => void;
}

export const AdminUserManagementModal: React.FC<AdminUserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserListChange,
}) => {
  const [users, setUsers] = useState<AppUser[]>(() => loadUsers());

  // Form states for new committee user
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('ম্যানেজিং কমিটি সদস্য');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Admin password change states
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerateCredentials = () => {
    const suggested = generateSuggestedUsername(fullName || 'committee');
    const pass = generateRandomPassword(6);
    setUsername(suggested);
    setPassword(pass);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('সদস্যের পূর্ণ নাম লিখুন');
      return;
    }
    if (!username.trim() || !password.trim()) {
      alert('ইউজার নেইম এবং পাসওয়ার্ড উভয়ই নির্ধারণ করুন');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    // Check if username already exists
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      alert('এই ইউজার নেইমটি ইতিমধ্যে ব্যবহার করা হয়েছে! অনুগ্রহ করে ভিন্ন ইউজার নেইম দিন।');
      return;
    }

    const newUser: AppUser = {
      id: `user_${Date.now()}`,
      username: cleanUsername,
      password: password.trim(),
      fullName: fullName.trim(),
      role: 'user', // strictly view-only for committee
      designation: designation.trim() || 'ম্যানেজিং কমিটি সদস্য',
      phone: phone.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    if (onUserListChange) onUserListChange();

    setSuccessMessage(`সফলভাবে "${newUser.fullName}"-এর জন্য ইউজার অ্যাকাউন্ট তৈরি হয়েছে!`);
    setTimeout(() => setSuccessMessage(''), 4000);

    // Reset form
    setFullName('');
    setUsername('');
    setPassword('');
    setPhone('');
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (userId === currentUser.id) {
      alert('আপনি আপনার নিজের অ্যাডমিন অ্যাকাউন্ট মুছতে পারবেন না!');
      return;
    }
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${name}"-এর ইউজার অ্যাকাউন্টটি মুছে ফেলতে চান?`)) {
      const updated = users.filter((u) => u.id !== userId);
      setUsers(updated);
      saveUsers(updated);
      if (onUserListChange) onUserListChange();
    }
  };

  const handleCopyCredentials = (u: AppUser) => {
    const text = `মোগলগাঁও লিটল স্টার একাডেমি হিসাব লগইন তথ্য:\nনাম: ${u.fullName} (${u.designation})\nইউজার নেইম: ${u.username}\nপাসওয়ার্ড: ${u.password}\nঅনুমতি: শুধুমাত্র দেখার অনুমতি (View Only)`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewPassword.trim() || adminNewPassword.length < 4) {
      alert('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    const updated = users.map((u) => {
      if (u.id === currentUser.id) {
        return { ...u, password: adminNewPassword.trim() };
      }
      return u;
    });

    setUsers(updated);
    saveUsers(updated);
    if (onUserListChange) onUserListChange();
    setAdminSuccessMsg('আপনার অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!');
    setAdminNewPassword('');
    setTimeout(() => setAdminSuccessMsg(''), 4000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                কমিটি সদস্য ইউজার ও পাসওয়ার্ড ব্যবস্থাপনা
              </h3>
              <p className="text-xs text-slate-500">
                প্রধান শিক্ষক প্রোফাইল • সদস্যদের লগইন ইউজারনেম ও পাসওয়ার্ড তৈরি করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

          {/* Alert / Notice */}
          <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950 space-y-1">
              <p className="font-bold text-sm text-indigo-900">
                কমিটি সদস্যদের জন্য নিরাপদ ভিউয়ার (View-Only) এক্সেস
              </p>
              <p className="text-indigo-800/90 leading-relaxed">
                আপনি কমিটির প্রতিটি সদস্যের নামে পৃথক ইউজারনেম ও কাস্টম পাসওয়ার্ড তৈরি করে দিতে পারেন। তারা লগইন করে স্কুলের সকল আয়, ব্যয়, ব্যালেন্স, মাসিক রিপোর্ট ও ভাউচার দেখতে ও প্রিন্ট করতে পারবেন, কিন্তু কোনো তথ্য <strong>এডিট বা ডিলিট</strong> করতে পারবেন না।
              </p>
            </div>
          </div>

          {/* Form: Create new committee user */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>নতুন কমিটি সদস্যের অ্যাকাউন্ট তৈরি করুন</span>
              </h4>
              <button
                type="button"
                onClick={handleGenerateCredentials}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>অটো জেনারেট করুন</span>
              </button>
            </div>

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সদস্যের নাম *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="যেমন: হাজী আব্দুর রহিম"
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    পদবী / দায়িত্ব *
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    <option value="ম্যানেজিং কমিটি সভাপতি">ম্যানেজিং কমিটি সভাপতি</option>
                    <option value="ম্যানেজিং কমিটি সদস্য">ম্যানেজিং কমিটি সদস্য</option>
                    <option value="বিদ্যোৎসাহী সদস্য">বিদ্যোৎসাহী সদস্য</option>
                    <option value="অভিভাবক প্রতিনিধি">অভিভাবক প্রতিনিধি</option>
                    <option value="দাতা সদস্য">দাতা সদস্য</option>
                    <option value="সহকারী শিক্ষক প্রতিনিধি">সহকারী শিক্ষক প্রতিনিধি</option>
                    <option value="অভ্যন্তরীণ নিরীক্ষক">অভ্যন্তরীণ নিরীক্ষক</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ইউজার নেইম (Username) *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="যেমন: rohim123"
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    কাস্টম পাসওয়ার্ড (Password) *
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="যেমন: 123456 বা রেন্ডম"
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    মোবাইল নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১৭০০-০০০০০০"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>রোল: <strong>User (শুধুমাত্র দেখার ও প্রিন্ট করার অনুমতি)</strong></span>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>অ্যাকাউন্ট তৈরি করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section: Active Users List */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>সকল সক্রিয় ইউজার ও লগইন তথ্য তালিকা ({users.length} জন)</span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">নাম ও পদবী</th>
                      <th className="py-2.5 px-3">ইউজার নেইম</th>
                      <th className="py-2.5 px-3">পাসওয়ার্ড</th>
                      <th className="py-2.5 px-3">ভূমিকা / রোল</th>
                      <th className="py-2.5 px-3 text-center">ক্রেডেনশিয়াল কপি</th>
                      <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {users.map((u) => {
                      const isAdmin = u.role === 'admin';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{u.fullName}</div>
                            <div className="text-[11px] text-slate-500">{u.designation}</div>
                            {u.phone && <div className="text-[10px] text-slate-400 mt-0.5">📞 {u.phone}</div>}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                            {u.username}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">
                              {u.password}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isAdmin ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin (প্রধান শিক্ষক)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Eye className="w-3 h-3 mr-1" />
                                User (ভিউ-অনলি)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleCopyCredentials(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200 cursor-pointer transition-colors"
                              title="কমিটি সদস্যকে পাঠানোর জন্য কপি করুন"
                            >
                              {copiedId === u.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-bold">কপি হয়েছে!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>কপি করুন</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {isAdmin ? (
                              <span className="text-[11px] text-slate-400 italic">প্রধান অ্যাকাউন্ট</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.fullName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="ইউজার মুছুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section: Change Admin Password */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>প্রধান শিক্ষকের নিজের পাসওয়ার্ড পরিবর্তন</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              অন্য কেউ যাতে আপনার অনুমতি ছাড়া অ্যাডমিন প্রবেশ করতে না পারে, সেজন্য আপনার সুবিধামত নতুন পাসওয়ার্ড দিন।
            </p>

            {adminSuccessMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{adminSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminPassword} className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="অ্যাডমিনের নতুন পাসওয়ার্ড লিখুন..."
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
              >
                পাসওয়ার্ড আপডেট করুন
              </button>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50/90 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
