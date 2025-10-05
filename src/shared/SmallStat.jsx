import React from "react";
import { Card } from "antd";

export default function SmallStat({ delta, title, value }) {
  return (
    <Card bordered={false} style={{ borderRadius: 8, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
      <div style={{ color: delta && delta.startsWith("+") ? "green" : "red", fontWeight: 600 }}>{delta}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{value}</div>
      <div style={{ color: "#888", marginTop: 6 }}>{title}</div>
    </Card>
  );
}
