import { useCallback, useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Rate,
  Button,
  Space,
  Image,
  Breadcrumb,
  Descriptions,
  message
} from 'antd';
import { ArrowLeftOutlined, UpOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { AppApiError, AsyncState, Product } from '../../types/api';
import { formatPrice } from '../../utils/formatPrice';
import { AsyncStateView } from '../../components/AsyncStateView';
import { useAppDispatch } from '../../store/hooks';
import { addToCart } from '../../store/cartSlice';
import './product-details-page.scss';

const { Title, Text } = Typography;

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<AsyncState<Product>>({ status: 'idle' });
  const [retryCount, setRetryCount] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const dispatch = useAppDispatch();

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  // 1. Fetch product details and abort in-flight request if product ID changes or page unmounts
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setState({ status: 'loading' });

    apiClient
      .getProductById(id, controller.signal)
      .then((product) => {
        if (!controller.signal.aborted) {
          setState({ status: 'success', data: product });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const apiError =
          err instanceof AppApiError
            ? err
            : new AppApiError(500, 'UNKNOWN_ERROR', 'Failed to load product details.');
        setState({ status: 'error', error: apiError });
      });

    return () => {
      controller.abort();
    };
  }, [id, retryCount]);

  // 2. Window scroll listener for Back to Top button with cleanup on unmount
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 250);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (state.status === 'idle' || state.status === 'loading') {
    return <AsyncStateView status="loading" />;
  }

  if (state.status === 'error') {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Link to="/">
            <Button icon={<ArrowLeftOutlined />}>Back to Catalog</Button>
          </Link>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <AsyncStateView status="error" error={state.error} onRetry={retry} />
        </Col>
      </Row>
    );
  }

  const product = state.data;
  const isOutOfStock = product.stock === 0;

  return (
    <Card className="product-details">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <Breadcrumb
            items={[
              { title: <Link to="/">Catalog</Link> },
              { title: product.category },
              { title: product.name },
            ]}
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={10} xl={10} xxl={10}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            className="product-details__image"
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={14} xl={14} xxl={14}>
          <Space direction="vertical" size="middle">
            <Space>
              <Tag color="blue">{product.category.toUpperCase()}</Tag>
              {isOutOfStock ? (
                <Tag color="error">Out of Stock</Tag>
              ) : (
                <Tag color="success">{product.stock} units available</Tag>
              )}
            </Space>

            <Title level={2}>{product.name}</Title>

            <Space>
              <Rate disabled allowHalf value={product.rating} />
              <Text type="secondary">{product.rating.toFixed(1)} out of 5</Text>
            </Space>

            <Text className="product-details__price">{formatPrice(product.price)}</Text>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="SKU">{product.id}</Descriptions.Item>
              <Descriptions.Item label="Category">{product.category}</Descriptions.Item>
              <Descriptions.Item label="Availability">
                {isOutOfStock ? 'Currently unavailable' : `${product.stock} in warehouse`}
              </Descriptions.Item>
            </Descriptions>

            <Space>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                disabled={isOutOfStock}
                onClick={() => {
                    dispatch(addToCart({ product }));
                    void message.success(`Added "${product.name}" to cart`);
                }}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Link to="/">
                <Button size="large" icon={<ArrowLeftOutlined />}>
                  Back to Catalog
                </Button>
              </Link>
            </Space>
          </Space>
        </Col>
      </Row>

      {showBackToTop && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          aria-label="Back to top"
          icon={<UpOutlined />}
          onClick={handleScrollToTop}
          className="product-details__back-top"
        />
      )}
    </Card>
  );
}