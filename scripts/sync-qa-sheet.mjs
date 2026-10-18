import fs from 'fs';
import path from 'path';

// Google Apps Script Webhook Endpoint for KidsCare QA Google Sheet
export const GOOGLE_SHEET_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbzor7XX4Yel5Sey042fb90z_zziYnRRJBh6xpzld31XE8cs2iBnb9WLYppEk3PiSF83tQ/exec';

export async function updateCell(row, col, value) {
  const payload = { row, col, status: value };
  try {
    const res = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: res.ok, raw: text };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function appendRow(rowNumber, colValues) {
  console.log(`Writing row ${rowNumber} to Google Sheet...`);
  for (let c = 1; c <= 11; c++) {
    const val = colValues[c] || '';
    const res = await updateCell(rowNumber, c, val);
    process.stdout.write(`R${rowNumber}C${c}: ${res.success} | `);
    await new Promise((r) => setTimeout(r, 600));
  }
  console.log(`\nRow ${rowNumber} successfully synced.`);
}
