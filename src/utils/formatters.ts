import { Product } from '../types';

/**
 * Định dạng số tiền sang định dạng tiền Việt Nam (VNĐ)
 */
export function formatVND(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Định dạng số lượng hoặc số đơn giản
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
}

/**
 * Phân tách số hàng đơn vị bằng dấu chấm (VD: 635000 -> 635.000)
 */
export function formatNumberWithDots(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Chuyển chuỗi định dạng có dấu chấm sang số nguyên (VD: "635.000" -> 635000)
 */
export function parseNumberFromDots(val: string | undefined | null): number {
  if (!val) return 0;
  const cleanStr = String(val).replace(/\D/g, '');
  return parseInt(cleanStr, 10) || 0;
}

/**
 * Chuẩn hóa số điện thoại: chỉ cho phép chữ số và tối đa 10 số
 */
export function sanitizePhone(val: string | undefined | null): string {
  if (!val) return '';
  return String(val).replace(/\D/g, '').slice(0, 10);
}

/**
 * Định dạng thời gian
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Vừa cập nhật';
    
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Vừa cập nhật';
  }
}

/**
 * Xuất file backup toàn bộ dữ liệu dạng JSON (Sản phẩm, danh mục, đơn hàng, thu chi, sổ kho)
 */
export function exportFullBackupJSON(data: {
  products: Product[];
  categories: string[];
  orders: any[];
  stockMovements: any[];
  purchaseOrders: any[];
  stockAudits: any[];
  transactions: any[];
}): void {
  const payload = {
    app: 'Vitamin Shop - Quản Lý Kho & Bán Lẻ',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    ...data,
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `vitamin-shop-sao-luu-toan-bo-${timestamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Xuất file backup dạng JSON danh sách sản phẩm
 */
export function exportToJSON(products: Product[]): void {
  const jsonStr = JSON.stringify(products, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `vitamin-shop-san-pham-${timestamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Xuất file Excel / CSV theo đúng biểu mẫu PDF
 */
export function exportToCSV(products: Product[]): void {
  const headers = [
    'STT',
    'Mã SP',
    'Sản Phẩm',
    'Hương vị / Phân loại',
    'Danh Mục SP',
    'Đơn Vị Tính',
    'Giá Nhập (VND)',
    'Tồn Đầu',
    'Nhập Trong Ngày',
    'Đã Bán',
    'Tồn Cuối Ngày',
    'Cập Nhật Lúc',
  ];

  const rows = products.map((p) => [
    p.stt || '',
    `"${p.code || ''}"`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.variant || '').replace(/"/g, '""')}"`,
    `"${(p.category || '').replace(/"/g, '""')}"`,
    `"${p.unit || ''}"`,
    p.costPrice,
    p.initialStock ?? p.stock,
    p.todayImport ?? 0,
    p.todaySold ?? 0,
    p.stock,
    `"${formatDate(p.updatedAt)}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `bang-kho-amway-105-sp-${timestamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
