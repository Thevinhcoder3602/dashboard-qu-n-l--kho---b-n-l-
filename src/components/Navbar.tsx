import React, { useRef } from 'react';
import { Database, FileSpreadsheet, Store, RotateCcw, CheckCircle, Upload } from 'lucide-react';

interface NavbarProps {
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onExportCSV: () => void;
  totalProductsCount: number;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onExportJSON,
  onImportJSON,
  onExportCSV,
  totalProductsCount,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      // Reset input so user can re-upload same file if needed
      e.target.value = '';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Hidden File Input for JSON Restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* LEFT: Branding & Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 font-black text-lg">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>Vitamin Shop</span>
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-slate-600 font-semibold text-xs">Kho Hàng & Bán Lẻ</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              {totalProductsCount} Sản phẩm
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Hệ thống quản lý bán lẻ & kho hàng chuẩn bảng giá PDF
          </p>
        </div>
      </div>

      {/* RIGHT: Top actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onResetData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
          title="Reset lại toàn bộ dữ liệu 105 sản phẩm chuẩn file PDF"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden lg:inline">Reset 105 SP PDF</span>
        </button>

        <button
          onClick={onExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
          title="Xuất bảng kho hàng ra Excel CSV"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">Xuất Excel</span>
        </button>

        <button
          onClick={onExportJSON}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
          title="Sao lưu toàn bộ dữ liệu (Sản phẩm, danh mục, đơn hàng, thu chi) ra file JSON"
        >
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Sao lưu JSON</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
          title="Khôi phục dữ liệu từ file backup JSON đã lưu trước đó"
        >
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          <span>Nhập file JSON</span>
        </button>
      </div>
    </header>
  );
};
