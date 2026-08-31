const { packager } = require('@electron/packager');
const path = require('path');
const fs = require('fs');

async function buildExe() {
  console.log('[1/2] Bắt đầu đóng gói Vitamin Shop EXE...');
  
  const releaseDir = path.join(__dirname, '../release');
  if (fs.existsSync(releaseDir)) {
    try {
      fs.rmSync(releaseDir, { recursive: true, force: true });
    } catch (e) {
      console.warn('Lưu ý dọn dẹp release:', e.message);
    }
  }

  const appPaths = await packager({
    dir: path.join(__dirname, '..'),
    name: 'Vitamin Shop',
    platform: 'win32',
    arch: 'x64',
    out: releaseDir,
    overwrite: true,
    asar: true,
    appVersion: '1.0.0',
    appCopyright: 'Copyright © 2026 Vitamin Shop',
    ignore: [
      /^\/src/,
      /^\/\.git/,
      /^\/\.gemini/,
      /^\/release/,
      /^\/scripts/,
      /\.ts$/,
      /\.tsx$/,
    ],
  });

  console.log('[2/2] HOÀN TẤT!');
  console.log('Thư mục ứng dụng đã được tạo thành công tại:');
  appPaths.forEach(p => console.log(' -> ' + p));
  console.log('\nBạn có thể chạy trực tiếp: "release/Vitamin Shop-win32-x64/Vitamin Shop.exe"');
}

buildExe().catch((err) => {
  console.error('[LỖI ĐÓNG GÓI]:', err);
  process.exit(1);
});
