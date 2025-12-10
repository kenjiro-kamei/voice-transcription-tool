import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MicIcon from '@mui/icons-material/Mic';
import HistoryIcon from '@mui/icons-material/History';

export default function Header() {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <MicIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 600,
          }}
        >
          音声・動画文字起こしツール
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<MicIcon />}
            color="primary"
          >
            文字起こし
          </Button>
          <Button
            component={RouterLink}
            to="/history"
            startIcon={<HistoryIcon />}
            color="primary"
          >
            履歴
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
