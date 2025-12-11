// 文字起こしサービス - モック実装

import type {
  TranscriptionJob,
  OutputFormat,
  UploadProgress,
  ErrorInfo,
} from '@/types';
import { logger } from '@/lib/logger';

export class TranscriptionService {
  // モックデータ（HTMLモックアップの表示内容に基づく）
  private mockTranscriptionText = `こんにちは。本日の会議を始めます。

まず、今月の売上について報告いたします。先月比で15%増加しており、目標を達成しました。

次に、新製品の開発状況について説明します。現在、プロトタイプの最終テストを実施中で、来月のリリースに向けて準備を進めています。

最後に、マーケティング戦略について議論したいと思います。SNS広告のROIが改善しており、この戦略を継続することを提案します。

以上で報告を終わります。ご質問があればお願いします。`;

  // ファイルアップロード
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<TranscriptionJob> {
    // @MOCK_TO_API: POST /api/transcriptions/upload
    // Request: multipart/form-data (file)
    // Response: TranscriptionJob

    logger.debug('Uploading file', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // ファイルバリデーション
    const validationError = this.validateFile(file);
    if (validationError) {
      logger.error('File validation failed', { error: validationError });
      throw validationError;
    }

    // アップロード進捗のシミュレーション
    return new Promise((resolve, reject) => {
      let loaded = 0;
      const total = file.size;
      const startTime = Date.now();

      const interval = setInterval(() => {
        // ランダムに進捗を増加（15%ずつ）
        const increment = Math.random() * total * 0.15;
        loaded = Math.min(loaded + increment, total);
        const percentage = Math.round((loaded / total) * 100);

        // 速度計算（MB/s）
        const elapsedTime = (Date.now() - startTime) / 1000; // 秒
        const speed = loaded / 1024 / 1024 / elapsedTime; // MB/s

        // 残り時間推定（秒）
        const remaining = total - loaded;
        const estimatedTime = Math.round(remaining / (speed * 1024 * 1024));

        if (onProgress) {
          onProgress({
            loaded,
            total,
            percentage,
            speed,
            estimatedTime: estimatedTime > 0 ? estimatedTime : undefined,
          });
        }

        // アップロード完了
        if (loaded >= total) {
          clearInterval(interval);

          const job: TranscriptionJob = {
            id: `job-${Date.now()}`,
            originalFilename: file.name,
            fileUrl: `https://mock-r2.example.com/uploads/${file.name}`,
            fileSize: file.size,
            duration: undefined,
            language: 'ja',
            transcriptionText: undefined,
            status: 'processing',
            errorMessage: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: undefined,
          };

          logger.info('File uploaded successfully', {
            jobId: job.id,
            fileName: file.name,
          });

          resolve(job);
        }
      }, 200);

      // タイムアウト（30秒）
      setTimeout(() => {
        clearInterval(interval);
        const error: ErrorInfo = {
          message: 'アップロードがタイムアウトしました。',
          type: 'network',
          retryable: true,
        };
        logger.error('Upload timeout', { fileName: file.name });
        reject(error);
      }, 30000);
    });
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
    // @MOCK_TO_API: GET /api/transcriptions/{job_id}/status
    // Response: TranscriptionJob

    logger.debug('Fetching transcription status', { jobId });

    // モック実装: 3秒後に完了とする
    await this.delay(3000);

    const job: TranscriptionJob = {
      id: jobId,
      originalFilename: 'sample.mp3',
      fileUrl: 'https://mock-r2.example.com/uploads/sample.mp3',
      fileSize: 1024 * 1024 * 10, // 10MB
      duration: 180, // 3分
      language: 'ja',
      transcriptionText: this.mockTranscriptionText,
      status: 'completed',
      errorMessage: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    logger.info('Transcription completed', { jobId });

    return job;
  }

  // 文字起こし結果取得
  async getResult(jobId: string): Promise<TranscriptionJob> {
    // @MOCK_TO_API: GET /api/transcriptions/{job_id}
    // Response: TranscriptionJob

    logger.debug('Fetching transcription result', { jobId });

    const job: TranscriptionJob = {
      id: jobId,
      originalFilename: 'sample.mp3',
      fileUrl: 'https://mock-r2.example.com/uploads/sample.mp3',
      fileSize: 1024 * 1024 * 10, // 10MB
      duration: 180, // 3分
      language: 'ja',
      transcriptionText: this.mockTranscriptionText,
      status: 'completed',
      errorMessage: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    logger.info('Transcription result fetched', { jobId });

    return job;
  }

  // 文字起こし削除
  async deleteTranscription(jobId: string): Promise<void> {
    // @MOCK_TO_API: DELETE /api/transcriptions/{job_id}
    // Response: void

    logger.debug('Deleting transcription', { jobId });

    await this.delay(500);

    logger.info('Transcription deleted', { jobId });
  }

  // 出力形式変換
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

  // ユーティリティ: 遅延
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
