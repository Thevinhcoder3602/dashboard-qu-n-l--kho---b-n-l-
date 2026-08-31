import React from 'react';
import {
  PieChart,
  TrendingUp,
  DollarSign,
  Archive,
  Receipt,
  FileSpreadsheet,
  History,
  Download,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { ReportsSubTab, Product, Order, FinancialTransaction } from '../types';
import { formatVND } from '../utils/formatters';

interface ReportsViewProps {
  subTab: ReportsSubTab;
  setSubTab: (sub: ReportsSubTab) => void;
  products: Product[];
  orders: Order[];
  transactions: FinancialTransaction[];
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  subTab,
  setSubTab,
  products,
  orders,
  transactions,
  onExportCSV,
  onExportJSON,
}) => {
  const totalRevenue = orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.finalAmount : 0), 0);
  const totalCostOfGoods = orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.totalCost : 0), 0);
  const grossProfit = totalRevenue - totalCostOfGoods;

  const totalOtherExpense = transactions.filter((t) => t.type === 'expense' && t.category !== 'Nhập hàng').reduce((s, t) => s + t.amount, 0);
  const netProfit = grossProfit - totalOtherExpense;

  const totalStockValue = products.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const totalPotentialRevenue = products.reduce((s, p) => s + p.stock * p.sellPrice, 0);

  const subTabTitles: Record<ReportsSubTab, string> = {
    overview: 'Tổng quan báo cáo',
    profit: 'Báo cáo lợi nhuận kinh doanh',
    revenue: 'Báo cáo doanh thu bán hàng',
    inventory_rpt: 'Báo cáo kho hàng & Giá trị tồn kho',
    finance_rpt: 'Báo cáo thu chi & Dòng tiền',
    stock_summary_rpt: 'Báo cáo tổng hợp tồn kho',
    export_history: 'Lịch sử xuất báo cáo & Tải về',
  };

  return (
    <div className="space-y-6 pb-10">
      {/* SUB-NAVIGATION TABS */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'overview'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Tổng quan</span>
          </button>

          <button
            onClick={() => setSubTab('profit')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'profit'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lợi nhuận</span>
          </button>

          <button
            onClick={() => setSubTab('revenue')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'revenue'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            <span>Doanh thu</span>
          </button>

          <button
            onClick={() => setSubTab('inventory_rpt')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'inventory_rpt'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-purple-600" />
            <span>Kho hàng</span>
          </button>

          <button
            onClick={() => setSubTab('finance_rpt')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'finance_rpt'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
            <span>Thu chi</span>
          </button>

          <button
            onClick={() => setSubTab('stock_summary_rpt')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'stock_summary_rpt'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>Tổng hợp tồn kho</span>
          </button>
        </div>
      </div>

      {/* REPORT CONTENT BODY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {subTabTitles[subTab]}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích số liệu tổng hợp tự động của hệ thống Vitamin Shop
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tải Excel</span>
            </button>
            <button
              onClick={onExportJSON}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tải JSON</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase">TỔNG DOANH THU</div>
            <div className="text-xl font-black text-slate-900 mt-1 font-mono">{formatVND(totalRevenue)}</div>
            <div className="text-[11px] text-slate-400 mt-1">Từ {orders.length} đơn hàng</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase">LỢI NHUẬN GỘP</div>
            <div className="text-xl font-black text-emerald-600 mt-1 font-mono">+{formatVND(grossProfit)}</div>
            <div className="text-[11px] text-slate-400 mt-1">Doanh thu - Giá vốn</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase">LỢI NHUẬN RÒNG DỰ KIẾN</div>
            <div className="text-xl font-black text-blue-600 mt-1 font-mono">+{formatVND(netProfit)}</div>
            <div className="text-[11px] text-slate-400 mt-1">Đã trừ chi phí vận hành</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase">TỔNG GIÁ TRỊ VỐN KHO</div>
            <div className="text-xl font-black text-indigo-700 mt-1 font-mono">{formatVND(totalStockValue)}</div>
            <div className="text-[11px] text-slate-400 mt-1">{products.length} mã sản phẩm</div>
          </div>
        </div>

        {/* DETAILED SUMMARY TABLE */}
        <div className="overflow-x-auto pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Bảng Tổng Hợp Chi Tiết Theo Sản Phẩm ({products.length} SP)
          </h4>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4">Tên Sản Phẩm</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4 text-center">Tồn Kho</th>
                <th className="py-3 px-4 text-right">Giá Nhập</th>
                <th className="py-3 px-4 text-right">Tổng Vốn Tồn Kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-mono text-slate-400">{p.stt}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{p.name} {p.variant && <span className="font-normal text-slate-500">({p.variant})</span>}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{p.stock}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">{formatVND(p.costPrice)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">{formatVND(p.stock * p.costPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
