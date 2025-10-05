import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const sampleBar = [
  { name: "Jan", uv: 30 },{ name: "Feb", uv: 40 },{ name: "Mar", uv: 35 },
  { name: "Apr", uv: 50 },{ name: "May", uv: 55 },{ name: "Jun", uv: 48 },
  { name: "Jul", uv: 70 },{ name: "Aug", uv: 65 },{ name: "Sep", uv: 55 },
  { name: "Oct", uv: 60 },{ name: "Nov", uv: 58 },{ name: "Dec", uv: 63 }
];

const pieData = [
  { name: "A", value: 47.4 }, { name: "B", value: 33.1 }, { name: "C", value: 19.5 }
];

export default function Charts({ type = "bar" }) {
  if (type === "bar") {
    return (
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={sampleBar}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="uv" fill="#2f54eb" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "donut" || type === "pie") {
    return (
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={type === "donut" ? 50 : 0} outerRadius={80}>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#2f54eb", "#00A859", "#FFA94D"][index % 3]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return null;
}
