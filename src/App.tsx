import { useState } from 'react';
import { Layout, Typography, Row, Col } from 'antd';
import { Link, Route, Routes } from 'react-router-dom';
import { setSimulateRaceCondition } from './api/client';
import { DebugToolbar } from './components/DebugToolbar';
import { CatalogPage } from './features/browse/CatalogPage';
import { ProductDetailsPage } from './features/browse/ProductDetailsPage';
import './app.scss';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {
  const [forceEmpty, setForceEmpty] = useState(false);
  const [simulateOutOfOrder, setSimulateOutOfOrder] = useState(false);

  const handleSimulateRaceChange = (checked: boolean) => {
    setSimulateOutOfOrder(checked);
    setSimulateRaceCondition(checked);
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Title level={4} className="app-header__title">
              <Link to="/" className="app-header__link">
                The Bug Bazaar
              </Link>
            </Title>
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
        </Routes>
      </Content>
    </Layout>
  );
}