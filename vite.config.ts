import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {existsSync, readFileSync} from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {testRecordsPlugin} from './server/testRecordsPlugin';

function readLocalEnv() {
  const envPath = path.resolve(__dirname, '.env');

  if (!existsSync(envPath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
        return [key, value];
      }),
  ) as Record<string, string>;
}

export default defineConfig(() => {
  const env = readLocalEnv();

  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      testRecordsPlugin({
        rootDir: __dirname,
        adminPasswordHash: env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD_HASH,
        sessionSecret: env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {
        ignored: ['**/data/test-records.json'],
      },
    },
  };
});
