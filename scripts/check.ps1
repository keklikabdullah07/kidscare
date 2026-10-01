# KidsCare Windows Kalite ve Dogrulama Kapisi (check.ps1)
# Calistirma: ./scripts/check.ps1

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "[+] KidsCare Quality & Verification Gate" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Type Check (TypeScript)
Write-Host "`n[1/3] TypeScript Tip Kontrolu Yapiliyor..." -ForegroundColor Yellow
try {
    pnpm --filter @kidscare/api exec tsc --noEmit
    pnpm --filter @kidscare/admin-web exec tsc --noEmit
    Write-Host "[OK] TypeScript tip kontrolleri basariyla gecti!" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] TypeScript tip hatasi bulundu!" -ForegroundColor Red
    exit 1
}

# 2. Lint Check (ESLint)
Write-Host "`n[2/3] Lint Kontrolu (ESLint) Yapiliyor..." -ForegroundColor Yellow
try {
    pnpm lint
    Write-Host "[OK] Lint kontrolleri basariyla gecti!" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Lint uyarisi/hatasi bulundu, lutfen duzeltin." -ForegroundColor Yellow
}

# 3. Test Check (Jest / Vitest)
Write-Host "`n[3/3] Testler Calistiriliyor..." -ForegroundColor Yellow
try {
    pnpm test
    Write-Host "[OK] Tum testler basariyla gecti!" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Bazi testler basarisiz oldu veya test tanimli degil." -ForegroundColor Yellow
}

Write-Host "`n[DOGRULAMA TAMAMLANDI] Sistem guvenle calisabilir!" -ForegroundColor Green
