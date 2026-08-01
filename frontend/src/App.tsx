import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth.tsx';
import Chat from './pages/Chat.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing: show chat UI directly (no auth wall) */}
        <Route path="/" element={<Chat />} />
        {/* OAuth callback & standalone auth page */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<Auth />} />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
