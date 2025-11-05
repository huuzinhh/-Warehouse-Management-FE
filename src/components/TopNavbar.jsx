import React, { useState } from "react";
import { Layout, Input, Avatar, Menu, Dropdown } from "antd";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  TeamOutlined,
  TagsOutlined,
  RetweetOutlined,
  ShopOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  AuditOutlined,
  UserSwitchOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  SettingOutlined,
  LoginOutlined,
  LogoutOutlined,
  ToolOutlined,
  InsertRowBelowOutlined,
} from "@ant-design/icons";
import AuthService from "../service/AuthenticationService";

const { Header } = Layout;

export default function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey =
    location.pathname === "/" ? "home" : location.pathname.replace("/", "");

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/");
  };

  // Menu chính (ở giữa thanh navbar)
  const mainMenuItems = [
    {
      key: "reports",
      label: <NavLink to="/reports">Tổng quan</NavLink>,
      icon: <DashboardOutlined />,
    },
    {
      key: "users",
      label: "Người dùng & Quyền",
      icon: <TeamOutlined />,
      children: [
        {
          key: "users-list",
          label: <NavLink to="/users">Người dùng</NavLink>,
          icon: <UserOutlined />,
        },
        {
          key: "roles",
          label: <NavLink to="/roles">Vai trò</NavLink>,
          icon: <SafetyCertificateOutlined />,
        },
      ],
    },
    {
      key: "products",
      label: "Sản phẩm & Danh mục",
      icon: <ShoppingOutlined />,
      children: [
        {
          key: "products-list",
          label: <NavLink to="/products">Sản phẩm</NavLink>,
          icon: <ShoppingOutlined />,
        },
        {
          key: "categories",
          label: <NavLink to="/categories">Danh mục</NavLink>,
          icon: <TagsOutlined />,
        },
      ],
    },
    {
      key: "partners",
      label: "Đối tác",
      icon: <UserSwitchOutlined />,
      children: [
        {
          key: "customers",
          label: <NavLink to="/customers">Khách hàng</NavLink>,
          icon: <UserOutlined />,
        },
        {
          key: "suppliers",
          label: <NavLink to="/suppliers">Nhà cung cấp</NavLink>,
          icon: <ShopOutlined />,
        },
      ],
    },
    {
      key: "inventories",
      label: "Kho hàng",
      icon: <DatabaseOutlined />,
      children: [
        {
          key: "receipts",
          label: <NavLink to="/receipts">Nhập kho</NavLink>,
          icon: <LoginOutlined />,
        },
        {
          key: "issues",
          label: <NavLink to="/issues">Xuất kho</NavLink>,
          icon: <LogoutOutlined />,
        },
        {
          key: "adjustments",
          label: <NavLink to="/adjustments">Kiểm kê</NavLink>,
          icon: <AuditOutlined />,
        },
        {
          key: "locations",
          label: <NavLink to="/locations">Vị trí kho</NavLink>,
          icon: <EnvironmentOutlined />,
        },
        {
          key: "inventories",
          label: <NavLink to="/inventories">Tồn kho</NavLink>,
          icon: <InsertRowBelowOutlined />,
        },
      ],
    },
  ];

  // Menu cá nhân (dropdown ở avatar)
  const userMenu = (
    <Menu
      items={[
        {
          key: "profile",
          label: <NavLink to="/admin-accounts">Thông tin cá nhân</NavLink>,
          icon: <UserOutlined />,
        },
        { type: "divider" },
        {
          key: "logout",
          label: (
            <span onClick={handleLogout} style={{ color: "red" }}>
              Đăng xuất
            </span>
          ),
          icon: <LogoutOutlined />,
        },
      ]}
    />
  );

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        background: "#fff",
        borderBottom: "1px solid #eaeaea",
        padding: "0 20px",
        height: 64,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: 30,
        }}
      >
        <img
          src="/src/assets/logo_anvinh.png"
          alt="Warehouse Logo"
          style={{ height: 100, objectFit: "contain" }}
        />
      </div>

      {/* Menu chính */}
      <Menu
        mode="horizontal"
        style={{
          flex: 1,
          fontWeight: 500,
          minWidth: 0,
        }}
        selectedKeys={[selectedKey]}
        items={mainMenuItems}
      />

      {/* Avatar + Dropdown cá nhân */}
      <Dropdown overlay={userMenu} placement="bottomRight" arrow>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: "auto",
            cursor: "pointer",
            gap: 8,
          }}
        >
          <Avatar
            size="large"
            style={{ backgroundColor: "#1677ff" }}
            icon={<UserOutlined />}
          />
          <span style={{ fontWeight: 500 }}>Admin</span>
        </div>
      </Dropdown>
    </Header>
  );
}
