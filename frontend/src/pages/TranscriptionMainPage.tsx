// 文字起こしメインページ

import { useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  CloudUpload,
  ContentCopy,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import MainLayout from '@/layouts/MainLayout';
import { useTranscriptionData } from '@/hooks/useTranscriptionData';
import type { OutputFormat } from '@/types';

export default function TranscriptionMainPage() {
  const {
    currentJob,
    isUploading,
    isProcessing,
    progressInfo,
    error,
    dropZoneState,
    copyStatus,
    outputFormat,
    uploadFile,
    copyToClipboard,
    retry,
    cancel,
    updateDropZoneState,
    changeOutputFormat,
  } = useTranscriptionData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル選択処理
  const handleFileSelect = (file: File | null) => {
    if (file) {
      uploadFile(file);
    }
  };

  // ドラッグ&ドロップイベント
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    updateDropZoneState('dragging');
  };

  const handleDragLeave = () => {
    updateDropZoneState('idle');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    updateDropZoneState('idle');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // 出力形式変更
  const handleFormatChange = (e: SelectChangeEvent<OutputFormat>) => {
    changeOutputFormat(e.target.value as OutputFormat);
  };

  // ドロップゾーンのスタイル
  const getDropZoneStyle = () => {
    const baseStyle = {
      border: '2px dashed',
      borderRadius: 2,
      p: 8,
      textAlign: 'center',
      backgroundColor: '#FFFFFF',
      cursor: 'pointer',
      transition: 'all 0.3s',
      mb: 4,
    };

    if (dropZoneState === 'dragging') {
      return {
        ...baseStyle,
        borderColor: 'primary.main',
        backgroundColor: 'rgba(33, 150, 243, 0.08)',
        borderStyle: 'solid',
      };
    }

    if (dropZoneState === 'error') {
      return {
        ...baseStyle,
        borderColor: 'error.main',
        backgroundColor: 'rgba(244, 67, 54, 0.04)',
      };
    }

    return {
      ...baseStyle,
      borderColor: '#BBBBBB',
      '&:hover': {
        borderColor: 'primary.main',
        backgroundColor: 'rgba(33, 150, 243, 0.04)',
      },
    };
  };

  // 処理中かどうか
  const isProcessingOrUploading = isUploading || isProcessing;

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 4, textAlign: 'center', fontWeight: 500 }}
        >
          音声・動画 文字起こし
        </Typography>

        {/* ファイルドロップゾーン */}
        {!isProcessingOrUploading && !currentJob && (
          <Box
            sx={getDropZoneStyle()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.mov,.webm,.mpeg"
              onChange={handleFileInputChange}
            />
            <CloudUpload sx={{ fontSize: 64, color: '#BBBBBB', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}>
              ファイルをドラッグ&ドロップ
            </Typography>
            <Typography variant="body2" sx={{ color: '#BBBBBB', mb: 1 }}>
              または、クリックしてファイルを選択
            </Typography>
            <Typography variant="body2" sx={{ color: '#BBBBBB' }}>
              対応形式: mp3, mp4, wav, m4a, mov, webm, mpeg
            </Typography>
          </Box>
        )}

        {/* プログレスバー（アップロード・処理中） */}
        {isProcessingOrUploading && progressInfo && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {progressInfo.status}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: 'primary.main' }}
              >
                {progressInfo.percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressInfo.percentage}
              sx={{ mb: 1.5, height: 8, borderRadius: 1 }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 14,
                color: '#666666',
              }}
            >
              <Typography variant="body2">
                {progressInfo.speed || '速度: 計算中...'}
              </Typography>
              <Typography variant="body2">
                {progressInfo.remainingTime || '残り時間: 計算中...'}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* エラーメッセージ */}
        {error && (
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{ mb: 4 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                {error.retryable && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={retry}
                    sx={{ minWidth: 80 }}
                  >
                    再試行
                  </Button>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={cancel}
                  sx={{ minWidth: 80 }}
                >
                  キャンセル
                </Button>
              </Box>
            }
          >
            {error.message}
          </Alert>
        )}

        {/* 文字起こし結果 */}
        {currentJob?.transcriptionText && (
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                pb: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                文字起こし結果
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Select
                  value={outputFormat}
                  onChange={handleFormatChange}
                  size="small"
                  sx={{
                    minWidth: 180,
                    fontSize: 14,
                  }}
                >
                  <MenuItem value="text">プレーンテキスト</MenuItem>
                  <MenuItem value="markdown">Markdown</MenuItem>
                  <MenuItem value="srt">SRT（字幕形式）</MenuItem>
                </Select>
                <Button
                  variant="contained"
                  startIcon={
                    copyStatus === 'copied' ? (
                      <CheckCircle />
                    ) : (
                      <ContentCopy />
                    )
                  }
                  onClick={copyToClipboard}
                  sx={{
                    minWidth: 120,
                    backgroundColor:
                      copyStatus === 'copied' ? 'success.main' : 'primary.main',
                    '&:hover': {
                      backgroundColor:
                        copyStatus === 'copied'
                          ? 'success.dark'
                          : 'primary.dark',
                    },
                  }}
                >
                  {copyStatus === 'copied' ? 'コピー完了' : 'コピー'}
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                backgroundColor: '#FAFAFA',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 2.5,
                fontSize: 15,
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                minHeight: 300,
                maxHeight: 600,
                overflowY: 'auto',
              }}
            >
              {currentJob.transcriptionText}
            </Box>
          </Paper>
        )}

        {/* スナックバー（コピー成功通知） */}
        <Snackbar
          open={copyStatus === 'copied'}
          autoHideDuration={2000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: 'success.main' }} />
              <span>コピーしました</span>
            </Box>
          }
        />
      </Box>
    </MainLayout>
  );
}
