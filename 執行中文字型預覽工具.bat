@echo off
cd /d "%~dp0"
python "%~dp0chinese_font_browser.py"
if errorlevel 1 (
    echo.
    echo 啟動失敗，請確認已安裝 Python。
    pause
)
