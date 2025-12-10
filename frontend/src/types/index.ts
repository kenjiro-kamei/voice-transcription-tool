// 音声・動画文字起こしツール - 型定義
// バックエンドと完全同期（backend/src/types/index.ts と同一内容を保つ）

// 処理状態
export type TranscriptionStatus = 'processing' | 'completed' | 'failed';

// 出力形式
export type OutputFormat = 'text' | 'markdown' | 'srt';

// 文字起こしジョブ
export interface TranscriptionJob {
  id: string; // UUID
  originalFilename: string;
  fileUrl: string;
  fileSize: number; // bytes
  duration?: number; // 秒
  language: string; // デフォルト: 'ja'
  transcriptionText?: string;
  status: TranscriptionStatus;
  errorMessage?: string;
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
  completedAt?: string; // ISO 8601形式
}

// 文字起こし履歴（フロントエンド用）
export interface TranscriptionHistory {
  id: string; // UUID
  originalFilename: string;
  transcriptionText: string;
  createdAt: string; // ISO 8601形式
  previewText?: string; // 最初の100文字
  fileSize?: number;
  duration?: number;
}

// APIレスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// アップロード進捗
export interface UploadProgress {
  loaded: number; // bytes
  total: number; // bytes
  percentage: number; // 0-100
  speed?: number; // MB/s
  estimatedTime?: number; // 秒
}
