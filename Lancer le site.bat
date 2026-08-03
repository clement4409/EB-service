@echo off
title EB SERVICE - Serveur local
cd /d "%~dp0"
echo.
echo   Demarrage du serveur EB SERVICE...
echo.
start "" http://localhost:3000
node server.js
pause
