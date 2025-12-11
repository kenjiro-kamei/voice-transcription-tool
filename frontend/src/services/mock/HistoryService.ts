// 履歴管理モックサービス（localStorage操作）
// @MOCK_TO_API: 将来的にバックエンドAPIと統合

import type {
  TranscriptionHistory,
  HistoryFilter,
  DateFilter,
  StorageStatus,
} from '@/types';
import { logger } from '@/lib/logger';

const STORAGE_KEY = 'transcription_histories';
const STORAGE_LIMIT_MB = 5; // 5MBまで（ブラウザlocalStorageの一般的な制限）
const WARNING_THRESHOLD = 0.8; // 80%
const CRITICAL_THRESHOLD = 0.95; // 95%

export class HistoryService {
  // localStorage容量チェック
  private checkStorageStatus(): StorageStatus {
    try {
      const used = new Blob([JSON.stringify(localStorage)]).size;
      const limit = STORAGE_LIMIT_MB * 1024 * 1024;
      const ratio = used / limit;

      logger.debug('Storage status checked', { used, limit, ratio });

      if (ratio >= CRITICAL_THRESHOLD) return 'critical';
      if (ratio >= WARNING_THRESHOLD) return 'warning';
      return 'normal';
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to check storage status', { error: error.message });
      return 'normal';
    }
  }

  // 古い履歴を自動削除（最も古い10件）
  private autoDeleteOldHistories(): void {
    try {
      logger.debug('Auto-deleting old histories');

      const histories = this.getAll();
      const sorted = histories.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const toDelete = sorted.slice(0, 10);
      const remaining = sorted.slice(10);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

      logger.info('Old histories deleted', { deletedCount: toDelete.length });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to auto-delete old histories', {
        error: error.message,
      });
      throw error;
    }
  }

  // 全履歴取得
  // @MOCK_TO_API: GET /api/transcriptions/history
  // Response: TranscriptionHistory[]
  getAll(): TranscriptionHistory[] {
    logger.debug('Fetching all histories from localStorage');

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const histories = JSON.parse(data) as TranscriptionHistory[];

      logger.info('Histories fetched', { count: histories.length });
      return histories;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch histories', { error: error.message });
      return [];
    }
  }

  // フィルタ・検索・ソート適用
  filter(histories: TranscriptionHistory[], filter: HistoryFilter): TranscriptionHistory[] {
    logger.debug('Filtering histories', { filter });

    let filtered = [...histories];

    // 検索キーワードでフィルタ
    if (filter.searchTerm.trim()) {
      const keywords = filter.searchTerm.toLowerCase().split(/\s+/);
      filtered = filtered.filter((history) => {
        const filename = history.originalFilename.toLowerCase();
        const text = history.transcriptionText.toLowerCase();
        return keywords.every((keyword) => filename.includes(keyword) || text.includes(keyword));
      });
    }

    // 日付フィルタ適用
    if (filter.dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((history) => {
        const createdAt = new Date(history.createdAt);
        return this.matchesDateFilter(createdAt, now, filter.dateFilter);
      });
    }

    // ソート適用
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return filter.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    logger.info('Histories filtered', {
      originalCount: histories.length,
      filteredCount: filtered.length,
    });

    return filtered;
  }

  // 日付フィルタのマッチング判定
  private matchesDateFilter(
    targetDate: Date,
    now: Date,
    filter: DateFilter
  ): boolean {
    switch (filter) {
      case 'today': {
        return (
          targetDate.getFullYear() === now.getFullYear() &&
          targetDate.getMonth() === now.getMonth() &&
          targetDate.getDate() === now.getDate()
        );
      }
      case 'thisWeek': {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return targetDate >= weekAgo;
      }
      case 'thisMonth': {
        return (
          targetDate.getFullYear() === now.getFullYear() &&
          targetDate.getMonth() === now.getMonth()
        );
      }
      default:
        return true;
    }
  }

  // 履歴追加（文字起こし完了時に呼ばれる）
  // @MOCK_TO_API: POST /api/transcriptions/history
  // Request: TranscriptionHistory
  // Response: void
  add(history: TranscriptionHistory): void {
    logger.debug('Adding history to localStorage', { id: history.id });

    try {
      // 容量チェック
      const status = this.checkStorageStatus();
      if (status === 'critical') {
        logger.warn('Storage is critical, auto-deleting old histories');
        this.autoDeleteOldHistories();
      }

      const histories = this.getAll();
      histories.unshift(history); // 先頭に追加（最新を上に）
      localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));

      logger.info('History added successfully', { id: history.id });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to add history', { error: error.message });
      throw error;
    }
  }

  // 履歴削除
  // @MOCK_TO_API: DELETE /api/transcriptions/history/{id}
  // Response: void
  delete(id: string): void {
    logger.debug('Deleting history', { id });

    try {
      const histories = this.getAll();
      const filtered = histories.filter((h) => h.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      logger.info('History deleted successfully', { id });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to delete history', { error: error.message, id });
      throw error;
    }
  }

  // 詳細取得
  // @MOCK_TO_API: GET /api/transcriptions/history/{id}
  // Response: TranscriptionHistory | null
  getById(id: string): TranscriptionHistory | null {
    logger.debug('Fetching history by ID', { id });

    try {
      const histories = this.getAll();
      const history = histories.find((h) => h.id === id) || null;

      if (history) {
        logger.info('History found', { id });
      } else {
        logger.warn('History not found', { id });
      }

      return history;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch history by ID', {
        error: error.message,
        id,
      });
      return null;
    }
  }

  // 容量状態取得
  getStorageStatus(): {
    status: StorageStatus;
    usedMB: number;
    limitMB: number;
    percentage: number;
  } {
    logger.debug('Getting storage status');

    try {
      const used = new Blob([JSON.stringify(localStorage)]).size;
      const limit = STORAGE_LIMIT_MB * 1024 * 1024;
      const usedMB = used / (1024 * 1024);
      const percentage = (used / limit) * 100;
      const status = this.checkStorageStatus();

      logger.info('Storage status retrieved', {
        status,
        usedMB,
        percentage,
      });

      return {
        status,
        usedMB: parseFloat(usedMB.toFixed(2)),
        limitMB: STORAGE_LIMIT_MB,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to get storage status', { error: error.message });
      return {
        status: 'normal',
        usedMB: 0,
        limitMB: STORAGE_LIMIT_MB,
        percentage: 0,
      };
    }
  }
}
