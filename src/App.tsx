import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  StudentFee, 
  SchoolExpense, 
  BankTransaction, 
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
import { getCurrentUser, logoutUser, saveUsersLocally } from './utils/auth';
import { 
  subscribeToFees, 
  subscribeToExpenses, 
  subscribeToBankTransactions,
  subscribeToUsers,
  saveFeeToCloud,
  deleteFeeFromCloud,
  saveExpenseToCloud,
  deleteExpenseFromCloud,
  saveBankTxToCloud,
  deleteBankTxFromCloud,
  saveUserToCloud,
  seedInitialUsersIfEmpty
} from './utils/cloudSync';
import { testFirestoreConnection } from './firebase';

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

  // 1. Initial Cloud Setup & Local Sync-up
  useEffect(() => {
    testFirestoreConnection();
    seedInitialUsersIfEmpty();

    // If local device already has data, sync it to cloud
    const localFees = loadFeesFromStorage();
    if (localFees.length > 0) {
      localFees.forEach((f) => saveFeeToCloud(f));
    }
    const localExpenses = loadExpensesFromStorage();
    if (localExpenses.length > 0) {
      localExpenses.forEach((e) => saveExpenseToCloud(e));
    }
    const localBank = loadBankTransactionsFromStorage();
    if (localBank.length > 0) {
      localBank.forEach((b) => saveBankTxToCloud(b));
    }
  }, []);

  // 2. Real-time Live Cloud Subscriptions
  useEffect(() => {
    // Listen to live student fees
    const unsubFees = subscribeToFees((cloudFees) => {
      setFees(cloudFees);
      saveFeesToStorage(cloudFees);
    });

    // Listen to live school expenses
    const unsubExpenses = subscribeToExpenses((cloudExpenses) => {
      setExpenses(cloudExpenses);
      saveExpensesToStorage(cloudExpenses);
    });

    // Listen to live bank transactions
    const unsubBank = subscribeToBankTransactions((cloudBank) => {
      setBankTransactions(cloudBank);
      saveBankTransactionsToStorage(cloudBank);
    });

    // Listen to live users updates
    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers.length > 0) {
        saveUsersLocally(cloudUsers);
        // If current user is logged in, sync their latest profile/role
        if (currentUser) {
          const fresh = cloudUsers.find((u) => u.id === currentUser.id);
          if (fresh) {
            setCurrentUser(fresh);
          }
        }
      }
    });

    return () => {
      unsubFees();
      unsubExpenses();
      unsubBank();
      unsubUsers();
    };
  }, [currentUser?.id]);

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

  // Handlers for Fees (Cloud + Local)
  const handleAddFee = (newFee: StudentFee) => {
    setFees((prev) => [newFee, ...prev]);
    saveFeeToCloud(newFee);
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
    deleteFeeFromCloud(id);
  };

  const handleUpdateFee = (updatedFee: StudentFee) => {
    setFees((prev) => prev.map((f) => (f.id === updatedFee.id ? updatedFee : f)));
    saveFeeToCloud(updatedFee);
  };

  // Handlers for Expenses (Cloud + Local)
  const handleAddExpense = (newExpense: SchoolExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);
    saveExpenseToCloud(newExpense);

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
      saveBankTxToCloud(bankTx);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    deleteExpenseFromCloud(id);
  };

  const handleUpdateExpense = (updatedExpense: SchoolExpense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)));
    saveExpenseToCloud(updatedExpense);
  };

  // Handlers for Bank Transactions (Cloud + Local)
  const handleAddBankTransaction = (newTx: BankTransaction) => {
    setBankTransactions((prev) => [newTx, ...prev]);
    saveBankTxToCloud(newTx);
  };

  const handleDeleteBankTransaction = (id: string) => {
    setBankTransactions((prev) => prev.filter((t) => t.id !== id));
    deleteBankTxFromCloud(id);
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

  // Import JSON Backup & Sync to Cloud
  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.fees && Array.isArray(data.fees)) {
          setFees(data.fees);
          data.fees.forEach((f: StudentFee) => saveFeeToCloud(f));
        }
        if (data.expenses && Array.isArray(data.expenses)) {
          setExpenses(data.expenses);
          data.expenses.forEach((ex: SchoolExpense) => saveExpenseToCloud(ex));
        }
        if (data.bankTransactions && Array.isArray(data.bankTransactions)) {
          setBankTransactions(data.bankTransactions);
          data.bankTransactions.forEach((tx: BankTransaction) => saveBankTxToCloud(tx));
        }
        alert('ডেটা ক্লাউডে সফলভাবে রিস্টোর ও সিঙ্ক করা হয়েছে!');
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
      fees.forEach((f) => deleteFeeFromCloud(f.id));
      expenses.forEach((e) => deleteExpenseFromCloud(e.id));
      bankTransactions.forEach((b) => deleteBankTxFromCloud(b.id));
      setFees([]);
      setExpenses([]);
      setBankTransactions([]);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // User Profile Update handler
  const handleUserUpdate = (updated: AppUser) => {
    setCurrentUser(updated);
    saveUserToCloud(updated);
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

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 min-w-[1240px]">
        {activeTab === 'dashboard' && (
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
            onOpenBankModal={handleOpenBankModalFromHeader}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onViewReceipt={(fee: StudentFee) => setSelectedReceiptFee(fee)}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'fees' && (
          <FeeSection
            fees={fees}
            onOpenFeeModal={() => handleOpenFeeModal()}
            onDeleteFee={handleDeleteFee}
            onUpdateFee={handleUpdateFee}
            onViewReceipt={(fee: StudentFee) => setSelectedReceiptFee(fee)}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseSection
            expenses={expenses}
            onOpenExpenseModal={() => handleOpenTodayExpense()}
            onDeleteExpense={handleDeleteExpense}
            onUpdateExpense={handleUpdateExpense}
            todayExpense={todaySummary.totalExpense}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'bank' && (
          <BankSection
            transactions={bankTransactions}
            currentBalance={bankBalance}
            onAddTransaction={handleAddBankTransaction}
            onDeleteTransaction={handleDeleteBankTransaction}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'daily_cashbook' && (
          <DailyCashBook
            fees={fees}
            expenses={expenses}
            dailySummaries={dailySummaries}
            onOpenExpenseModalWithDate={(date: string) => handleOpenTodayExpense(date)}
            onOpenFeeModalWithDate={(date: string) => handleOpenFeeModal(date)}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyAnalytics
            fees={fees}
            expenses={expenses}
          />
        )}
      </main>

      {/* Modal: Fee Collection */}
      <FeeCollectionModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        onAddFee={handleAddFee}
        initialDate={feeModalDate}
      />

      {/* Modal: School Expense */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
        initialDate={expenseModalDate}
      />

      {/* Modal: Receipt View */}
      {selectedReceiptFee && (
        <ReceiptModal
          fee={selectedReceiptFee}
          onClose={() => setSelectedReceiptFee(null)}
        />
      )}

      {/* Modal: Admin User & Password Management */}
      <AdminUserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentUser={currentUser}
      />

      {/* Modal: User Profile & Security */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUserUpdate={handleUserUpdate}
        onOpenUserManagement={() => {
          setIsProfileModalOpen(false);
          setIsUserManagementOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 mt-auto min-w-[1240px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p>
            © {new Date().getFullYear()} {SCHOOL_INFO.name} • সকল স্বত্ব সংরক্ষিত
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>লাইভ ক্লাউড ডাটাবেজ সক্রিয় (Multi-device Sync)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
