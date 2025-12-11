// 文字起こしサービス - 実API実装

import type {
  TranscriptionJob,
  OutputFormat,
  UploadProgress,
  ErrorInfo,
} from '@/types';
import { apiClient } from './client';
import { logger } from '@/lib/logger';

export class TranscriptionService {
  // ファイルアップロード
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<TranscriptionJob> {
    logger.debug('Uploading file', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // ファイルバリデーション（クライアントサイド）
    const validationError = this.validateFile(file);
    if (validationError) {
      logger.error('File validation failed', { error: validationError });
      throw validationError;
    }

    // FormData 作成
    const formData = new FormData();
    formData.append('file', file);

    const startTime = Date.now();

    // アップロード実行
    const job = await apiClient.postFormData<TranscriptionJob>(
      '/transcriptions/upload',
      formData,
      (loaded, total) => {
        if (onProgress) {
          const percentage = Math.round((loaded / total) * 100);
          const elapsedTime = (Date.now() - startTime) / 1000;
          const speed = elapsedTime > 0 ? loaded / 1024 / 1024 / elapsedTime : 0;
          const remaining = total - loaded;
          const estimatedTime = speed > 0 ? Math.round(remaining / (speed * 1024 * 1024)) : undefined;

          onProgress({
            loaded,
            total,
            percentage,
            speed,
            estimatedTime,
          });
        }
      }
    );

    logger.info('File uploaded successfully', {
      jobId: job.id,
      fileName: file.name,
    });

    return job;
  }

  // ファイルバリデーション
  private validateFile(file: File): ErrorInfo | null {
    // ファイルサイズチェック（2GB）
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      return {
        message: 'ファイルサイズが2GBを超えています。',
        type: 'fileSize',
        retryable: false,
      };
    }

    // ファイル形式チェック
    const validExtensions = ['.mp3', '.mp4', '.wav', '.m4a', '.mov', '.webm', '.mpeg'];
    const validMimeTypes = [
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/x-m4a',
      'video/mp4',
      'video/quicktime',
      'video/webm',
      'video/mpeg',
    ];

    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));
    const hasValidMimeType = validMimeTypes.includes(file.type);

    if (!hasValidExtension && !hasValidMimeType) {
      return {
        message:
          '対応していないファイル形式です。mp3, mp4, wav, m4a, mov, webm, mpeg をご利用ください。',
        type: 'fileType',
        retryable: false,
      };
    }

    return null;
  }

  // 文字起こし状況取得（ポーリング用）
  async getStatus(jobId: string): Promise<TranscriptionJob> {
    logger.debug('Fetching transcription status', { jobId });

    const job = await apiClient.get<TranscriptionJob>(
      `/transcriptions/${jobId}/status`
    );

    logger.info('Transcription status fetched', { jobId, status: job.status });

    return job;
  }

  // 文字起こし結果取得
  async getResult(jobId: string): Promise<TranscriptionJob> {
    logger.debug('Fetching transcription result', { jobId });

    const job = await apiClient.get<TranscriptionJob>(
      `/transcriptions/${jobId}`
    );

    logger.info('Transcription result fetched', { jobId });

    return job;
  }

  // 文字起こし削除
  async deleteTranscription(jobId: string): Promise<void> {
    logger.debug('Deleting transcription', { jobId });

    await apiClient.delete(`/transcriptions/${jobId}`);

    logger.info('Transcription deleted', { jobId });
  }

  // 出力形式変換（クライアントサイド処理）
  convertFormat(text: string, format: OutputFormat): string {
    logger.debug('Converting format', { format, textLength: text.length });

    switch (format) {
      case 'text':
        return text;

      case 'markdown':
        // シンプルなMarkdown変換（段落を維持）
        return text
          .split('\n\n')
          .map((paragraph) => paragraph.trim())
          .filter((p) => p.length > 0)
          .map((paragraph) => `${paragraph}\n`)
          .join('\n');

      case 'srt': {
        // SRT形式に変換（簡易版：10秒ごとに分割）
        const lines = text.split('\n').filter((line) => line.trim().length > 0);
        let srt = '';
        let index = 1;
        let startTime = 0;

        for (const line of lines) {
          const endTime = startTime + 10; // 10秒間隔
          srt += `${index}\n`;
          srt += `${this.formatSrtTime(startTime)} --> ${this.formatSrtTime(endTime)}\n`;
          srt += `${line}\n\n`;
          index++;
          startTime = endTime;
        }

        return srt;
      }

      default:
        logger.warn('Unknown format, returning text', { format });
        return text;
    }
  }

  // SRT時間フォーマット（HH:MM:SS,mmm）
  private formatSrtTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = 0;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
  }
}
