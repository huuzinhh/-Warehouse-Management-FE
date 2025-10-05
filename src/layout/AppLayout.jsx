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
  // ✅ Menu items viết theo chuẩn mới
  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "2",
      icon: <InboxOutlined />,
      label: <Link to="/goods-receipt">Phiếu nhập</Link>,
    },
    {
      key: "3",
      icon: <UploadOutlined />,
      label: <Link to="/goods-issue">Phiếu xuất</Link>,
    },
    {
      key: "4",
      icon: <AppstoreOutlined />,
      label: <Link to="/inventory">Tồn kho</Link>,
    },
    {
      key: "5",
      icon: <BarChartOutlined />,
      label: <Link to="/reports">Báo cáo</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider collapsible>
        <div
          style={{
            height: 64,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: "bold",
            color: "white",
          }}
        >
          Kho
        </div>

        {/* ✅ Menu dùng items, không warning */}
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>

      {/* Main Layout */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Hệ thống quản lý kho</h2>
          <Avatar size="large" icon={<UserOutlined />} />
        </Header>

        <Content style={{ margin: "20px", padding: 20, background: "#fff" }}>
          <Outlet /> {/* nơi render các trang con */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
