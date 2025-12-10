import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

/**
 * Clean Light テーマ
 *
 * コンセプト: シンプルで明るく視認性を最優先
 * 特徴:
 * - 白基調の清潔感
 * - 直感的な操作性
 * - 親しみやすく初心者にも優しいデザイン
 * - 音声・動画文字起こしツールに最適化
 *
 * カラー:
 * - プライマリ: #2196F3（青）
 * - セカンダリ: #FF9800（オレンジ）
 * - 背景: #FFFFFF（白）
 * - テキスト: #333333（ダークグレー）
 */
const themeOptions: ThemeOptions = {
  palette,
  typography,
  components,

  // レスポンシブデザイン設定
  breakpoints: {
    values: {
      xs: 0,      // モバイル（小）
      sm: 600,    // モバイル（大）・タブレット（小）
      md: 960,    // タブレット（大）
      lg: 1280,   // デスクトップ（小）
      xl: 1920,   // デスクトップ（大）
    },
  },

  // スペーシング設定（8pxベース）
  spacing: 8,

  // シェイプ設定
  shape: {
    borderRadius: 8,
  },

  // トランジション設定
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },

  // z-index設定
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
};

// テーマの作成
export const theme = createTheme(themeOptions);

export default theme;
