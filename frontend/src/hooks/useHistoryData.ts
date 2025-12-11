// 履歴データ管理カスタムフック

import { useState, useEffect, useMemo } from 'react';
import { HistoryService } from '@/services';
import type {
  TranscriptionHistory,
  HistoryFilter,
  DateFilter,
  SortOrder,
  StorageStatus,
} from '@/types';
import { logger } from '@/lib/logger';

const service = new HistoryService();

export const useHistoryData = () => {
  const [allHistories, setAllHistories] = useState<TranscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // フィルタ状態
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // モーダル状態
  const [selectedHistory, setSelectedHistory] = useState<TranscriptionHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // スナックバー状態
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // ストレージ状態
  const [storageStatus, setStorageStatus] = useState<StorageStatus>('normal');
  const [storageInfo, setStorageInfo] = useState({
    usedMB: 0,
    limitMB: 5,
    percentage: 0,
  });

  // 履歴取得
  const fetchHistories = () => {
    try {
      setLoading(true);
      logger.debug('Fetching histories', { hookName: 'useHistoryData' });

      const histories = service.getAll();
      setAllHistories(histories);

      // ストレージ状態チェック
      const storage = service.getStorageStatus();
      setStorageStatus(storage.status);
      setStorageInfo({
        usedMB: storage.usedMB,
        limitMB: storage.limitMB,
        percentage: storage.percentage,
      });

      logger.info('Histories fetched successfully', {
        count: histories.length,
        storageStatus: storage.status,
        hookName: 'useHistoryData',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to fetch histories', {
        error: error.message,
        hookName: 'useHistoryData',
      });
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    logger.debug('Hook mounted', { hookName: 'useHistoryData' });
    fetchHistories();
  }, []);

  // フィルタ・ソート適用（useMemo で最適化）
  const filteredHistories = useMemo(() => {
    const filter: HistoryFilter = { searchTerm, dateFilter, sortOrder };
    return service.filter(allHistories, filter);
  }, [allHistories, searchTerm, dateFilter, sortOrder]);

  // 検索ワードハイライト用の正規表現生成
  const highlightRegex = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const keywords = searchTerm.trim().split(/\s+/);
    const pattern = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return new RegExp(`(${pattern})`, 'gi');
  }, [searchTerm]);

  // テキストハイライト処理
  const highlightText = (text: string): string => {
    if (!highlightRegex) return text;
    return text.replace(highlightRegex, '<mark>$1</mark>');
  };

  // 履歴削除
  const deleteHistory = (id: string) => {
    try {
      logger.debug('Deleting history', { id, hookName: 'useHistoryData' });

      service.delete(id);
      fetchHistories(); // リフレッシュ
      showSnackbar('削除しました');

      // モーダルが開いている場合は閉じる
      if (selectedHistory?.id === id) {
        closeModal();
      }

      logger.info('History deleted successfully', {
        id,
        hookName: 'useHistoryData',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to delete history', {
        error: error.message,
        id,
        hookName: 'useHistoryData',
      });
      setError(error);
    }
  };

  // モーダル開く
  const openModal = (history: TranscriptionHistory) => {
    logger.debug('Opening modal', { historyId: history.id });
    setSelectedHistory(history);
    setIsModalOpen(true);
  };

  // モーダル閉じる
  const closeModal = () => {
    logger.debug('Closing modal');
    setIsModalOpen(false);
    setSelectedHistory(null);
  };

  // クリップボードにコピー
  const copyToClipboard = async (text: string) => {
    try {
      logger.debug('Copying to clipboard');

      await navigator.clipboard.writeText(text);
      showSnackbar('コピーしました');

      logger.info('Text copied to clipboard successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to copy to clipboard', { error: error.message });
      showSnackbar('コピーに失敗しました');
    }
  };

  // スナックバー表示
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // スナックバー閉じる
  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  // フィルタリセット
  const resetFilters = () => {
    logger.debug('Resetting filters');
    setSearchTerm('');
    setDateFilter('all');
    setSortOrder('desc');
  };

  return {
    // データ
    allHistories,
    filteredHistories,
    loading,
    error,

    // フィルタ状態
    searchTerm,
    dateFilter,
    sortOrder,
    setSearchTerm,
    setDateFilter,
    setSortOrder,
    resetFilters,

    // ハイライト
    highlightText,

    // モーダル
    selectedHistory,
    isModalOpen,
    openModal,
    closeModal,

    // スナックバー
    snackbarMessage,
    snackbarOpen,
    closeSnackbar,

    // ストレージ
    storageStatus,
    storageInfo,

    // 操作
    deleteHistory,
    copyToClipboard,
    refetch: fetchHistories,
  };
};
