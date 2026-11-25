/* Geliştirme: API sunucusu (3120, dosya değişince yeniden başlar) + Vite (5173). */
import { spawn } from 'node:child_process';
const calistir = (komut, args) => spawn(komut, args, { stdio: 'inherit', shell: process.platform === 'win32' });
const sunucu = calistir('node', ['--watch', '--env-file-if-exists=.env', 'server.mjs']);
const vite = calistir('npx', ['vite']);
const kapat = () => { sunucu.kill(); vite.kill(); process.exit(); };
process.on('SIGINT', kapat); process.on('SIGTERM', kapat);
