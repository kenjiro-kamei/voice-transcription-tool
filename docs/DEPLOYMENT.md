# デプロイ手順書

## 目次
1. [前提条件](#前提条件)
2. [環境変数設定](#環境変数設定)
3. [本番環境構成](#本番環境構成)
4. [デプロイ手順](#デプロイ手順)
5. [ヘルスチェック](#ヘルスチェック)
6. [ロールバック手順](#ロールバック手順)
7. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### 必要なサービス
- **PostgreSQL**: Neon (推奨) または自己ホスト
- **Redis**: Redis Cloud (推奨) または自己ホスト
- **オブジェクトストレージ**: Cloudflare R2 (初期) → AWS S3 (本番移行後)
- **OpenAI API**: Whisper API用

### 必要なツール
```bash
# Node.js 20+
node --version  # >= 20.0.0

# Python 3.11+
python --version  # >= 3.11

# Docker (オプション)
docker --version

# GitHub CLI (CI/CD)
gh --version
```

---

## 環境変数設定

### 必須環境変数

```bash
# .env.production (本番用)

# ===== Database =====
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# ===== OpenAI =====
OPENAI_API_KEY=sk-...

# ===== Cloudflare R2 =====
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=voice-transcription-prod

# ===== Redis =====
REDIS_URL=redis://default:password@host:6379

# ===== Application =====
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
CORS_ORIGIN=https://your-domain.com
ENVIRONMENT=production
```

### 機密情報の管理

本番環境では以下のいずれかを使用してください：

1. **AWS Secrets Manager** (推奨)
2. **Google Secret Manager**
3. **Hashicorp Vault**
4. **環境変数（CI/CD経由）**

---

## 本番環境構成

### 推奨アーキテクチャ

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (CDN/WAF)     │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐       ┌───────────▼───────────┐
    │    Frontend       │       │      Backend          │
    │  (Vercel/CF Pages)│       │   (Cloud Run/Render)  │
    │    React SPA      │       │      FastAPI          │
    └───────────────────┘       └───────────┬───────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
          ┌─────────▼─────────┐   ┌─────────▼─────────┐   ┌─────────▼─────────┐
          │    PostgreSQL     │   │      Redis        │   │   Cloudflare R2   │
          │      (Neon)       │   │  (Redis Cloud)    │   │  (Object Storage) │
          └───────────────────┘   └─────────┬─────────┘   └───────────────────┘
                                            │
                                  ┌─────────▼─────────┐
                                  │  Celery Worker    │
                                  │ (文字起こし処理)  │
                                  └───────────────────┘
```

### リソース要件

| コンポーネント | 最小 | 推奨 |
|--------------|------|------|
| Frontend | 256MB RAM | 512MB RAM |
| Backend (API) | 512MB RAM, 1 vCPU | 1GB RAM, 2 vCPU |
| Celery Worker | 1GB RAM, 1 vCPU | 2GB RAM, 2 vCPU |
| PostgreSQL | 512MB | 1GB |
| Redis | 30MB | 100MB |

---

## デプロイ手順

### 1. フロントエンドデプロイ (Vercel)

```bash
# Vercel CLIインストール
npm i -g vercel

# ビルド確認
cd frontend
npm run build

# デプロイ
vercel --prod
```

**環境変数設定 (Vercel Dashboard)**:
- `VITE_API_URL`: バックエンドURL

### 2. バックエンドデプロイ (Cloud Run)

```bash
# Dockerイメージビルド
cd backend
docker build -t voice-transcription-api .

# Google Cloud にプッシュ
docker tag voice-transcription-api gcr.io/PROJECT_ID/voice-transcription-api
docker push gcr.io/PROJECT_ID/voice-transcription-api

# Cloud Runデプロイ
gcloud run deploy voice-transcription-api \
  --image gcr.io/PROJECT_ID/voice-transcription-api \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=$DATABASE_URL,REDIS_URL=$REDIS_URL,..."
```

### 3. Celery Workerデプロイ

```bash
# Cloud Run Jobs または別のCloud Runサービスとして
gcloud run deploy voice-transcription-worker \
  --image gcr.io/PROJECT_ID/voice-transcription-api \
  --platform managed \
  --region asia-northeast1 \
  --command="celery" \
  --args="-A,src.celery_app,worker,--loglevel=info"
```

### 4. データベースマイグレーション

```bash
# マイグレーション実行（デプロイ前に実行）
cd backend
alembic upgrade head

# マイグレーション状態確認
alembic current
```

---

## ヘルスチェック

### エンドポイント一覧

| エンドポイント | 用途 | 期待レスポンス |
|---------------|------|--------------|
| `/api/health` | 総合ヘルスチェック | 200 OK |
| `/api/health/live` | Liveness Probe | 200 OK |
| `/api/health/ready` | Readiness Probe | 200 OK |

### 監視項目

```bash
# 基本ヘルスチェック
curl https://api.your-domain.com/api/health

# 期待レスポンス
{
  "status": "healthy",
  "timestamp": "2025-12-11T12:00:00Z",
  "database": "connected",
  "services": {
    "database": {"status": "connected", "latency_ms": 5.2},
    "redis": {"status": "connected", "latency_ms": 2.1},
    "celery": {"status": "connected", "latency_ms": 3.0}
  },
  "version": "1.0.0"
}
```

---

## ロールバック手順

### 1. Cloud Run ロールバック

```bash
# 直前のリビジョン一覧
gcloud run revisions list --service voice-transcription-api

# 特定リビジョンへロールバック
gcloud run services update-traffic voice-transcription-api \
  --to-revisions REVISION_NAME=100
```

### 2. フロントエンドロールバック (Vercel)

```bash
# デプロイ一覧
vercel ls

# 特定デプロイを本番に
vercel alias set DEPLOYMENT_URL your-domain.com
```

### 3. データベースロールバック

```bash
# 1つ前のマイグレーションに戻す
cd backend
alembic downgrade -1

# 特定リビジョンに戻す
alembic downgrade <revision_id>
```

---

## トラブルシューティング

### よくある問題

#### 1. Database Connection Failed
```
Error: Service unavailable: Database connection failed
```
**解決策**:
- DATABASE_URL が正しいか確認
- Neon/PostgreSQLが起動しているか確認
- IPホワイトリストにCloud RunのIPが含まれているか確認

#### 2. Redis Connection Timeout
```
Error: Redis health check failed: Connection timed out
```
**解決策**:
- REDIS_URLが正しいか確認
- Redis Cloudのファイアウォール設定確認
- TLS接続が必要な場合は`rediss://`を使用

#### 3. Celery Worker Not Processing
```
Tasks are stuck in pending state
```
**解決策**:
- Workerがデプロイされているか確認
- Redis接続を確認
- Worker起動ログを確認: `celery -A src.celery_app inspect active`

#### 4. File Upload Failed
```
Error: R2 upload failed
```
**解決策**:
- R2認証情報が正しいか確認
- バケット名が正しいか確認
- CORS設定を確認

### ログ確認

```bash
# Cloud Run ログ
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=voice-transcription-api" --limit 50

# フィルタ付き（エラーのみ）
gcloud logging read "severity>=ERROR AND resource.labels.service_name=voice-transcription-api" --limit 20
```

---

## チェックリスト

### デプロイ前
- [ ] 全環境変数が設定済み
- [ ] データベースマイグレーション実行済み
- [ ] ビルドエラーなし (`npm run build`, `python -m py_compile`)
- [ ] テスト通過 (`npm test`, `pytest`)
- [ ] セキュリティ監査通過 (`npm audit`, 脆弱性なし)

### デプロイ後
- [ ] `/api/health` が200を返す
- [ ] フロントエンドが正常に表示
- [ ] ファイルアップロードが動作
- [ ] 文字起こし処理が完了
- [ ] ログにエラーがない

---

## 連絡先

問題が発生した場合:
1. GitHubのIssueを作成
2. エラーログを添付
3. 再現手順を記載
