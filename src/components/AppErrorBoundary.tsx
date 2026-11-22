import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Row, Col } from 'antd';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  errorId: string | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
    errorId: null,
  };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
      errorId: `err-${Date.now().toString(36)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log sanitized error metadata (never log auth tokens or raw user payloads)
    console.error('[BugBazaar Telemetry] Unhandled UI error', {
      errorName: error.name,
      message: error.message,
      componentStack: errorInfo.componentStack?.split('\n').slice(0, 4).join('\n'),
      timestamp: new Date().toISOString(),
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, errorId: null });
    window.location.assign('/');
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={8}>
            <Result
              status="500"
              title="Something went wrong"
              subTitle={`An unexpected application error was caught and logged (Ref: ${this.state.errorId ?? 'unknown'}).`}
              extra={
                <Button type="primary" onClick={this.handleReset}>
                  Reload Store
                </Button>
              }
            />
          </Col>
        </Row>
      );
    }

    return this.props.children;
  }
}