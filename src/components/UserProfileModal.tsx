import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Eye, 
  Lock, 
  Check, 
  Users, 
  LogOut, 
  Calendar, 
  UserCheck, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { AppUser } from '../types';
import { loadUsers, saveUsers, setCurrentUser } from '../utils/auth';
import { formatBanglaDate } from '../utils/formatters';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onUserUpdate: (updatedUser: AppUser) => void;
  onOpenUserManagement?: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdate,
  onOpenUserManagement,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  // Edit Profile Form
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [designation, setDesignation] = useState(currentUser.designation);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Password Change Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('অনুগ্রহ করে পূর্ণ নাম প্রদান করুন');
      return;
    }

    const allUsers = loadUsers();
    const updatedUsers = allUsers.map((u) => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          designation: designation.trim() || u.designation,
        };
      }
      return u;
    });

    const updatedCurrent: AppUser = {
      ...currentUser,
      fullName: fullName.trim(),
      phone: phone.trim() || undefined,
      designation: designation.trim() || currentUser.designation,
    };

    saveUsers(updatedUsers);
    setCurrentUser(updatedCurrent);
    onUserUpdate(updatedCurrent);

    setProfileSuccessMsg('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccessMsg('');

    if (currentUser.password !== currentPassword.trim()) {
      setPasswordError('বর্তমান পাসওয়ার্ড সঠিক নয়! দয়া করে আবার চেষ্টা করুন।');
      return;
    }

    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setPasswordError('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordError('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মিলছে না!');
      return;
    }

    const allUsers = loadUsers();
    const updatedUsers = allUsers.map((u) => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          password: newPassword.trim(),
        };
      }
      return u;
    });

    const updatedCurrent: AppUser = {
      ...currentUser,
      password: newPassword.trim(),
    };

    saveUsers(updatedUsers);
    setCurrentUser(updatedCurrent);
    onUserUpdate(updatedCurrent);

    setPasswordSuccessMsg('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccessMsg(''), 4000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold shadow-md shrink-0 ${
              isAdmin 
                ? 'bg-purple-600 text-white ring-4 ring-purple-400/30' 
                : 'bg-emerald-600 text-white ring-4 ring-emerald-400/30'
            }`}>
              {isAdmin ? <Shield className="w-7 h-7" /> : <Eye className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {currentUser.fullName}
                </h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isAdmin 
                    ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30' 
                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                }`}>
                  {isAdmin ? 'সুপার অ্যাডমিন' : 'কমিটি সদস্য'}
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                {currentUser.designation}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-300">
                <span>ইউজারনেম: <strong className="text-white font-mono">{currentUser.username}</strong></span>
                <span>•</span>
                <span>অ্যাকাউন্ট: <strong className="text-emerald-300">সক্রিয়</strong></span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              প্রোফাইল তথ্য
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              পাসওয়ার্ড পরিবর্তন
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          
          {/* TAB 1: Profile Information */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পূর্ণ নাম
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পদবি / পদমর্যাদা
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: ০১৭১১-XXXXXX"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">ইউজার আইডি:</span>
                  <span className="font-mono text-slate-700 font-semibold">{currentUser.username}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">অনুমতি স্তর:</span>
                  <span className="font-semibold text-slate-800">
                    {isAdmin ? 'পূর্ণ হিসাবরক্ষণ ও ব্যবস্থাপনা (Admin)' : 'শুধুমাত্র পর্যবেক্ষণ (View Only)'}
                  </span>
                </div>
                {currentUser.createdAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">অ্যাকাউন্ট সৃষ্টি:</span>
                    <span className="text-slate-700">
                      {formatBanglaDate(currentUser.createdAt.split('T')[0])}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  প্রোফাইল সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Change Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বর্তমান পাসওয়ার্ড
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="আপনার বর্তমান পাসওয়ার্ডটি লিখুন"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নতুন পাসওয়ার্ড
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="কমপক্ষে ৪ অক্ষর"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পাসওয়ার্ড নিশ্চিত করুন
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="একই পাসওয়ার্ড লিখুন"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                  পাসওয়ার্ড পরিবর্তন করুন
                </button>
              </div>
            </form>
          )}

          {/* Quick Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {isAdmin && onOpenUserManagement ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUserManagement();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>কমিটি অ্যাকাউন্টস ম্যানেজমেন্ট</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
