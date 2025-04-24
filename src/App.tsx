import { TitleBar } from './components/TitleBar'
import { ErrorBoundary } from './components/ErrorBoundary'


function App() {

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-100 dark:bg-black text-gray-900 dark:text-white hover-effect">
        <TitleBar title={import.meta.env.VITE_APP_TITLE} />
        <main>
          APP BODY
        </main>
      </div>
    </ErrorBoundary>  
  )
}

export default App
