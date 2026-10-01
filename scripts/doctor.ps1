# KidsCare Workspace Doctor (PowerShell)
# Calistirma: ./scripts/doctor.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🩺 KidsCare ANEW Workspace Doctor" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$issues = 0

function Check-File($path, $label) {
    if (Test-Path $path) {
        Write-Host "  ✅ $label : $path" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $label Eksik : $path" -ForegroundColor Red
        $script:issues++
    }
}

function Check-Tool($cmd, $label) {
    $found = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($found) {
        Write-Host "  ✅ $label yuklu : $($found.Source)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $label bulunamadi!" -ForegroundColor Red
        $script:issues++
    }
}

Write-Host "`n1. [Arac Kontrolleri]" -ForegroundColor Yellow
Check-Tool "node" "Node.js"
Check-Tool "pnpm" "pnpm"
Check-Tool "git" "Git"

Write-Host "`n2. [Mimarisi ve Anayasa Dosyalari]" -ForegroundColor Yellow
Check-File "AGENTS.md" "Proje Anayasasi"
Check-File "docs/architecture.md" "Mimari Dokumani"
Check-File "docs/domain.md" "Domain Sozlugu"
Check-File "docs/conventions.md" "Gelistirme Standartlari"
Check-File "docs/testing.md" "Test Stratejisi"
Check-File "docs/security.md" "Guvenlik Modeli"
Check-File "docs/git.md" "Git Kurallari"

Write-Host "`n3. [Sartname ve Surec Omurgasi]" -ForegroundColor Yellow
Check-File "specs/TEMPLATE.md" "Spec Sablonu"
Check-File "specs/plans/TEMPLATE.md" "Plan Sablonu"
Check-File "workflows/feature-development.md" "Feature Workflow"
Check-File "workflows/bug-fix.md" "BugFix Workflow"

Write-Host "`n4. [Aktif Sartnameler (specs/active)]" -ForegroundColor Yellow
$activeSpecs = Get-ChildItem "specs/active/*.md" -Exclude "README.md" -ErrorAction SilentlyContinue
if ($activeSpecs) {
    foreach ($spec in $activeSpecs) {
        $content = Get-Content $spec.FullName -Raw
        if ($content -match "Status:\s*(\w+)") {
            $status = $matches[1]
            Write-Host "  📋 $($spec.Name) -> Durum: $status" -ForegroundColor Cyan
        } else {
            Write-Host "  ⚠️ $($spec.Name) -> Status alani bulunamadi!" -ForegroundColor Yellow
            $issues++
        }
    }
} else {
    Write-Host "  ℹ️ Aktif sartname bulunmuyor." -ForegroundColor Gray
}

Write-Host "`n------------------------------------------" -ForegroundColor Cyan
if ($issues -eq 0) {
    Write-Host "🎉 [DOKTOR RAPORU: MUKEMMEL] Calisma alani %100 saglikli ve ANEW kurallarina uygun!" -ForegroundColor Green
} else {
    Write-Host "⚠️ [DOKTOR RAPORU: UYARI] Toplam $issues adet eksik/uyari tespit edildi." -ForegroundColor Yellow
}
