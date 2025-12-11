# 文字起こしメインページ API仕様書

生成日: 2025-12-10
収集元: frontend/src/services/mock/TranscriptionService.ts
@MOCK_TO_APIマーク数: 4

---

## エンドポイント一覧

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | /api/transcriptions/upload | ファイルアップロード |
| GET | /api/transcriptions/{job_id}/status | 文字起こし状況取得 |
| GET | /api/transcriptions/{job_id} | 文字起こし結果取得 |
| DELETE | /api/transcriptions/{job_id} | 文字起こし削除 |

---

## 1. ファイルアップロード

### エンドポイント
```
POST /api/transcriptions/upload
```

### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: 音声・動画ファイル（必須）

### バリデーション
```yaml
ファイルサイズ:
  最大: 2GB (2,147,483,648 bytes)
  エラーメッセージ: "ファイルサイズが2GBを超えています。"

ファイル形式:
  許可拡張子: [".mp3", ".mp4", ".wav", ".m4a", ".mov", ".webm", ".mpeg"]
  許可MIMEタイプ:
    - audio/mpeg
    - audio/mp4
    - audio/wav
    - audio/x-m4a
    - video/mp4
    - video/quicktime
    - video/webm
    - video/mpeg
  エラーメッセージ: "対応していないファイル形式です。mp3, mp4, wav, m4a, mov, webm, mpeg をご利用ください。"
```

### Response
```typescript
// 成功時: 200 OK
{
  id: string;               // UUID
  originalFilename: string; // 元のファイル名
  fileUrl: string;          // R2保存URL
  fileSize: number;         // ファイルサイズ（bytes）
  duration?: number;        // 音声の長さ（秒）
  language: string;         // 言語コード（デフォルト: "ja"）
  transcriptionText?: string;
  status: "processing";     // 初期状態
  errorMessage?: string;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  completedAt?: string;     // ISO 8601
}

// エラー時: 400 Bad Request
{
  error: string;
  type: "fileSize" | "fileType";
  retryable: boolean;
}
```

---

## 2. 文字起こし状況取得

### エンドポイント
```
GET /api/transcriptions/{job_id}/status
```

### パラメータ
- `job_id`: 文字起こしジョブID（UUID）

### Response
```typescript
// 成功時: 200 OK
{
  id: string;
  originalFilename: string;
  fileUrl: string;
  fileSize: number;
  duration?: number;
  language: string;
  transcriptionText?: string;   // 完了時のみ
  status: "processing" | "completed" | "failed";
  errorMessage?: string;        // 失敗時のみ
  createdAt: string;
  updatedAt: string;
  completedAt?: string;         // 完了時のみ
}
```

### ポーリング仕様
- **間隔**: 5秒ごと
- **タイムアウト**: なし（ユーザーがキャンセルするまで継続）

---

## 3. 文字起こし結果取得

### エンドポイント
```
GET /api/transcriptions/{job_id}
```

### パラメータ
- `job_id`: 文字起こしジョブID（UUID）

### Response
```typescript
// 成功時: 200 OK
{
  id: string;
  originalFilename: string;
  fileUrl: string;
  fileSize: number;
  duration?: number;
  language: string;
  transcriptionText: string;    // 必須
  status: "completed";
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string;          // 必須
}

// エラー時: 404 Not Found
{
  error: "Transcription not found"
}
```

---

## 4. 文字起こし削除

### エンドポイント
```
DELETE /api/transcriptions/{job_id}
```

### パラメータ
- `job_id`: 文字起こしジョブID（UUID）

### Response
```typescript
// 成功時: 204 No Content
// （レスポンスボディなし）

// エラー時: 404 Not Found
{
  error: "Transcription not found"
}
```

---

## 型定義参照

```typescript
// frontend/src/types/index.ts

type TranscriptionStatus = 'processing' | 'completed' | 'failed';
type OutputFormat = 'text' | 'markdown' | 'srt';

interface TranscriptionJob {
  id: string;
  originalFilename: string;
  fileUrl: string;
  fileSize: number;
  duration?: number;
  language: string;
  transcriptionText?: string;
  status: TranscriptionStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface ErrorInfo {
  message: string;
  type: 'network' | 'fileSize' | 'fileType' | 'unknown';
  retryable: boolean;
}
```

---

## モックサービス参照

```
frontend/src/services/mock/TranscriptionService.ts
```

バックエンド実装時は、このモックサービスの挙動を参考にしてください。
