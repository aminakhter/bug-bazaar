import { Alert, Button, Empty, Row, Col, Spin } from 'antd';
import { AppApiError } from '../types/api';
import './async-state-view.scss';

interface AsyncStateViewProps {
  status: 'idle' | 'loading' | 'error' | 'empty';
  error?: AppApiError;
  emptyDescription?: string;
  onRetry?: () => void;
}

export function AsyncStateView({
  status,
  error,
  emptyDescription = 'No items found.',
  onRetry,
}: AsyncStateViewProps) {
  if (status === 'loading' || status === 'idle') {
    return (
      <Row gutter={[16, 16]} justify="center" className="async-state">
        <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={8}>
          <Spin size="large" tip="Loading Bug Bazaar catalog..." />
        </Col>
      </Row>
    );
  }

  if (status === 'error') {
    return (
      <Row gutter={[16, 16]} justify="center" className="async-state">
        <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={8}>
          <Alert
            type="error"
            showIcon
            message={error ? `Error ${error.httpStatus}: ${error.code}` : 'Something went wrong'}
            description={error?.message ?? 'An unexpected error occurred while fetching data.'}
            action={
              onRetry ? (
                <Button size="small" type="primary" danger onClick={onRetry}>
                  Retry
                </Button>
              ) : undefined
            }
          />
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]} justify="center" className="async-state">
      <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={8}>
        <Empty description={emptyDescription} />
      </Col>
    </Row>
  );
}