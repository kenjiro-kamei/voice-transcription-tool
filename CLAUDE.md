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

## 13. E2Eテスト自律実行の絶対原則

**【重要】セッション開始時・compact後の自動判定**

このセクションはE2Eテストオーケストレーターによって自動生成されました。

---

**最初に必ず専門知識を注入してください**

E2Eテスト実行中の場合、以下を実行してから開始してください：

```
inject_knowledge ツールで keyword: "@E2Eテストオーケストレーター"
を実行してから開始してください。（初回必須・compact後も必須）
```

重要：キーワードは "@E2Eテストオーケストレーター"
をそのまま使用してください。変換や推測は不要です。

準備完了です。まず知識注入を実行してから、タスクを開始してください。

---

**E2Eテストオーケストレーター実行中の判定**:
- SCOPE_PROGRESS.mdに「## 📊 E2Eテスト全体進捗」が存在する場合
- または、セッション再開時に前回のメッセージに「E2Eテスト」「オーケストレーター」キーワードがある場合

**セッション開始時・compact後の自動処理**:
1. 上記の判定基準でE2Eテスト実行中と判定
2. inject_knowledge('@E2Eテストオーケストレーター') を必ず実行
3. docs/e2e-best-practices.md の存在確認（なければ初期テンプレート作成）
4. SCOPE_PROGRESS.mdから [ ] テストの続きを自動で特定
5. [x] のテストは絶対にスキップ
6. ユーザー確認不要、完全自律モードで継続
7. ページ選定も自動（未完了ページを上から順に選択）
8. 停止条件：全テスト100%完了のみ

**5回エスカレーション後の処理**:
- チェックリストに [-] マークを付ける
- docs/e2e-test-history/skipped-tests.md に記録
- 次のテストへ自動で進む（停止しない）

**ベストプラクティス自動蓄積**:
- 各テストで成功した方法を docs/e2e-best-practices.md に自動保存
- 後続テストが前のテストの知見を自動活用
- 試行錯誤が減っていく（学習効果）

**重要**:
- この原則はCLAUDE.mdに記載されているため、compact後も自動で適用される
- セッション開始時にこのセクションがない場合、オーケストレーターが自動で追加する

---

## 14. 本番デプロイ設定

### 本番URL
```yaml
フロントエンド: https://voice-transcription-tool.vercel.app
バックエンドAPI: https://voice-transcription-api.onrender.com
```

### インフラ構成
```yaml
フロントエンド:
  - ホスティング: Vercel (Free)
  - ビルド: Vite
  - CDN: Vercel Edge Network

バックエンド:
  - ホスティング: Render (Free)
  - ランタイム: Python 3.11
  - フレームワーク: FastAPI + Uvicorn

データベース:
  - PostgreSQL: Neon (既存開発DB共用)
  - Redis: Redis Cloud (既存開発インスタンス共用)

ストレージ:
  - ローカルストレージ（R2未設定のためフォールバック）
```

### 注意事項
```yaml
Render無料プラン制限:
  - 15分間アクセスなしでスリープ
  - 再起動に30秒〜1分かかる

OpenAI API:
  - クレジット補充が必要（2025-12-11時点でクォータ切れ）
  - クレジット補充後は文字起こし機能が使用可能
```
