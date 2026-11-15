import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-canvas">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border-2 border-red-200 text-center shadow-lg">
            <h2 className="text-3xl font-bold italic text-navy mb-4">Something went wrong</h2>
            <p className="text-lg text-stone-600 mb-6">
              We encountered an unexpected issue. Your data is safe. Please try refreshing the page.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
