import { Box, Paper, Typography } from '@mui/material';
import MainLayout from '@/layouts/MainLayout';

export default function TranscriptionMainPage() {
  return (
    <MainLayout>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h4" gutterBottom>
            文字起こしメインページ
          </Typography>
          <Typography variant="body1" color="text.secondary">
            P-001: ファイルアップロード、文字起こし実行、結果表示
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            ※ Phase 4でページ詳細を実装します
          </Typography>
        </Paper>
      </Box>
    </MainLayout>
  );
}
