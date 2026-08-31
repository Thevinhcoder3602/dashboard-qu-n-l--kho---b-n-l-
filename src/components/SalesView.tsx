import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck,
  User,
  Phone,
  MapPin,
  Printer,
  X,
  Trash2,
  Edit2,
  ReceiptText,
  Percent,
} from 'lucide-react';
import { Order, OrderStatus, Product, OrderItem } from '../types';
import { PriceInput } from './PriceInput';
import {
  formatVND,
  formatDate,
  sanitizePhone,
} from '../utils/formatters';

interface SalesViewProps {
  orders: Order[];
  products: Product[];
  onCreateOrder: (newOrder: Omit<Order, 'id' | 'createdAt'>) => void;
  onUpdateOrder: (updatedOrder: Order, previousOrder: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  orders,
  products,
  onCreateOrder,
  onUpdateOrder,
  onDeleteOrder,
  onUpdateOrderStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Search in product picker
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // New Order Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'cod'>('cash');
  
  // Discount state (Dual mode: VNĐ vs %)
  const [discountType, setDiscountType] = useState<'vnd' | 'percent'>('vnd');
  const [discountVnd, setDiscountVnd] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  const [note, setNote] = useState('');
  // Cart items with customizable selling price (Giá bán tự nhập tay)
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number; sellPrice: number }[]>([]);

  // Edit Order Form state
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerAddress, setEditCustomerAddress] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'cash' | 'transfer' | 'cod'>('cash');
  const [editStatus, setEditStatus] = useState<OrderStatus>('completed');
  
  // Edit Discount state (Dual mode: VNĐ vs %)
  const [editDiscountType, setEditDiscountType] = useState<'vnd' | 'percent'>('vnd');
  const [editDiscountVnd, setEditDiscountVnd] = useState<number>(0);
  const [editDiscountPercent, setEditDiscountPercent] = useState<number>(0);
  
  const [editNote, setEditNote] = useState('');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);

  // Categories for product picker
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filtered products for picker
  const pickerProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.variant || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategoryFilter, productSearch]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.code.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.customerAddress && o.customerAddress.toLowerCase().includes(q));
      const matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  // Cart operations for Create Order
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Sản phẩm này đã hết hàng trong kho!');
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Chỉ còn ${product.stock} ${product.unit} trong kho!`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Default selling price can start as costPrice or 0 for manual input
      return [...prev, { product, quantity: 1, sellPrice: product.costPrice || 0 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleQuantityChange = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock;
          return { ...item, quantity: Math.min(qty, maxStock) };
        }
        return item;
      })
    );
  };

  const handlePriceChange = (productId: string, price: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, sellPrice: price } : item))
    );
  };

  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.sellPrice || 0) * item.quantity, 0);
  const cartCost = cartItems.reduce((sum, item) => sum + item.product.costPrice * item.quantity, 0);
  
  // Calculated actual discount amount in VNĐ
  const cartActualDiscount = useMemo(() => {
    if (discountType === 'percent') {
      const pct = Math.min(100, Math.max(0, discountPercent || 0));
      return Math.round((cartSubtotal * pct) / 100);
    }
    return Math.min(cartSubtotal, Math.max(0, discountVnd || 0));
  }, [cartSubtotal, discountType, discountPercent, discountVnd]);

  const cartFinalTotal = Math.max(0, cartSubtotal - cartActualDiscount);
  const cartProfit = cartFinalTotal - cartCost;

  const handleSubmitCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm vào đơn hàng!');
      return;
    }

    const newCode = 'DH' + (10028 + orders.length);

    onCreateOrder({
      code: newCode,
      customerName: customerName.trim() || 'Khách lẻ',
      customerPhone: sanitizePhone(customerPhone),
      customerAddress: customerAddress.trim(),
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        variant: item.product.variant,
        unitPrice: item.sellPrice || 0,
        costPrice: item.product.costPrice,
        quantity: item.quantity,
        total: (item.sellPrice || 0) * item.quantity,
      })),
      totalAmount: cartSubtotal,
      discount: cartActualDiscount,
      discountType: discountType,
      discountPercent: discountType === 'percent' ? discountPercent : undefined,
      finalAmount: cartFinalTotal,
      totalCost: cartCost,
      profit: cartProfit,
      paymentMethod: paymentMethod,
      status: 'completed',
      note: note.trim(),
    });

    // Reset form & close modal
    setCartItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDiscountVnd(0);
    setDiscountPercent(0);
    setDiscountType('vnd');
    setNote('');
    setIsCreateModalOpen(false);
  };

  // Open Edit Order Modal
  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setEditCustomerName(order.customerName);
    setEditCustomerPhone(order.customerPhone || '');
    setEditCustomerAddress(order.customerAddress || '');
    setEditPaymentMethod(order.paymentMethod);
    setEditStatus(order.status);
    
    // Set discount type & value
    if (order.discountType === 'percent') {
      setEditDiscountType('percent');
      setEditDiscountPercent(order.discountPercent || (order.totalAmount > 0 ? Math.round((order.discount / order.totalAmount) * 100) : 0));
      setEditDiscountVnd(0);
    } else {
      setEditDiscountType('vnd');
      setEditDiscountVnd(order.discount || 0);
      setEditDiscountPercent(0);
    }
    
    setEditNote(order.note || '');
    setEditItems([...order.items]);
  };

  const handleEditItemQtyChange = (idx: number, newQty: number) => {
    if (newQty <= 0) {
      setEditItems((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    setEditItems((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            quantity: newQty,
            total: item.unitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleEditItemPriceChange = (idx: number, newPrice: number) => {
    setEditItems((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return {
            ...item,
            unitPrice: newPrice,
            total: newPrice * item.quantity,
          };
        }
        return item;
      })
    );
  };

  const editSubtotal = editItems.reduce((s, it) => s + it.total, 0);
  const editTotalCost = editItems.reduce((s, it) => s + it.costPrice * it.quantity, 0);
  
  const editActualDiscount = useMemo(() => {
    if (editDiscountType === 'percent') {
      const pct = Math.min(100, Math.max(0, editDiscountPercent || 0));
      return Math.round((editSubtotal * pct) / 100);
    }
    return Math.min(editSubtotal, Math.max(0, editDiscountVnd || 0));
  }, [editSubtotal, editDiscountType, editDiscountPercent, editDiscountVnd]);

  const editFinalTotal = Math.max(0, editSubtotal - editActualDiscount);
  const editProfit = editFinalTotal - editTotalCost;

  const handleSaveEditOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (editItems.length === 0) {
      alert('Đơn hàng phải có ít nhất 1 sản phẩm!');
      return;
    }

    const updated: Order = {
      ...editingOrder,
      customerName: editCustomerName.trim() || 'Khách lẻ',
      customerPhone: sanitizePhone(editCustomerPhone),
      customerAddress: editCustomerAddress.trim(),
      paymentMethod: editPaymentMethod,
      status: editStatus,
      discount: editActualDiscount,
      discountType: editDiscountType,
      discountPercent: editDiscountType === 'percent' ? editDiscountPercent : undefined,
      note: editNote.trim(),
      items: editItems,
      totalAmount: editSubtotal,
      finalAmount: editFinalTotal,
      totalCost: editTotalCost,
      profit: editProfit,
    };

    onUpdateOrder(updated, editingOrder);
    setEditingOrder(null);
  };

  const handleDeleteClick = (order: Order) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa đơn hàng "${order.code}" (${order.customerName})?\nToàn bộ số lượng sản phẩm trong đơn sẽ được hoàn trả lại vào kho!`
      )
    ) {
      onDeleteOrder(order.id);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-emerald-600" />
            <span>QUẢN LÝ ĐƠN BÁN HÀNG</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {orders.length} đơn
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Lập đơn bán nhanh, tự nhập giá bán lẻ linh hoạt theo từng đơn, chiết khấu theo % / VNĐ & in hóa đơn Vitamin Shop
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đơn Hàng Mới</span>
        </button>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã đơn (e.g. DH10028), tên khách, SĐT (10 số), địa chỉ..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs font-semibold">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({orders.length})
            </button>

            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedStatus === 'pending'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chờ xác nhận</span>
            </button>

            <button
              onClick={() => setSelectedStatus('processing')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedStatus === 'processing'
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Đang xử lý</span>
            </button>

            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedStatus === 'completed'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hoàn thành</span>
            </button>

            <button
              onClick={() => setSelectedStatus('cancelled')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedStatus === 'cancelled'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Đã hủy</span>
            </button>
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4 min-w-[180px]">Khách Hàng & Địa Chỉ</th>
                <th className="py-3 px-4">Thời Gian</th>
                <th className="py-3 px-4 text-center">Số Lượng SP</th>
                <th className="py-3 px-4 text-right">Chiết Khấu</th>
                <th className="py-3 px-4 text-right">Tổng Tiền</th>
                <th className="py-3 px-4 text-right">Lợi Nhuận</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center w-36">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    Không có đơn hàng nào phù hợp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const totalItemCount = ord.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order Code */}
                      <td className="py-3 px-4 font-bold font-mono text-emerald-700 whitespace-nowrap">
                        {ord.code}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{ord.customerName}</span>
                        </div>
                        {ord.customerPhone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{ord.customerPhone}</span>
                          </div>
                        )}
                        {ord.customerAddress && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={ord.customerAddress}>
                              {ord.customerAddress}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(ord.createdAt)}
                      </td>

                      {/* Item count */}
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold font-mono text-slate-700">
                          {totalItemCount} món
                        </span>
                      </td>

                      {/* Discount */}
                      <td className="py-3 px-4 text-right font-mono">
                        {ord.discount > 0 ? (
                          <div className="text-rose-600 font-bold">
                            <span>-{formatVND(ord.discount)}</span>
                            {ord.discountType === 'percent' && ord.discountPercent ? (
                              <span className="text-[10px] ml-1 text-rose-500 font-semibold">({ord.discountPercent}%)</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Final Amount */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatVND(ord.finalAmount)}
                      </td>

                      {/* Profit */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        +{formatVND(ord.profit)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            ord.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === 'pending'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : ord.status === 'processing'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {ord.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {ord.status === 'pending' && <Clock className="w-3 h-3 text-rose-600" />}
                          {ord.status === 'processing' && <PackageCheck className="w-3 h-3 text-amber-600" />}
                          {ord.status === 'cancelled' && <XCircle className="w-3 h-3 text-slate-500" />}
                          <span>
                            {ord.status === 'completed'
                              ? 'Hoàn thành'
                              : ord.status === 'pending'
                              ? 'Chờ xác nhận'
                              : ord.status === 'processing'
                              ? 'Đang xử lý'
                              : 'Đã hủy'}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Xem chi tiết & In hóa đơn"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ord)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                            title="Sửa thông tin đơn hàng"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(ord)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Xóa đơn hàng & Hoàn kho"
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
      </div>

      {/* MODAL: CREATE ORDER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-emerald-600" />
                <span>Tạo Đơn Hàng Mới</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Product Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    1. Chọn sản phẩm từ kho
                  </h4>
                  <span className="text-[11px] text-slate-400">{pickerProducts.length} sản phẩm</span>
                </div>

                {/* Product Search & Category Bar */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm tên SP, mã SP..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(c)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                          selectedCategoryFilter === c
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {c === 'all' ? 'Tất cả' : c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {pickerProducts.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">Không tìm thấy sản phẩm.</div>
                  ) : (
                    pickerProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 hover:border-emerald-400 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            {p.variant && <span>{p.variant}</span>}
                            <span>•</span>
                            <span className="font-mono text-slate-700">Giá nhập: {formatVND(p.costPrice)}</span>
                            <span>•</span>
                            <span className={`font-semibold ${p.stock <= p.minStock ? 'text-amber-600' : 'text-slate-600'}`}>
                              Tồn: {p.stock}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          disabled={p.stock <= 0}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition cursor-pointer"
                        >
                          + Chọn
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Order Cart & Customer details */}
              <form onSubmit={handleSubmitCreateOrder} className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. Chi tiết đơn & Khách hàng
                  </h4>

                  {/* Customer Info: Name & Phone */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase">Tên Khách Hàng</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Chị Mai Lan"
                        className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase">Số Điện Thoại (10 số)</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(sanitizePhone(e.target.value))}
                        placeholder="e.g. 0912345678"
                        className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Customer Address */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase">Địa Chỉ Giao Hàng</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="e.g. 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
                      className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  {/* Cart Items List with editable Selling Price */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">
                        Sản phẩm trong đơn ({cartItems.length} món)
                      </label>
                      <span className="text-[10px] text-emerald-700 font-semibold italic">
                        * Tự nhập giá bán trực tiếp
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 space-y-2 max-h-48 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <div className="text-xs text-slate-400 text-center py-6">
                          Chưa có sản phẩm nào được chọn
                        </div>
                      ) : (
                        cartItems.map((item) => (
                          <div
                            key={item.product.id}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="font-bold text-slate-900 text-xs truncate">{item.product.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                  {item.product.variant && <span>{item.product.variant} •</span>}
                                  <span>Giá nhập: {formatVND(item.product.costPrice)}</span>
                                  <span>•</span>
                                  <span>Tồn kho: {item.product.stock}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(item.product.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Xóa món này khỏi đơn"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                              {/* Quantity */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 font-bold text-[11px]">SL:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.product.stock}
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                                  className="w-12 text-center py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold"
                                />
                              </div>

                              {/* Custom Selling Price */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 font-bold text-[11px]">Giá bán:</span>
                                <PriceInput
                                  value={item.sellPrice}
                                  onChange={(val) => handlePriceChange(item.product.id, val)}
                                  className="w-28 text-right py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-emerald-700 outline-none focus:border-emerald-600 focus:bg-white"
                                  placeholder="0"
                                />
                              </div>

                              {/* Total */}
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 text-[11px]">Thành tiền:</span>
                                <span className="font-bold font-mono text-slate-900 min-w-16 text-right">
                                  {formatVND((item.sellPrice || 0) * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Tạm tính ({cartItems.length} món):</span>
                      <span className="font-mono font-bold text-slate-800">{formatVND(cartSubtotal)}</span>
                    </div>

                    {/* Chiết khấu / Giảm giá: Dual Mode (VNĐ vs %) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Chiết khấu:</span>
                        <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setDiscountType('vnd')}
                            className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                              discountType === 'vnd'
                                ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            VNĐ
                          </button>
                          <button
                            type="button"
                            onClick={() => setDiscountType('percent')}
                            className={`px-2.5 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                              discountType === 'percent'
                                ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Percent className="w-3 h-3" />
                            <span>% Phần trăm</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 self-end sm:self-auto">
                        {discountType === 'vnd' ? (
                          <PriceInput
                            value={discountVnd}
                            onChange={(val) => setDiscountVnd(val)}
                            className="w-32 text-right py-1 px-2.5 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold outline-none focus:border-emerald-600"
                            placeholder="0"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={discountPercent === 0 ? '' : discountPercent}
                                onChange={(e) =>
                                  setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                                }
                                placeholder="0"
                                className="w-20 text-right pr-6 py-1 pl-2 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold outline-none focus:border-emerald-600"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                %
                              </span>
                            </div>
                            {cartActualDiscount > 0 && (
                              <span className="text-[11px] font-mono text-rose-600 font-bold whitespace-nowrap">
                                (-{formatVND(cartActualDiscount)})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                      <span>TỔNG KHÁCH THANH TOÁN:</span>
                      <span className="text-emerald-700 font-mono text-base">{formatVND(cartFinalTotal)}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center gap-3 pt-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Hình thức:</label>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      {(['cash', 'transfer', 'cod'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`px-3 py-1 rounded-lg border transition cursor-pointer ${
                            paymentMethod === method
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                              : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                          }`}
                        >
                          {method === 'cash' ? 'Tiền mặt' : method === 'transfer' ? 'Chuyển khoản' : 'COD'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    Tạo & Hoàn Tất Đơn
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ORDER */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Sửa Đơn Hàng <span className="font-mono text-emerald-700">{editingOrder.code}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Tạo lúc: {formatDate(editingOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên khách hàng</label>
                  <input
                    type="text"
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại (10 số)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editCustomerPhone}
                    onChange={(e) => setEditCustomerPhone(sanitizePhone(e.target.value))}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ khách hàng</label>
                <input
                  type="text"
                  value={editCustomerAddress}
                  onChange={(e) => setEditCustomerAddress(e.target.value)}
                  placeholder="Địa chỉ giao nhận hàng..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái đơn</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                  >
                    <option value="completed">Hoàn thành</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hình thức thanh toán</label>
                  <select
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value as 'cash' | 'transfer' | 'cod')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="transfer">Chuyển khoản</option>
                    <option value="cod">COD</option>
                  </select>
                </div>
              </div>

              {/* Items List inside Edit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Danh sách sản phẩm trong đơn ({editItems.length} món)
                </label>
                <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 space-y-2 max-h-48 overflow-y-auto">
                  {editItems.map((item, idx) => (
                    <div key={idx} className="p-2 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold text-slate-800 truncate flex-1">{item.productName}</div>
                        <button
                          type="button"
                          onClick={() => handleEditItemQtyChange(idx, 0)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Xóa món này khỏi đơn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-400">SL:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleEditItemQtyChange(idx, Number(e.target.value) || 1)}
                            className="w-12 text-center py-0.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-400">Giá bán:</span>
                          <PriceInput
                            value={item.unitPrice}
                            onChange={(val) => handleEditItemPriceChange(idx, val)}
                            className="w-24 text-right py-0.5 px-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-emerald-700"
                            placeholder="0"
                          />
                        </div>

                        <span className="font-bold font-mono text-slate-900 min-w-16 text-right">
                          {formatVND(item.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Discount: Dual Mode (VNĐ vs %) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Chiết khấu / Giảm giá</label>
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEditDiscountType('vnd')}
                      className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                        editDiscountType === 'vnd'
                          ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      VNĐ
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDiscountType('percent')}
                      className={`px-2.5 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                        editDiscountType === 'percent'
                          ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Percent className="w-3 h-3" />
                      <span>%</span>
                    </button>
                  </div>
                </div>

                {editDiscountType === 'vnd' ? (
                  <PriceInput
                    value={editDiscountVnd}
                    onChange={(val) => setEditDiscountVnd(val)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none font-bold font-mono focus:border-emerald-600"
                    placeholder="0"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editDiscountPercent === 0 ? '' : editDiscountPercent}
                        onChange={(e) =>
                          setEditDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none font-bold font-mono focus:border-emerald-600"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        %
                      </span>
                    </div>
                    {editActualDiscount > 0 && (
                      <span className="text-xs font-mono text-rose-600 font-bold whitespace-nowrap">
                        (-{formatVND(editActualDiscount)})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  placeholder="Ghi chú thêm cho đơn..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS / INVOICE (VITAMIN SHOP) */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            {/* Header: Vitamin Shop Branding */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  V
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Vitamin Shop</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HÓA ĐƠN BÁN LẺ</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order meta */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Mã đơn hàng:</span>
                <span className="font-bold font-mono text-emerald-700">{selectedOrderDetails.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian tạo:</span>
                <span className="font-medium text-slate-700">{formatDate(selectedOrderDetails.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Khách hàng:</span>
                <span className="font-bold text-slate-900">{selectedOrderDetails.customerName}</span>
              </div>
              {selectedOrderDetails.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Số điện thoại:</span>
                  <span className="font-mono text-slate-700">{selectedOrderDetails.customerPhone}</span>
                </div>
              )}
              {selectedOrderDetails.customerAddress && (
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 shrink-0">Địa chỉ giao:</span>
                  <span className="text-slate-700 text-right pl-2 font-medium">{selectedOrderDetails.customerAddress}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Hình thức thanh toán:</span>
                <span className="font-semibold text-slate-800">
                  {selectedOrderDetails.paymentMethod === 'cash'
                    ? 'Tiền mặt'
                    : selectedOrderDetails.paymentMethod === 'transfer'
                    ? 'Chuyển khoản'
                    : 'COD'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="py-2.5 border-y border-dashed border-slate-200 space-y-2 text-xs">
              {selectedOrderDetails.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-bold text-slate-800 truncate">{it.productName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {it.quantity} x {formatVND(it.unitPrice)}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-900">{formatVND(it.total)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span className="font-mono font-semibold">{formatVND(selectedOrderDetails.totalAmount)}</span>
              </div>
              {selectedOrderDetails.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>
                    Giảm giá{selectedOrderDetails.discountType === 'percent' && selectedOrderDetails.discountPercent ? ` (${selectedOrderDetails.discountPercent}%)` : ''}:
                  </span>
                  <span className="font-mono font-semibold">-{formatVND(selectedOrderDetails.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>TỔNG THU:</span>
                <span className="text-emerald-700 font-mono text-lg">{formatVND(selectedOrderDetails.finalAmount)}</span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Hóa Đơn</span>
              </button>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
