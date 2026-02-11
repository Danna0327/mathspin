@echo off
cd /d "%~dp0"

REM Inicia el servidor en una ventana minimizada
start "" /min cmd /c "node server.js"

REM Espera un poco para que el server levante
timeout /t 2 >nul

REM Abre el juego LOCAL (el que sí tiene login)
start "" "http://localhost:5000"

REM (Opcional) abre la demo de GitHub en otra pestaña
REM start "" "https://tic-innovaedu.github.io/codigo-rosa/"
