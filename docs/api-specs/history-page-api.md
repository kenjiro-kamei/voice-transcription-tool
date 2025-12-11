# 履歴一覧ページ API仕様書

生成日: 2025-12-10
収集元: frontend/src/services/mock/HistoryService.ts
@MOCK_TO_APIマーク数: 4

---

## エンドポイント一覧

### 1. 履歴一覧取得

- **エンドポイント**: `GET /api/transcriptions/history`
- **説明**: localStorageに保存された文字起こし履歴を全件取得
- **認証**: 不要（MVP版）

#### Request
なし

#### Response
```typescript
// 成功時: 200 OK
TranscriptionHistory[]

// TranscriptionHistory型
interface TranscriptionHistory {
  id: string;                    // UUID
  originalFilename: string;      // 元のファイル名
  transcriptionText: string;     // 文字起こしテキスト
  createdAt: string;             // ISO 8601形式
  previewText?: string;          // プレビュー用（最初の100文字）
  fileSize?: number;             // ファイルサイズ（bytes）
  duration?: number;             // 音声の長さ（秒）
}
```

---

### 2. 履歴追加

- **エンドポイント**: `POST /api/transcriptions/history`
- **説明**: 文字起こし完了時に履歴を追加
- **認証**: 不要（MVP版）

#### Request
```typescript
// Request Body
TranscriptionHistory
```

#### Response
```typescript
// 成功時: 201 Created
void

// エラー時: 500 Internal Server Error
{
  error: string;
}
```

---

### 3. 履歴削除

- **エンドポイント**: `DELETE /api/transcriptions/history/{id}`
- **説明**: 指定IDの履歴を削除
- **認証**: 不要（MVP版）

#### Request
| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| id | string (path) | ○ | 履歴ID（UUID） |

#### Response
```typescript
// 成功時: 204 No Content
void

// エラー時: 404 Not Found
{
  error: "History not found"
}
```

---

### 4. 履歴詳細取得

- **エンドポイント**: `GET /api/transcriptions/history/{id}`
- **説明**: 指定IDの履歴詳細を取得
- **認証**: 不要（MVP版）

#### Request
| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| id | string (path) | ○ | 履歴ID（UUID） |

#### Response
```typescript
// 成功時: 200 OK
TranscriptionHistory

// エラー時: 404 Not Found
{
  error: "History not found"
}
```

---

## フロントエンド専用機能（API不要）

以下の機能はフロントエンドのみで処理され、バックエンドAPIは不要です：

### フィルタリング・検索・ソート

```typescript
interface HistoryFilter {
  searchTerm: string;      // 検索キーワード（空白区切りでAND検索）
  dateFilter: DateFilter;  // 'today' | 'thisWeek' | 'thisMonth' | 'all'
  sortOrder: SortOrder;    // 'asc' | 'desc'
}
```

- **検索**: ファイル名・テキスト内容の部分一致（大文字小文字区別なし）
- **日付フィルタ**: フロントエンドで日付範囲計算
- **ソート**: createdAtによる昇順/降順

### localStorage容量管理

```typescript
interface StorageInfo {
  status: StorageStatus;  // 'normal' | 'warning' | 'critical'
  usedMB: number;         // 使用量（MB）
  limitMB: number;        // 制限（5MB）
  percentage: number;     // 使用率（%）
}
```

- **80%超過**: 警告表示
- **95%超過**: 古い履歴10件を自動削除

---

## モックサービス参照

```typescript
// 実装時はこのモックサービスの挙動を参考にする
frontend/src/services/mock/HistoryService.ts
```

---

## 備考

- MVP版ではバックエンドAPIは実装せず、localStorageで履歴管理
- Phase 11拡張時にPostgreSQLへの永続化を検討
- バックエンド実装時は、モックサービスの@MOCK_TO_APIマークを参照
