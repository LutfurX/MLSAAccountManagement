import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  Users, 
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react';
import { AppUser } from '../types';
import { authenticateUser, loadUsers } from '../utils/auth';
import { SCHOOL_INFO } from '../utils/formatters';

interface LoginScreenProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const availableUsers = loadUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('ইউজার নেইম এবং পাসওয়ার্ড উভয়ই পূরণ করুন।');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authenticateUser(username, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'ইউজার নেইম অথবা পাসওয়ার্ড সঠিক নয়।');
      }
    }, 250);
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full my-auto z-10">
        
        {/* Brand Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl p-2 mb-3 border-2 border-indigo-400/40">
            <img 
              src="/school_logo.jpg" 
              alt="লোগো" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {SCHOOL_INFO.name}
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            হিসাবরক্ষণ ও আর্থিক ব্যবস্থাপনা পোর্টাল
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium mt-2 border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>লগইন এক্সেস (User & Admin)</span>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-indigo-600" />
              <span>সফটওয়্যারে প্রবেশ করুন</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              আপনার প্রদত্ত ইউজার নেইম ও পাসওয়ার্ড দিয়ে লগইন করুন।
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ইউজার নেইম (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="যেমন: admin অথবা আপনার ইউজারনেম"
                  required
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}</span>
            </button>
          </form>

          {/* Quick Demo Login Credentials Selector */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
              এক ক্লিকে ডেমো লগইন করুন
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin123')}
                className="p-2.5 text-left rounded-xl border border-indigo-100 bg-indigo-50/70 hover:bg-indigo-100/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>প্রধান শিক্ষক (Admin)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  ইউজার: <span className="font-mono font-semibold text-indigo-800">admin</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-1">
                  ✓ সম্পূর্ণ নিয়ন্ত্রণ ও এডিট
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('committee', 'user123')}
                className="p-2.5 text-left rounded-xl border border-emerald-100 bg-emerald-50/70 hover:bg-emerald-100/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>কমিটি সদস্য (User)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  ইউজার: <span className="font-mono font-semibold text-emerald-800">committee</span>
                </div>
                <div className="text-[10px] text-blue-700 font-medium mt-1">
                  ✓ শুধুমাত্র দেখার অনুমতি
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="mt-5 text-center text-xs text-slate-400 space-y-1">
          <p>
            প্রধান শিক্ষক তার প্রোফাইল থেকে কমিটির সকল সদস্যের জন্য ইউজারনেম ও পাসওয়ার্ড তৈরি করতে পারেন।
          </p>
          <p className="text-[11px] text-slate-500">
            কমিটি মেম্বাররা সকল আর্থিক হিসাব দেখতে ও প্রিন্ট করতে পারবেন, কিন্তু এডিট বা ডিলিট করতে পারবেন না।
          </p>
        </div>
      </div>
    </div>
  );
};
