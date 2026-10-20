# KidsCare Windows Kalite ve Dogrulama Kapisi (check.ps1)
# Calistirma: ./scripts/check.ps1

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "[+] KidsCare Quality & Verification Gate" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$totalTimer = [System.Diagnostics.Stopwatch]::StartNew()

# 1. Type Check (TypeScript)
Write-Host "`n[1/3] TypeScript Tip Kontrolu Yapiliyor..." -ForegroundColor Yellow
$stepTimer = [System.Diagnostics.Stopwatch]::StartNew()

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
$stepTimer.Stop()
Write-Host "[OK] TypeScript tip kontrolleri basariyla gecti! ($([Math]::Round($stepTimer.Elapsed.TotalSeconds, 1))s)" -ForegroundColor Green

# 2. Lint Check (ESLint)
Write-Host "`n[2/3] Lint Kontrolu (ESLint) Yapiliyor..." -ForegroundColor Yellow
$stepTimer.Restart()

pnpm lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] ESLint kural ihlalleri bulundu!" -ForegroundColor Red
    exit 1
}
$stepTimer.Stop()
Write-Host "[OK] Lint kontrolleri sifir hata ile gecti! ($([Math]::Round($stepTimer.Elapsed.TotalSeconds, 1))s)" -ForegroundColor Green

# 3. Test Check (Jest / Vitest - Paralel)
Write-Host "`n[3/3] Testler Calistiriliyor..." -ForegroundColor Yellow
$stepTimer.Restart()

pnpm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Bazi birim veya entegrasyon testleri basarisiz oldu!" -ForegroundColor Red
    exit 1
}
$stepTimer.Stop()
Write-Host "[OK] Tum testler basariyla gecti! ($([Math]::Round($stepTimer.Elapsed.TotalSeconds, 1))s)" -ForegroundColor Green

$totalTimer.Stop()
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "[DOGRULAMA TAMAMLANDI] %100 ANEW Kalite Kapisi Basariyla Gecti! ($([Math]::Round($totalTimer.Elapsed.TotalSeconds, 1))s)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
exit 0
