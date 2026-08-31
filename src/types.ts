export interface Product {
  id: string;
  stt: number;
  code: string;
  name: string;
  variant: string;
  category: 'Nutrilite' | 'Artistry' | 'Amway Care' | 'Amway Home' | string;
  unit: string;
  costPrice: number; // Giá NPP trong PDF
  sellPrice: number; // Giá bán lẻ đề xuất
  stock: number; // Tồn hiện tại / Tồn cuối ngày
  initialStock: number; // Số lượng tồn ban đầu
  todayImport: number; // Nhập trong ngày
  todaySold: number; // Bán trong ngày
  minStock: number; // Mức tồn cảnh báo tối thiểu
  imageUrl?: string;
  updatedAt: string;
}

export type ProductFormData = Omit<Product, 'id' | 'updatedAt'> & {
  todaySold?: number;
};

export interface OrderItem {
  productId: string;
  productName: string;
  variant?: string;
  priceType?: 'retail' | 'npp'; // Bán theo giá lẻ hay giá NPP
  unitPrice: number;
  costPrice: number;
  quantity: number;
  total: number;
}

export type OrderStatus = 'completed' | 'pending' | 'processing' | 'cancelled';

export interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number; // Tổng số tiền giảm thực tế (VNĐ)
  discountType?: 'vnd' | 'percent'; // Loại chiết khấu (theo VNĐ hay theo %)
  discountPercent?: number; // % giảm giá nếu chọn loại percent
  finalAmount: number;
  totalCost: number;
  profit: number;
  paymentMethod: 'cash' | 'transfer' | 'cod';
  status: OrderStatus;
  createdAt: string;
  note?: string;
}

export interface StockMovement {
  id: string;
  type: 'import' | 'sale' | 'export' | 'adjust' | 'audit_adjust';
  productId: string;
  productName: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  refCode: string;
  note: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplier: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'received' | 'pending' | 'cancelled';
  note?: string;
  createdAt: string;
}

export interface StockAuditItem {
  productId: string;
  productName: string;
  unit: string;
  systemStock: number;
  actualStock: number;
  difference: number;
  reason: string;
}

export interface StockAudit {
  id: string;
  code: string;
  auditDate: string;
  auditor: string;
  items: StockAuditItem[];
  status: 'applied' | 'draft';
  note?: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  code: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  refCode?: string;
  date: string;
  paymentMethod: 'cash' | 'transfer' | 'cod';
}

export type MainTab =
  | 'dashboard'
  | 'products'
  | 'pos'
  | 'sales'
  | 'orders'
  | 'inventory'
  | 'finance'
  | 'reports';

export type InventorySubTab = 'ledger' | 'stock' | 'initial' | 'import' | 'export' | 'audit';
export type ReportsSubTab =
  | 'overview'
  | 'profit'
  | 'revenue'
  | 'inventory_rpt'
  | 'finance_rpt'
  | 'stock_summary_rpt'
  | 'export_history';
export type SalesSubTab = 'orders' | 'pos';
export type ProductsSubTab = 'products_list' | 'pricing' | 'categories';
export type FinanceSubTab = 'transactions' | 'cashflow' | 'summary';
