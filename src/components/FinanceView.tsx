import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  DollarSign,
  X,
  CreditCard,
} from 'lucide-react';
import { FinancialTransaction, FinanceSubTab } from '../types';
import { PriceInput } from './PriceInput';
import { formatVND, formatDate, formatNumberWithDots, parseNumberFromDots } from '../utils/formatters';

interface FinanceViewProps {
  subTab: FinanceSubTab;
  setSubTab: (sub: FinanceSubTab) => void;
  transactions: FinancialTransaction[];
  onCreateTransaction: (newTx: Omit<FinancialTransaction, 'id'>) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  subTab,
  setSubTab,
  transactions,
  onCreateTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Bán hàng');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'cod'>('cash');

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netCashflow = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      t.code.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesQuery && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    const code = (txType === 'income' ? 'PT' : 'PC') + Math.floor(10000 + Math.random() * 90000);

    onCreateTransaction({
      code,
      type: txType,
      category,
      amount,
      description: description.trim(),
      date: new Date().toISOString(),
      paymentMethod,
    });

    setAmount(0);
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* SUB-NAVIGATION & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>SỔ QUỸ THU CHI</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Vitamin Shop
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý dòng tiền vào/ra, phiếu thu bán hàng và chi phí vận hành cửa hàng
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Phiếu Thu / Chi</span>
        </button>
      </div>

      {/* 3 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">TỔNG THU</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600">
            +{formatVND(totalIncome)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Doanh thu bán hàng & thu khác</div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">TỔNG CHI</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600">
            -{formatVND(totalExpense)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Tất cả chi phí nhập hàng & tiện ích</div>
        </div>

        {/* Net Cashflow Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">TỒN QUỸ THỰC TẾ</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-3 text-2xl font-black ${netCashflow >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatVND(netCashflow)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Cân đối thu chi toàn cửa hàng</div>
        </div>
      </div>

      {/* FILTER & TRANSACTIONS TABLE */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã phiếu, nội dung thu chi, danh mục..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'all' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'income' ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Phiếu Thu
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filterType === 'expense' ? 'bg-rose-600 text-white font-bold' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Phiếu Chi
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Mã Chứng Từ</th>
                <th className="py-3 px-4">Loại Phiếu</th>
                <th className="py-3 px-4">Danh Mục Chi Phí</th>
                <th className="py-3 px-4">Nội Dung Mô Tả</th>
                <th className="py-3 px-4 text-right">Số Tiền</th>
                <th className="py-3 px-4 text-center">Hình Thức</th>
                <th className="py-3 px-4 text-right">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Không tìm thấy phiếu giao dịch nào.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold font-mono text-emerald-700">{tx.code}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {tx.type === 'income' ? 'Phiếu Thu' : 'Phiếu Chi'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{tx.category}</td>
                    <td className="py-3 px-4 text-slate-600">{tx.description}</td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-extrabold ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? `+${formatVND(tx.amount)}` : `-${formatVND(tx.amount)}`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-semibold text-[11px] text-slate-700">
                        {tx.paymentMethod === 'cash' ? 'Tiền mặt' : tx.paymentMethod === 'transfer' ? 'Chuyển khoản' : 'COD'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-xs whitespace-nowrap">{formatDate(tx.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CREATE TRANSACTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Lập Phiếu Thu / Phiếu Chi</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('income');
                    setCategory('Bán hàng');
                  }}
                  className={`flex-1 py-2 rounded-xl font-bold transition cursor-pointer ${
                    txType === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Phiếu Thu (+)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('expense');
                    setCategory('Nhập hàng');
                  }}
                  className={`flex-1 py-2 rounded-xl font-bold transition cursor-pointer ${
                    txType === 'expense' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Phiếu Chi (-)
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-600">Danh Mục Chi Phí</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                >
                  {txType === 'income' ? (
                    <>
                      <option value="Bán hàng">Bán hàng</option>
                      <option value="Thu nợ khách">Thu nợ khách</option>
                      <option value="Thu khác">Thu khác</option>
                    </>
                  ) : (
                    <>
                      <option value="Nhập hàng">Nhập hàng</option>
                      <option value="Điện nước & Tiện ích">Điện nước & Tiện ích</option>
                      <option value="Vận chuyển & Ship">Vận chuyển & Ship</option>
                      <option value="Lương nhân viên">Lương nhân viên</option>
                      <option value="Thuê mặt bằng">Thuê mặt bằng</option>
                      <option value="Chi khác">Chi khác</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600">Số Tiền (VNĐ)</label>
                <PriceInput
                  value={amount}
                  onChange={(val) => setAmount(val)}
                  placeholder="0"
                  required
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600">Hình thức thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'transfer' | 'cod')}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                  <option value="cod">COD</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600">Nội Dung Chi Tiết</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả lý do thu chi..."
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Lưu Phiếu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
