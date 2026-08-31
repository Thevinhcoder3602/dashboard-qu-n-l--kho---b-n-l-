import React from 'react';
import {
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Sparkles,
  ClipboardCheck,
  Clock,
  Layers,
} from 'lucide-react';
import { Product, Order, MainTab } from '../types';
import { formatVND, formatNumber, formatDate } from '../utils/formatters';

interface OverviewDashboardProps {
  products: Product[];
  orders: Order[];
  categories: string[];
  setActiveTab: (tab: MainTab) => void;
  setSelectedCategory: (cat: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  products,
  orders,
  categories,
  setActiveTab,
  setSelectedCategory,
}) => {
  // Calculations
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCostValue = products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
  const totalRetailValue = products.reduce((acc, p) => acc + p.stock * p.sellPrice, 0);
  const expectedProfit = totalRetailValue - totalCostValue;

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.finalAmount, 0);
  const totalProfit = completedOrders.reduce((acc, o) => acc + o.profit, 0);

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'Nutrilite':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800',
          icon: '🌿',
        };
      case 'Artistry':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-200',
          badge: 'bg-rose-100 text-rose-800',
          icon: '💄',
        };
      case 'Amway Care':
        return {
          bg: 'bg-sky-50 text-sky-900 border-sky-200',
          badge: 'bg-sky-100 text-sky-800',
          icon: '🧴',
        };
      case 'Amway Home':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          badge: 'bg-amber-100 text-amber-800',
          icon: '🏠',
        };
      default:
        return {
          bg: 'bg-purple-50 text-purple-900 border-purple-200',
          badge: 'bg-purple-100 text-purple-800',
          icon: '🏷️',
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ Thống Kho & Bán Lẻ Vitamin Shop</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Quản Lý {products.length} Sản Phẩm
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Tự động theo dõi tồn kho, giá vốn nhập hàng, linh hoạt nhập giá bán theo từng đơn hàng và chốt kho nhanh chóng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs shadow-sm hover:bg-emerald-50 transition cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Tạo Đơn Bán Mới</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-900 text-white font-bold text-xs transition border border-emerald-500/40 cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Chốt Kho Cuối Ngày</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost Value (Giá Nhập) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Giá Trị Kho (Giá Nhập)
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {formatVND(totalCostValue)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-indigo-600">{formatNumber(totalStockCount)}</span>
              <span>sản phẩm trong kho</span>
            </div>
          </div>
        </div>

        {/* Expected Retail Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Giá Trị Bán Lẻ Ước Tính
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              {formatVND(totalRetailValue)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Lợi nhuận kỳ vọng:</span>
              <span className="font-bold text-emerald-600">+{formatVND(expectedProfit)}</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Doanh Thu Đã Bán
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {formatVND(totalRevenue)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>Lợi nhuận ròng:</span>
              <span className="font-bold text-blue-600">+{formatVND(totalProfit)}</span>
            </div>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cảnh Báo Tồn Kho Ít
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${lowStockProducts.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-xl sm:text-2xl font-black ${lowStockProducts.length > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}
            >
              {lowStockProducts.length} <span className="text-sm font-normal text-slate-500">mã SP</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {lowStockProducts.length > 0 ? 'Cần nhập bổ sung sớm' : 'Kho hàng an toàn'}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Overview Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Phân Bổ Kho Theo {categories.length} Danh Mục</span>
          </h3>
          <span className="text-xs text-slate-500">{products.length} sản phẩm chuẩn</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((catName) => {
            const catItems = products.filter((p) => p.category === catName);
            const count = catItems.length;
            const catStock = catItems.reduce((acc, p) => acc + p.stock, 0);
            const catCost = catItems.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
            const style = getCategoryBadgeStyle(catName);

            return (
              <div
                key={catName}
                onClick={() => {
                  setSelectedCategory(catName);
                  setActiveTab('products');
                }}
                className={`p-4 rounded-2xl border transition-all hover:shadow-md cursor-pointer ${style.bg}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <span>{style.icon}</span>
                    <span>{catName}</span>
                  </span>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {count} SP
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-lg font-black">{formatVND(catCost)}</div>
                  <div className="text-xs opacity-75 mt-0.5">Tồn: {catStock} sản phẩm</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Low Stock Alert & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Low Stock Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Sản phẩm sắp hết hàng</h4>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Không có sản phẩm nào chạm mức tồn cảnh báo.
              </div>
            ) : (
              lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {p.name} {p.variant && `(${p.variant})`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mã: {p.code} | {p.category} | Giá Nhập: {formatVND(p.costPrice)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                      Tồn: {p.stock} {p.unit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Đơn hàng vừa bán gần đây</h4>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Xem sổ đơn ({orders.length})
            </button>
          </div>

          <div className="space-y-2">
            {orders.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Chưa có đơn hàng nào được tạo.
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{order.customerName || 'Khách lẻ'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({order.code})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {order.items.length} món • {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-700 font-mono">
                      {formatVND(order.finalAmount)}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      Lãi: +{formatVND(order.profit)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
