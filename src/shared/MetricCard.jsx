import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function MetricCard({ title, value, change, data }) {
  // adapt data format to recharts
  const chartData = (data || []).map((d, i) => ({ x: i, y: d.v }));
  return (
    <Card style={{ borderRadius: 8, boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
      <Row>
        <Col span={16}>
          <div style={{ color: "#666", fontSize: 13 }}>{title}</div>
          <div style={{ marginTop: 6 }}>
            <Statistic value={value} valueStyle={{ fontSize: 20 }} />
            <div style={{ color: change?.startsWith("+") ? "green" : "red", fontSize: 12 }}>{change}</div>
          </div>
        </Col>
        <Col span={8}>
          <div style={{ width: "100%", height: 50 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="y" stroke="#1E90FF" fill="#CFE9FF" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
