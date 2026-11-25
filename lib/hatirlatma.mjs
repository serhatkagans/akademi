import { uyeyeGonder } from './posta.mjs';
import { durumHesapla } from '../routes/ogrenme.mjs';
import { guncel } from './icerik.mjs';
import { ceviri } from './diller.mjs';

/**
 * "Kaldığın yerden devam et" hatırlatması — saatte bir çalışır.
 * Kimlere: bildirimi açık, yönetici olmayan, sertifikası henüz olmayan, hesabı en az
 * 3 gündür var ve son girişi 3 günden eski olanlara. Aynı kişiye en sık haftada bir,
 * toplam en çok 3 hatırlatma (ısrarcı olmasın).
 */
const GUN = 86400000;
export async function hatirlatmalariGonder(db, simdi = Date.now()) {
  const adaylar = await db.all(`
    SELECT u.* FROM uyeler u
    WHERE u.bildirim = 1 AND u.yonetici = 0 AND u.hatirlatma_sayisi < 3
      AND u.olusturma < ? AND COALESCE(u.son_giris, u.olusturma) < ?
      AND (u.son_hatirlatma IS NULL OR u.son_hatirlatma < ?)
      AND NOT EXISTS (SELECT 1 FROM sertifikalar s WHERE s.uye_id = u.id)`,
  [simdi - 3 * GUN, simdi - 3 * GUN, simdi - 7 * GUN]);
  let sayi = 0;
  for (const u of adaylar) {
    const d = await durumHesapla(db, u.id);
    const biten = d.bolumler.reduce((a, b) => a + b.biten, 0);
    const toplam = d.bolumler.reduce((a, b) => a + b.toplam, 0);
    const bi = d.bolumler.findIndex(b => !b.tamam);
    const b = guncel().bolumler[bi];
    const siradaki = b ? (ceviri(u.dil)?.bolumler?.[b.id]?.baslik || b.baslik[u.dil] || b.baslik.en) : '';
    await uyeyeGonder(db, u, 'hatirlatma', { biten, toplam, siradaki });
    await db.run('UPDATE uyeler SET son_hatirlatma = ?, hatirlatma_sayisi = hatirlatma_sayisi + 1 WHERE id = ?', [simdi, u.id]);
    sayi++;
  }
  return sayi;
}
