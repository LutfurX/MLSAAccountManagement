import React, { useState, useMemo, useRef } from 'react';
import { 
  Landmark, 
  PlusCircle, 
  MinusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  FileText, 
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  Upload,
  X,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { BankTransaction, BankTransactionType } from '../types';
import { 
  formatCurrency, 
  formatBanglaDate, 
  getTodayDateString, 
  generateId, 
  toBanglaDigits,
  SCHOOL_INFO 
} from '../utils/formatters';
import { VoucherPreviewModal } from './VoucherPreviewModal';

interface BankSectionProps {
  transactions: BankTransaction[];
  onAddTransaction: (tx: BankTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  currentBalance: number;
  isAdmin?: boolean;
}

export const BankSection: React.FC<BankSectionProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  currentBalance,
  isAdmin = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<BankTransactionType>('credit');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');

  // Form states
  const [date, setDate] = useState(getTodayDateString());
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('ক্যাশ ফান্ড থেকে ব্যাংকে জমা');
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');
  const [recordedBy, setRecordedBy] = useState('প্রধান শিক্ষক / হিসাবরক্ষক');
  const [slipImage, setSlipImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewSlip, setPreviewSlip] = useState<BankTransaction | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('ছবির সাইজ সর্বোচ্চ ৫ MB হতে পারবে');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSlipImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveSlip = () => {
    setSlipImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openModal = (type: BankTransactionType) => {
    setModalType(type);
    setDate(getTodayDateString());
    setAmount('');
    setReferenceNo('');
    setDescription('');
    setSlipImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (type === 'credit') {
      setSource('ক্যাশ ফান্ড থেকে ব্যাংকে জমা');
    } else {
      setSource('স্কুল পরিচালন বা বেতন বাবদ উত্তোলন');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('সঠিক টাকার পরিমাণ লিখুন');
      return;
    }

    if (modalType === 'debit' && numAmount > currentBalance) {
      const confirmOverdraft = window.confirm(
        `সতর্কতা: বর্তমান ব্যালেন্স (${formatCurrency(currentBalance)}) থেকে উত্তোলনের পরিমাণ বেশি। আপনি কি নিশ্চিত?`
      );
      if (!confirmOverdraft) return;
    }

    const newTx: BankTransaction = {
      id: generateId(),
      date,
      type: modalType,
      amount: numAmount,
      source: source.trim() || (modalType === 'credit' ? 'ব্যাংকে জমা' : 'ব্যাংক উত্তোলন'),
      referenceNo: referenceNo.trim() || `REF-${toBanglaDigits(Math.floor(1000 + Math.random() * 9000))}`,
      description: description.trim(),
      slipImage: slipImage || undefined,
      recordedBy: recordedBy.trim() || 'হিসাবরক্ষণ শাখা',
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);
    setSlipImage('');
    setIsModalOpen(false);
  };

  // Sort transactions chronological for calculating running balance
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  // Compute running balance for each transaction
  const transactionsWithBalance = useMemo(() => {
    let balance = 0;
    const list = sortedTransactions.map((tx) => {
      if (tx.type === 'credit') {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }
      return {
        ...tx,
        runningBalance: balance,
      };
    });
    // Return newest first for display table
    return list.reverse();
  }, [sortedTransactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactionsWithBalance.filter((tx) => {
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      const matchesSearch = 
        tx.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.date.includes(searchQuery);
      return matchesType && matchesSearch;
    });
  }, [transactionsWithBalance, typeFilter, searchQuery]);

  // Total credits and debits stats
  const totalCredit = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalDebit = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Current Balance & Primary Action Buttons */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium mb-3 backdrop-blur-xs">
              <Landmark className="w-3.5 h-3.5" />
              <span>পূবালী ব্যাংক লিমিটেড (মোগলগাঁও শাখা) ও প্রাতিষ্ঠানিক হিসাব</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">বর্তমান ব্যাংক ব্যালেন্স (Live Status)</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mt-1 text-white">
              {formatCurrency(currentBalance)}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                মোট মোট এড/জমা: <strong className="text-emerald-300">{formatCurrency(totalCredit)}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                মোট মোট উত্তোলন: <strong className="text-rose-300">{formatCurrency(totalDebit)}</strong>
              </span>
            </div>
          </div>

          {/* User's explicitly requested Credit and Debit Buttons (Admin Only) */}
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <button
                id="bank-credit-btn"
                onClick={() => openModal('credit')}
                className="inline-flex items-center justify-center px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95 shrink-0"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                <span>ক্রেডিট বাটন (এড / জমা)</span>
              </button>

              <button
                id="bank-debit-btn"
                onClick={() => openModal('debit')}
                className="inline-flex items-center justify-center px-6 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95 shrink-0"
              >
                <MinusCircle className="w-5 h-5 mr-2" />
                <span>ডেবিট বাটন (উত্তোলন / খরচ)</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 text-indigo-100 text-xs font-semibold backdrop-blur-xs border border-white/20">
              <Eye className="w-4 h-4 text-emerald-300" />
              <span>শুধুমাত্র দেখার ও নিরীক্ষার অনুমতি</span>
            </div>
          )}
        </div>
      </div>

      {/* Bank Transaction History Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-600" />
              ব্যাংকের লেনদেন হিস্ট্রি (উত্তোলন ও জমার তালিকা)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              সর্বমোট {toBanglaDigits(transactions.length)} টি ব্যাংক লেনদেন রেকর্ড রয়েছে
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="খাত বা রেফারেন্স দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>

            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  typeFilter === 'all' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সব লেনদেন
              </button>
              <button
                onClick={() => setTypeFilter('credit')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  typeFilter === 'credit' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                শুধু ক্রেডিট (জমা)
              </button>
              <button
                onClick={() => setTypeFilter('debit')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  typeFilter === 'debit' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                শুধু ডেবিট (উত্তোলন)
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">লেনদেনের ধরন</th>
                <th className="py-3 px-4">খাত / বিবরণ</th>
                <th className="py-3 px-4">চেক / রেফারেন্স</th>
                <th className="py-3 px-4 text-right">টাকার পরিমাণ</th>
                <th className="py-3 px-4 text-right">অবশিষ্ট ব্যালেন্স</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    কোনো লেনদেনের রেকর্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatBanglaDate(tx.date)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isCredit ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                            ক্রেডিট (এড / জমা)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                            ডেবিট (উত্তোলন)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        <div className="font-semibold">{tx.source}</div>
                        {tx.description && (
                          <div className="text-xs text-slate-500 mt-0.5">{tx.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{tx.referenceNo || '—'}</div>
                        {tx.slipImage && (
                          <button
                            type="button"
                            onClick={() => setPreviewSlip(tx)}
                            className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                            title="ডিপোজিট / ব্যাংক স্লিপ দেখুন"
                          >
                            <Eye className="w-3 h-3" />
                            <span>স্লিপ কপি</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold">
                        <span className={isCredit ? 'text-emerald-600' : 'text-rose-600'}>
                          {isCredit ? '+' : '-'} {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-slate-800">
                        {formatCurrency(tx.runningBalance)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isAdmin ? (
                          <button
                            onClick={() => {
                              if (window.confirm('আপনি কি এই ব্যাংক লেনদেনটি মুছে ফেলতে চান?')) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="লেনদেন মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit / Debit Transaction Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
                  modalType === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {modalType === 'credit' ? <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : <MinusCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">
                    {modalType === 'credit' ? 'ব্যাংকে ক্রেডিট (টাকা এড / জমা করুন)' : 'ব্যাংক ডেবিট (টাকা উত্তোলন / খরচ করুন)'}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {modalType === 'credit' ? 'স্কুল একাউন্টে নতুন অর্থ যোগ করুন' : 'স্কুল একাউন্ট থেকে অর্থ উত্তোলন করুন'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer shrink-0 ml-2"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 overscroll-contain">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    তারিখ *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    টাকার পরিমাণ (৳) *
                  </label>
                  <input
                    type="number"
                    placeholder="যেমন: ৫০০০"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    required
                    className="w-full px-3 py-2 text-lg sm:text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    লেনদেনের খাত / উৎস *
                  </label>
                  {modalType === 'credit' ? (
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="ক্যাশ ফান্ড থেকে ব্যাংকে জমা">ক্যাশ ফান্ড থেকে ব্যাংকে জমা</option>
                      <option value="ছাত্র-ছাত্রীদের বেতন সরাসরি ব্যাংক জমা">ছাত্র-ছাত্রীদের বেতন সরাসরি ব্যাংক জমা</option>
                      <option value="ম্যানেজিং কমিটি / দাতার অনুদান">ম্যানেজিং কমিটি / দাতার অনুদান</option>
                      <option value="সরকারি উপবৃত্তি বা অনুদান">সরকারি উপবৃত্তি বা অনুদান</option>
                      <option value="ব্যাংক মুনাফা / সুদ">ব্যাংক মুনাফা / সুদ</option>
                      <option value="অন্যান্য উৎস থেকে জমা">অন্যান্য উৎস থেকে জমা</option>
                    </select>
                  ) : (
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="শিক্ষক ও স্টাফ বেতন বাবদ উত্তোলন">শিক্ষক ও স্টাফ বেতন বাবদ উত্তোলন</option>
                      <option value="স্কুল পরিচালন বা বিদ্যুৎ বিল পরিশোধ">স্কুল পরিচালন বা বিদ্যুৎ বিল পরিশোধ</option>
                      <option value="নির্মাণ ও আসবাবপত্র সংস্কার বাবদ উত্তোলন">নির্মাণ ও আসবাবপত্র সংস্কার বাবদ উত্তোলন</option>
                      <option value="নগদ ক্যাশ বক্সের জন্য উত্তোলন">নগদ ক্যাশ বক্সের জন্য উত্তোলন</option>
                      <option value="পরীক্ষা ও অনুষ্ঠান বাবদ খরচ">পরীক্ষা ও অনুষ্ঠান বাবদ খরচ</option>
                      <option value="অন্যান্য ব্যয় বাবদ উত্তোলন">অন্যান্য ব্যয় বাবদ উত্তোলন</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    চেক নং / ডিপোজিট স্লিপ / রেফারেন্স নং
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: CHK-4421 অথবা DEP-8812"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    বিস্তারিত বিবরণ / মন্তব্য
                  </label>
                  <textarea
                    rows={2}
                    placeholder="প্রয়োজনে অতিরিক্ত কোনো নোট থাকলে লিখুন..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* ডিপোজিট স্লিপ / চেক কপি আপলোড */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      {modalType === 'credit' ? 'ডিপোজিট স্লিপ আপলোড (ঐচ্ছিক)' : 'চেক বা উত্তোলন স্লিপ আপলোড (ঐচ্ছিক)'}
                    </span>
                    {slipImage && (
                      <span className="text-[11px] text-emerald-600 font-bold">✓ স্লিপ সংযুক্ত হয়েছে</span>
                    )}
                  </label>

                  {slipImage ? (
                    <div className="relative border border-slate-200 rounded-xl p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={slipImage}
                          alt="ডিপোজিট স্লিপ প্রিভিউ"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-white shrink-0 shadow-xs"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-800 block truncate">
                            ✓ {modalType === 'credit' ? 'ডিপোজিট স্লিপ' : 'উত্তোলন স্লিপ'} সংযুক্ত হয়েছে
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                            প্রয়োজনে মুছে আবার নতুন ছবি দিতে পারেন
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveSlip}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="স্লিপ ছবি মুছুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-50/50'
                          : 'border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/20'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          ক্লিক অথবা ড্র্যাগ করে {modalType === 'credit' ? 'ডিপোজিট স্লিপ' : 'চেক বা স্লিপের'} ছবি আপলোড করুন
                        </span>
                        <span className="text-[11px] text-slate-400">
                          JPG, PNG বা স্ক্যান কপি (সর্বোচ্চ ৫ MB)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="flex items-center justify-end space-x-3 p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/90 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-all cursor-pointer ${
                    modalType === 'credit'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {modalType === 'credit' ? 'জমা / ক্রেডিট সম্পন্ন করুন' : 'উত্তোলন / ডেবিট সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Slip Preview Modal */}
      {previewSlip && (
        <VoucherPreviewModal
          isOpen={!!previewSlip}
          onClose={() => setPreviewSlip(null)}
          imageUrl={previewSlip.slipImage}
          title={`ব্যাংক স্লিপ: ${previewSlip.source} (${previewSlip.referenceNo})`}
          amount={previewSlip.amount}
          date={previewSlip.date}
        />
      )}
    </div>
  );
};
