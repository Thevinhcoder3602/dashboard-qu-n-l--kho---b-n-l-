import React, { useState } from 'react';
import {
  BookOpen,
  Archive,
  ArrowDownLeft,
  ArrowUpRight,
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  X,
  Boxes,
} from 'lucide-react';
import { InventorySubTab, Product, StockMovement, PurchaseOrder, StockAudit } from '../types';
import { formatVND, formatDate } from '../utils/formatters';

interface InventoryViewProps {
  subTab: InventorySubTab;
  setSubTab: (sub: InventorySubTab) => void;
  products: Product[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  stockAudits: StockAudit[];
  onCreatePurchaseOrder: (newPo: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  onApplyStockAudit: (newAudit: Omit<StockAudit, 'id' | 'createdAt'>) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  subTab,
  setSubTab,
  products,
  stockMovements,
  purchaseOrders,
  stockAudits,
  onCreatePurchaseOrder,
  onApplyStockAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewImportModalOpen, setIsNewImportModalOpen] = useState(false);
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);

  // New Purchase Order Form State
  const [supplier, setSupplier] = useState('');
  const [poItems, setPoItems] = useState<{ product: Product; quantity: number; unitPrice: number }[]>([]);

  // Audit Form State
  const [auditItems, setAuditItems] = useState<{ product: Product; actualStock: number; reason: string }[]>(() =>
    products.map((p) => ({ product: p, actualStock: p.stock, reason: 'Khớp 100%' }))
  );

  const subTabTitles: Record<InventorySubTab, string> = {
    ledger: 'Sổ kho (Lịch sử nhập xuất tồn)',
    stock: 'Tồn kho (Báo cáo & Cảnh báo)',
    initial: 'Tồn kho đầu kỳ',
    import: 'Nhập hàng (Phiếu nhập kho)',
    export: 'Xuất hàng (Phiếu xuất kho)',
    audit: 'Kiểm kho (Đối soát & Cân bằng kho)',
  };

  const handleAddPoItem = (prod: Product) => {
    setPoItems((prev) => {
      const exists = prev.find((item) => item.product.id === prod.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, quantity: item.quantity + 10 } : item
        );
      }
      return [...prev, { product: prod, quantity: 10, unitPrice: prod.costPrice }];
    });
  };

  const handleSubmitPo = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm nhập hàng!');
      return;
    }

    const code = 'NH' + Math.floor(1000 + Math.random() * 9000);
    const totalAmount = poItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    onCreatePurchaseOrder({
      code: code,
      supplier: supplier.trim() || 'Tổng Kho Amway Việt Nam',
      items: poItems.map((it) => ({
        productId: it.product.id,
        productName: it.product.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.quantity * it.unitPrice,
      })),
      totalAmount: totalAmount,
      status: 'received',
      note: 'Đã hoàn thành nhập kho',
    });

    setPoItems([]);
    setSupplier('');
    setIsNewImportModalOpen(false);
  };

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = 'KK' + Math.floor(100 + Math.random() * 900);
    const auditDate = new Date().toISOString().slice(0, 10);

    onApplyStockAudit({
      code,
      auditDate,
      auditor: 'Chủ cửa hàng Vitamin Shop',
      items: auditItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        unit: item.product.unit,
        systemStock: item.product.stock,
        actualStock: item.actualStock,
        difference: item.actualStock - item.product.stock,
        reason: item.reason,
      })),
      status: 'applied',
      note: 'Đã cập nhật tồn kho theo kết quả kiểm kê',
    });

    setIsNewAuditModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* SUB-NAVIGATION TABS */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setSubTab('ledger')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'ledger'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sổ kho</span>
          </button>

          <button
            onClick={() => setSubTab('stock')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'stock'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Tồn kho</span>
          </button>

          <button
            onClick={() => setSubTab('initial')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'initial'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-amber-500" />
            <span>Tồn kho đầu kỳ</span>
          </button>

          <button
            onClick={() => setSubTab('import')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'import'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nhập hàng</span>
          </button>

          <button
            onClick={() => setSubTab('export')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'export'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Xuất hàng</span>
          </button>

          <button
            onClick={() => setSubTab('audit')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              subTab === 'audit'
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Kiểm kho</span>
          </button>
        </div>

        {subTab === 'import' && (
          <button
            onClick={() => setIsNewImportModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo phiếu nhập</span>
          </button>
        )}

        {subTab === 'audit' && (
          <button
            onClick={() => setIsNewAuditModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo phiếu kiểm kho</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: SỔ KHO (LEDGER) */}
      {subTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">
              {subTabTitles.ledger}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhật ký chi tiết biến động số lượng sản phẩm nhập kho, xuất bán và kiểm kê
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Thời Gian</th>
                  <th className="py-3 px-4">Mã Tham Chiếu</th>
                  <th className="py-3 px-4">Loại Giao Dịch</th>
                  <th className="py-3 px-4">Sản Phẩm</th>
                  <th className="py-3 px-4 text-center">Tồn Trước</th>
                  <th className="py-3 px-4 text-center">Thay Đổi</th>
                  <th className="py-3 px-4 text-center">Tồn Sau</th>
                  <th className="py-3 px-4">Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">{formatDate(mov.createdAt)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{mov.refCode}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          mov.type === 'import'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : mov.type === 'sale'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {mov.type === 'import'
                          ? 'Nhập kho'
                          : mov.type === 'sale'
                          ? 'Bán hàng'
                          : 'Cân bằng kiểm kho'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {mov.productName}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">{mov.stockBefore}</td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold">
                      <span className={mov.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{mov.stockAfter}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{mov.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2 & 3: TỒN KHO & TỒN KHO ĐẦU KỲ */}
      {(subTab === 'stock' || subTab === 'initial') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {subTabTitles[subTab]}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {subTab === 'stock'
                  ? 'Tổng hợp số lượng hiện có, giá trị vốn tồn kho và ngưỡng tối thiểu'
                  : 'Danh sách số lượng tồn kho ban đầu khi bắt đầu thiết lập cửa hàng'}
              </p>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Tổng giá trị vốn: <span className="font-mono text-emerald-700 text-sm font-extrabold">{formatVND(products.reduce((s, p) => s + p.stock * p.costPrice, 0))}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 text-center w-12">STT</th>
                  <th className="py-3 px-4">Mã & Tên SP</th>
                  <th className="py-3 px-4">Danh Mục</th>
                  <th className="py-3 px-4 text-right">Giá Nhập</th>
                  <th className="py-3 px-4 text-center">Tồn Hiện Tại</th>
                  <th className="py-3 px-4 text-center">Min Stock</th>
                  <th className="py-3 px-4 text-right">Tổng Vốn Tồn</th>
                  <th className="py-3 px-4 text-center">Đánh Giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{p.stt}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.name} {p.variant && <span className="font-normal text-slate-500">({p.variant})</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{formatVND(p.costPrice)}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{p.stock} {p.unit}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{p.minStock}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-800">
                      {formatVND(p.stock * p.costPrice)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.stock === 0 ? (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-bold text-[11px]">Hết hàng</span>
                      ) : p.stock <= p.minStock ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-bold text-[11px]">Cần nhập thêm</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[11px]">An toàn</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4 & 5: NHẬP HÀNG & XUẤT HÀNG */}
      {(subTab === 'import' || subTab === 'export') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {subTabTitles[subTab]}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách chứng từ nhập kho / xuất hàng từ nhà cung cấp & đối tác
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div key={po.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold font-mono text-emerald-700">{po.code}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã nhập kho</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Nhà cung cấp: <strong className="text-slate-800">{po.supplier}</strong> • {formatDate(po.createdAt)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {po.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold font-mono text-slate-900">
                    {formatVND(po.totalAmount)}
                  </div>
                  <div className="text-[11px] text-slate-400">Đã thanh toán đủ</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 6: KIỂM KHO (AUDIT) */}
      {subTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {subTabTitles[subTab]}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lịch sử các đợt kiểm kê thực tế tại cửa hàng & tự động cân bằng dữ liệu kho
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {stockAudits.map((aud) => (
              <div key={aud.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold font-mono text-emerald-700">{aud.code}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Đã cân bằng kho</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{aud.auditDate}</span>
                </div>

                <div className="text-xs text-slate-500">
                  Người kiểm kê: <strong>{aud.auditor}</strong> - {aud.note}
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                  {aud.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span>{it.productName}: Hệ thống {it.systemStock} → Thực tế {it.actualStock}</span>
                      <span className={`font-bold font-mono ${it.difference !== 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {it.difference > 0 ? `+${it.difference}` : it.difference} ({it.reason})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE PURCHASE RECEIPT (NHẬP HÀNG) */}
      {isNewImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Tạo Phiếu Nhập Hàng</h3>
              <button onClick={() => setIsNewImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPo} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-600">Nhà Cung Cấp</label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Tổng Kho Amway Việt Nam"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600">Chọn sản phẩm cần nhập:</label>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-36 overflow-y-auto">
                  {products.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handleAddPoItem(p)}
                      className="p-2 text-left rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 flex justify-between items-center transition cursor-pointer"
                    >
                      <span className="font-bold truncate text-slate-800">{p.name}</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold">+ Thêm</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2 max-h-48 overflow-y-auto">
                <div className="font-bold text-slate-600">Danh sách mặt hàng nhập ({poItems.length} món):</div>
                {poItems.length === 0 ? (
                  <div className="text-slate-400 text-center py-4">Chưa chọn sản phẩm nào</div>
                ) : (
                  poItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-800 truncate flex-1">{item.product.name}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setPoItems((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: val } : it));
                          }}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold"
                        />
                        <span className="text-slate-600">x {formatVND(item.unitPrice)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsNewImportModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Xác Nhận Nhập Kho</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE AUDIT */}
      {isNewAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Tạo Phiếu Kiểm Kho Cân Bằng</h3>
              <button onClick={() => setIsNewAuditModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAudit} className="space-y-4 text-xs">
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {auditItems.map((item, idx) => (
                  <div key={item.product.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900">{item.product.name}</div>
                      <div className="text-[11px] text-slate-500">Tồn hệ thống: <strong className="text-slate-800">{item.product.stock} {item.product.unit}</strong></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="font-semibold text-slate-600">Thực tế:</label>
                      <input
                        type="number"
                        min="0"
                        value={item.actualStock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAuditItems((prev) => prev.map((it, i) => i === idx ? { ...it, actualStock: val } : it));
                        }}
                        className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsNewAuditModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Lưu & Cân Bằng Kho</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
