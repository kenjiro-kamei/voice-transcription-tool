// API クライアント基盤

import { logger } from '@/lib/logger';
import type { ErrorInfo } from '@/types';

// API ベースURL（環境変数から取得）
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8567/api';

/**
 * APIエラーをErrorInfo形式に変換
 */
function createErrorInfo(message: string, status?: number): ErrorInfo {
  // ステータスコードに基づいてエラータイプを判定
  let type: ErrorInfo['type'] = 'unknown';
  let retryable = true;

  if (status === 413) {
    type = 'fileSize';
    retryable = false;
  } else if (status === 415) {
    type = 'fileType';
    retryable = false;
  } else if (!status || status >= 500) {
    type = 'network';
    retryable = true;
  } else if (status >= 400 && status < 500) {
    retryable = false;
  }

  return { message, type, retryable };
}

/**
 * snake_case を camelCase に変換
 */
function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = obj[key];

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[camelKey] = snakeToCamel(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map((item) =>
          typeof item === 'object' && item !== null
            ? snakeToCamel(item as Record<string, unknown>)
            : item
        );
      } else {
        result[camelKey] = value;
      }
    }
  }

  return result;
}

/**
 * APIレスポンスを処理
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'APIエラーが発生しました';

    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {
      // JSONパース失敗時はデフォルトメッセージを使用
    }

    logger.error('API error', {
      status: response.status,
      message: errorMessage,
    });

    throw createErrorInfo(errorMessage, response.status);
  }

  // 204 No Content の場合
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();
  return snakeToCamel(data) as T;
}

/**
 * GETリクエスト
 */
export async function get<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  logger.debug('API GET request', { url });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return handleResponse<T>(response);
  } catch (error) {
    if ((error as ErrorInfo).type) {
      throw error;
    }

    logger.error('Network error', { url, error });
    throw createErrorInfo('ネットワークエラーが発生しました。接続を確認してください。');
  }
}

/**
 * POSTリクエスト（JSON）
 */
export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  logger.debug('API POST request', { url });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  } catch (error) {
    if ((error as ErrorInfo).type) {
      throw error;
    }

    logger.error('Network error', { url, error });
    throw createErrorInfo('ネットワークエラーが発生しました。接続を確認してください。');
  }
}

/**
 * POSTリクエスト（FormData / ファイルアップロード）
 */
export async function postFormData<T>(
  endpoint: string,
  formData: FormData,
  onProgress?: (loaded: number, total: number) => void
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  logger.debug('API POST FormData request', { url });

  try {
    // XMLHttpRequest を使用してアップロード進捗を取得
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 進捗イベント
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress(event.loaded, event.total);
          }
        });
      }

      // 完了イベント
      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(snakeToCamel(data) as T);
          } catch {
            reject(createErrorInfo('レスポンスの解析に失敗しました'));
          }
        } else {
          let errorMessage = 'APIエラーが発生しました';

          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.detail || errorData.error || errorMessage;
          } catch {
            // JSONパース失敗時はデフォルトメッセージを使用
          }

          logger.error('API error', {
            status: xhr.status,
            message: errorMessage,
          });

          reject(createErrorInfo(errorMessage, xhr.status));
        }
      });

      // エラーイベント
      xhr.addEventListener('error', () => {
        logger.error('Network error', { url });
        reject(createErrorInfo('ネットワークエラーが発生しました。接続を確認してください。'));
      });

      // タイムアウトイベント
      xhr.addEventListener('timeout', () => {
        logger.error('Request timeout', { url });
        reject(createErrorInfo('リクエストがタイムアウトしました。'));
      });

      // リクエスト設定
      xhr.open('POST', url);
      xhr.timeout = 300000; // 5分（大きなファイルのアップロード用）
      xhr.send(formData);
    });
  } catch (error) {
    if ((error as ErrorInfo).type) {
      throw error;
    }

    logger.error('Upload error', { url, error });
    throw createErrorInfo('ファイルのアップロードに失敗しました。');
  }
}

/**
 * DELETEリクエスト
 */
export async function del(endpoint: string): Promise<void> {
  const url = `${API_BASE_URL}${endpoint}`;

  logger.debug('API DELETE request', { url });

  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });

    await handleResponse<void>(response);
  } catch (error) {
    if ((error as ErrorInfo).type) {
      throw error;
    }

    logger.error('Network error', { url, error });
    throw createErrorInfo('ネットワークエラーが発生しました。接続を確認してください。');
  }
}

export const apiClient = {
  get,
  post,
  postFormData,
  delete: del,
};
