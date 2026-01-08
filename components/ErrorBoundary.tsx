import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[100] bg-black text-white p-10 flex flex-col items-center justify-center overflow-auto font-mono">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">SYSTEM MALFUNCTION</h1>
                    <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl max-w-4xl w-full">
                        <h2 className="text-xl mb-2 text-red-300">Error Trace:</h2>
                        <pre className="whitespace-pre-wrap break-all text-xs bg-black/50 p-4 rounded text-red-100">
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                        <button
                            className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase transition-colors"
                            onClick={() => window.location.href = '/'}
                        >
                            Reboot System (Reload)
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
