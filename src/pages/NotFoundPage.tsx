import { Result, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Row gutter={[16, 16]} justify="center">
      <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={8}>
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page or bug artifact you are looking for does not exist."
          extra={
            <Link to="/">
              <Button type="primary">Back to Catalog</Button>
            </Link>
          }
        />
      </Col>
    </Row>
  );
}