@echo off
chcp 65001 >nul
title Vitamin Shop - Đóng Gói File EXE

echo ======================================================================
echo             VITAMIN SHOP - QUẢN LÝ KHO HÀNG & BÁN LẺ
echo    Đang tự động biên dịch và đóng gói phần mềm thành file .EXE
echo ======================================================================
echo.

echo [1/2] Đang biên dịch mã nguồn giao diện (Vite Build)...
node ./node_modules/vite/bin/vite.js build
if %errorlevel% neq 0 (
    echo [LỖI] Quá trình build giao diện thất bại!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Đang đóng gói thành ứng dụng Desktop Windows (.exe)...
node scripts/build-exe.cjs
if %errorlevel% neq 0 (
    echo [LỖI] Đóng gói ứng dụng thất bại!
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================================
echo  [HOÀN TẤT] Đã đóng gói thành công file chạy độc lập!
echo.
echo  Đường dẫn file ứng dụng:
echo  📂 release\Vitamin Shop-win32-x64\Vitamin Shop.exe
echo.
echo  Bạn có thể nhấp đúp vào "Vitamin Shop.exe" để mở app bất cứ lúc nào!
echo ======================================================================
echo.
pause
