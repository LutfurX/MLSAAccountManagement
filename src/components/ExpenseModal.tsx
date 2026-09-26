import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Tag, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  X,
  FileText
} from 'lucide-react';
import { SchoolExpense } from '../types';
import { 
  getTodayDateString, 
  generateId, 
  generateReceiptNo 
} from '../utils/formatters';
import { compressImage } from '../utils/imageCompressor';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: SchoolExpense) => void;
  initialDate?: string;
}

const PRESET_CATEGORIES = [
  'অফিস খরচ',
  'আপ্যায়ন',
  'মোবাইল বিল',
  'বিদ্যুৎ বিল',
  'অন্যান্য',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  initialDate,
}) => {
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [selectedCategory, setSelectedCategory] = useState<string>('অফিস খরচ');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [voucherImage, setVoucherImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ফাইলের সাইজ সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারবে');
        return;
      }
      try {
        const compressed = await compressImage(file, 1000, 1000, 0.7);
        setVoucherImage(compressed);
      } catch (err) {
        console.warn('Fallback reading image:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setVoucherImage(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = () => {
    setVoucherImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('অনুগ্রহ করে সঠিক খরচের পরিমাণ লিখুন');
      return;
    }

    if (!title.trim()) {
      alert('খরচের সংক্ষিপ্ত বিবরণ লিখুন');
      return;
    }

    // Determine effective category
    let finalCategory = selectedCategory;
    if (selectedCategory === 'অন্যান্য') {
      finalCategory = customCategory.trim() || 'অন্যান্য';
    }

    const newExpense: SchoolExpense = {
      id: generateId(),
      date,
      category: finalCategory,
      title: title.trim(),
      amount: numAmount,
      voucherImage: voucherImage || undefined,
      voucherNo: generateReceiptNo('VOU'),
      paidFrom: 'ক্যাশ ফান্ড',
      paidTo: 'সাধারণ ব্যয়',
      createdAt: new Date().toISOString(),
    };

    onAddExpense(newExpense);
    
    // Reset fields
    setTitle('');
    setAmount('');
    setCustomCategory('');
    setVoucherImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full my-auto shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  খরচ এন্ট্রি ফরম
                </h3>
                <span className="text-[11px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 font-semibold whitespace-nowrap">
                  দৈনিক ব্যয়
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                মোগলগাঁও লিটল স্টার একাডেমি • খরচের বিবরণ ও ভাউচার
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer shrink-0 ml-2"
            title="বন্ধ করুন"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-5 overflow-y-auto flex-1 space-y-4 overscroll-contain">
            
            {/* ১. তারিখ: */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                তারিখ *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            {/* ২. খরচের ক্যাটাগরি : */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" />
                খরচের ক্যাটাগরি *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* পরে একটা ঘর থাকবে নিজে থেকে লিখার জন্য */}
              {selectedCategory === 'অন্যান্য' && (
                <div className="mt-2.5 animate-in fade-in duration-150">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    ক্যাটাগরির নাম নিজে লিখুন:
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: পরীক্ষা খরচ, বই ক্রয় ইত্যাদি"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-base sm:text-sm bg-white border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* ৩. খরচের বিবরণ : */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                খরচের বিবরণ *
              </label>
              <input
                type="text"
                placeholder="খরচের বিস্তারিত বিবরণ লিখুন (যেমন: চক, ডাস্টার ও কলম ক্রয়)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            {/* ৪. পরিমাণ : */}
            <div>
              <label className="block text-xs font-semibold text-rose-800 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-rose-600" />
                পরিমাণ (টাকা) *
              </label>
              <input
                type="number"
                placeholder="যেমন: ৫০০"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
                className="w-full px-3.5 py-2.5 text-lg font-bold text-rose-700 bg-rose-50/50 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            {/* ৫. ভাউচার আপলোড : */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-slate-400" />
                ভাউচার আপলোড (এখানে খরচের ভাউচার আপলোড করা যাবে)
              </label>

              {voucherImage ? (
                <div className="relative border border-slate-200 rounded-xl p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={voucherImage}
                      alt="ভাউচার প্রিভিউ"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-emerald-700 block truncate">
                        ✓ ভাউচার ছবি সংযুক্ত হয়েছে
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                        প্রয়োজনে পরিবর্তন বা মুছে ফেলতে পারেন
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="ভাউচার মুছুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50/70 hover:bg-rose-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="w-9 h-9 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      ক্লিক করে ভাউচার ছবি আপলোড করুন
                    </span>
                    <span className="text-[11px] text-slate-400">
                      PNG, JPG, JPEG (সর্বোচ্চ 5MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-100 bg-slate-50/90 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              খরচ সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
