@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp000_准备第一集素材.ps1"
if errorlevel 1 (
  echo.
  echo [失败] 第一集参考素材准备失败，请查看上方错误。
  pause
  exit /b 1
)
echo.
pause
