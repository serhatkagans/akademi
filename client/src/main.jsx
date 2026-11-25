import { createRoot } from 'react-dom/client';
import Uygulama from './Uygulama.jsx';
import '@fontsource-variable/inter';
import './stil.css';
import './stil-ek.css';
import './stil-kurumsal.css';
import './stil-ders.css';
import './stil-tema.css';

/* Tema ilk çizimden ÖNCE uygulanır ki sayfa bir an lacivert görünüp yeşile dönmesin. */
try { if (localStorage.getItem('tema') === 'yesil') document.documentElement.dataset.tema = 'yesil'; } catch { /* yok */ }

createRoot(document.getElementById('kok')).render(<Uygulama />);
