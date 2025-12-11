// 音声・動画文字起こしツール - 型定義
// バックエンドと完全同期（backend/src/types/index.ts と同一内容を保つ）

// ============================================================================
// 基本型定義
// ============================================================================

// 処理状態
export type TranscriptionStatus = 'processing' | 'completed' | 'failed';

// 出力形式
export type OutputFormat = 'text' | 'markdown' | 'srt';

// プログレスステータス（表示用テキスト）
export type ProgressStatusText = 'アップロード中...' | '文字起こし処理中...' | '完了';

// ドロップゾーン状態
export type DropZoneState = 'idle' | 'dragging' | 'error';

// コピーステータス
export type CopyStatus = 'idle' | 'copying' | 'copied';

// 日付フィルタ（履歴ページ用）
export type DateFilter = 'today' | 'thisWeek' | 'thisMonth' | 'all';

// ソート順（履歴ページ用）
export type SortOrder = 'asc' | 'desc';

// ストレージ容量状態（履歴ページ用）
export type StorageStatus = 'normal' | 'warning' | 'critical';

// ============================================================================
// エンティティ型定義
// ============================================================================

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

// 履歴フィルタパラメータ（履歴ページ用）
export interface HistoryFilter {
  searchTerm: string; // 検索キーワード
  dateFilter: DateFilter; // 日付フィルタ
  sortOrder: SortOrder; // ソート順
}

// ============================================================================
// UI状態型定義
// ============================================================================

// アップロード進捗
export interface UploadProgress {
  loaded: number; // bytes
  total: number; // bytes
  percentage: number; // 0-100
  speed?: number; // MB/s
  estimatedTime?: number; // 秒
}

// プログレス情報（UI表示用）
export interface ProgressInfo {
  status: ProgressStatusText;
  percentage: number; // 0-100
  speed?: string; // 表示用（例: "2.5 MB/s"）
  remainingTime?: string; // 表示用（例: "残り時間: 約30秒"）
}

// エラー情報
export interface ErrorInfo {
  message: string;
  type: 'network' | 'fileSize' | 'fileType' | 'unknown';
  retryable: boolean;
}

// ============================================================================
// API型定義
// ============================================================================

// APIレスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// 型ガード
// ============================================================================

// TranscriptionStatus 型ガード
export function isTranscriptionStatus(value: unknown): value is TranscriptionStatus {
  return (
    typeof value === 'string' &&
    (value === 'processing' || value === 'completed' || value === 'failed')
  );
}

// OutputFormat 型ガード
export function isOutputFormat(value: unknown): value is OutputFormat {
  return (
    typeof value === 'string' &&
    (value === 'text' || value === 'markdown' || value === 'srt')
  );
}

// TranscriptionJob 型ガード
export function isTranscriptionJob(obj: unknown): obj is TranscriptionJob {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const job = obj as Record<string, unknown>;
  return (
    typeof job.id === 'string' &&
    typeof job.originalFilename === 'string' &&
    typeof job.fileUrl === 'string' &&
    typeof job.fileSize === 'number' &&
    typeof job.language === 'string' &&
    isTranscriptionStatus(job.status) &&
    typeof job.createdAt === 'string' &&
    typeof job.updatedAt === 'string' &&
    (job.duration === undefined || typeof job.duration === 'number') &&
    (job.transcriptionText === undefined || typeof job.transcriptionText === 'string') &&
    (job.errorMessage === undefined || typeof job.errorMessage === 'string') &&
    (job.completedAt === undefined || typeof job.completedAt === 'string')
  );
}

// ErrorInfo 型ガード
export function isErrorInfo(obj: unknown): obj is ErrorInfo {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const error = obj as Record<string, unknown>;
  return (
    typeof error.message === 'string' &&
    typeof error.type === 'string' &&
    (error.type === 'network' || error.type === 'fileSize' || error.type === 'fileType' || error.type === 'unknown') &&
    typeof error.retryable === 'boolean'
  );
}

// SortOrder 型ガード
export function isSortOrder(value: unknown): value is SortOrder {
  return (
    typeof value === 'string' &&
    (value === 'asc' || value === 'desc')
  );
}

// StorageStatus 型ガード
export function isStorageStatus(value: unknown): value is StorageStatus {
  return (
    typeof value === 'string' &&
    (value === 'normal' || value === 'warning' || value === 'critical')
  );
}

// DateFilter 型ガード
export function isDateFilter(value: unknown): value is DateFilter {
  return (
    typeof value === 'string' &&
    (value === 'today' || value === 'thisWeek' || value === 'thisMonth' || value === 'all')
  );
}

// HistoryFilter 型ガード
export function isHistoryFilter(obj: unknown): obj is HistoryFilter {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const filter = obj as Record<string, unknown>;
  return (
    typeof filter.searchTerm === 'string' &&
    isDateFilter(filter.dateFilter) &&
    isSortOrder(filter.sortOrder)
  );
}
