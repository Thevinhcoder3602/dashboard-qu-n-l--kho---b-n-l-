export const VUE_COMPONENT_CODE = `<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans transition-colors">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Top Navigation & Title Bar -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-500/20">
              📦
            </div>
            <div>
              <h1 class="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dashboard Quản Lý Kho & Bán Lẻ
              </h1>
              <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Single Page Application • Đồng bộ LocalStorage tự động
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-auto">
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="Đổi giao diện Sáng / Tối"
          >
            <span v-if="isDark">☀️</span>
            <span v-else>🌙</span>
          </button>
        </div>
      </header>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng Mặt Hàng</div>
          <div class="text-2xl md:text-3xl font-bold mt-2 text-slate-900 dark:text-white">{{ stats.totalItems }} <span class="text-xs font-normal text-slate-400">SKUs</span></div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng Lượng Tồn Kho</div>
          <div class="text-2xl md:text-3xl font-bold mt-2 text-indigo-600 dark:text-indigo-400">{{ stats.totalStock }} <span class="text-xs font-normal text-slate-400">sản phẩm</span></div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Sắp Hết Hàng (≤ Min)</div>
          <div class="text-2xl md:text-3xl font-bold mt-2" :class="stats.lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'">
            {{ stats.lowStockCount }} <span class="text-xs font-normal text-slate-400">mặt hàng</span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng Giá Trị Tồn Kho</div>
          <div class="text-xl md:text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">
            {{ formatVND(stats.totalValue) }}
          </div>
        </div>
      </div>

      <!-- Action Toolbar & Search -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <!-- Search Input -->
        <div class="relative flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 Tìm nhanh theo tên sản phẩm, phân loại..."
            class="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center flex-wrap gap-2">
          <button
            @click="openAddModal"
            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <span>➕</span> Thêm sản phẩm
          </button>

          <button
            @click="exportJSON"
            class="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
            title="Xuất sao lưu JSON"
          >
            <span>📥</span> Xuất Backup
          </button>

          <label class="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5">
            <span>📤</span> Nhập Backup
            <input type="file" accept=".json" class="hidden" @change="importJSON" />
          </label>
        </div>
      </div>

      <!-- Main Data Table -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th class="py-3.5 px-4">Tên Sản Phẩm</th>
                <th class="py-3.5 px-4">Phân Loại</th>
                <th class="py-3.5 px-4 text-right">Giá Vốn</th>
                <th class="py-3.5 px-4 text-right">Giá Bán</th>
                <th class="py-3.5 px-4 text-right">Lợi Nhuận</th>
                <th class="py-3.5 px-4 text-center">Tồn Kho</th>
                <th class="py-3.5 px-4 text-center">Thao Tác Kho</th>
                <th class="py-3.5 px-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr
                v-for="item in filteredProducts"
                :key="item.id"
                class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                :class="{ 'bg-amber-50/40 dark:bg-amber-950/20': item.stock <= item.minStock && item.stock > 0, 'bg-rose-50/40 dark:bg-rose-950/20': item.stock === 0 }"
              >
                <!-- Product Name -->
                <td class="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                  <div class="flex items-center gap-2">
                    <span>{{ item.name }}</span>
                    <span
                      v-if="item.stock === 0"
                      class="px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                    >
                      Hết hàng
                    </span>
                    <span
                      v-else-if="item.stock <= item.minStock"
                      class="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                    >
                      Sắp hết (≤{{ item.minStock }})
                    </span>
                  </div>
                </td>

                <!-- Variant -->
                <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                  <span class="inline-block px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                    {{ item.variant || 'Tiêu chuẩn' }}
                  </span>
                </td>

                <!-- Cost Price -->
                <td class="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
                  {{ formatVND(item.costPrice) }}
                </td>

                <!-- Sell Price -->
                <td class="py-3.5 px-4 text-right font-medium text-slate-900 dark:text-white">
                  {{ formatVND(item.sellPrice) }}
                </td>

                <!-- Estimated Profit -->
                <td class="py-3.5 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                  +{{ formatVND(item.sellPrice - item.costPrice) }}
                </td>

                <!-- Stock Count & Badge -->
                <td class="py-3.5 px-4 text-center font-bold" :class="item.stock <= item.minStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'">
                  {{ item.stock }}
                </td>

                <!-- Quick Stock Adjust & Sell 1 Button -->
                <td class="py-3.5 px-4 text-center">
                  <div class="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
                    <button
                      @click="adjustStock(item.id, -1)"
                      :disabled="item.stock <= 0"
                      class="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
                      title="Giảm tồn kho 1"
                    >
                      -
                    </button>
                    <button
                      @click="adjustStock(item.id, 1)"
                      class="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold transition"
                      title="Tăng tồn kho 1"
                    >
                      +
                    </button>
                    <button
                      @click="sellOne(item)"
                      :disabled="item.stock <= 0"
                      class="px-2.5 h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
                      title="Bán ngay 1 đơn vị"
                    >
                      ⚡ Bán 1
                    </button>
                  </div>
                </td>

                <!-- Actions: Edit & Delete -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="openEditModal(item)"
                      class="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                      title="Chỉnh sửa sản phẩm"
                    >
                      ✏️
                    </button>
                    <button
                      @click="deleteProduct(item.id, item.name)"
                      class="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Xóa sản phẩm"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="filteredProducts.length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400 dark:text-slate-500">
                  <p class="text-base font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit Modal -->
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              {{ editingId ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg">✕</button>
          </div>

          <form @submit.prevent="saveProduct" class="space-y-3.5">
            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tên sản phẩm *</label>
              <input
                v-model="formData.name"
                required
                type="text"
                placeholder="VD: Protein Thực Vật"
                class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phân loại (Size / Màu / Phiên bản)</label>
              <input
                v-model="formData.variant"
                type="text"
                placeholder="VD: Hộp 450g / Vị Socola"
                class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Giá vốn (VNĐ) *</label>
                <input
                  v-model.number="formData.costPrice"
                  required
                  min="0"
                  type="number"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Giá bán (VNĐ) *</label>
                <input
                  v-model.number="formData.sellPrice"
                  required
                  min="0"
                  type="number"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Số lượng tồn ban đầu *</label>
                <input
                  v-model.number="formData.stock"
                  required
                  min="0"
                  type="number"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Ngưỡng cảnh báo hết hàng</label>
                <input
                  v-model.number="formData.minStock"
                  required
                  min="1"
                  type="number"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div class="flex justify-end gap-2.5 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                class="px-5 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
              >
                {{ editingId ? 'Lưu Thay Đổi' : 'Thêm Sản Phẩm' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// 1. Khởi tạo danh sách mẫu mặc định
const DEFAULT_PRODUCTS = [
  { id: '1', name: 'Protein Thực Vật Nutrilite', variant: 'Thực vật 450g', costPrice: 823000, sellPrice: 980000, stock: 12, minStock: 3, updatedAt: new Date().toISOString() },
  { id: '2', name: 'Protein Socola Nutrilite', variant: 'Vị Socola', costPrice: 914000, sellPrice: 1090000, stock: 2, minStock: 3, updatedAt: new Date().toISOString() },
  { id: '3', name: 'Double X - Vitamin tổng hợp', variant: 'Có khay', costPrice: 1335000, sellPrice: 1590000, stock: 4, minStock: 2, updatedAt: new Date().toISOString() },
  { id: '4', name: 'Daily - Vitamin tổng hợp', variant: 'Hộp 60 viên', costPrice: 265000, sellPrice: 320000, stock: 18, minStock: 5, updatedAt: new Date().toISOString() },
  { id: '5', name: 'Vitamin C 60 viên', variant: 'Hộp 60 viên', costPrice: 370000, sellPrice: 445000, stock: 1, minStock: 3, updatedAt: new Date().toISOString() },
  { id: '6', name: 'Nước giặt SA8', variant: 'Chai 1 Lít', costPrice: 250000, sellPrice: 300000, stock: 14, minStock: 4, updatedAt: new Date().toISOString() },
  { id: '7', name: 'Nước rửa chén Dish Drops', variant: 'Chai 1 Lít', costPrice: 184000, sellPrice: 225000, stock: 0, minStock: 4, updatedAt: new Date().toISOString() },
];

const STORAGE_KEY = 'vue_inventory_products';
const products = ref([]);
const searchQuery = ref('');
const isDark = ref(false);

// Quản lý Modal & Form
const isModalOpen = ref(false);
const editingId = ref(null);
const formData = ref({
  name: '',
  variant: '',
  costPrice: 0,
  sellPrice: 0,
  stock: 0,
  minStock: 3,
});

// Tải dữ liệu từ LocalStorage khi khởi động
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      products.value = JSON.parse(saved);
    } catch {
      products.value = DEFAULT_PRODUCTS;
    }
  } else {
    products.value = DEFAULT_PRODUCTS;
  }

  // Tải trạng thái Theme
  if (localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  }
});

// Đồng bộ tự động vào LocalStorage mỗi khi dữ liệu thay đổi
watch(products, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
}, { deep: true });

// Toggle Dark/Light Mode
const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

// Tính toán KPIs
const stats = computed(() => {
  const totalItems = products.value.length;
  const totalStock = products.value.reduce((acc, p) => acc + (p.stock || 0), 0);
  const lowStockCount = products.value.filter((p) => p.stock <= p.minStock).length;
  const totalValue = products.value.reduce((acc, p) => acc + (p.stock * p.sellPrice), 0);
  return { totalItems, totalStock, lowStockCount, totalValue };
});

// Lọc tìm kiếm
const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return products.value;
  return products.value.filter((p) =>
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.variant && p.variant.toLowerCase().includes(q))
  );
});

// Định dạng tiền tệ VNĐ
const formatVND = (val) => {
  if (val === undefined || val === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

// Mở Modal Thêm
const openAddModal = () => {
  editingId.value = null;
  formData.value = {
    name: '',
    variant: '',
    costPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 3,
  };
  isModalOpen.value = true;
};

// Mở Modal Sửa
const openEditModal = (item) => {
  editingId.value = item.id;
  formData.value = {
    name: item.name,
    variant: item.variant,
    costPrice: item.costPrice,
    sellPrice: item.sellPrice,
    stock: item.stock,
    minStock: item.minStock,
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingId.value = null;
};

// Lưu Sản Phẩm (Thêm / Sửa)
const saveProduct = () => {
  if (!formData.value.name.trim()) return;

  if (editingId.value) {
    const idx = products.value.findIndex((p) => p.id === editingId.value);
    if (idx !== -1) {
      products.value[idx] = {
        ...products.value[idx],
        ...formData.value,
        updatedAt: new Date().toISOString(),
      };
    }
  } else {
    const newProduct = {
      id: Date.now().toString(),
      ...formData.value,
      updatedAt: new Date().toISOString(),
    };
    products.value.unshift(newProduct);
  }
  closeModal();
};

// Thao tác nhanh: Tăng/Giảm tồn kho trực tiếp
const adjustStock = (id, delta) => {
  const item = products.value.find((p) => p.id === id);
  if (item) {
    const nextStock = item.stock + delta;
    if (nextStock >= 0) {
      item.stock = nextStock;
      item.updatedAt = new Date().toISOString();
    }
  }
};

// Thao tác nhanh: Bán 1 sản phẩm
const sellOne = (item) => {
  if (item.stock > 0) {
    item.stock -= 1;
    item.updatedAt = new Date().toISOString();
  }
};

// Xóa sản phẩm kèm xác nhận
const deleteProduct = (id, name) => {
  if (confirm(\`Bạn có chắc chắn muốn xóa sản phẩm "\${name}" khỏi kho?\`)) {
    products.value = products.value.filter((p) => p.id !== id);
  }
};

// Xuất file backup JSON
const exportJSON = () => {
  const dataStr = JSON.stringify(products.value, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = \`backup-kho-\${new Date().toISOString().slice(0, 10)}.json\`;
  a.click();
  URL.revokeObjectURL(url);
};

// Nhập dữ liệu backup JSON
const importJSON = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        products.value = data;
        alert('Nhập dữ liệu thành công!');
      } else {
        alert('File không hợp lệ!');
      }
    } catch {
      alert('Không thể đọc nội dung file JSON.');
    }
  };
  reader.readAsText(file);
};
</script>
`;
