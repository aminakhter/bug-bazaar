import { useState } from 'react';
import { Row, Col, Select, Switch, Typography, Space } from 'antd';
import { ForcedErrorCode, getForcedErrorCode, setForcedErrorCode } from '../api/client';
import './debug-toolbar.scss';

const { Text } = Typography;

interface DebugToolbarProps {
  forceEmpty: boolean;
  onForceEmptyChange: (checked: boolean) => void;
  simulateOutOfOrder: boolean;
  onSimulateOutOfOrderChange: (checked: boolean) => void;
}

export function DebugToolbar({
  forceEmpty,
  onForceEmptyChange,
  simulateOutOfOrder,
  onSimulateOutOfOrderChange,
}: DebugToolbarProps) {
  const [errorCode, setErrorCode] = useState<ForcedErrorCode>(() => getForcedErrorCode());

  const handleErrorChange = (value: string) => {
    const parsed = value === 'none' ? null : (Number(value) as ForcedErrorCode);
    setErrorCode(parsed);
    setForcedErrorCode(parsed);
  };

  return (
    <Row gutter={[16, 8]} align="middle" className="debug-toolbar">
      <Col xs={24} sm={24} md={8} lg={8} xl={8} xxl={8}>
        <Space>
          <Text strong>QA Controls:</Text>
          <Select
            aria-label="Simulate API Error"
            size="small"
            value={errorCode === null ? 'none' : String(errorCode)}
            onChange={handleErrorChange}
            options={[
              { value: 'none', label: 'API: Normal (200)' },
              { value: '400', label: 'Force 400 Bad Request' },
              { value: '401', label: 'Force 401 Unauthorized' },
              { value: '404', label: 'Force 404 Not Found' },
              { value: '409', label: 'Force 409 Out of Stock' },
              { value: '500', label: 'Force 500 Server Error' },
            ]}
          />
        </Space>
      </Col>
      <Col xs={12} sm={12} md={8} lg={8} xl={8} xxl={8}>
        <Space>
          <Switch size="small" checked={forceEmpty} onChange={onForceEmptyChange} />
          <Text>Force Empty State</Text>
        </Space>
      </Col>
      <Col xs={12} sm={12} md={8} lg={8} xl={8} xxl={8}>
        <Space>
          <Switch size="small" checked={simulateOutOfOrder} onChange={onSimulateOutOfOrderChange} />
          <Text>Simulate Race Condition</Text>
        </Space>
      </Col>
    </Row>
  );
}