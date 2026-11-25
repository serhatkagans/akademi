import { zip } from './zip.mjs';

/**
 * Çok sayfalı en küçük .xlsx yazıcısı (dış paket yok; bkz. zip.mjs).
 * Sayfa = { ad, ust?: [başlık, not…], sutunlar: [[başlık, genişlik]], satirlar: [[değer, …]], bicimler?: ['metin'|'sayi'|'yuzde'] }
 * Sayı → gerçek Excel sayısı (yüzde biçimi 0,0 %); metin → satır içi dize.
 * Tablo başlık satırı sabitlenir ve süzgeçlidir; sayfa A4 yatay, genişliğe sığdırılır.
 */
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PKG = 'http://schemas.openxmlformats.org/package/2006/relationships';

const esc = v => String(v ?? '')
  .replace(/[^\x09\x0A\x0D\x20-퟿-�\u{10000}-\u{10FFFF}]/gu, '')
  .replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sutunAdi = i => (i >= 26 ? sutunAdi(Math.floor(i / 26) - 1) : '') + String.fromCharCode(65 + (i % 26));
const sayfaAdi = (ad, kullanilan) => {
  let s = String(ad).replace(/[[\]:*?/\\']/g, ' ').trim().slice(0, 31) || 'Sayfa';
  for (let n = 2; kullanilan.has(s.toLowerCase()); n++) s = s.slice(0, 28) + ' ' + n;
  kullanilan.add(s.toLowerCase());
  return s;
};

/* cellXfs: 0 normal, 1 başlık (lacivert zemin, beyaz kalın), 2 metin, 3 sayı, 4 yüzde, 5 büyük başlık, 6 soluk not */
const S = { baslik: 1, metin: 2, sayi: 3, yuzde: 4, ana: 5, not: 6 };
const STYLES = `${XML}<styleSheet xmlns="${MAIN}">`
  + '<numFmts count="1"><numFmt numFmtId="164" formatCode="0.0%"/></numFmts>'
  + '<fonts count="4"><font><sz val="11"/><name val="Calibri"/></font>'
  + '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'
  + '<font><b/><sz val="14"/><color rgb="FF0A1D35"/><name val="Calibri"/></font>'
  + '<font><i/><sz val="10"/><color rgb="FF5B6B7F"/><name val="Calibri"/></font></fonts>'
  + '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
  + '<fill><patternFill patternType="solid"><fgColor rgb="FF0F2A4A"/><bgColor indexed="64"/></patternFill></fill></fills>'
  + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
  + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
  + '<cellXfs count="7">'
  + '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
  + '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>'
  + '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>'
  + '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top"/></xf>'
  + '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf>'
  + '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
  + '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
  + '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

function hucre(ref, v, bicim) {
  if (v && typeof v === 'object') { bicim = v.b; v = v.v; } // hücreye özel biçim: { v, b }
  if (v === '' || v === null || v === undefined) return '';
  if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}" s="${bicim === 'yuzde' ? S.yuzde : S.sayi}"><v>${v}</v></c>`;
  return `<c r="${ref}" s="${S[bicim] ?? S.metin}" t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
}

function sayfaXml({ sutunlar, satirlar, ust = [], bicimler = [] }) {
  const sx = [];
  let r = 1;
  ust.forEach((m, i) => { sx.push(`<row r="${r}">${hucre('A' + r, m, i === 0 ? 'ana' : 'not')}</row>`); r++; });
  if (ust.length) r++; // boş satır
  const bas = r;
  sx.push(`<row r="${r}">${sutunlar.map(([b], i) => hucre(sutunAdi(i) + r, String(b), 'baslik')).join('')}</row>`);
  for (const s of satirlar) { r++; sx.push(`<row r="${r}">${s.map((v, i) => hucre(sutunAdi(i) + r, v, bicimler[i])).join('')}</row>`); }
  const son = sutunAdi(sutunlar.length - 1);
  return {
    filtre: satirlar.length ? { ref: `A${bas}:${son}${r}`, mutlak: `$A$${bas}:$${son}$${r}` } : null,
    xml: `${XML}<worksheet xmlns="${MAIN}" xmlns:r="${REL}">`
      + '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>'
      + `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${bas}" topLeftCell="A${bas + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
      + '<sheetFormatPr defaultRowHeight="15"/>'
      + `<cols>${sutunlar.map(([, g], i) => `<col min="${i + 1}" max="${i + 1}" width="${g}" customWidth="1"/>`).join('')}</cols>`
      + `<sheetData>${sx.join('')}</sheetData>`
      + (satirlar.length ? `<autoFilter ref="A${bas}:${son}${r}"/>` : '')
      + '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>'
      + '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>',
  };
}

export function xlsxYaz(sayfalar, simdi = new Date()) {
  const kullanilan = new Set();
  const adlar = sayfalar.map(s => sayfaAdi(s.ad, kullanilan));
  const y = sayfalar.map(sayfaXml);
  const tipler = `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
    + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
    + y.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
    + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>';
  const kokRels = `${XML}<Relationships xmlns="${PKG}"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const kitapRels = `${XML}<Relationships xmlns="${PKG}">`
    + y.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${REL}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
    + `<Relationship Id="rId${y.length + 1}" Type="${REL}/styles" Target="styles.xml"/></Relationships>`;
  const adlarXml = y.map((s, i) => s.filtre
    ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${esc(adlar[i])}'!${s.filtre.mutlak}</definedName>` : '').join('');
  const kitap = `${XML}<workbook xmlns="${MAIN}" xmlns:r="${REL}"><sheets>`
    + adlar.map((a, i) => `<sheet name="${esc(a)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets>'
    + (adlarXml ? `<definedNames>${adlarXml}</definedNames>` : '') + '</workbook>';
  return zip([
    { name: '[Content_Types].xml', data: tipler },
    { name: '_rels/.rels', data: kokRels },
    { name: 'xl/workbook.xml', data: kitap },
    { name: 'xl/_rels/workbook.xml.rels', data: kitapRels },
    ...y.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: s.xml })),
    { name: 'xl/styles.xml', data: STYLES },
  ], simdi);
}
