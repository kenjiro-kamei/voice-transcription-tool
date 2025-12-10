import type { ThemeOptions } from '@mui/material/styles';

/**
 * Clean Light テーマのタイポグラフィ設定
 *
 * 特徴:
 * - システムフォント優先（Noto Sans JP + システムフォント）
 * - 高い視認性と可読性を重視
 * - 日本語に最適化された行間とフォントサイズ
 * - レスポンシブ対応（モバイル・デスクトップで最適化）
 */
export const typography: ThemeOptions['typography'] = {
  // フォントファミリー
  fontFamily: [
    '"Noto Sans JP"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),

  // 基本フォントサイズ（14px = 0.875rem）
  fontSize: 14,

  // フォントウェイト
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,

  // 見出し1（ページタイトル）
  h1: {
    fontSize: '2.5rem',       // 40px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01562em',
    color: '#333333',
  },

  // 見出し2（セクションタイトル）
  h2: {
    fontSize: '2rem',         // 32px
    fontWeight: 700,
    lineHeight: 1.35,
    letterSpacing: '-0.00833em',
    color: '#333333',
  },

  // 見出し3（サブセクションタイトル）
  h3: {
    fontSize: '1.75rem',      // 28px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0em',
    color: '#333333',
  },

  // 見出し4（カードタイトル）
  h4: {
    fontSize: '1.5rem',       // 24px
    fontWeight: 600,
    lineHeight: 1.45,
    letterSpacing: '0.00735em',
    color: '#333333',
  },

  // 見出し5（小見出し）
  h5: {
    fontSize: '1.25rem',      // 20px
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0em',
    color: '#333333',
  },

  // 見出し6（最小見出し）
  h6: {
    fontSize: '1rem',         // 16px
    fontWeight: 600,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
    color: '#333333',
  },

  // サブタイトル1（重要な補足情報）
  subtitle1: {
    fontSize: '1rem',         // 16px
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
    color: '#333333',
  },

  // サブタイトル2（通常の補足情報）
  subtitle2: {
    fontSize: '0.875rem',     // 14px
    fontWeight: 500,
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
    color: '#666666',
  },

  // 本文1（メインコンテンツ）
  body1: {
    fontSize: '1rem',         // 16px
    fontWeight: 400,
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
    color: '#333333',
  },

  // 本文2（副次コンテンツ）
  body2: {
    fontSize: '0.875rem',     // 14px
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.01071em',
    color: '#666666',
  },

  // ボタンテキスト
  button: {
    fontSize: '0.875rem',     // 14px
    fontWeight: 600,
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'none',    // 大文字変換なし（日本語に最適化）
    color: '#FFFFFF',
  },

  // キャプション（補足説明、注釈）
  caption: {
    fontSize: '0.75rem',      // 12px
    fontWeight: 400,
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
    color: '#666666',
  },

  // オーバーライン（ラベル、カテゴリ表示）
  overline: {
    fontSize: '0.75rem',      // 12px
    fontWeight: 600,
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
    color: '#666666',
  },
};
