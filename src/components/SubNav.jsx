import React from "react";
import { Menu } from "antd";
import { HomeOutlined, AppstoreOutlined, FormOutlined, MoreOutlined, LayoutOutlined, BookOutlined } from "@ant-design/icons";

export default function SubNav() {
  const items = [
    { key: "home", icon: <HomeOutlined />, label: "Home" },
    { key: "interface", icon: <AppstoreOutlined />, label: "Interface" },
    { key: "form", icon: <FormOutlined />, label: "Form elements" },
    { key: "extras", icon: <MoreOutlined />, label: "Extras" },
    { key: "layout", icon: <LayoutOutlined />, label: "Layout" },
    { key: "docs", icon: <BookOutlined />, label: "Documentation" },
  ];

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #eef0f3" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 16px" }}>
        <Menu mode="horizontal" selectable={false} items={items} />
      </div>
    </div>
  );
}
