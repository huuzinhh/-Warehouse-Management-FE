import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import MetricCard from "../shared/MetricCard";
import SmallStat from "../shared/SmallStat";
import Charts from "../shared/Charts";

export default function Dashboard() {
  // sample data used in MetricCard / Charts
  const sparkData = [
    { v: 5 }, { v: 12 }, { v: 9 }, { v: 18 }, { v: 10 }, { v: 14 }, { v: 20 }, { v: 16 }
  ];

  return (
    <>
      {/* Row 1: top KPI cards w/ sparks */}
      <Row gutter={[16, 16]}>
        <Col span={6}><MetricCard title="New Tickets" value="43" change="+6%" data={sparkData} /></Col>
        <Col span={6}><MetricCard title="Closed Today" value="17" change="-3%" data={sparkData} /></Col>
        <Col span={6}><MetricCard title="New Replies" value="7" change="+9%" data={sparkData} /></Col>
        <Col span={6}><MetricCard title="Followers" value="27.3k" change="+3%" data={sparkData} /></Col>
      </Row>

      {/* Row 2: small white boxes */}
      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        <Col span={4}><SmallStat delta="+6%" title="New Tickets" value="43" /></Col>
        <Col span={4}><SmallStat delta="-3%" title="Closed Today" value="17" /></Col>
        <Col span={4}><SmallStat delta="+9%" title="New Replies" value="7" /></Col>
        <Col span={4}><SmallStat delta="+3%" title="Followers" value="27.3k" /></Col>
        <Col span={4}><SmallStat delta="-2%" title="Daily earnings" value="$95" /></Col>
        <Col span={4}><SmallStat delta="-1%" title="Products" value="621" /></Col>
      </Row>

      {/* Row 3: charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
        <Col span={12}>
          <Card title="A" style={{ borderRadius: 8 }}>
            <Charts type="bar" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="B" style={{ borderRadius: 8 }}>
            <Charts type="donut" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="C" style={{ borderRadius: 8 }}>
            <Charts type="pie" />
          </Card>
        </Col>
      </Row>
    </>
  );
}
