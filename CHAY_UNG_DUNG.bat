@echo off
chcp 65001 >nul
title Vitamin Shop - Khởi Chạy Ứng Dụng

echo ======================================================
echo    ĐANG MỞ VITAMIN SHOP (PHIÊN BẢN DESKTOP LIGHT)
echo ======================================================
echo.

if not exist node_modules (
    echo [THÔNG BÁO] Đang tự động cài đặt thư viện cần thiết...
    call npm.cmd install
)

if not exist dist\index.html (
    echo [THÔNG BÁO] Đang khởi tạo bản build lần đầu...
    node ./node_modules/vite/bin/vite.js build
)

echo [THÔNG BÁO] Đang khởi chạy ứng dụng...
node ./node_modules/electron/cli.js .

if %errorlevel% neq 0 (
    echo.
    echo [LỖI] Khởi chạy ứng dụng gặp sự cố.
    pause
)

