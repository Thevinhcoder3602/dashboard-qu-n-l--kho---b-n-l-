import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Layers,
  Check,
  X,
  PlusCircle,
  MinusCircle,
  FolderPlus,
  Tag,
} from 'lucide-react';
import { Product, ProductFormData } from '../types';
import { PriceInput } from './PriceInput';
import {
  formatVND,
  formatNumber,
  formatNumberWithDots,
  parseNumberFromDots,
} from '../utils/formatters';

interface ProductsViewProps {
  products: Product[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onAddCategory: (categoryName: string) => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (productData: ProductFormData) => void;
  onDeleteProduct: (productId: string) => void;
  onQuickStockChange: (productId: string, delta: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  onAddCategory,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onQuickStockChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Quick import modal
  const [importModalProduct, setImportModalProduct] = useState<Product | null>(null);
  const [importQuantity, setImportQuantity] = useState<number>(5);

  // Form state for add/edit
  const [formData, setFormData] = useState<ProductFormData>({
    stt: products.length + 1,
    code: '',
    name: '',
    variant: '',
    category: categories[0] || 'Nutrilite',
    unit: 'Hộp',
    costPrice: 0,
    sellPrice: 0,
    stock: 10,
    initialStock: 10,
    todayImport: 0,
    minStock: 3,
  });

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Stock filter
        if (stockFilter === 'low' && p.stock > p.minStock) return false;
        if (stockFilter === 'out' && p.stock > 0) return false;

        // Search term
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchCode = p.code.toLowerCase().includes(query);
          const matchVariant = (p.variant || '').toLowerCase().includes(query);
          const matchCat = (p.category || '').toLowerCase().includes(query);
          const matchStt = String(p.stt).includes(query);
          return matchName || matchCode || matchVariant || matchCat || matchStt;
        }

        return true;
      })
      .sort((a, b) => (a.stt || 0) - (b.stt || 0));
  }, [products, selectedCategory, stockFilter, searchTerm]);

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      stt: p.stt,
      code: p.code,
      name: p.name,
      variant: p.variant,
      category: p.category,
      unit: p.unit,
      costPrice: p.costPrice,
      sellPrice: p.sellPrice,
      stock: p.stock,
      initialStock: p.initialStock,
      todayImport: p.todayImport,
      minStock: p.minStock,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct({
      ...editingProduct,
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    setEditingProduct(null);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAddProduct(formData);
    setIsAddModalOpen(false);
  };

  const handleQuickImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importModalProduct || importQuantity <= 0) return;
    onQuickStockChange(importModalProduct.id, importQuantity);
    setImportModalProduct(null);
  };

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setNewCategoryName('');
    setIsAddCategoryModalOpen(false);
  };

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'Nutrilite':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Artistry':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Amway Care':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Amway Home':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-purple-50 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>KHO HÀNG & BẢNG GIÁ SẢN PHẨM</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý {products.length} sản phẩm thuộc {categories.length} danh mục (Vitamin Shop)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Category Button */}
          <button
            onClick={() => {
              setNewCategoryName('');
              setIsAddCategoryModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
            title="Thêm danh mục sản phẩm mới"
          >
            <FolderPlus className="w-4 h-4 text-emerald-600" />
            <span>Tạo Danh Mục</span>
          </button>

          {/* Add Product Button */}
          <button
            onClick={() => {
              setFormData({
                stt: products.length + 1,
                code: `SP-${products.length + 1}`,
                name: '',
                variant: '',
                category: selectedCategory !== 'all' ? selectedCategory : categories[0] || 'Nutrilite',
                unit: 'Hộp',
                costPrice: 0,
                sellPrice: 0,
                stock: 10,
                initialStock: 10,
                todayImport: 0,
                minStock: 3,
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Tất cả</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategory === 'all' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {products.length}
          </span>
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat).length;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Stock Filter Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo STT, tên sản phẩm, mã SP, hương vị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stock Filter Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              stockFilter === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Tất cả ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              stockFilter === 'low'
                ? 'bg-amber-100 text-amber-900 font-bold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Tồn ít ({products.filter((p) => p.stock <= p.minStock).length})
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              stockFilter === 'out'
                ? 'bg-rose-100 text-rose-900 font-bold'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Hết hàng ({products.filter((p) => p.stock === 0).length})
          </button>
        </div>
      </div>

      {/* Main Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-3 w-24">Mã SP</th>
                <th className="py-3 px-3 min-w-[200px]">Tên Sản Phẩm</th>
                <th className="py-3 px-3 min-w-[140px]">Hương vị / Phân loại</th>
                <th className="py-3 px-3">Danh Mục SP</th>
                <th className="py-3 px-3 text-center">ĐVT</th>
                <th className="py-3 px-3 text-right">Giá Nhập</th>
                <th className="py-3 px-3 text-center">Tồn Kho</th>
                <th className="py-3 px-3 text-center w-28">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = product.stock <= product.minStock;
                  const isOut = product.stock === 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-400">
                        {product.stt}
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-600">
                        {product.code}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {product.name}
                      </td>

                      {/* Variant */}
                      <td className="py-3 px-3 text-slate-600">
                        {product.variant ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {product.variant}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${getCategoryBadgeStyle(
                            product.category
                          )}`}
                        >
                          {product.category}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3 text-center text-slate-500">
                        {product.unit || 'Hộp'}
                      </td>

                      {/* Cost Price (Giá Nhập) */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-800 font-mono">
                        {formatVND(product.costPrice)}
                      </td>

                      {/* Stock with quick adjust buttons */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onQuickStockChange(product.id, -1)}
                            disabled={product.stock <= 0}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
                            title="Giảm 1"
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                          </button>

                          <span
                            className={`min-w-[32px] px-2 py-0.5 rounded-md font-bold text-xs ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {product.stock}
                          </span>

                          <button
                            onClick={() => onQuickStockChange(product.id, 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                            title="Tăng 1"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setImportModalProduct(product);
                              setImportQuantity(5);
                            }}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                            title="Nhập thêm hàng"
                          >
                            + Nhập
                          </button>
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="p-1.5 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            Hiển thị <strong>{filteredProducts.length}</strong> / <strong>{products.length}</strong> sản phẩm
          </span>
          <span className="font-semibold text-slate-700">
            Tổng tồn đang hiển thị: {filteredProducts.reduce((sum, p) => sum + p.stock, 0)} cái
          </span>
        </div>
      </div>

      {/* MODAL: TẠO DANH MỤC MỚI */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-emerald-600" />
                <span>Tạo Danh Mục Mới</span>
              </h3>
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategorySubmit} className="mt-3.5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên danh mục mới
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thực phẩm bổ sung, Đồ uống..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  autoFocus
                  required
                />
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                Danh mục mới sẽ lập tức xuất hiện trên thanh lọc danh mục và trong biểu mẫu thêm/sửa sản phẩm.
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Tạo Danh Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nhập Thêm Hàng Nhanh */}
      {importModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h3 className="text-sm font-extrabold text-slate-900 mb-1">
              Nhập Thêm Hàng Vào Kho
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {importModalProduct.name} ({importModalProduct.variant || 'Mặc định'})
            </p>

            <form onSubmit={handleQuickImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số lượng nhập thêm ({importModalProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={importQuantity}
                  onChange={(e) => setImportQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none focus:bg-white"
                  autoFocus
                />
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span>Tồn kho hiện tại:</span>
                  <span className="font-bold text-slate-800">{importModalProduct.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sau khi nhập:</span>
                  <span className="font-bold text-emerald-600">
                    {importModalProduct.stock + (Number(importQuantity) || 0)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportModalProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Xác Nhận Nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Chỉnh Sửa / Thêm Mới Sản Phẩm */}
      {(editingProduct || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsAddModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingProduct ? handleSaveEdit : handleSaveAdd}
              className="mt-4 space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    STT (Số thứ tự)
                  </label>
                  <input
                    type="number"
                    value={formData.stt || ''}
                    onChange={(e) => setFormData({ ...formData, stt: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã sản phẩm
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-emerald-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hương vị / Phân loại
                  </label>
                  <input
                    type="text"
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="e.g. Vị Socola, 200ml..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Danh mục sản phẩm
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold focus:border-emerald-600 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                    placeholder="Hộp / Chai"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá Nhập (VNĐ)
                  </label>
                  <PriceInput
                    value={formData.costPrice}
                    onChange={(val) => setFormData({ ...formData, costPrice: val })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-bold focus:border-emerald-600 focus:bg-white"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tồn kho hiện tại
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formData.stock === 0 ? '0' : formatNumberWithDots(formData.stock)}
                    onChange={(e) => setFormData({ ...formData, stock: parseNumberFromDots(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-bold focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tồn tối thiểu cảnh báo
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formData.minStock === 0 ? '0' : formatNumberWithDots(formData.minStock)}
                    onChange={(e) => setFormData({ ...formData, minStock: parseNumberFromDots(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsAddModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
