import React from 'react';
import { 
  Building2, 
  Calendar, 
  Wallet, 
  ArrowDownRight, 
  Landmark,
  Shield,
  Users,
  LogOut,
  Eye
} from 'lucide-react';
import { AppUser } from '../types';
import { 
  SCHOOL_INFO 
} from '../utils/formatters';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  todayIncome?: number;
  todayExpense?: number;
  todayBalance?: number;
  bankBalance?: number;
  currentUser: AppUser;
  onLogout: () => void;
  onOpenUserManagement: () => void;
  onOpenProfile?: () => void;
  onOpenExpenseModal?: () => void;
  onOpenFeeModal?: () => void;
  onOpenBankModal?: (type: 'credit' | 'debit') => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenUserManagement,
  onOpenProfile,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'দৈনিক ও সার্বিক ড্যাশবোর্ড', icon: Building2 },
    { id: 'fees', label: 'ছাত্র-ছাত্রীদের বেতন (মাসিক)', icon: Wallet },
    { id: 'expenses', label: 'দৈনিক খরচ ও হিসাব', icon: ArrowDownRight },
    { id: 'bank', label: 'ব্যাংক ব্যালেন্স ও হিস্ট্রি', icon: Landmark },
    { id: 'monthly', label: 'মাসিক হিসাব ও গড় পর্যালোচনা', icon: Calendar },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-40">
      {/* Top Bar with School Identity & Actions */}
      <div className="max-w-7xl mx-auto px-6 py-3 min-w-[1240px]">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & School Name */}
          <div className="flex items-center space-x-3.5">
            <div className="relative w-13 h-13 shrink-0 rounded-full border-2 border-indigo-600/30 p-0.5 bg-white shadow-xs overflow-hidden">
              <img
                src="/school_logo.jpg"
                alt="মোগলগাঁও লিটল স্টার একাডেমি লোগো"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                  {SCHOOL_INFO.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  স্থাপিত: {SCHOOL_INFO.established}
                </span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>{SCHOOL_INFO.address}</span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-medium">হিসাবরক্ষণ ব্যবস্থাপনা</span>
              </p>
            </div>
          </div>

          {/* User Profile Info & Action Controls */}
          <div className="flex items-center gap-3">
            {/* User Profile Card (Clickable) */}
            <button
              type="button"
              id="header-user-profile-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer text-left active:scale-[0.98] group"
              title="প্রোফাইল বিবরণী ও নিরাপত্তা সেটিংস দেখতে ক্লিক করুন"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-transform group-hover:scale-105 ${
                isAdmin 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}>
                {isAdmin ? <Shield className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {currentUser.fullName}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isAdmin 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {isAdmin ? 'Admin' : 'User (View)'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                  {currentUser.designation}
                </span>
              </div>
            </button>

            {/* Admin Management Button (Only for Admin) */}
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenUserManagement}
                className="inline-flex items-center px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
                title="কমিটি সদস্যদের জন্য ইউজারনেম ও পাসওয়ার্ড তৈরি করুন"
              >
                <Users className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                <span>কমিটি অ্যাকাউন্টস</span>
              </button>
            )}

            {/* View Only Badge for Non-Admin Members */}
            {!isAdmin && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>শুধুমাত্র দেখার অনুমতি</span>
              </span>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer ml-1"
              title="সফটওয়্যার থেকে লগআউট করুন"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto mt-3 pt-2.5 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
