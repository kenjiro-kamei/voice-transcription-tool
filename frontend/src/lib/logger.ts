// ロガー実装（環境別制御）

const isDevelopment = import.meta.env.MODE === 'development';
const isE2EMode = import.meta.env.VITE_E2E_MODE === 'true';

// E2Eテスト時と本番環境ではログ出力を抑制
const shouldLog = isDevelopment && !isE2EMode;

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (shouldLog) {
      // eslint-disable-next-line no-console
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};
