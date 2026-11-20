import React from 'react';
import { X, Clock, Trash2, ArrowRight } from 'lucide-react';
import { formatNumber } from '../utils/calculations';

export interface HistoryItem {
  id: string;
  timestamp: string;
  loanAmount: string;
  interest: string;
  period: string;
  periodUnit: 'year' | 'month';
  emi: string;
  currency: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Calculation History</h3>
              <p className="text-[11px] text-slate-500">Tap any item to reload into calculator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
              No calculation history yet.
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {item.currency} {formatNumber(Number(item.loanAmount) || 0)} &bull; {item.interest}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.period} {item.periodUnit === 'year' ? 'Years' : 'Months'} &bull; EMI: {item.currency} {formatNumber(Number(item.emi) || 0)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{item.timestamp}</div>
                </div>

                <div className="w-7 h-7 rounded-full bg-white group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shadow-2xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
