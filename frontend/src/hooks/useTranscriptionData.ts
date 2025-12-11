// 文字起こしデータ管理フック

import { useState, useCallback, useRef, useEffect } from 'react';
import { TranscriptionService } from '@/services';
import type {
  TranscriptionJob,
  OutputFormat,
  UploadProgress,
  ProgressInfo,
  ErrorInfo,
  CopyStatus,
  DropZoneState,
} from '@/types';
import { logger } from '@/lib/logger';

const service = new TranscriptionService();

export const useTranscriptionData = () => {
  // 状態管理
  const [currentJob, setCurrentJob] = useState<TranscriptionJob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [dropZoneState, setDropZoneState] = useState<DropZoneState>('idle');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('text');
  const [retryCount, setRetryCount] = useState(0);

  // uploadFile関数の参照を保持（循環参照回避）
  const uploadFileRef = useRef<((file: File) => Promise<void>) | null>(null);

  // localStorageに履歴保存
  const saveToHistory = useCallback((job: TranscriptionJob) => {
    try {
      const history = localStorage.getItem('transcriptionHistory');
      const historyArray = history ? JSON.parse(history) : [];

      // 履歴アイテム作成
      const historyItem = {
        id: job.id,
        originalFilename: job.originalFilename,
        transcriptionText: job.transcriptionText || '',
        createdAt: job.createdAt,
        previewText: job.transcriptionText?.slice(0, 100),
        fileSize: job.fileSize,
        duration: job.duration,
      };

      historyArray.unshift(historyItem);

      // 容量チェック（簡易版: 100件まで保持）
      if (historyArray.length > 100) {
        historyArray.splice(100);
        logger.info('History limit reached, removed old entries');
      }

      localStorage.setItem('transcriptionHistory', JSON.stringify(historyArray));

      logger.info('Saved to history', { jobId: job.id });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to save history', { error: error.message });
    }
  }, []);

  // 文字起こし処理開始（ポーリング対応）
  const startProcessing = useCallback(
    async (jobId: string) => {
      try {
        setIsProcessing(true);
        setProgressInfo({
          status: '文字起こし処理中...',
          percentage: 50,
          speed: undefined,
          remainingTime: '推定残り時間: 約2分',
        });

        logger.debug('Starting transcription processing', { jobId });

        // ポーリング（処理完了までステータスを定期確認）
        const POLLING_INTERVAL = 2000; // 2秒間隔
        const MAX_POLLING_TIME = 600000; // 最大10分
        const startTime = Date.now();

        let completedJob = await service.getStatus(jobId);

        while (completedJob.status === 'processing') {
          // タイムアウトチェック
          if (Date.now() - startTime > MAX_POLLING_TIME) {
            throw new Error('処理がタイムアウトしました。');
          }

          // 進捗更新（推定）
          const elapsedTime = (Date.now() - startTime) / 1000;
          const estimatedProgress = Math.min(50 + Math.floor(elapsedTime / 2), 95);
          setProgressInfo({
            status: '文字起こし処理中...',
            percentage: estimatedProgress,
            speed: undefined,
            remainingTime: `経過時間: ${Math.floor(elapsedTime)}秒`,
          });

          // 待機
          await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));

          // 再度ステータス確認
          completedJob = await service.getStatus(jobId);
        }

        // 処理完了または失敗
        if (completedJob.status === 'failed') {
          throw new Error(completedJob.errorMessage || '文字起こし処理に失敗しました。');
        }

        setCurrentJob(completedJob);
        setIsProcessing(false);
        setProgressInfo(null);

        logger.info('Transcription processing completed', { jobId });

        // localStorageに履歴保存
        saveToHistory(completedJob);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        logger.error('Transcription processing failed', {
          error: error.message,
          jobId,
        });

        const errorInfo: ErrorInfo = {
          message: error.message || '文字起こし処理に失敗しました。',
          type: 'unknown',
          retryable: true,
        };

        setError(errorInfo);
        setIsProcessing(false);
        setProgressInfo(null);
      }
    },
    [saveToHistory]
  );

  // ファイルアップロード
  const uploadFile = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setError(null);
        setDropZoneState('idle');

        logger.debug('Starting file upload', {
          fileName: file.name,
          fileSize: file.size,
        });

        // アップロード実行
        const job = await service.uploadFile(file, (progress) => {
          setUploadProgress(progress);

          // ProgressInfo形式に変換
          const info: ProgressInfo = {
            status: 'アップロード中...',
            percentage: progress.percentage,
            speed: progress.speed
              ? `${progress.speed.toFixed(2)} MB/s`
              : undefined,
            remainingTime: progress.estimatedTime
              ? `残り時間: 約${progress.estimatedTime}秒`
              : undefined,
          };
          setProgressInfo(info);
        });

        setCurrentJob(job);
        setIsUploading(false);
        setRetryCount(0);

        logger.info('File upload completed', { jobId: job.id });

        // 文字起こし処理開始
        await startProcessing(job.id);
      } catch (err) {
        const errorInfo =
          err instanceof Error
            ? {
                message: err.message,
                type: 'unknown' as const,
                retryable: true,
              }
            : (err as ErrorInfo);

        logger.error('File upload failed', {
          error: errorInfo.message,
          fileName: file.name,
        });

        setError(errorInfo);
        setIsUploading(false);
        setDropZoneState('error');

        // 自動リトライ（ネットワークエラーのみ、最大3回）
        if (errorInfo.type === 'network' && retryCount < 3) {
          const delays = [2000, 5000, 10000]; // 2秒、5秒、10秒
          const delay = delays[retryCount];

          logger.info('Auto retrying upload', {
            retryCount: retryCount + 1,
            delay,
          });

          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            uploadFileRef.current?.(file);
          }, delay);
        }
      }
    },
    [retryCount, startProcessing]
  );

  // uploadFile関数の参照を更新
  useEffect(() => {
    uploadFileRef.current = uploadFile;
  }, [uploadFile]);

  // コピー機能
  const copyToClipboard = useCallback(async () => {
    if (!currentJob?.transcriptionText) {
      logger.warn('No transcription text to copy');
      return;
    }

    try {
      setCopyStatus('copying');

      // 出力形式に応じて変換
      const textToCopy = service.convertFormat(
        currentJob.transcriptionText,
        outputFormat
      );

      await navigator.clipboard.writeText(textToCopy);

      setCopyStatus('copied');
      logger.info('Text copied to clipboard', {
        format: outputFormat,
        length: textToCopy.length,
      });

      // 2秒後にアイコンを元に戻す
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to copy to clipboard', { error: error.message });
      setCopyStatus('idle');
    }
  }, [currentJob, outputFormat]);

  // 手動リトライ
  const retry = useCallback(() => {
    setError(null);
    setDropZoneState('idle');
    setRetryCount(0);
    logger.debug('Manual retry triggered');
  }, []);

  // キャンセル
  const cancel = useCallback(() => {
    setError(null);
    setIsUploading(false);
    setIsProcessing(false);
    setProgressInfo(null);
    setDropZoneState('idle');
    setCurrentJob(null);
    logger.debug('Operation cancelled');
  }, []);

  // ドロップゾーン状態更新
  const updateDropZoneState = useCallback((state: DropZoneState) => {
    setDropZoneState(state);
  }, []);

  // 出力形式変更
  const changeOutputFormat = useCallback((format: OutputFormat) => {
    setOutputFormat(format);
    logger.debug('Output format changed', { format });
  }, []);

  return {
    // 状態
    currentJob,
    isUploading,
    isProcessing,
    uploadProgress,
    progressInfo,
    error,
    dropZoneState,
    copyStatus,
    outputFormat,

    // アクション
    uploadFile,
    copyToClipboard,
    retry,
    cancel,
    updateDropZoneState,
    changeOutputFormat,
  };
};
