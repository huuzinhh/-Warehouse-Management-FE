import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";

const { Header, Content } = Layout;

export default function TopLayout() {
  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}> 
      {/* Header */}
      <Header
        style={{
          background: "#fff",
          padding: 0,
          width: "100%",
        }}
      >
        <TopNavbar />
      </Header>

      {/* Content chiếm toàn màn hình ngang */}
      <Content
        style={{
          margin: 0,
          padding: 20,
          background: "#f5f6fa",
          width: "100%",          // ✅ full chiều ngang
          minHeight: "calc(100vh - 64px)", // trừ chiều cao header
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: 20,
            height: "100%",
            width: "100%",       // ✅ đảm bảo không bị bó hẹp
          }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
