/* Sade çizgi simgeleri (24×24, currentColor). Süs amaçlıdır: aria-hidden. */
const YOL = {
  pusula: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  ampul: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></>,
  yaprak: <><path d="M12 20v-8" /><path d="M12 12C12 8 9.5 5.5 4.5 5.5c0 4 2.5 6.5 7.5 6.5z" /><path d="M12 10.5c0-3.5 2.3-6 7-6 0 3.6-2.4 6-7 6z" /><path d="M7 20h10" /></>,
  eller: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16.5 14.1A5 5 0 0 1 21 19" /></>,
  ekran: <><rect x="4" y="4.5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /><path d="m10 8-2 2 2 2M14 8l2 2-2 2" /></>,
  roket: <><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><path d="M9 15 6 12l3-6c3-4 8-5 12-4 1 4 0 9-4 12l-6 3z" /><circle cx="15" cy="9" r="1.5" /></>,
  tik: <path d="m5 12 4.5 4.5L19 7" />,
  kilit: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  ok: <path d="M5 12h14M13 6l6 6-6 6" />,
  oynat: <path d="M8 5v14l11-7z" />,
  test: <><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="m9 14 2 2 4-4" /></>,
  anket: <><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" /></>,
  sertifika: <><circle cx="12" cy="9" r="5" /><path d="m9 13.5-1.5 7.5 4.5-2.5 4.5 2.5-1.5-7.5" /></>,
  kitap: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /></>,
  video: <><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  kalem: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  kapat: <path d="M6 6l12 12M18 6 6 18" />,
  dunya: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  kartlar: <><rect x="3" y="6" width="13" height="14" rx="2" /><path d="M8 6V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3" /></>,
  oncekiOk: <path d="M19 12H5M11 6l-6 6 6 6" />,
  hedef: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  kalkan: <><path d="M12 3 5 6v6c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
};

export default function Simge({ ad, boy = 24, ...p }) {
  return (
    <svg width={boy} height={boy} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      {YOL[ad]}
    </svg>
  );
}
