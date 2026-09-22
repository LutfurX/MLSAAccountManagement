import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

interface VoucherPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title: string;
  amount?: number;
  date?: string;
}

export const VoucherPreviewModal: React.FC<VoucherPreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  amount,
  date,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
          <div className="min-w-0 pr-3">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">
              ভাউচার কপি: {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {date ? `তারিখ: ${date}` : ''} {amount ? `• পরিমাণ: ৳${amount}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download={`voucher_${title || 'copy'}.png`}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-900/5 flex items-center justify-center overflow-auto flex-1">
          <img
            src={imageUrl}
            alt="ভাউচার কপি"
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-xs border border-slate-200 bg-white"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
};
