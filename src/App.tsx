import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  StudentFee, 
  SchoolExpense, 
  BankTransaction,
  BankTransactionType,
  AppUser
} from './types';
import { 
  getTodayDateString, 
  getMonthKeyFromDate,
  SCHOOL_INFO 
} from './utils/formatters';
import {
  loadFeesFromStorage,
  saveFeesToStorage,
  loadExpensesFromStorage,
  saveExpensesToStorage,
  loadBankTransactionsFromStorage,
  saveBankTransactionsToStorage,
  computeBankBalance,
  computeDailySummaries,
  computeMonthlySummary,
  exportDataAsJSON,
  resetDemoData,
} from './utils/storage';
import { getCurrentUser, logoutUser } from './utils/auth';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { FeeSection } from './components/FeeSection';
import { FeeCollectionModal } from './components/FeeCollectionModal';
import { ExpenseSection } from './components/ExpenseSection';
import { ExpenseModal } from './components/ExpenseModal';
import { BankSection } from './components/BankSection';
import { DailyCashBook } from './components/DailyCashBook';
import { MonthlyAnalytics } from './components/MonthlyAnalytics';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminUserManagementModal } from './components/AdminUserManagementModal';
import { UserProfileModal } from './components/UserProfileModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUser());
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persistent States
  const [fees, setFees] = useState<StudentFee[]>(() => loadFeesFromStorage());
  const [expenses, setExpenses] = useState<SchoolExpense[]>(() => loadExpensesFromStorage());
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => 
    loadBankTransactionsFromStorage()
  );

  // Sync to local storage
  useEffect(() => {
    saveFeesToStorage(fees);
  }, [fees]);

  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  useEffect(() => {
    saveBankTransactionsToStorage(bankTransactions);
  }, [bankTransactions]);

  // Modals
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [feeModalDate, setFeeModalDate] = useState<string | undefined>(undefined);
  const [expenseModalDate, setExpenseModalDate] = useState<string | undefined>(undefined);
  const [selectedReceiptFee, setSelectedReceiptFee] = useState<StudentFee | null>(null);

  // Calculations
  const todayStr = getTodayDateString();
  const currentMonthKey = getMonthKeyFromDate(todayStr);

  const bankBalance = useMemo(() => {
    return computeBankBalance(bankTransactions);
  }, [bankTransactions]);

  const dailySummaries = useMemo(() => {
    return computeDailySummaries(fees, expenses);
  }, [fees, expenses]);

  const todaySummary = useMemo(() => {
    return dailySummaries[todayStr] || {
      date: todayStr,
      totalIncome: 0,
      incomeCount: 0,
      totalExpense: 0,
      expenseCount: 0,
      netBalance: 0,
    };
  }, [dailySummaries, todayStr]);

  const currentMonthSummary = useMemo(() => {
    return computeMonthlySummary(currentMonthKey, fees, expenses);
  }, [currentMonthKey, fees, expenses]);

  // Handlers
  const handleAddFee = (newFee: StudentFee) => {
    setFees((prev) => [newFee, ...prev]);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignore if confetti fails
    }
  };

  const handleDeleteFee = (id: string) => {
    setFees((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateFee = (updatedFee: StudentFee) => {
    setFees((prev) => prev.map((f) => (f.id === updatedFee.id ? updatedFee : f)));
  };

  const handleAddExpense = (newExpense: SchoolExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);

    // If paid from bank account, automatically record debit in bank
    if (newExpense.paidFrom === 'ব্যাংক অ্যাকাউন্ট') {
      const bankTx: BankTransaction = {
        id: `auto-bank-${newExpense.id}`,
        date: newExpense.date,
        type: 'debit',
        amount: newExpense.amount,
        source: `খরচ পরিশোধ: ${newExpense.title}`,
        referenceNo: newExpense.voucherNo || `VOU-${newExpense.id.slice(0, 6)}`,
        description: `খাত: ${newExpense.category} • প্রাপক: ${newExpense.paidTo || 'অফিস'}`,
        recordedBy: 'হিসাব সফটওয়্যার (অটো)',
        createdAt: new Date().toISOString(),
      };
      setBankTransactions((prev) => [bankTx, ...prev]);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateExpense = (updatedExpense: SchoolExpense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)));
  };

  const handleAddBankTransaction = (newTx: BankTransaction) => {
    setBankTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteBankTransaction = (id: string) => {
    setBankTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Open Expense Modal directly (for "আজকের খরচ" buttons)
  const handleOpenTodayExpense = (targetDate?: string) => {
    setExpenseModalDate(targetDate || todayStr);
    setIsExpenseModalOpen(true);
  };

  // Open Fee Modal
  const handleOpenFeeModal = (targetDate?: string) => {
    setFeeModalDate(targetDate || todayStr);
    setIsFeeModalOpen(true);
  };

  // Open Bank Modal directly into Bank tab
  const handleOpenBankModalFromHeader = () => {
    setActiveTab('bank');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    exportDataAsJSON(fees, expenses, bankTransactions);
  };

  // Import JSON Backup
  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.fees && Array.isArray(data.fees)) {
          setFees(data.fees);
        }
        if (data.expenses && Array.isArray(data.expenses)) {
          setExpenses(data.expenses);
        }
        if (data.bankTransactions && Array.isArray(data.bankTransactions)) {
          setBankTransactions(data.bankTransactions);
        }
        alert('ডেটা সফলভাবে রিস্টোর করা হয়েছে!');
      } catch (err) {
        alert('ফাইলটি সঠিক ফরম্যাটে নেই। দয়া করে বৈধ ব্যাকআপ ফাইল নির্বাচন করুন।');
      }
    };
    reader.readAsText(file);
  };

  // Clear all data
  const handleResetData = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সকল হিসাব ও লেনদেন মুছে পরিষ্কার করতে চান?')) {
      resetDemoData();
      setFees([]);
      setExpenses([]);
      setBankTransactions([]);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // If no user is authenticated, display the Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-['Kalpurush','Hind_Siliguri',sans-serif] min-w-[1240px]">
      
      {/* Universal Header with user authentication info */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        todayIncome={todaySummary.totalIncome}
        todayExpense={todaySummary.totalExpense}
        todayBalance={todaySummary.netBalance}
        bankBalance={bankBalance}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenExpenseModal={() => handleOpenTodayExpense(todayStr)}
        onOpenFeeModal={() => handleOpenFeeModal(todayStr)}
        onOpenBankModal={handleOpenBankModalFromHeader}
        onExport={handleExportBackup}
        onImport={handleImportBackup}
        onReset={handleResetData}
      />

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6 min-w-[1240px]">
        
        {/* TAB 1: Dashboard & Integrated Daily Cash Flow */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <Dashboard
              fees={fees}
              expenses={expenses}
              bankTransactions={bankTransactions}
              bankBalance={bankBalance}
              todayIncome={todaySummary.totalIncome}
              todayExpense={todaySummary.totalExpense}
              todayBalance={todaySummary.netBalance}
              monthlyIncome={currentMonthSummary.totalIncome}
              monthlyExpense={currentMonthSummary.totalExpense}
              monthlyNet={currentMonthSummary.netBalance}
              dailyAvgIncome={currentMonthSummary.dailyAverageIncome}
              dailyAvgExpense={currentMonthSummary.dailyAverageExpense}
              onOpenFeeModal={() => handleOpenFeeModal(todayStr)}
              onOpenExpenseModal={() => handleOpenTodayExpense(todayStr)}
              onOpenBankModal={(type) => {
                setActiveTab('bank');
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onViewReceipt={(fee) => setSelectedReceiptFee(fee)}
              isAdmin={isAdmin}
            />

            {/* Daily Cash Book integrated on dashboard for immediate date-by-date accounting */}
            <div className="pt-4 border-t border-slate-200">
              <DailyCashBook
                fees={fees}
                expenses={expenses}
                dailySummaries={dailySummaries}
                onOpenExpenseModalWithDate={(d) => handleOpenTodayExpense(d)}
                onOpenFeeModalWithDate={(d) => handleOpenFeeModal(d)}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Month-wise Student Fees */}
        {activeTab === 'fees' && (
          <div className="animate-in fade-in duration-200">
            <FeeSection
              fees={fees}
              onOpenFeeModal={() => handleOpenFeeModal(todayStr)}
              onDeleteFee={handleDeleteFee}
              onUpdateFee={handleUpdateFee}
              onViewReceipt={(fee) => setSelectedReceiptFee(fee)}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* TAB 3: Daily Expenses */}
        {activeTab === 'expenses' && (
          <div className="animate-in fade-in duration-200">
            <ExpenseSection
              expenses={expenses}
              onOpenExpenseModal={() => handleOpenTodayExpense(todayStr)}
              onDeleteExpense={handleDeleteExpense}
              onUpdateExpense={handleUpdateExpense}
              todayExpense={todaySummary.totalExpense}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* TAB 4: Bank Section (Balance & Credit/Debit Buttons & History) */}
        {activeTab === 'bank' && (
          <div className="animate-in fade-in duration-200">
            <BankSection
              transactions={bankTransactions}
              onAddTransaction={handleAddBankTransaction}
              onDeleteTransaction={handleDeleteBankTransaction}
              currentBalance={bankBalance}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* TAB 5: Monthly Analytics & Daily Averages */}
        {activeTab === 'monthly' && (
          <div className="animate-in fade-in duration-200">
            <MonthlyAnalytics
              fees={fees}
              expenses={expenses}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <img 
              src="/school_logo.jpg" 
              alt="Logo" 
              className="w-5 h-5 rounded-full object-contain"
              referrerPolicy="no-referrer" 
            />
            <span className="font-semibold text-slate-700">{SCHOOL_INFO.name}</span>
            <span>• {SCHOOL_INFO.address}</span>
          </div>
          <p>© {new Date().getFullYear()} মোগলগাঁও লিটল স্টার একাডেমি • সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </footer>

      {/* Global Modals */}
      <FeeCollectionModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        onAddFee={handleAddFee}
        initialDate={feeModalDate}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
        initialDate={expenseModalDate}
      />

      <ReceiptModal
        fee={selectedReceiptFee}
        onClose={() => setSelectedReceiptFee(null)}
      />

      {/* Admin User Management Modal */}
      {isUserManagementOpen && (
        <AdminUserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* User Profile & Security Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUserUpdate={(updated) => setCurrentUser(updated)}
          onOpenUserManagement={() => {
            setIsProfileModalOpen(false);
            setIsUserManagementOpen(true);
          }}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
