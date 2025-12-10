import { Box, Paper, Typography } from '@mui/material';
import MainLayout from '@/layouts/MainLayout';

export default function HistoryPage() {
  return (
    <MainLayout>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h4" gutterBottom>
            履歴一覧ページ
          </Typography>
          <Typography variant="body1" color="text.secondary">
            P-002: 履歴一覧表示、検索、フィルタリング、詳細表示、削除
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            ※ Phase 4でページ詳細を実装します
          </Typography>
        </Paper>
      </Box>
    </MainLayout>
  );
}
