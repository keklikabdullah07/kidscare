#!/usr/bin/env bash
# KidsCare VPS Safe Maintenance & Docker Cache Cleaner
# Bu script Dokploy sunucusunda build cache, dangling image ve geçici logları güvenle temizler.
# DİKKAT: Veritabanı (postgres_data, redis_data) volume'larına ASLA dokunmaz.

set -e

echo "=== [KidsCare VPS Temizlik Başlatılıyor] ==="
echo "Tarih: $(date)"

# 1. Mevcut disk durumunu göster
echo ""
echo "--- Öncesi Disk Durumu ---"
df -h /

# 2. Docker BuildKit Cache Temizliği (En çok yer tutan kısım: /var/lib/docker/buildkit)
echo ""
echo "--- Docker Builder Cache Temizleniyor (1 saatten eski cache'ler) ---"
docker builder prune -af --filter "until=1h"

# 3. Eski/Dangling Docker İmajlarını Temizle (Kullanılmayan eski build imajları)
echo ""
echo "--- Kullanılmayan / Dangling Docker İmajları Temizleniyor ---"
docker image prune -af --filter "until=24h"

# 4. Durmuş/Eski Container'ları Temizle
echo ""
echo "--- Durmuş Geçici Container'lar Temizleniyor ---"
docker container prune -f

# 5. Kullanılmayan Docker Ağlarını Temizle
echo ""
echo "--- Kullanılmayan Docker Ağları Temizleniyor ---"
docker network prune -f

# 6. Sistem Journal Loglarını Temizle (3 günden eskileri sil)
if command -v journalctl &> /dev/null; then
  echo ""
  echo "--- Systemd Journal Logları Temizleniyor (3 günden eskiler) ---"
  journalctl --vacuum-time=3d || true
fi

# 7. Sonuç disk durumunu göster
echo ""
echo "--- Temizlik Sonrası Disk Durumu ---"
df -h /

echo ""
echo "=== [Temizlik Başarıyla Tamamlandı] ==="
