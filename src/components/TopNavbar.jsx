import React, { useState } from "react";
import { Layout, Input, Avatar, Menu } from "antd";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  TeamOutlined,
  AppstoreAddOutlined,
  TagsOutlined,
  RetweetOutlined,
  ShopOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  SolutionOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Search } = Input;

export default function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 👈 kiểm soát login/logout
  const selectedKey =
    location.pathname === "/" ? "home" : location.pathname.replace("/", "");

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/login");
  };

  const menuItems = [
    {
      key: "home",
      label: <NavLink to="/">Trang chủ</NavLink>,
      icon: <HomeOutlined />,
    },
    {
      key: "users",
      label: "Người dùng & Phân quyền",
      icon: <TeamOutlined />,
      children: [
        { key: "users-list", label: <NavLink to="/users">Người dùng</NavLink>, icon: <UserOutlined /> },
        { key: "roles", label: <NavLink to="/roles">Vai trò</NavLink>, icon: <SolutionOutlined /> },
        { key: "users-roles", label: <NavLink to="/users-roles">Gán quyền</NavLink>, icon: <RetweetOutlined /> },
      ],
    },
    {
      key: "products",
      label: "Sản phẩm & Danh mục",
      icon: <AppstoreAddOutlined />,
      children: [
        { key: "products-list", label: <NavLink to="/products">Sản phẩm</NavLink>, icon: <AppstoreAddOutlined /> },
        { key: "categories", label: <NavLink to="/categories">Danh mục</NavLink>, icon: <TagsOutlined /> },
        { key: "unit-conversions", label: <NavLink to="/unit-conversions">Quy đổi đơn vị</NavLink>, icon: <RetweetOutlined /> },
        { key: "suppliers", label: <NavLink to="/suppliers">Nhà cung cấp</NavLink>, icon: <ShopOutlined /> },
      ],
    },
    {
      key: "warehouses",
      label: "Kho & Vị trí lưu trữ",
      icon: <DatabaseOutlined />,
      children: [
        { key: "warehouse-list", label: <NavLink to="/warehouses">Kho hàng</NavLink>, icon: <DatabaseOutlined /> },
        { key: "locations", label: <NavLink to="/locations">Vị trí trong kho</NavLink>, icon: <EnvironmentOutlined /> },
      ],
    },
    {
      key: "customers",
      label: "Khách hàng",
      icon: <TeamOutlined />,
      children: [
        { key: "customers-list", label: <NavLink to="/customers">Danh sách khách hàng</NavLink>, icon: <UserOutlined /> },
      ],
    },
    {
      key: "inventory",
      label: "Nhập – Xuất kho",
      icon: <RetweetOutlined />,
      children: [
        { key: "imports", label: <NavLink to="/imports">Phiếu nhập hàng</NavLink>, icon: <LoginOutlined /> },
        { key: "exports", label: <NavLink to="/exports">Phiếu xuất hàng</NavLink>, icon: <LogoutOutlined /> },
      ],
    },
    {
      key: "system",
      label: "Hệ thống",
      icon: <SettingOutlined />,
      children: [
        { key: "admin-accounts", label: <NavLink to="/admin-accounts">Tài khoản admin</NavLink>, icon: <UserOutlined /> },
        { key: "settings", label: <NavLink to="/settings">Cấu hình chung</NavLink>, icon: <SettingOutlined /> },
        // ✅ Hiển thị login hoặc logout tùy trạng thái
        isLoggedIn
          ? {
              key: "logout",
              label: (
                <span onClick={handleLogout} style={{ color: "red" }}>
                  Đăng xuất
                </span>
              ),
              icon: <LogoutOutlined />,
            }
          : {
              key: "login",
              label: (
                <span onClick={handleLogin} style={{ color: "green" }}>
                  Đăng nhập
                </span>
              ),
              icon: <LoginOutlined />,
            },
      ],
    },
  ];

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
          fontWeight: "bold",
          fontSize: 18,
          color: "#001529",
          marginRight: 30,
        }}
      >
        📦 Warehouse
      </div>

      {/* Menu */}
      <Menu
        mode="horizontal"
        style={{ flex: "none" }}
        selectedKeys={[selectedKey]}
        items={menuItems}
      />

      {/* Search + Avatar */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
        <Search placeholder="Tìm kiếm..." style={{ width: 200, marginRight: 16 }} />
        <Avatar icon={<UserOutlined />} />
      </div>
    </Header>
  );
}
