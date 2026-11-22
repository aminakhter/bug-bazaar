import { useState } from 'react';
import {
  Row,
  Col,
  Card,
  List,
  InputNumber,
  Button,
  Typography,
  Space,
  Alert,
  Result,
  Tag,
} from 'antd';
import { DeleteOutlined, ShoppingOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  clearCart,
  removeFromCart,
  selectCartItems,
  selectCartSubtotalCents,
  selectCartTotalCount,
  updateCartQuantity,
} from '../../store/cartSlice';
import { selectIsAuthenticated } from '../../store/authSlice';
import { PRODUCTS_QUERY_KEY } from '../../hooks/useProductsQuery';
import { CreateOrderResponse } from '../../types/api';
import { formatPrice } from '../../utils/formatPrice';
import { mapApiError } from '../../utils/mapApiError';
import './cart-page.scss';

const { Text } = Typography;

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const items = useAppSelector(selectCartItems);
  const totalCount = useAppSelector(selectCartTotalCount);
  const subtotalCents = useAppSelector(selectCartSubtotalCents);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Persist one idempotency key per checkout attempt so retries never create duplicate orders
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => createIdempotencyKey());
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<{ title: string; description: string } | null>(
    null,
  );
  const [confirmedOrder, setConfirmedOrder] = useState<CreateOrderResponse | null>(null);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (submitting || items.length === 0) return;

    setSubmitting(true);
    setCheckoutError(null);

    try {
      const response = await apiClient.createOrder({
        items: items.map((entry) => ({
          productId: entry.product.id,
          quantity: entry.quantity,
        })),
        idempotencyKey,
      });

      setConfirmedOrder(response);
      dispatch(clearCart());
      setIdempotencyKey(createIdempotencyKey());

      // Refresh cached product stock immediately after an order is placed (D3-5)
      await queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    } catch (err: unknown) {
      const mapped = mapApiError(err);
      setCheckoutError({ title: mapped.title, description: mapped.description });
      // Refresh stock cache if a 409 occurred so updated stock counts are visible
      if (mapped.isOutOfStock) {
        await queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={10}>
          <Card>
            <Result
              status="success"
              title="Order Queued!"
              subTitle={`Order ID: ${confirmedOrder.id} • Status: ${confirmedOrder.status.toUpperCase()}`}
              extra={
                <Link to="/">
                  <Button type="primary">Continue Shopping</Button>
                </Link>
              }
            />
          </Card>
        </Col>
      </Row>
    );
  }

  if (items.length === 0) {
    return (
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={10}>
          <Card>
            <Result
              icon={<ShoppingOutlined />}
              title="Your cart is empty"
              subTitle="Browse keyboards, rubber ducks, coffee, and developer stickers."
              extra={
                <Link to="/">
                  <Button type="primary">Browse Catalog</Button>
                </Link>
              }
            />
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={[24, 24]} className="cart-page">
      <Col xs={24} sm={24} md={15} lg={16} xl={16} xxl={16}>
        <Card title={`Shopping Cart (${totalCount} items)`}>
          <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={({ product, quantity }) => (
              <List.Item
                actions={[
                  <InputNumber
                    key="qty"
                    aria-label={`Quantity for ${product.name}`}
                    min={1}
                    max={Math.max(1, product.stock)}
                    value={quantity}
                    onChange={(val) => {
                      if (typeof val === 'number') {
                        dispatch(updateCartQuantity({ productId: product.id, quantity: val }));
                      }
                    }}
                  />,
                  <Button
                    key="remove"
                    type="text"
                    danger
                    aria-label={`Remove ${product.name}`}
                    icon={<DeleteOutlined />}
                    onClick={() => dispatch(removeFromCart(product.id))}
                  >
                    Remove
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={<Link to={`/products/${product.id}`}>{product.name}</Link>}
                  description={
                    <Space>
                      <Text>{formatPrice(product.price)} each</Text>
                      <Tag>{product.stock} in stock</Tag>
                    </Space>
                  }
                />
                <Text strong>{formatPrice(product.price * quantity)}</Text>
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col xs={24} sm={24} md={9} lg={8} xl={8} xxl={8}>
        <Card title="Order Summary" className="cart-page__summary">
          <Space direction="vertical" size="middle">
            {checkoutError && (
              <Alert
                type="error"
                showIcon
                role="alert"
                message={checkoutError.title}
                description={checkoutError.description}
              />
            )}

            <Space>
              <Text>Items ({totalCount}):</Text>
              <Text className="cart-page__total">{formatPrice(subtotalCents)}</Text>
            </Space>

            <Button
              type="primary"
              size="large"
              block
              icon={isAuthenticated ? undefined : <LockOutlined />}
              loading={submitting}
              disabled={submitting}
              onClick={() => {
                void handleCheckout();
              }}
            >
              {isAuthenticated ? 'Place Order' : 'Sign In to Checkout'}
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}