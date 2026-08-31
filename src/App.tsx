import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SalesView } from './components/SalesView';
import { ProductsView } from './components/ProductsView';
import { InventoryView } from './components/InventoryView';
import { FinanceView } from './components/FinanceView';
import { ReportsView } from './components/ReportsView';

import {
  Product,
  ProductFormData,
  Order,
  OrderStatus,
  StockMovement,
  PurchaseOrder,
  StockAudit,
  FinancialTransaction,
  MainTab,
  InventorySubTab,
  ReportsSubTab,
  FinanceSubTab,
} from './types';

import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_STOCK_AUDITS,
  INITIAL_FINANCIAL_TRANSACTIONS,
} from './data/initialData';

import { exportToJSON, exportToCSV, exportFullBackupJSON } from './utils/formatters';
import { CheckCircle2 } from 'lucide-react';

const PRODUCTS_KEY = 'vitamin_shop_products_data';
const ORDERS_KEY = 'vitamin_shop_orders_data';
const MOVEMENTS_KEY = 'vitamin_shop_movements_data';
const PO_KEY = 'vitamin_shop_po_data';
const AUDITS_KEY = 'vitamin_shop_audits_data';
const FINANCE_KEY = 'vitamin_shop_finance_data';
const CATEGORIES_KEY = 'vitamin_shop_categories_data';

const DEFAULT_CATEGORIES = ['Nutrilite', 'Artistry', 'Amway Care', 'Amway Home'];

export default function App() {
  // 1. Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inventorySubTab, setInventorySubTab] = useState<InventorySubTab>('stock');
  const [reportsSubTab, setReportsSubTab] = useState<ReportsSubTab>('overview');
  const [financeSubTab, setFinanceSubTab] = useState<FinanceSubTab>('transactions');

  // 2. Persistent State
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved =
        localStorage.getItem(CATEGORIES_KEY) ||
        localStorage.getItem('amway_inventory_categories_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi tải categories:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved =
        localStorage.getItem(PRODUCTS_KEY) ||
        localStorage.getItem('amway_inventory_products_105_v4') ||
        localStorage.getItem('amway_inventory_products_105_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi tải products:', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved =
        localStorage.getItem(ORDERS_KEY) ||
        localStorage.getItem('amway_inventory_orders_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi tải orders:', e);
    }
    return INITIAL_ORDERS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved =
        localStorage.getItem(MOVEMENTS_KEY) ||
        localStorage.getItem('amway_inventory_movements_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi tải movements:', e);
    }
    return INITIAL_STOCK_MOVEMENTS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved =
        localStorage.getItem(PO_KEY) ||
        localStorage.getItem('amway_inventory_po_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi tải PO:', e);
    }
    return INITIAL_PURCHASE_ORDERS;
  });

  const [stockAudits, setStockAudits] = useState<StockAudit[]>(() => {
    try {
      const saved =
        localStorage.getItem(AUDITS_KEY) ||
        localStorage.getItem('amway_inventory_audits_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi tải Audits:', e);
    }
    return INITIAL_STOCK_AUDITS;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    try {
      const saved =
        localStorage.getItem(FINANCE_KEY) ||
        localStorage.getItem('amway_inventory_finance_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi tải Finance:', e);
    }
    return INITIAL_FINANCIAL_TRANSACTIONS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(PO_KEY, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(AUDITS_KEY, JSON.stringify(stockAudits));
  }, [stockAudits]);

  useEffect(() => {
    localStorage.setItem(FINANCE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  // Handlers for Categories
  const handleAddCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      showToast(`Danh mục "${trimmed}" đã tồn tại!`);
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    showToast(`Đã tạo thành công danh mục mới: "${trimmed}"`);
  };

  // Handlers for Products
  const handleAddProduct = (formData: ProductFormData) => {
    const newProd: Product = {
      id: 'prod-' + Date.now(),
      ...formData,
      todaySold: formData.todaySold ?? 0,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    showToast(`Đã thêm sản phẩm "${formData.name}" vào danh mục ${formData.category}!`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Đã cập nhật thông tin sản phẩm "${updated.name}"`);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Đã xóa sản phẩm khỏi kho');
  };

  const handleQuickStockChange = (id: string, delta: number) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const nextStock = Math.max(0, target.stock + delta);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              stock: nextStock,
              todayImport: delta > 0 ? (p.todayImport || 0) + delta : p.todayImport,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    // Create Stock Movement log
    const movement: StockMovement = {
      id: 'mov-' + Date.now(),
      type: delta > 0 ? 'import' : 'adjust',
      productId: target.id,
      productName: target.name,
      quantityChange: delta,
      stockBefore: target.stock,
      stockAfter: nextStock,
      refCode: 'DC-' + Math.floor(1000 + Math.random() * 9000),
      note: delta > 0 ? 'Nhập bổ sung kho nhanh' : 'Điều chỉnh giảm tồn kho',
      createdAt: new Date().toISOString(),
    };
    setStockMovements((prev) => [movement, ...prev]);
    showToast(`Đã cập nhật tồn kho "${target.name}" (${nextStock} ${target.unit})`);
  };

  // Handlers for Orders
  const handleCreateOrder = (newOrderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      ...newOrderData,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Deduct Stock & add movements
    newOrder.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const nextStock = Math.max(0, prod.stock - item.quantity);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.productId
              ? {
                  ...p,
                  stock: nextStock,
                  todaySold: (p.todaySold || 0) + item.quantity,
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );

        const mov: StockMovement = {
          id: 'mov-' + Date.now() + Math.random(),
          type: 'sale',
          productId: item.productId,
          productName: item.productName,
          quantityChange: -item.quantity,
          stockBefore: prod.stock,
          stockAfter: nextStock,
          refCode: newOrder.code,
          note: `Xuất bán đơn hàng ${newOrder.code}`,
          createdAt: new Date().toISOString(),
        };
        setStockMovements((prev) => [mov, ...prev]);
      }
    });

    // Create Income Transaction
    const tx: FinancialTransaction = {
      id: 'ft-' + Date.now(),
      code: 'PT' + Math.floor(10000 + Math.random() * 90000),
      type: 'income',
      category: 'Bán hàng',
      amount: newOrder.finalAmount,
      description: `Thu tiền đơn hàng ${newOrder.code} - ${newOrder.customerName}`,
      refCode: newOrder.code,
      date: new Date().toISOString(),
      paymentMethod: newOrder.paymentMethod,
    };
    setTransactions((prev) => [tx, ...prev]);

    showToast(`Đã tạo và hoàn tất đơn hàng ${newOrder.code}!`);
  };

  const handleUpdateOrder = (updatedOrder: Order, previousOrder: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));

    // Reconcile stock differences
    previousOrder.items.forEach((prevItem) => {
      const nextItem = updatedOrder.items.find((i) => i.productId === prevItem.productId);
      const diff = (nextItem ? nextItem.quantity : 0) - prevItem.quantity;
      if (diff !== 0) {
        setProducts((prevProds) =>
          prevProds.map((p) =>
            p.id === prevItem.productId
              ? {
                  ...p,
                  stock: Math.max(0, p.stock - diff),
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );
      }
    });

    showToast(`Đã cập nhật đơn hàng ${updatedOrder.code}!`);
  };

  const handleDeleteOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Refund stock to inventory
    targetOrder.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === item.productId
            ? {
                ...p,
                stock: p.stock + item.quantity,
                todaySold: Math.max(0, (p.todaySold || 0) - item.quantity),
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );

      const mov: StockMovement = {
        id: 'mov-' + Date.now() + Math.random(),
        type: 'adjust',
        productId: item.productId,
        productName: item.productName,
        quantityChange: item.quantity,
        stockBefore: products.find((p) => p.id === item.productId)?.stock || 0,
        stockAfter: (products.find((p) => p.id === item.productId)?.stock || 0) + item.quantity,
        refCode: 'HUY-' + targetOrder.code,
        note: `Hoàn kho do xóa đơn hàng ${targetOrder.code}`,
        createdAt: new Date().toISOString(),
      };
      setStockMovements((prev) => [mov, ...prev]);
    });

    // Remove matching transaction
    setTransactions((prev) => prev.filter((t) => t.refCode !== targetOrder.code));

    // Remove order
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(`Đã xóa đơn hàng ${targetOrder.code} & hoàn trả tồn kho thành công!`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    showToast(`Đã cập nhật trạng thái đơn hàng`);
  };

  // Purchase Order (Nhập hàng)
  const handleCreatePurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    const newPo: PurchaseOrder = {
      id: 'po-' + Date.now(),
      ...poData,
      createdAt: new Date().toISOString(),
    };

    setPurchaseOrders((prev) => [newPo, ...prev]);

    // Increase stock
    newPo.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const nextStock = prod.stock + item.quantity;
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.productId
              ? {
                  ...p,
                  stock: nextStock,
                  todayImport: (p.todayImport || 0) + item.quantity,
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );

        const mov: StockMovement = {
          id: 'mov-' + Date.now() + Math.random(),
          type: 'import',
          productId: item.productId,
          productName: item.productName,
          quantityChange: item.quantity,
          stockBefore: prod.stock,
          stockAfter: nextStock,
          refCode: newPo.code,
          note: `Nhập kho theo phiếu ${newPo.code} (${newPo.supplier})`,
          createdAt: new Date().toISOString(),
        };
        setStockMovements((prev) => [mov, ...prev]);
      }
    });

    // Create Expense Transaction
    const tx: FinancialTransaction = {
      id: 'ft-' + Date.now(),
      code: 'PC' + Math.floor(10000 + Math.random() * 90000),
      type: 'expense',
      category: 'Nhập hàng',
      amount: newPo.totalAmount,
      description: `Thanh toán nhập kho ${newPo.code} cho ${newPo.supplier}`,
      refCode: newPo.code,
      date: new Date().toISOString(),
      paymentMethod: 'transfer',
    };
    setTransactions((prev) => [tx, ...prev]);

    showToast(`Đã tạo phiếu nhập kho ${newPo.code} (+ Tồn kho đã tăng)!`);
  };

  // Stock Audit (Kiểm kho)
  const handleApplyStockAudit = (auditData: Omit<StockAudit, 'id' | 'createdAt'>) => {
    const newAudit: StockAudit = {
      id: 'aud-' + Date.now(),
      ...auditData,
      createdAt: new Date().toISOString(),
    };

    setStockAudits((prev) => [newAudit, ...prev]);

    // Adjust system stock to actual stock
    newAudit.items.forEach((item) => {
      if (item.difference !== 0) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === item.productId
              ? { ...p, stock: item.actualStock, updatedAt: new Date().toISOString() }
              : p
          )
        );

        const mov: StockMovement = {
          id: 'mov-' + Date.now() + Math.random(),
          type: 'audit_adjust',
          productId: item.productId,
          productName: item.productName,
          quantityChange: item.difference,
          stockBefore: item.systemStock,
          stockAfter: item.actualStock,
          refCode: newAudit.code,
          note: `Cân bằng kiểm kê theo phiếu ${newAudit.code} (${item.reason})`,
          createdAt: new Date().toISOString(),
        };
        setStockMovements((prev) => [mov, ...prev]);
      }
    });

    showToast(`Đã lưu phiếu kiểm kho ${newAudit.code} & đồng bộ tồn kho!`);
  };

  // Financial Transaction
  const handleCreateTransaction = (txData: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      id: 'ft-' + Date.now(),
      ...txData,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Đã ghi nhận ${newTx.type === 'income' ? 'Phiếu Thu' : 'Phiếu Chi'} ${newTx.code}!`);
  };

  // Reset to default sample data (105 SP chuẩn file PDF)
  const handleResetData = () => {
    if (window.confirm('Khôi phục lại toàn bộ 105 sản phẩm & danh mục chuẩn theo file PDF?')) {
      localStorage.removeItem(PRODUCTS_KEY);
      localStorage.removeItem(ORDERS_KEY);
      localStorage.removeItem(MOVEMENTS_KEY);
      localStorage.removeItem(PO_KEY);
      localStorage.removeItem(AUDITS_KEY);
      localStorage.removeItem(FINANCE_KEY);
      localStorage.removeItem(CATEGORIES_KEY);
      localStorage.removeItem('amway_inventory_products_105_v4');
      localStorage.removeItem('amway_inventory_products_105_v3');

      setCategories(DEFAULT_CATEGORIES);
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setStockMovements(INITIAL_STOCK_MOVEMENTS);
      setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      setStockAudits(INITIAL_STOCK_AUDITS);
      setTransactions(INITIAL_FINANCIAL_TRANSACTIONS);
      setSelectedCategory('all');
      showToast('Đã khôi phục 105 sản phẩm chuẩn theo PDF thành công!');
    }
  };

  // Import JSON Backup handler
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Case 1: Full Backup Object { products, categories, orders, ... }
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          let countSP = 0;
          if (Array.isArray(parsed.products) && parsed.products.length > 0) {
            setProducts(parsed.products);
            countSP = parsed.products.length;
          }
          if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
            setCategories(parsed.categories);
          }
          if (Array.isArray(parsed.orders)) {
            setOrders(parsed.orders);
          }
          if (Array.isArray(parsed.stockMovements)) {
            setStockMovements(parsed.stockMovements);
          }
          if (Array.isArray(parsed.purchaseOrders)) {
            setPurchaseOrders(parsed.purchaseOrders);
          }
          if (Array.isArray(parsed.stockAudits)) {
            setStockAudits(parsed.stockAudits);
          }
          if (Array.isArray(parsed.transactions)) {
            setTransactions(parsed.transactions);
          }

          showToast(`Đã khôi phục toàn diện dữ liệu (${countSP} sản phẩm, ${parsed.orders?.length || 0} đơn hàng)!`);
          return;
        }

        // Case 2: Array of Products
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          const importedCats = Array.from(
            new Set(parsed.map((p: any) => p.category).filter(Boolean))
          ) as string[];
          if (importedCats.length > 0) {
            setCategories((prev) => Array.from(new Set([...prev, ...importedCats])));
          }
          showToast(`Đã nạp thành công ${parsed.length} sản phẩm từ file JSON!`);
          return;
        }

        alert('File JSON không đúng cấu trúc dữ liệu của Vitamin Shop!');
      } catch (err) {
        console.error('Lỗi khi đọc file JSON:', err);
        alert('Không thể đọc file JSON. Vui lòng kiểm tra lại định dạng file!');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleExportFullJSON = () => {
    exportFullBackupJSON({
      products,
      categories,
      orders,
      stockMovements,
      purchaseOrders,
      stockAudits,
      transactions,
    });
    showToast('Đã xuất file sao lưu JSON toàn bộ dữ liệu thành công!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700/40 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1 min-h-screen">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar Header */}
          <Navbar
            totalProductsCount={products.length}
            onExportJSON={handleExportFullJSON}
            onImportJSON={handleImportJSON}
            onExportCSV={() => exportToCSV(products)}
            onResetData={handleResetData}
          />

          {/* Page Body depending on active Tab */}
          <main className="flex-1 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <OverviewDashboard
                products={products}
                orders={orders}
                categories={categories}
                setActiveTab={setActiveTab}
                setSelectedCategory={setSelectedCategory}
              />
            )}

            {activeTab === 'products' && (
              <ProductsView
                products={products}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onAddCategory={handleAddCategory}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onQuickStockChange={handleQuickStockChange}
              />
            )}

            {(activeTab === 'pos' || activeTab === 'sales' || activeTab === 'orders') && (
              <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <SalesView
                  orders={orders}
                  products={products}
                  onCreateOrder={handleCreateOrder}
                  onUpdateOrder={handleUpdateOrder}
                  onDeleteOrder={handleDeleteOrder}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                />
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <InventoryView
                  subTab={inventorySubTab}
                  setSubTab={setInventorySubTab}
                  products={products}
                  stockMovements={stockMovements}
                  purchaseOrders={purchaseOrders}
                  stockAudits={stockAudits}
                  onCreatePurchaseOrder={handleCreatePurchaseOrder}
                  onApplyStockAudit={handleApplyStockAudit}
                />
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <FinanceView
                  subTab={financeSubTab}
                  setSubTab={setFinanceSubTab}
                  transactions={transactions}
                  onCreateTransaction={handleCreateTransaction}
                />
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                <ReportsView
                  subTab={reportsSubTab}
                  setSubTab={setReportsSubTab}
                  products={products}
                  orders={orders}
                  transactions={transactions}
                  onExportCSV={() => exportToCSV(products)}
                  onExportJSON={() => exportToJSON(products)}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
