import { Routes, Route } from 'react-router-dom';
import TranscriptionMainPage from '@/pages/TranscriptionMainPage';
import HistoryPage from '@/pages/HistoryPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TranscriptionMainPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  );
}

export default App;
