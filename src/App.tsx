import { TitleBar } from './components/TitleBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DocumentUpload } from './components/DocumentUpload';
import { ToastContainer } from './components/ui/Toasts';
import { Routes, Route } from 'react-router-dom';
import { DocumentDetails } from './components/DocumentDetails';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <TitleBar title={import.meta.env.VITE_APP_TITLE} />
        <main className="container">
          <Routes>
            <Route path="/" element={<DocumentUpload />} />
            <Route path="/details" element={<DocumentDetails />} />
            <Route path="*" element={<DocumentUpload />} />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
