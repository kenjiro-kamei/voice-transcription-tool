import type { Components, Theme } from '@mui/material/styles';

/**
 * Clean Light テーマのコンポーネントカスタマイズ
 *
 * 特徴:
 * - シンプルで直感的なUIデザイン
 * - 高い視認性とアクセシビリティ
 * - 音声・動画文字起こしツールに最適化
 * - レスポンシブ対応
 */
export const components: Components<Theme> = {
  // ボタンのカスタマイズ
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,              // 角丸（柔らかい印象）
        textTransform: 'none',        // 大文字変換なし（日本語対応）
        fontWeight: 600,
        padding: '10px 24px',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)',
        },
      },
      outlined: {
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2,
        },
      },
      sizeSmall: {
        padding: '6px 16px',
        fontSize: '0.8125rem',
      },
      sizeLarge: {
        padding: '12px 32px',
        fontSize: '0.9375rem',
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },

  // カードのカスタマイズ
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,             // より大きな角丸（モダンな印象）
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
        },
      },
    },
  },

  // テキストフィールドのカスタマイズ
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          '& fieldset': {
            borderColor: '#E0E0E0',
            borderWidth: 2,
          },
          '&:hover fieldset': {
            borderColor: '#2196F3',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2196F3',
            borderWidth: 2,
          },
        },
        '& .MuiInputLabel-root': {
          fontWeight: 500,
        },
      },
    },
    defaultProps: {
      variant: 'outlined',
    },
  },

  // AppBarのカスタマイズ
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        backgroundColor: '#FFFFFF',
        color: '#333333',
      },
    },
    defaultProps: {
      elevation: 0,
    },
  },

  // Drawerのカスタマイズ
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#FAFAFA',
        borderRight: '2px solid #E0E0E0',
      },
    },
  },

  // チップのカスタマイズ
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
        fontSize: '0.8125rem',
      },
      filled: {
        backgroundColor: '#E3F2FD',
        color: '#1976D2',
        '&:hover': {
          backgroundColor: '#BBDEFB',
        },
      },
    },
  },

  // アラートのカスタマイズ
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
        '& .MuiAlert-icon': {
          fontSize: '1.5rem',
        },
      },
      standardSuccess: {
        backgroundColor: '#E8F5E9',
        color: '#2E7D32',
      },
      standardError: {
        backgroundColor: '#FFEBEE',
        color: '#C62828',
      },
      standardWarning: {
        backgroundColor: '#FFF3E0',
        color: '#E65100',
      },
      standardInfo: {
        backgroundColor: '#E3F2FD',
        color: '#1565C0',
      },
    },
  },

  // ダイアログのカスタマイズ
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15)',
      },
    },
  },

  // テーブルのカスタマイズ
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid #E0E0E0',
        padding: '16px',
      },
      head: {
        fontWeight: 700,
        backgroundColor: '#F5F5F5',
        color: '#333333',
      },
    },
  },

  // ペーパーのカスタマイズ
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      elevation1: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
      elevation2: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
      elevation3: {
        boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },

  // タブのカスタマイズ
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.875rem',
        minHeight: 48,
        '&.Mui-selected': {
          color: '#2196F3',
        },
      },
    },
  },

  // スイッチのカスタマイズ
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 42,
        height: 26,
        padding: 0,
      },
      switchBase: {
        padding: 1,
        '&.Mui-checked': {
          transform: 'translateX(16px)',
          color: '#FFFFFF',
          '& + .MuiSwitch-track': {
            backgroundColor: '#2196F3',
            opacity: 1,
          },
        },
      },
      thumb: {
        width: 24,
        height: 24,
      },
      track: {
        borderRadius: 13,
        backgroundColor: '#E0E0E0',
        opacity: 1,
      },
    },
  },

  // リストアイテムボタンのカスタマイズ
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        marginBottom: 4,
        '&.Mui-selected': {
          backgroundColor: 'rgba(33, 150, 243, 0.12)',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.16)',
          },
        },
        '&:hover': {
          backgroundColor: 'rgba(33, 150, 243, 0.08)',
        },
      },
    },
  },

  // アイコンボタンのカスタマイズ
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'rgba(33, 150, 243, 0.08)',
        },
      },
    },
  },

  // リニアプログレスのカスタマイズ（文字起こし進捗表示用）
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        height: 8,
        backgroundColor: '#E0E0E0',
      },
      bar: {
        borderRadius: 4,
        backgroundColor: '#2196F3',
      },
    },
  },

  // サーキュラープログレスのカスタマイズ
  MuiCircularProgress: {
    styleOverrides: {
      root: {
        color: '#2196F3',
      },
    },
  },

  // Tooltipのカスタマイズ
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#333333',
        fontSize: '0.75rem',
        fontWeight: 500,
        borderRadius: 6,
        padding: '8px 12px',
      },
      arrow: {
        color: '#333333',
      },
    },
  },
};
