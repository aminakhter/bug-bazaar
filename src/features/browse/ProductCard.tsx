import { Card, Tag, Rate, Typography, Space, Button, Image } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Product } from '../../types/api';
import { formatPrice } from '../../utils/formatPrice';
import './product-card.scss';

const { Title, Text } = Typography;

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <Card
      hoverable
      className="product-card"
      cover={
        <Link to={`/products/${product.id}`} aria-label={`View details for ${product.name}`}>
          <Image
            preview={false}
            src={product.imageUrl}
            alt={product.name}
            className="product-card__image"
          />
        </Link>
      }
      actions={[
        <Button
          key="add-to-cart"
          type="primary"
          icon={<ShoppingCartOutlined />}
          disabled={isOutOfStock}
          onClick={() => onAddToCart?.(product)}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>,
      ]}
    >
      <Space direction="vertical" size="small">
        <Space wrap>
          <Tag color="blue">{product.category.toUpperCase()}</Tag>
          {isOutOfStock ? (
            <Tag color="error">Out of Stock</Tag>
          ) : (
            <Tag color="success">{product.stock} in stock</Tag>
          )}
        </Space>

        <Title level={5}>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </Title>

        <Text className="product-card__price">{formatPrice(product.price)}</Text>

        <Space>
          <Rate disabled allowHalf value={product.rating} />
          <Text type="secondary">({product.rating.toFixed(1)})</Text>
        </Space>
      </Space>
    </Card>
  );
}