/**
 * Yönetici hesabı aç / yetki ver / parola sıfırla (komut satırından).
 *   npm run yonetici -- ekle <eposta> "<Ad Soyad>"     → rastgele parola yazdırır
 *   npm run yonetici -- yetki <eposta>                  → var olan hesaba yöneticilik
 *   npm run yonetici -- parola <eposta>                 → yeni rastgele parola
 *   npm run yonetici -- liste
 * Yönetici hesapları göstergelere ve CSV'ye katılımcı olarak sayılmaz.
 */
import { randomBytes } from 'node:crypto';
import { openDb } from '../lib/db.mjs';
import { parolaOzeti } from '../lib/uye.mjs';

const [komut, eposta, ad] = process.argv.slice(2);
const db = await openDb();
const yeniParola = () => randomBytes(12).toString('base64url');

try {
  if (komut === 'ekle' && eposta && ad) {
    const p = yeniParola();
    await db.insert(`INSERT INTO uyeler (eposta, parola, ad, ulke, dogum_yili, rol, dil, yonetici, olusturma)
      VALUES (?, ?, ?, 'TR', 1990, 'diger', 'tr', 1, ?)`, [eposta.toLowerCase(), parolaOzeti(p), ad, Date.now()]);
    console.log(`Yönetici açıldı: ${eposta}\nParola: ${p}`);
  } else if (komut === 'yetki' && eposta) {
    await db.run('UPDATE uyeler SET yonetici = 1 WHERE eposta = ?', [eposta.toLowerCase()]);
    console.log('Yetki verildi.');
  } else if (komut === 'parola' && eposta) {
    const p = yeniParola();
    await db.run('UPDATE uyeler SET parola = ? WHERE eposta = ?', [parolaOzeti(p), eposta.toLowerCase()]);
    await db.run('DELETE FROM oturumlar WHERE uye_id = (SELECT id FROM uyeler WHERE eposta = ?)', [eposta.toLowerCase()]);
    console.log(`Yeni parola: ${p}`);
  } else if (komut === 'liste') {
    for (const u of await db.all('SELECT eposta, ad FROM uyeler WHERE yonetici = 1')) console.log(`${u.eposta}\t${u.ad}`);
  } else {
    console.log('Kullanım: ekle <eposta> "<Ad>" | yetki <eposta> | parola <eposta> | liste');
  }
} finally {
  await db.close();
}
