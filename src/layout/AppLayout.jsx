// src/layout/AppLayout.jsx
import React from "react";
import { Layout, Menu, Avatar } from "antd";
import {
  DashboardOutlined,
  InboxOutlined,
  UploadOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, Outlet } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Main Layout */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            height: 64,
            lineHeight: "64px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Avatar size="large" icon={<UserOutlined />} />
        </Header>

        <Content
          style={{
            margin: "16px",
            padding: 16,
            background: "#fff",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
