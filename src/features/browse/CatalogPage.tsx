import { useCallback, useEffect, useState } from 'react';
import { Row, Col, Pagination, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { ProductCategory, ProductSortOption } from '../../types/api';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useProductsQuery } from '../../hooks/useProductsQuery';
import { AsyncStateView } from '../../components/AsyncStateView';
import { useAppDispatch } from '../../store/hooks';
import { addToCart } from '../../store/cartSlice';
import { ProductFilters } from './ProductFilters';
import { ProductCard } from './ProductCard';
import { Product } from '../../types/api';
import './catalog-page.scss';

const PAGE_SIZE = 24;

interface CatalogPageProps {
  forceEmpty: boolean;
}

export function CatalogPage({ forceEmpty }: CatalogPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get('search') ?? '';
  const category = (searchParams.get('category') ?? '') as ProductCategory | '';
  const sort = (searchParams.get('sort') ?? '') as ProductSortOption | '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Keep local input in sync when user navigates with browser Back/Forward buttons
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Sync debounced search text into URL query string
  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch.trim()) {
        next.set('search', debouncedSearch.trim());
      } else {
        next.delete('search');
      }
      next.delete('page');
      return next;
    });
  }, [debouncedSearch, urlSearch, setSearchParams]);

  const updateParam = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== 'page') {
        next.delete('page');
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const { state, retry } = useProductsQuery(
    {
      search: urlSearch,
      category,
      sort,
      page,
      inStockOnly,
    },
    forceEmpty,
  );

  const hasActiveFilters = Boolean(urlSearch || category || sort || inStockOnly);
  const totalCount = state.status === 'success' ? state.data.total : 0;

  const dispatch = useAppDispatch();
    const handleAddToCart = useCallback(
        (product: Product) => {
            dispatch(addToCart({ product }));
            void message.success(`Added "${product.name}" to cart`);
        },
        [dispatch],
    );

  return (
    <Row gutter={[16, 16]} className="catalog-page">
      <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
        <ProductFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          category={category}
          onCategoryChange={(val) => updateParam('category', val || null)}
          inStockOnly={inStockOnly}
          onInStockOnlyChange={(checked) => updateParam('inStock', checked ? 'true' : null)}
          sort={sort}
          onSortChange={(val) => updateParam('sort', val || null)}
          totalCount={totalCount}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      </Col>

      {state.status === 'idle' || state.status === 'loading' ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <AsyncStateView status="loading" />
        </Col>
      ) : state.status === 'error' ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <AsyncStateView status="error" error={state.error} onRetry={retry} />
        </Col>
      ) : state.data.items.length === 0 ? (
        <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <AsyncStateView
            status="empty"
            emptyDescription="No developer gear matches your current filters."
          />
        </Col>
      ) : (
        <>
          {state.data.items.map((product) => (
            <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6} xxl={4}>
              <ProductCard onAddToCart={handleAddToCart} product={product} />
            </Col>
          ))}

          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24} className="catalog-page__pagination">
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={state.data.total}
              showSizeChanger={false}
              onChange={(nextPage) => updateParam('page', nextPage > 1 ? String(nextPage) : null)}
            />
          </Col>
        </>
      )}
    </Row>
  );
}