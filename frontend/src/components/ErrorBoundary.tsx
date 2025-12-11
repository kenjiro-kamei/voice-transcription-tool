import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch and handle React component errors.
 * Prevents the entire app from crashing when a component throws an error.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our logging service
    logger.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });
  }

  handleReload = (): void => {
    // Clear the error state and reload the page
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleRetry = (): void => {
    // Clear the error state to attempt re-rendering
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              py: 4,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                maxWidth: 500,
                width: '100%',
              }}
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              <Typography variant="h5" component="h1" gutterBottom>
                エラーが発生しました
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                申し訳ございません。予期しないエラーが発生しました。
                ページを再読み込みするか、しばらくしてからもう一度お試しください。
              </Typography>

              {/* Show error details in development mode */}
              {import.meta.env.DEV && this.state.error && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'grey.100',
                    textAlign: 'left',
                    overflow: 'auto',
                    maxHeight: 200,
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      m: 0,
                    }}
                  >
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </Typography>
                </Paper>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={this.handleRetry}
                  sx={{ minWidth: 120 }}
                >
                  再試行
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReload}
                  sx={{ minWidth: 120 }}
                >
                  再読み込み
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
