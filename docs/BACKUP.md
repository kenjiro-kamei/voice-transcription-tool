# バックアップ戦略

## 概要

本ドキュメントでは、音声・動画文字起こしツールのバックアップ戦略と復旧手順を定義します。

---

## バックアップ対象

| 対象 | 重要度 | バックアップ頻度 | 保存期間 |
|-----|--------|-----------------|---------|
| PostgreSQL（文字起こしジョブ） | Critical | 日次 | 30日 |
| Cloudflare R2（音声/動画ファイル） | High | リアルタイム複製 | 90日 |
| localStorage（フロントエンド履歴） | Medium | ユーザー責任 | - |
| 環境変数・設定 | Critical | 変更時 | 永続 |

---

## 1. PostgreSQL バックアップ

### Neon PostgreSQL（推奨）

Neonは自動バックアップを提供します：
- **自動バックアップ**: 7日間のPITR（Point-in-Time Recovery）
- **手動バックアップ**: Neon Console から作成可能

#### 手動バックアップ（pg_dump）

```bash
# バックアップ作成
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 圧縮バックアップ
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### 自動バックアップスクリプト

```bash
#!/bin/bash
# scripts/backup_db.sh

BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="transcription_backup_${DATE}.sql.gz"

# バックアップ作成
pg_dump $DATABASE_URL | gzip > "${BACKUP_DIR}/${FILENAME}"

# 30日以上古いバックアップを削除
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete

# クラウドストレージにアップロード（オプション）
# aws s3 cp "${BACKUP_DIR}/${FILENAME}" s3://your-backup-bucket/postgresql/
```

#### リストア手順

```bash
# 圧縮バックアップからリストア
gunzip -c backup_20251211_120000.sql.gz | psql $DATABASE_URL

# 直接リストア
psql $DATABASE_URL < backup_20251211_120000.sql
```

### Neon PITR（Point-in-Time Recovery）

1. Neon Console にログイン
2. プロジェクト → Branches → Restore
3. 復旧したい時点を選択
4. 新しいブランチとして復旧

---

## 2. Cloudflare R2 バックアップ

### R2の特性
- **耐久性**: 99.999999999%（11ナイン）
- **可用性**: 99.9%
- **レプリケーション**: 自動（複数リージョン）

### クロスリージョンバックアップ（推奨）

```bash
# AWS S3 CLI互換でR2を操作
export AWS_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
export AWS_ENDPOINT_URL=https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com

# バケット間同期（R2 → S3）
aws s3 sync s3://voice-transcription-prod s3://voice-transcription-backup \
  --endpoint-url $AWS_ENDPOINT_URL
```

### ファイル保持ポリシー

R2のライフサイクルルールで自動削除を設定：

```json
{
  "rules": [
    {
      "id": "delete-old-files",
      "enabled": true,
      "filter": {
        "prefix": "uploads/"
      },
      "expiration": {
        "days": 90
      }
    }
  ]
}
```

---

## 3. localStorage バックアップ（フロントエンド）

MVP版では履歴はlocalStorageに保存されます。ユーザー自身でエクスポート可能な機能の実装を推奨します。

### エクスポート機能（将来実装）

```typescript
// 履歴のエクスポート
const exportHistory = () => {
  const history = localStorage.getItem('transcriptionHistory');
  const blob = new Blob([history || '[]'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcription_history_${new Date().toISOString()}.json`;
  a.click();
};

// インポート
const importHistory = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target?.result as string;
    localStorage.setItem('transcriptionHistory', data);
  };
  reader.readAsText(file);
};
```

---

## 4. 環境変数・設定バックアップ

### 推奨管理方法

1. **AWS Secrets Manager** または **Google Secret Manager**
2. **HashiCorp Vault**
3. **Git暗号化**（git-crypt）

### Git暗号化の例

```bash
# git-cryptのセットアップ
git-crypt init
git-crypt add-gpg-user YOUR_GPG_KEY_ID

# .env.productionを暗号化対象に
echo ".env.production filter=git-crypt diff=git-crypt" >> .gitattributes
```

---

## 5. 災害復旧手順（DR）

### RPO/RTO目標

| 指標 | 目標値 | 説明 |
|-----|--------|------|
| RPO (Recovery Point Objective) | 24時間 | 最大データ損失許容時間 |
| RTO (Recovery Time Objective) | 4時間 | サービス復旧目標時間 |

### 復旧手順

#### ステップ1: インフラ復旧

```bash
# Cloud Run 再デプロイ
gcloud run deploy voice-transcription-api \
  --image gcr.io/PROJECT_ID/voice-transcription-api:latest

# Celery Worker 再デプロイ
gcloud run deploy voice-transcription-worker \
  --image gcr.io/PROJECT_ID/voice-transcription-api:latest
```

#### ステップ2: データベース復旧

```bash
# Neon PITRを使用
# または手動バックアップからリストア
gunzip -c backup_latest.sql.gz | psql $DATABASE_URL
```

#### ステップ3: ストレージ確認

```bash
# R2バケットの状態確認
aws s3 ls s3://voice-transcription-prod --endpoint-url $AWS_ENDPOINT_URL
```

#### ステップ4: ヘルスチェック

```bash
# サービス正常性確認
curl https://api.your-domain.com/api/health
```

---

## 6. バックアップ監視

### アラート設定

以下の条件でアラートを設定：

1. **バックアップ失敗**: pg_dumpがエラーで終了
2. **バックアップサイズ異常**: 前回比50%以上の変動
3. **ストレージ容量**: 80%以上使用

### 監視スクリプト例

```bash
#!/bin/bash
# scripts/check_backup.sh

BACKUP_DIR="/backups/postgresql"
LATEST=$(ls -t ${BACKUP_DIR}/*.sql.gz | head -1)
YESTERDAY=$(date -d "yesterday" +%Y%m%d)

# 24時間以内のバックアップが存在するか
if [[ ! -f "${BACKUP_DIR}/*${YESTERDAY}*.sql.gz" ]]; then
  echo "ALERT: No backup found for ${YESTERDAY}"
  # Slack/PagerDuty通知
fi
```

---

## 7. チェックリスト

### 日次確認
- [ ] PostgreSQLバックアップ成功
- [ ] バックアップサイズが正常範囲

### 週次確認
- [ ] バックアップからの復旧テスト（ステージング環境）
- [ ] R2ストレージ使用量確認

### 月次確認
- [ ] DR手順のドライラン
- [ ] バックアップ保持ポリシーの見直し
- [ ] RPO/RTO達成状況の確認

---

## 連絡先

バックアップ関連の問題が発生した場合：
1. GitHubのIssueを作成
2. 該当するバックアップログを添付
3. 影響範囲を記載
