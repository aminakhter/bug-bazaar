import { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Descriptions, Button, Space } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { apiClient } from '../../api/client';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, selectCurrentUser } from '../../store/authSlice';
import { AppApiError, AsyncState, User } from '../../types/api';
import { AsyncStateView } from '../../components/AsyncStateView';

const { Title } = Typography;

export function AccountPage() {
  const dispatch = useAppDispatch();
  const storeUser = useAppSelector(selectCurrentUser);
  const [profileState, setProfileState] = useState<AsyncState<User>>({ status: 'idle' });

  useEffect(() => {
    const controller = new AbortController();
    setProfileState({ status: 'loading' });

    apiClient
      .getMe(controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) {
          setProfileState({ status: 'success', data: user });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const apiError =
          err instanceof AppApiError ? err : new AppApiError(401, 'UNAUTHORIZED', 'Session expired.');
        setProfileState({ status: 'error', error: apiError });
      });

    return () => {
      controller.abort();
    };
  }, []);

  if (profileState.status === 'loading' || profileState.status === 'idle') {
    return <AsyncStateView status="loading" />;
  }

  if (profileState.status === 'error') {
    return <AsyncStateView status="error" error={profileState.error} />;
  }

  const user = profileState.data ?? storeUser;

  return (
    <Row gutter={[16, 16]} justify="center">
      <Col xs={24} sm={22} md={16} lg={12} xl={10} xxl={8}>
        <Card>
          <Space direction="vertical" size="large">
            <Title level={3}>Developer Account</Title>
            {user && (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
                <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              </Descriptions>
            )}
            <Button danger icon={<LogoutOutlined />} onClick={() => dispatch(logout())}>
              Log Out
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}