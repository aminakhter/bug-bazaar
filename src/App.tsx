import { useState } from 'react';
import { Layout, Typography, Row, Col, Space, Button, Badge } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';
import { Link, Route, Routes } from 'react-router-dom';
import { setSimulateRaceCondition } from './api/client';
import { useAppSelector } from './store/hooks';
import { selectCartTotalCount } from './store/cartSlice';
import { selectCurrentUser, selectIsAuthenticated } from './store/authSlice';
import { DebugToolbar } from './components/DebugToolbar';
import { CatalogPage } from './features/browse/CatalogPage';
import { ProductDetailsPage } from './features/browse/ProductDetailsPage';
import { CartPage } from './features/cart/CartPage';
import { LoginPage } from './features/auth/LoginPage';
import { AccountPage } from './features/auth/AccountPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { NotFoundPage } from './pages/NotFoundPage';
import './app.scss';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {
  const [forceEmpty, setForceEmpty] = useState(false);
  const [simulateOutOfOrder, setSimulateOutOfOrder] = useState(false);

  const cartCount = useAppSelector(selectCartTotalCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  const handleSimulateRaceChange = (checked: boolean) => {
    setSimulateOutOfOrder(checked);
    setSimulateRaceCondition(checked);
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <Title level={4} className="app-header__title">
              <Link to="/" className="app-header__link">
                The Bug Bazaar
              </Link>
            </Title>
          </Col>

          <Col xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className="app-header__nav">
            <Space size="middle">
              <Link to="/cart" aria-label={`Cart with ${cartCount} items`}>
                <Badge count={cartCount} showZero>
                  <Button icon={<ShoppingCartOutlined />}>Cart</Button>
                </Badge>
              </Link>

              {isAuthenticated ? (
                <Link to="/account">
                  <Button type="primary" icon={<UserOutlined />}>
                    {currentUser?.name ?? 'Account'}
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button type="primary" icon={<LoginOutlined />}>
                    Sign In
                  </Button>
                </Link>
              )}
            </Space>
          </Col>
        </Row>
      </Header>

      <DebugToolbar
        forceEmpty={forceEmpty}
        onForceEmptyChange={setForceEmpty}
        simulateOutOfOrder={simulateOutOfOrder}
        onSimulateOutOfOrderChange={handleSimulateRaceChange}
      />

      <Content className="app-content">
        <Routes>
          <Route path="/" element={<CatalogPage forceEmpty={forceEmpty} />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}