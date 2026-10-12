# KidsCare Windows Kalite ve Dogrulama Kapisi (check.ps1)
# Calistirma: ./scripts/check.ps1

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "[+] KidsCare Quality & Verification Gate" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Type Check (TypeScript)
Write-Host "`n[1/3] TypeScript Tip Kontrolu Yapiliyor..." -ForegroundColor Yellow
pnpm --filter @kidscare/api exec tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] @kidscare/api TypeScript tip hatasi bulundu!" -ForegroundColor Red
    exit 1
}
pnpm --filter @kidscare/admin-web exec tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] @kidscare/admin-web TypeScript tip hatasi bulundu!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] TypeScript tip kontrolleri basariyla gecti!" -ForegroundColor Green

# 2. Lint Check (ESLint)
Write-Host "`n[2/3] Lint Kontrolu (ESLint) Yapiliyor..." -ForegroundColor Yellow
pnpm lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] ESLint kural ihlalleri bulundu!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Lint kontrolleri sifir hata ile gecti!" -ForegroundColor Green

# 3. Test Check (Jest / Vitest)
Write-Host "`n[3/3] Testler Calistiriliyor..." -ForegroundColor Yellow
pnpm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Bazi birim veya entegrasyon testleri basarisiz oldu!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Tum testler basariyla gecti!" -ForegroundColor Green

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "[DOGRULAMA TAMAMLANDI] %100 ANEW Kalite Kapisi Basariyla Gecti!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
exit 0
