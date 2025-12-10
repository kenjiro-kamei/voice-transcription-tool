# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: 音声・動画文字起こしツール
開始日: 2025-12-10
技術スタック:
  frontend:
    - React 18
    - TypeScript 5
    - MUI v6
    - Zustand
    - React Router v6
    - React Query
    - Vite 5
  backend:
    - Python 3.11+
    - FastAPI
    - Celery
    - Redis
    - SQLAlchemy
    - Alembic
  database:
    - PostgreSQL (Neon)
  storage:
    - Cloudflare R2 (初期)
    - AWS S3 (本番移行後)
```

## 開発環境
```yaml
ポート設定:
  # 複数プロジェクト並行開発のため、一般的でないポートを使用
  frontend: 3427
  backend: 8567
  database: 5433

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  必須項目:
    - DATABASE_URL
    - OPENAI_API_KEY
    - R2_ACCOUNT_ID
    - R2_ACCESS_KEY_ID
    - R2_SECRET_ACCESS_KEY
    - R2_BUCKET_NAME
    - REDIS_URL
```

## テスト認証情報
```yaml
開発用アカウント:
  # MVP版は認証なし（localStorageで管理）
  # Phase 11拡張時に追加

外部サービス:
  OpenAI API: テスト用APIキー（$5クレジット）
  Cloudflare R2: 10GB無料枠
  Neon: 512MB無料枠
  Redis Cloud: 30MB無料枠
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: TranscriptionMain.tsx)
  - ユーティリティ: camelCase.ts (例: formatDate.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: API_ENDPOINTS.ts)

変数・関数:
  - 変数: camelCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型/インターフェース: PascalCase
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止
  - エラーハンドリング必須
  - 関数行数: 100行以下（96.7%カバー）
  - ファイル行数: 700行以下（96.9%カバー）
  - 複雑度: 10以下
  - 行長: 120文字

フォーマット:
  - インデント: スペース2つ
  - セミコロン: あり
  - クォート: シングル
```

## プロジェクト固有ルール

### APIエンドポイント
```yaml
命名規則:
  - RESTful形式を厳守
  - 複数形を使用 (/transcriptions)
  - ケバブケース使用

エンドポイント一覧:
  - POST /api/transcriptions/upload: ファイルアップロード
  - GET /api/transcriptions/{job_id}/status: 文字起こし状況取得
  - GET /api/transcriptions/{job_id}: 文字起こし結果取得
  - DELETE /api/transcriptions/{job_id}: 文字起こし削除
  - GET /api/health: ヘルスチェック
```

### 型定義
```yaml
配置:
  frontend: src/types/index.ts
  backend: src/types/index.ts

同期ルール:
  - 両ファイルは常に同一内容を保つ
  - 片方を更新したら即座にもう片方も更新

主要型:
  - TranscriptionJob: 文字起こしジョブ
  - TranscriptionStatus: 処理状態 (processing/completed/failed)
  - OutputFormat: 出力形式 (text/markdown/srt)
```

## 🆕 最新技術情報（知識カットオフ対応）
```yaml
OpenAI Whisper API:
  - 2025年のWhisper Turbo（large-v3-turbo）で従来比3.16倍高速化
  - 25MBファイル制限あり（ffmpegで圧縮対応）
  - 日本語精度: WER 4.9%（95%以上の認識精度）

Cloudflare R2:
  - S3互換API
  - 10GB無料、転送料無料
  - 初期テストに最適

Celery + Redis:
  - 長時間の文字起こし処理をバックグラウンド実行
  - Redis Cloud 30MB無料枠で十分
```

## MVP版の特徴
```yaml
認証: なし（localStorageで履歴管理）
ページ数: 2ページ
  - P-001: 文字起こしメインページ (/)
  - P-002: 履歴一覧ページ (/history)

初期コスト: $0（完全無料）
拡張予定: Phase 11で認証機能追加
```

## 開発フロー
```yaml
Phase 1: 要件定義 ✅
Phase 2: Git/GitHub管理（推奨、スキップ可）
Phase 3: フロントエンド基盤
Phase 4: ページ実装
Phase 5: バックエンド基盤
Phase 6: API実装
Phase 7: 統合テスト
Phase 8: デプロイ準備
Phase 9: 本番デプロイ
Phase 10: 運用監視
Phase 11: 機能拡張（必要に応じて）
```

## 参考ドキュメント
```yaml
要件定義書: docs/requirements.md
進捗管理表: docs/SCOPE_PROGRESS.md
ESLint設定: .eslintrc.json
Python Lint設定: .flake8
```
