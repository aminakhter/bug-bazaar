import { Row, Col, Input, Select, Switch, Button, Typography, Space } from 'antd';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { ProductCategory, ProductSortOption } from '../../types/api';
import './product-filters.scss';

const { Text } = Typography;

interface ProductFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  category: ProductCategory | '';
  onCategoryChange: (value: ProductCategory | '') => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (checked: boolean) => void;
  sort: ProductSortOption | '';
  onSortChange: (value: ProductSortOption | '') => void;
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ProductFilters({
  searchInput,
  onSearchInputChange,
  category,
  onCategoryChange,
  inStockOnly,
  onInStockOnlyChange,
  sort,
  onSortChange,
  totalCount,
  hasActiveFilters,
  onClearFilters,
}: ProductFiltersProps) {
  return (
    <Row gutter={[16, 16]} align="middle" className="product-filters">
      <Col xs={24} sm={12} md={8} lg={7} xl={7} xxl={7}>
        <Input
          allowClear
          aria-label="Search products"
          prefix={<SearchOutlined />}
          placeholder="Search keyboards, ducks, coffee..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
        />
      </Col>

      <Col xs={24} sm={12} md={5} lg={5} xl={5} xxl={5}>
        <Select
          aria-label="Filter by category"
          className="product-filters__select"
          value={category}
          onChange={(val) => onCategoryChange(val)}
          options={[
            { value: '', label: 'All Categories' },
            { value: 'keyboards', label: 'Keyboards' },
            { value: 'ducks', label: 'Rubber Ducks' },
            { value: 'coffee', label: 'Coffee' },
            { value: 'stickers', label: 'Stickers' },
          ]}
        />
      </Col>

      <Col xs={24} sm={12} md={5} lg={5} xl={5} xxl={5}>
        <Select
          aria-label="Sort products"
          className="product-filters__select"
          value={sort}
          onChange={(val) => onSortChange(val)}
          options={[
            { value: '', label: 'Sort: Featured' },
            { value: 'price_asc', label: 'Price: Low to High' },
            { value: 'price_desc', label: 'Price: High to Low' },
            { value: 'rating_desc', label: 'Highest Rated' },
            { value: 'name_asc', label: 'Name: A to Z' },
          ]}
        />
      </Col>

      <Col xs={12} sm={6} md={3} lg={3} xl={3} xxl={3}>
        <Space>
          <Switch
            aria-label="In stock only"
            checked={inStockOnly}
            onChange={onInStockOnlyChange}
          />
          <Text>In stock</Text>
        </Space>
      </Col>

      <Col xs={12} sm={6} md={3} lg={4} xl={4} xxl={4}>
        <Space wrap>
          <Text strong>{totalCount.toLocaleString()} items</Text>
          {hasActiveFilters && (
            <Button size="small" icon={<ClearOutlined />} onClick={onClearFilters}>
              Clear
            </Button>
          )}
        </Space>
      </Col>
    </Row>
  );
}