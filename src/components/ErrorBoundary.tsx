import { Component, ReactNode } from 'react';
import { Button } from './ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h3 className="text-red-800 dark:text-red-200 text-sm font-montserrat font-medium mb-2">
            Something went wrong
          </h3>
          <p className="text-red-700 dark:text-red-300 text-xs mb-4 font-mono">
            {this.state.error?.message}
          </p>
          <Button onClick={this.handleReset} variant="danger" size="small">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
