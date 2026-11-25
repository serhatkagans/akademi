/**
 * Ortam ayarları tek yerde. Değerler süreç başlarken bir kez çözülür.
 */
export const port = Number(process.env.PORT || 3120);
export const origin = process.env.PUBLIC_ORIGIN || `http://localhost:${port}`;
export const secure = process.env.COOKIE_SECURE === 'true';

/* Alt dizin kurulumu (ör. aiotechs.cloud/akademi). Vekil öneki soyarak köke
   iletir, arayüz göreli adres kullanır; önek yalnızca çerez yolu için gerekir. */
export const basePath = (process.env.BASE_PATH || '').replace(/\/+$/, '');

/* Ters vekil arkasında istemci adresi yalnızca vekilin başlığından okunabilir. */
export const trustProxy = process.env.TRUST_PROXY === 'true';

export const OTURUM_GUN = 30;
export const MIN_PAROLA = 8;
