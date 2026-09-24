import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Trash2, 
  Copy, 
  Check, 
  Shield, 
  Eye, 
  Sparkles, 
  Lock, 
  UserCheck,
  Loader2
} from 'lucide-react';
import { AppUser } from '../types';
import { 
  loadUsers, 
  saveUsersLocally, 
  removeUserAccount,
  generateRandomPassword, 
  generateSuggestedUsername 
} from '../utils/auth';
import { subscribeToUsers, saveUserToCloud } from '../utils/cloudSync';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen to live Cloud Firestore updates
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
        saveUsersLocally(cloudUsers);
      }
    });
    return () => unsub();
  }, [isOpen]);

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
  const [isAdminPassSubmitting, setIsAdminPassSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGenerateCredentials = () => {
    const suggested = generateSuggestedUsername(fullName || 'committee');
    const pass = generateRandomPassword(6);
    setUsername(suggested);
    setPassword(pass);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    try {
      // Strictly enforce role === 'user' (No additional admin can ever be created)
      // phone must be string, never undefined to avoid Firestore rejection
      const newUser: AppUser = {
        id: `user_${Date.now()}`,
        username: cleanUsername,
        password: password.trim(),
        fullName: fullName.trim(),
        role: 'user', // strictly view-only for committee
        designation: designation.trim() || 'ম্যানেজিং কমিটি সদস্য',
        phone: phone.trim() || '',
        createdAt: new Date().toISOString(),
      };

      // 1. Save directly to Cloud Firestore
      await saveUserToCloud(newUser);

      // 2. Update local state and storage
      const updated = [...users.filter((u) => u.id !== newUser.id), newUser];
      setUsers(updated);
      saveUsersLocally(updated);
      if (onUserListChange) onUserListChange();

      setSuccessMessage(`সফলভাবে "${newUser.fullName}"-এর অ্যাকাউন্ট তৈরি ও ক্লাউড ডাটাবেজে স্থায়ীভাবে সংরক্ষিত হয়েছে!`);
      setTimeout(() => setSuccessMessage(''), 5000);

      // Reset form
      setFullName('');
      setUsername('');
      setPassword('');
      setPhone('');
    } catch (err) {
      console.error('Failed to create user:', err);
      alert('অ্যাকাউন্ট ক্লাউডে সেভ করতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (userId === currentUser.id) {
      alert('আপনি প্রধান শিক্ষক অ্যাকাউন্ট মুছতে পারবেন না!');
      return;
    }
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${name}"-এর ইউজার অ্যাকাউন্টটি ক্লাউড ডাটাবেজ থেকে মুছে ফেলতে চান?`)) {
      try {
        const updated = removeUserAccount(userId);
        setUsers(updated);
        if (onUserListChange) onUserListChange();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'মুছে ফেলা সম্ভব হয়নি');
      }
    }
  };

  const handleCopyCredentials = (u: AppUser) => {
    const text = `মোগলগাঁও লিটল স্টার একাডেমি হিসাব সফটওয়্যার লগইন তথ্য:\nনাম: ${u.fullName} (${u.designation})\nইউজার নেইম: ${u.username}\nপাসওয়ার্ড: ${u.password}\nঅনুমতি: শুধুমাত্র দেখার অনুমতি (View Only)\nলিংক: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewPassword.trim() || adminNewPassword.length < 4) {
      alert('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    setIsAdminPassSubmitting(true);
    try {
      const updated = users.map((u) => {
        if (u.role === 'admin' || u.id === currentUser.id) {
          return { ...u, password: adminNewPassword.trim() };
        }
        return u;
      });

      const updatedAdmin = updated.find((u) => u.id === currentUser.id);
      if (updatedAdmin) {
        await saveUserToCloud(updatedAdmin);
      }
      setUsers(updated);
      saveUsersLocally(updated);
      if (onUserListChange) onUserListChange();
      setAdminSuccessMsg('আপনার অ্যাডমিন পাসওয়ার্ড ক্লাউডে সফলভাবে আপডেট হয়েছে! পুরনো পাসওয়ার্ড আর কোনো ডিভাইসে কাজ করবে না।');
      setAdminNewPassword('');
      setTimeout(() => setAdminSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to update admin password:', err);
      alert('পাসওয়ার্ড ক্লাউডে সেভ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsAdminPassSubmitting(false);
    }
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
        {/* Header */}
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
                একমাত্র প্রধান শিক্ষক অ্যাডমিন • তৈরি করা ইউজার যেকোনো ডিভাইস দিয়ে লগইন করতে পারবে
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
                🔒 সিঙ্গেল অ্যাডমিন নীতি ও কমিটি সদস্যদের ভিউয়ার এক্সেস
              </p>
              <p className="text-indigo-800/90 leading-relaxed">
                সফটওয়্যারটিতে <strong>একমাত্র আপনিই (প্রধান শিক্ষক) একমাত্র অ্যাডমিন</strong>। কোনো দ্বিতীয় অ্যাডমিন তৈরি করা সম্পূর্ণ বন্ধ রাখা হয়েছে। আপনি কমিটির প্রতিটি সদস্যের জন্য পৃথক ইউজারনেম ও পাসওয়ার্ড তৈরি করে দিলে তারা তাদের নিজস্ব মোবাইল থেকে লগইন করে স্কুলের সকল আয়, ব্যয়, ব্যালেন্স, মাসিক রিপোর্ট দেখতে ও প্রিন্ট করতে পারবেন, কিন্তু কোনো তথ্য <strong>এডিট বা ডিলিট</strong> করতে পারবেন না।
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
                    autoCapitalize="none"
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
                    placeholder="যেমন: 123456 বা যেকোনো পাসওয়ার্ড"
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
                  <span>ভূমিকা: <strong>User (ভিউ-অনলি সদস্য, কোনো এডিট ক্ষমতা নেই)</strong></span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>সংরক্ষণ করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>ক্লাউডে অ্যাকাউন্ট সেভ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Section: Active Users List */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>সক্রিয় ইউজার তালিকা ({users.length} জন)</span>
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
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <Shield className="w-3 h-3 mr-1" />
                                একমাত্র অ্যাডমিন
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <Eye className="w-3 h-3 mr-1" />
                                User (ভিউ-অনলি সদস্য)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleCopyCredentials(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200 cursor-pointer transition-colors"
                              title="সদস্যকে পাঠানোর জন্য কপি করুন"
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
                              <span className="text-[11px] text-purple-700 font-bold">স্থায়ী অ্যাডমিন</span>
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
              <span>প্রধান শিক্ষকের অ্যাডমিন পাসওয়ার্ড পরিবর্তন (ক্লাউডে সংরক্ষণ)</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              আপনার অ্যাডমিন পাসওয়ার্ড পরিবর্তন করলে তা সাথে সাথে ক্লাউডে আপডেট হবে। এরপর থেকে যেকোনো ডিভাইসে লগইন করতে আপনার এই নতুন পাসওয়ার্ডটি ব্যবহার করতে হবে।
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
                  placeholder="অ্যাডমিনের নতুন পাসওয়ার্ড দিন..."
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-hidden font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isAdminPassSubmitting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {isAdminPassSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>পাসওয়ার্ড ক্লাউডে সেভ করুন</span>
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
