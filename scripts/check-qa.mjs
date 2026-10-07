import fs from 'fs';
import path from 'path';

// .env dosyasından GOOGLE_QA_SHEET_URL oku
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env dosyası bulunamadı.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/GOOGLE_QA_SHEET_URL=([^\r\n]+)/);
const sheetUrl = match ? match[1].trim() : '';

if (!sheetUrl) {
  console.log('⚠️ Henüz .env dosyasına GOOGLE_QA_SHEET_URL eklenmemiş.');
  console.log('Lütfen Google E-Tablonuzun bağlantı linkini .env içerisine yapıştırın.');
  process.exit(0);
}

// Spreadsheet ID ayıkla
const idMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
if (!idMatch) {
  console.error('❌ Geçersiz Google E-Tablo URL formatı.');
  process.exit(1);
}

const sheetId = idMatch[1];
const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

console.log(`📡 Google E-Tablo'dan bildirimler çekiliyor... (Sheet ID: ${sheetId})`);

try {
  const res = await fetch(csvUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const text = await res.text();
  const rows = text.split('\n').filter((r) => r.trim().length > 0);

  if (rows.length <= 1) {
    console.log('✅ Henüz bildirilmiş yeni bir hata veya istek bulunmuyor.');
    process.exit(0);
  }

  console.log(`\n📋 Toplam ${rows.length - 1} adet bildirim bulundu:\n`);
  rows.slice(1).forEach((row, i) => {
    console.log(`--- [Kayıt #${i + 1}] ---`);
    console.log(row);
  });
} catch (err) {
  console.error('❌ E-Tablo verisi çekilirken hata oluştu:', err.message);
  console.log(
    'İpucu: E-Tablo paylaşım ayarının "Bağlantıya sahip olan herkes görüntüleyebilir" olduğundan emin olun.',
  );
}
