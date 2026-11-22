import { Layout, Typography, Row, Col } from 'antd';
import './app.scss';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function App() {
  return (
    <Layout>
      <Header className="app-header">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Title level={4} className="app-header__title">
              The Bug Bazaar
            </Title>
          </Col>
        </Row>
      </Header>
      <Content>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
            <Text>Foundation setup complete. Ready for D1-2 API contract and mock backend.</Text>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}