import { useState } from 'react';
import { Row, Col, Card, Form, Input, Button, Alert, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/authSlice';
import { mapApiError } from '../../utils/mapApiError';
import './login-page.scss';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm<LoginFormValues>();

  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fromPath = (location.state as LocationState | null)?.from ?? '/';

  const handleFinish = async (values: LoginFormValues) => {
    if (submitting) return;
    setSubmitting(true);
    setAuthError(null);

    try {
      const response = await apiClient.login(values.email, values.password);
      dispatch(setCredentials({ token: response.token, user: response.user }));
      navigate(fromPath, { replace: true });
    } catch (err: unknown) {
      const mapped = mapApiError(err);
      if (mapped.fieldErrors.email) {
        form.setFields([{ name: 'email', errors: [mapped.fieldErrors.email] }]);
      }
      if (mapped.fieldErrors.password) {
        form.setFields([{ name: 'password', errors: [mapped.fieldErrors.password] }]);
      }
      setAuthError(mapped.description);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row gutter={[16, 16]} justify="center" className="login-page">
      <Col xs={24} sm={20} md={14} lg={10} xl={8} xxl={8}>
        <Card>
          <Title level={3}>Developer Sign In</Title>
          <Text type="secondary">Demo credentials: dev@bugbazaar.io / password123</Text>

          {authError && (
            <Alert
              type="error"
              showIcon
              message={authError}
              role="alert"
            />
          )}

          <Form<LoginFormValues>
            form={form}
            layout="vertical"
            initialValues={{ email: 'dev@bugbazaar.io', password: 'password123' }}
            onFinish={(vals) => {
              void handleFinish(vals);
            }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email is required.' },
                { type: 'email', message: 'Enter a valid email address.' },
              ]}
            >
              <Input prefix={<MailOutlined />} autoComplete="email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Password is required.' },
                { min: 4, message: 'Password must be at least 4 characters.' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={submitting} disabled={submitting}>
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}