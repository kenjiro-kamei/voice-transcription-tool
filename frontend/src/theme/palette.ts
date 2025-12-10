import type { PaletteOptions } from '@mui/material/styles';

/**
 * Clean Light テーマのカラーパレット
 *
 * コンセプト: シンプルで明るく視認性を最優先
 * - プライマリ: #2196F3（青） - 信頼感と安定感
 * - セカンダリ: #FF9800（オレンジ） - アクセントと活気
 * - 背景: #FFFFFF（白） - 清潔感と明るさ
 * - テキスト: #333333（ダークグレー） - 高い視認性
 */
export const palette: PaletteOptions = {
  mode: 'light',

  // プライマリカラー（メインアクション、リンク、重要な要素）
  primary: {
    main: '#2196F3',      // 鮮やかな青
    light: '#64B5F6',     // 明るい青（ホバー状態など）
    dark: '#1976D2',      // 濃い青（アクティブ状態など）
    contrastText: '#FFFFFF', // プライマリカラー上のテキスト
  },

  // セカンダリカラー（補助的なアクション、強調要素）
  secondary: {
    main: '#FF9800',      // 鮮やかなオレンジ
    light: '#FFB74D',     // 明るいオレンジ（ホバー状態など）
    dark: '#F57C00',      // 濃いオレンジ（アクティブ状態など）
    contrastText: '#FFFFFF', // セカンダリカラー上のテキスト
  },

  // エラーカラー（エラーメッセージ、警告）
  error: {
    main: '#F44336',      // 赤（視認性の高いエラー色）
    light: '#E57373',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
  },

  // 警告カラー（注意喚起）
  warning: {
    main: '#FF9800',      // オレンジ（セカンダリと共通）
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#333333',
  },

  // 情報カラー（情報メッセージ、ヒント）
  info: {
    main: '#2196F3',      // 青（プライマリと共通）
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },

  // 成功カラー（成功メッセージ、完了状態）
  success: {
    main: '#4CAF50',      // 緑（明確な成功表現）
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },

  // 背景カラー
  background: {
    default: '#FAFAFA',   // メイン背景（わずかにグレーがかった白）
    paper: '#FFFFFF',     // カード、ダイアログなどの背景
  },

  // テキストカラー
  text: {
    primary: '#333333',   // メインテキスト（高い視認性）
    secondary: '#666666', // サブテキスト（やや薄め）
    disabled: '#BBBBBB',  // 無効状態のテキスト
  },

  // 区切り線カラー
  divider: '#E0E0E0',     // 明確な境界線

  // アクションカラー（ボタン、リンクなどのインタラクティブ要素）
  action: {
    active: '#2196F3',           // アクティブ状態（プライマリ色）
    hover: 'rgba(33, 150, 243, 0.08)',  // ホバー状態（プライマリ色の8%透明度）
    selected: 'rgba(33, 150, 243, 0.16)', // 選択状態（プライマリ色の16%透明度）
    disabled: 'rgba(0, 0, 0, 0.26)',      // 無効状態
    disabledBackground: 'rgba(0, 0, 0, 0.12)', // 無効状態の背景
    focus: 'rgba(33, 150, 243, 0.12)',    // フォーカス状態
  },
};
