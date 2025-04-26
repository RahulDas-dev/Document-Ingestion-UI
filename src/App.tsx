import { TitleBar } from './components/TitleBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DocumentUpload } from './components/DocumentUpload';
import { ToastContainer } from './components/ui/Toasts';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <TitleBar title={import.meta.env.VITE_APP_TITLE} />
        <main className="container mx-auto py-8 px-4 mt-12">
          <DocumentUpload />
        </main>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
