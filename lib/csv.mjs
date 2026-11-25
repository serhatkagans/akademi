/* CSV indirme (Excel uyumlu: UTF-8 BOM, noktalı virgül). Formül enjeksiyonuna karşı
   = + - @ ile başlayan hücreler kesme işaretiyle başlatılır. */
const hucre = v => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[";\n,]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export const tarih = t => (t ? new Date(Number(t)).toISOString().slice(0, 10) : '');

export function csvGonder(res, dosya, baslik, satirlar) {
  const csv = '\uFEFF' + [baslik, ...satirlar].map(s => s.map(hucre).join(';')).join('\r\n');
  const ascii = dosya.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  res.writeHead(200, {
    'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store',
    'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(dosya)}`,
  });
  res.end(csv);
  return true;
}
