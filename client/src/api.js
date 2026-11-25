/* Sunucuyla konuşma: göreli adres (alt dizinde de çalışır), JSON, hata kodu. */
export class ApiHata extends Error {
  constructor(kod, durum) { super(kod); this.kod = kod; this.durum = durum; }
}

export async function api(yol, { method = 'GET', govde } = {}) {
  let yanit;
  try {
    yanit = await fetch('api/' + yol, {
      method, credentials: 'same-origin',
      headers: govde ? { 'Content-Type': 'application/json' } : undefined,
      body: govde ? JSON.stringify(govde) : undefined,
    });
  } catch { throw new ApiHata('ag', 0); }
  const veri = await yanit.json().catch(() => ({}));
  if (!yanit.ok) throw new ApiHata(veri.hata || 'sunucu', yanit.status);
  return veri;
}
