// 履歴一覧ページ

import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Search,
  Close,
  ContentCopy,
  Delete,
  CheckCircle,
  SearchOff,
  Warning,
} from '@mui/icons-material';
import MainLayout from '@/layouts/MainLayout';
import { useHistoryData } from '@/hooks/useHistoryData';
import type { DateFilter, SortOrder } from '@/types';

export default function HistoryPage() {
  const {
    filteredHistories,
    loading,
    error,
    searchTerm,
    dateFilter,
    sortOrder,
    setSearchTerm,
    setDateFilter,
    setSortOrder,
    highlightText,
    selectedHistory,
    isModalOpen,
    openModal,
    closeModal,
    snackbarMessage,
    snackbarOpen,
    closeSnackbar,
    storageStatus,
    storageInfo,
    deleteHistory,
    copyToClipboard,
  } = useHistoryData();

  // 日付フィルタボタン
  const dateFilters: { value: DateFilter; label: string }[] = [
    { value: 'all', label: '全期間' },
    { value: 'today', label: '今日' },
    { value: 'thisWeek', label: '今週' },
    { value: 'thisMonth', label: '今月' },
  ];

  // 検索クリア
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // 日付フィルタ変更
  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
  };

  // ソート変更
  const handleSortChange = (e: SelectChangeEvent<SortOrder>) => {
    setSortOrder(e.target.value as SortOrder);
  };

  // カードクリック
  const handleCardClick = (history: typeof filteredHistories[0]) => {
    openModal(history);
  };

  // コピーボタン（カード内）
  const handleCopyFromCard = (
    e: React.MouseEvent,
    text: string
  ) => {
    e.stopPropagation();
    copyToClipboard(text);
  };

  // 削除ボタン（カード内）
  const handleDeleteFromCard = (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();
    if (window.confirm('この履歴を削除してもよろしいですか?')) {
      deleteHistory(id);
    }
  };

  // 削除ボタン（モーダル内）
  const handleDeleteFromModal = () => {
    if (selectedHistory && window.confirm('この履歴を削除してもよろしいですか?')) {
      deleteHistory(selectedHistory.id);
    }
  };

  // コピーボタン（モーダル内）
  const handleCopyFromModal = () => {
    if (selectedHistory) {
      copyToClipboard(selectedHistory.transcriptionText);
    }
  };

  // 日時フォーマット（カード用）
  const formatDateShort = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
  };

  // 日時フォーマット（モーダル用）
  const formatDateLong = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // プレビューテキスト生成（最初の100文字）
  const getPreviewText = (text: string): string => {
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  // ローディング中
  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  // エラー発生
  if (error) {
    return (
      <MainLayout>
        <Alert severity="error">{error.message}</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 4, textAlign: 'center', fontWeight: 500 }}
        >
          文字起こし履歴
        </Typography>

        {/* 検索・フィルタセクション */}
        <Paper sx={{ p: 3, mb: 3 }}>
          {/* 検索ボックス */}
          <TextField
            fullWidth
            placeholder="ファイル名やテキストで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#666666' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ color: '#666666' }}
                  >
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* フィルタ・ソートコントロール */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {/* 日付フィルタボタン */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {dateFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={dateFilter === filter.value ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleDateFilterChange(filter.value)}
                  sx={{
                    minWidth: 80,
                    textTransform: 'none',
                    ...(dateFilter !== filter.value && {
                      color: '#666666',
                      borderColor: '#E0E0E0',
                      backgroundColor: '#FFFFFF',
                      '&:hover': {
                        backgroundColor: '#F5F5F5',
                      },
                    }),
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </Box>

            {/* ソートセレクト */}
            <Select
              value={sortOrder}
              onChange={handleSortChange}
              size="small"
              sx={{
                minWidth: 180,
                color: '#666666',
              }}
            >
              <MenuItem value="desc">日付：新しい順</MenuItem>
              <MenuItem value="asc">日付：古い順</MenuItem>
            </Select>
          </Box>
        </Paper>

        {/* 容量警告バナー */}
        {(storageStatus === 'warning' || storageStatus === 'critical') && (
          <Alert
            severity="warning"
            icon={<Warning />}
            sx={{ mb: 3 }}
          >
            履歴の保存容量が残り少なくなっています（{storageInfo.percentage}%使用）。不要な履歴を削除してください。
          </Alert>
        )}

        {/* 履歴カードグリッド */}
        {filteredHistories.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {filteredHistories.map((history) => (
              <Box key={history.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => handleCardClick(history)}
                >
                  <CardContent>
                    {/* カードヘッダー */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 500,
                          wordBreak: 'break-word',
                          flex: 1,
                          mr: 1,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: highlightText(history.originalFilename),
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: '#BBBBBB', whiteSpace: 'nowrap' }}
                      >
                        {formatDateShort(history.createdAt)}
                      </Typography>
                    </Box>

                    {/* プレビューテキスト */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666666',
                        lineHeight: 1.6,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 2,
                        '& mark': {
                          backgroundColor: '#FFEB3B',
                          padding: '2px 0',
                        },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          getPreviewText(history.transcriptionText)
                        ),
                      }}
                    />
                  </CardContent>

                  {/* カードアクション */}
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <IconButton
                      size="small"
                      onClick={(e) =>
                        handleCopyFromCard(e, history.transcriptionText)
                      }
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.08)',
                          '& .MuiSvgIcon-root': { color: 'primary.main' },
                        },
                      }}
                    >
                      <ContentCopy sx={{ fontSize: 20, color: '#666666' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteFromCard(e, history.id)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.08)',
                          '& .MuiSvgIcon-root': { color: 'error.main' },
                        },
                      }}
                    >
                      <Delete sx={{ fontSize: 20, color: '#666666' }} />
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          // 空状態
          <Box sx={{ textAlign: 'center', py: 8, color: '#BBBBBB' }}>
            <SearchOff sx={{ fontSize: 64, color: '#E0E0E0', mb: 2 }} />
            <Typography variant="body1">
              該当する履歴が見つかりませんでした
            </Typography>
          </Box>
        )}

        {/* 詳細表示モーダル */}
        <Dialog
          open={isModalOpen}
          onClose={closeModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh',
            },
          }}
        >
          {selectedHistory && (
            <>
              <DialogTitle
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 500, wordBreak: 'break-word', flex: 1, mr: 2 }}
                >
                  {selectedHistory.originalFilename}
                </Typography>
                <IconButton
                  onClick={closeModal}
                  sx={{ '&:hover': { backgroundColor: '#F5F5F5' } }}
                >
                  <Close />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ pt: 3 }}>
                <Typography
                  variant="body2"
                  sx={{ color: '#BBBBBB', mb: 2 }}
                >
                  作成日時: {formatDateLong(selectedHistory.createdAt)}
                </Typography>
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
                    minHeight: 200,
                    maxHeight: 500,
                    overflowY: 'auto',
                    '& mark': {
                      backgroundColor: '#FFEB3B',
                      padding: '2px 0',
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: highlightText(selectedHistory.transcriptionText),
                  }}
                />
              </DialogContent>

              <DialogActions
                sx={{
                  borderTop: 1,
                  borderColor: 'divider',
                  p: 2,
                  gap: 1.5,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<ContentCopy />}
                  onClick={handleCopyFromModal}
                  sx={{ minWidth: 120 }}
                >
                  コピー
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDeleteFromModal}
                  sx={{ minWidth: 120 }}
                >
                  削除
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* スナックバー */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: 'success.main' }} />
              <span>{snackbarMessage}</span>
            </Box>
          }
        />
      </Box>
    </MainLayout>
  );
}
