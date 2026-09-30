import { Component, ErrorInfo, ReactNode } from 'react';
import { LuTriangleAlert, LuRotateCcw, LuHouse } from 'react-icons/lu';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in dashboard component:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-rose-100 rounded-3xl p-8 text-center shadow-xl shadow-rose-500/5">
            <div className="w-16 h-16 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-600 shadow-sm">
              <LuTriangleAlert size={30} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              {this.props.fallbackTitle || 'Section Unavailable'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
              We encountered an issue loading this section data. The error has been isolated so the rest of your dashboard remains safe.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 font-mono mb-6 text-left break-all">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <LuRotateCcw size={14} /> Try Again
              </button>
              <button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <LuHouse size={14} /> Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
