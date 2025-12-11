// モック履歴データ（開発・テスト用）
// @MOCK_TO_API: 本番環境ではAPIから取得

import type { TranscriptionHistory } from '@/types';

export const mockHistories: TranscriptionHistory[] = [
  {
    id: '1',
    originalFilename: '会議録音_2025-12-10.mp3',
    transcriptionText:
      'こんにちは。本日の会議を始めます。まず、今月の売上について報告いたします。先月比で15%増加しており、目標を達成しました。次に、新製品の開発状況について説明します。現在、プロトタイプの最終テストを実施中で、来月のリリースに向けて準備を進めています。最後に、マーケティング戦略について議論したいと思います。SNS広告のROIが改善しており、この戦略を継続することを提案します。以上で報告を終わります。ご質問があればお願いします。',
    createdAt: new Date('2025-12-10T14:30:00').toISOString(),
    fileSize: 5242880, // 5MB
    duration: 180, // 3分
  },
  {
    id: '2',
    originalFilename: 'インタビュー音声_田中様.wav',
    transcriptionText:
      'お時間をいただきありがとうございます。それでは、まず自己紹介からお願いできますでしょうか。はい、田中と申します。現在、IT企業でエンジニアとして働いています。プログラミング歴は約10年で、主にWebアプリケーション開発を担当しています。趣味は読書と映画鑑賞です。特にSF小説が好きで、週末は図書館で過ごすことが多いです。',
    createdAt: new Date('2025-12-09T16:45:00').toISOString(),
    fileSize: 8388608, // 8MB
    duration: 300, // 5分
  },
  {
    id: '3',
    originalFilename: 'プレゼン動画_製品紹介.mp4',
    transcriptionText:
      '皆様、おはようございます。本日は新製品のご紹介をさせていただきます。この製品は従来比で30%の性能向上を実現しました。また、エネルギー効率も20%改善されており、環境にも配慮した設計となっています。価格は従来モデルと同等で、コストパフォーマンスに優れています。発売日は来月1日を予定しております。ご期待ください。',
    createdAt: new Date('2025-12-08T10:20:00').toISOString(),
    fileSize: 15728640, // 15MB
    duration: 240, // 4分
  },
];

// localStorageにモックデータを保存する関数（開発用）
export const seedMockHistories = () => {
  const existing = localStorage.getItem('transcription_histories');
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem('transcription_histories', JSON.stringify(mockHistories));
    // eslint-disable-next-line no-console
    console.info('[DEV] Mock histories seeded to localStorage');
  }
};
