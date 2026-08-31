import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ReceiptText,
  ClipboardList,
  WalletCards,
  TrendingUp,
  Plus,
  HeartHandshake,
  FolderPlus,
} from 'lucide-react';
import { MainTab, Product } from '../types';

interface SidebarProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  products: Product[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenAddCategoryModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  onOpenAddCategoryModal,
}) => {
  const navItems = [
    {
      id: 'dashboard' as MainTab,
      label: 'Tổng quan',
      icon: LayoutDashboard,
      desc: 'Báo cáo & Thống kê nhanh',
    },
    {
      id: 'products' as MainTab,
      label: 'Kho hàng & Bảng giá',
      icon: Package,
      badge: `${products.length} SP`,
      desc: 'Bảng giá & Quản lý sản phẩm',
    },
    {
      id: 'pos' as MainTab,
      label: 'Tạo đơn bán hàng',
      icon: ShoppingCart,
      badge: 'Bán lẻ/NPP',
      desc: 'Lập đơn nhanh & trừ kho',
    },
    {
      id: 'orders' as MainTab,
      label: 'Lịch sử đơn hàng',
      icon: ReceiptText,
      desc: 'Xem & in phiếu đơn hàng',
    },
    {
      id: 'inventory' as MainTab,
      label: 'Chốt kho cuối ngày',
      icon: ClipboardList,
      badge: 'PDF',
      desc: 'Tồn đầu, Nhập, Cuối ngày',
    },
    {
      id: 'finance' as MainTab,
      label: 'Sổ quỹ thu chi',
      icon: WalletCards,
      desc: 'Theo dõi tiền & dòng vốn',
    },
  ];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Nutrilite':
        return 'bg-emerald-100 text-emerald-800';
      case 'Artistry':
        return 'bg-rose-100 text-rose-800';
      case 'Amway Care':
        return 'bg-sky-100 text-sky-800';
      case 'Amway Home':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Nutrilite':
        return '🌿';
      case 'Artistry':
        return '💄';
      case 'Amway Care':
        return '🧴';
      case 'Amway Home':
        return '🏠';
      default:
        return '🏷️';
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
          V
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-sm tracking-tight">Vitamin Shop</h1>
          <p className="text-[11px] text-slate-400 font-medium">Kho Hàng & Bán Lẻ Light</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Chức năng chính
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'pos' && activeTab === 'sales');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive
                          ? 'bg-emerald-700/80 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Categories Fast Filter */}
      <div className="p-3 mt-1 border-t border-slate-100 flex-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Danh Mục ({categories.length})</span>
          {onOpenAddCategoryModal && (
            <button
              onClick={onOpenAddCategoryModal}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-1.5 py-0.5 rounded-md transition cursor-pointer"
              title="Tạo thêm danh mục mới"
            >
              <Plus className="w-3 h-3" />
              <span>Thêm mới</span>
            </button>
          )}
        </div>

        <div className="space-y-1 mt-1 max-h-56 overflow-y-auto pr-1">
          {/* All categories */}
          <button
            onClick={() => {
              setSelectedCategory('all');
              if (activeTab !== 'products') setActiveTab('products');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
              activeTab === 'products' && selectedCategory === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="truncate">Tất cả sản phẩm</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'products' && selectedCategory === 'all'
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {products.length}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            const isCatActive = activeTab === 'products' && selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  if (activeTab !== 'products') setActiveTab('products');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
                  isCatActive
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="truncate flex items-center gap-1.5">
                  <span>{getCategoryIcon(cat)}</span>
                  <span>{cat}</span>
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isCatActive ? 'bg-slate-800 text-slate-200' : getCategoryColor(cat)
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Summary Pill at Bottom */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trạng thái kho</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 flex justify-between">
            <span>Tổng tồn kho:</span>
            <span className="font-bold text-slate-900">
              {products.reduce((sum, p) => sum + p.stock, 0)} cái
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
