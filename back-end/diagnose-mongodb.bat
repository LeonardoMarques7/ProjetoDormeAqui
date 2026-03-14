@echo off
REM Script de Diagnóstico MongoDB para Windows
REM Executar como administrador para melhores resultados

SETLOCAL ENABLEDELAYEDEXPANSION

ECHO.
ECHO ╔════════════════════════════════════════════════════╗
ECHO ║   DIAGNÓSTICO MONGODB ATLAS - WINDOWS PowerShell   ║
ECHO ╚════════════════════════════════════════════════════╝
ECHO.

REM Informações do Sistema
ECHO 💻 INFORMAÇÕES DO SISTEMA
ECHO ─────────────────────────────────────────────────────
FOR /f "tokens=*" %%A IN ('hostname') DO SET HOSTNAME=%%A
ECHO Computador: %HOSTNAME%
ECHO Sistema: Windows
ECHO PowerShell: 7+ ou 5.1

ECHO.
ECHO 🌐 TESTE DE CONECTIVIDADE INTERNET
ECHO ─────────────────────────────────────────────────────
ECHO Testando ping google.com...
ping -n 2 google.com >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    ECHO ✅ Internet conectada
) ELSE (
    ECHO ❌ Internet desconectada ou lenta
)

ECHO.
ECHO 🔍 TESTE DNS
ECHO ─────────────────────────────────────────────────────
ECHO Testando: cluster0.1vl2i94.mongodb.net
nslookup cluster0.1vl2i94.mongodb.net
ECHO.
ECHO Testando: _mongodb._tcp.cluster0.1vl2i94.mongodb.net (SRV)
nslookup -type=SRV _mongodb._tcp.cluster0.1vl2i94.mongodb.net

ECHO.
ECHO 🔌 TESTE PORTA 27017
ECHO ─────────────────────────────────────────────────────
ECHO Testando conexão com MongoDB (porta 27017)...
powershell -Command "Test-NetConnection -ComputerName cluster0.1vl2i94.mongodb.net -Port 27017 -InformationLevel 'Detailed'"

ECHO.
ECHO 📍 VERIFICAR IP PÚBLICO
ECHO ─────────────────────────────────────────────────────
ECHO Seu IP público (necessário para whitelist MongoDB Atlas):
powershell -Command "Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing | Select-Object -ExpandProperty Content"

ECHO.
ECHO 🔐 FIREWALL WINDOWS
ECHO ─────────────────────────────────────────────────────
powershell -Command "Get-NetFirewallProfile | Format-Table -Property Name, Enabled"

ECHO.
ECHO 📋 SERVIÇOS DE REDE
ECHO ─────────────────────────────────────────────────────
ECHO Cache DNS (DNSCache):
powershell -Command "Get-Service DNSCache | Select-Object -Property Name, Status"

ECHO.
ECHO ⚠️  PRÓXIMOS PASSOS:
ECHO ─────────────────────────────────────────────────────
ECHO 1. Se DNS falhar: ipconfig /flushdns
ECHO 2. Se porta falhar: Adicionar IP no MongoDB Atlas
ECHO 3. Se internet falhar: Reiniciar roteador/conexão
ECHO 4. Testar Node.js: node test-mongodb-connection.js
ECHO.
ECHO ╔════════════════════════════════════════════════════╗
ECHO ║              FIM DO DIAGNÓSTICO                    ║
ECHO ╚════════════════════════════════════════════════════╝
ECHO.

PAUSE
