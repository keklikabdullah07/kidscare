# KidsCare - Docker Desktop Acilmadan WSL ile Veritabani ve Redis Baslatici
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " KidsCare: WSL Postgres & Redis Baslatiliyor (Docker UI Yok)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. WSL docker-desktop dagitimi erisim kontrolu
$testWsl = wsl -d docker-desktop echo "ok" 2>$null
if ($testWsl -notmatch "ok") {
    Write-Host "[HATA] 'docker-desktop' WSL dagitimina erisilemedi!" -ForegroundColor Red
    Write-Host "wsl -l -v ile mevcut dagitimlarinizi kontrol edin." -ForegroundColor Yellow
    exit 1
}

# 2. Lock dizini, PostgreSQL ve Redis baslatma komutu
Write-Host "[1/3] WSL ortaminda PostgreSQL (Port 5433) ve Redis (Port 6379) tetikleniyor..." -ForegroundColor Yellow

$wslCommand = "mkdir -p /run/postgresql && chown -R postgres:postgres /run/postgresql && su - postgres -s /bin/sh -c 'pg_ctl -D /mnt/host/wsl/pgdata status >/dev/null 2>&1 || pg_ctl -D /mnt/host/wsl/pgdata start' && pgrep redis-server >/dev/null 2>&1 || redis-server --daemonize yes --protected-mode no"

wsl -d docker-desktop sh -c $wslCommand

# 3. Port kontrolleri
Start-Sleep -Seconds 2

$pgPort = Get-NetTCPConnection -LocalPort 5433 -ErrorAction SilentlyContinue
$redisPort = Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue

if ($pgPort) {
    Write-Host " [OK] PostgreSQL 5433 portunda aktif ve dinliyor." -ForegroundColor Green
} else {
    Write-Host " [UYARI] PostgreSQL 5433 henuz hazir gorunmuyor, lutfen birkac saniye bekleyin." -ForegroundColor Yellow
}

if ($redisPort) {
    Write-Host " [OK] Redis 6379 portunda aktif ve dinliyor." -ForegroundColor Green
} else {
    Write-Host " [UYARI] Redis 6379 henuz hazir gorunmuyor." -ForegroundColor Yellow
}

Write-Host "`n>> Artik 'pnpm dev:api' ve 'pnpm dev:admin' calistirabilirsiniz!" -ForegroundColor Cyan
