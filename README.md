# 音声・動画文字起こしツール

音声ファイルや動画ファイルをアップロードして、OpenAI Whisper APIを使用して文字起こしを行うWebアプリケーションです。

## 特徴

- 音声/動画ファイルのドラッグ&ドロップまたはファイル選択でアップロード
- OpenAI Whisper API (large-v3-turbo) による高精度な文字起こし
- 出力形式の選択（プレーンテキスト/Markdown/SRT字幕）
- ワンクリックでコピー
- 文字起こし履歴の管理（検索・フィルタリング・削除）
- レスポンシブデザイン（デスクトップ/タブレット/モバイル対応）

## 技術スタック

### フロントエンド
- React 19 + TypeScript 5.9
- Vite 7
- MUI (Material-UI) v7
- TanStack Query (React Query)
- Zustand（状態管理）
- React Router v6

### バックエンド
- Python 3.11+
- FastAPI
- Celery + Redis（非同期タスク処理）
- SQLAlchemy + Alembic（ORM/マイグレーション）
- PostgreSQL (Neon)
- Cloudflare R2（ファイルストレージ）

## 開発環境のセットアップ

### 前提条件

- Node.js 20+
- Python 3.11+
- Redis（ローカルまたはRedis Cloud）
- PostgreSQL（ローカルまたはNeon）

### 1. リポジトリのクローン

```bash
git clone https://github.com/kenjiro-kamei/voice-transcription-tool.git
cd voice-transcription-tool
```

### 2. 環境変数の設定

プロジェクトルートに `.env.local` を作成:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OpenAI API
OPENAI_API_KEY=sk-...

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name

# Redis
REDIS_URL=redis://localhost:6379

# Application
FRONTEND_URL=http://localhost:3427
BACKEND_URL=http://localhost:8567
CORS_ORIGIN=http://localhost:3427
ENVIRONMENT=development
```

### 3. フロントエンドのセットアップ

```bash
cd frontend
npm install
npm run dev
```

フロントエンドは http://localhost:3427 で起動します。

### 4. バックエンドのセットアップ

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# データベースマイグレーション
alembic upgrade head

# サーバー起動
uvicorn src.main:app --host 0.0.0.0 --port 8567 --reload
```

バックエンドAPIは http://localhost:8567 で起動します。

### 5. Celery Workerの起動

```bash
cd backend
celery -A src.celery_app worker --loglevel=info
```

## テスト

### フロントエンドテスト

```bash
cd frontend

# ユニットテスト
npm test

# E2Eテスト
npm run test:e2e

# E2Eテスト（UIモード）
npm run test:e2e:ui
```

### バックエンドテスト

```bash
cd backend
pytest
```

## API仕様

詳細なAPI仕様は以下を参照してください:
- [文字起こしAPI仕様](docs/api-specs/transcription-main-api.md)
- [履歴API仕様](docs/api-specs/history-page-api.md)

### 主要エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/transcriptions/upload` | ファイルアップロード |
| GET | `/api/transcriptions/{job_id}/status` | 処理状況取得 |
| GET | `/api/transcriptions/{job_id}` | 結果取得 |
| DELETE | `/api/transcriptions/{job_id}` | 削除 |
| GET | `/api/health` | ヘルスチェック |

## ディレクトリ構造

```
.
├── frontend/               # React フロントエンド
│   ├── src/
│   │   ├── components/     # 共通コンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   ├── services/       # API クライアント
│   │   ├── types/          # 型定義
│   │   └── utils/          # ユーティリティ
│   └── tests/              # テスト
├── backend/                # FastAPI バックエンド
│   ├── src/
│   │   ├── routers/        # API ルーター
│   │   ├── services/       # ビジネスロジック
│   │   ├── models/         # SQLAlchemy モデル
│   │   ├── schemas/        # Pydantic スキーマ
│   │   └── tasks/          # Celery タスク
│   ├── alembic/            # DB マイグレーション
│   └── tests/              # テスト
└── docs/                   # ドキュメント
    ├── api-specs/          # API 仕様
    ├── requirements.md     # 要件定義
    ├── SCOPE_PROGRESS.md   # 進捗管理
    └── DEPLOYMENT.md       # デプロイ手順
```

## ライセンス

MIT License

## 貢献

1. Forkする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成
