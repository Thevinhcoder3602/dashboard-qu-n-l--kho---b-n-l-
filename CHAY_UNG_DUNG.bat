@echo off
chcp 65001 >nul
title Vitamin Shop - Khởi Chạy Ứng Dụng

echo ======================================================
echo    ĐANG MỞ VITAMIN SHOP (PHIÊN BẢN DESKTOP LIGHT)
echo ======================================================
echo.

if not exist dist\index.html (
    echo Đang khởi tạo bản build lần đầu...
    node ./node_modules/vite/bin/vite.js build
)

node ./node_modules/electron/cli.js .
