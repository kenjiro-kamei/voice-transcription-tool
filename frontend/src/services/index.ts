// サービスエクスポート
// 環境変数 VITE_USE_MOCK で切り替え可能

import { TranscriptionService as MockTranscriptionService } from './mock/TranscriptionService';
import { TranscriptionService as ApiTranscriptionService } from './api/TranscriptionService';
export { HistoryService } from './mock/HistoryService';

// モックモード判定
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// TranscriptionService
// - 開発中（VITE_USE_MOCK=true）はモックを使用
// - 本番/API統合テスト時は実APIを使用
export const TranscriptionService = USE_MOCK
  ? MockTranscriptionService
  : ApiTranscriptionService;
