import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, HomeOutlined } from "@ant-design/icons";

export default function Shelves() {
  const [shelves, setShelves] = useState([]);

  // Giả lập dữ liệu (sau này sẽ lấy từ API)
  useEffect(() => {
    setShelves([
      { id: 1, name: "Kệ A1", type: "Kệ đứng", warehouse_id: 101 },
      { id: 2, name: "Kệ B2", type: "Kệ di động", warehouse_id: 102 },
      { id: 3, name: "Kệ C3", type: "Kệ lạnh", warehouse_id: 101 },
    ]);
  }, []);

  const handleEdit = (record) => {
    console.log("Edit:", record);
  };

  const handleDelete = (record) => {
    console.log("Delete:", record);
  };

  const columns = [
    {
      title: "Mã kệ",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Tên kệ",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span>
          <AppstoreOutlined style={{ marginRight: 6, color: "#1677ff" }} />
          {name}
        </span>
      ),
    },
    {
      title: "Loại kệ",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type.includes("lạnh") ? "cyan" : "blue"}>{type}</Tag>
      ),
    },
    {
      title: "Mã kho",
      dataIndex: "warehouse_id",
      key: "warehouse_id",
      render: (warehouse_id) => (
        <span>
          <HomeOutlined style={{ marginRight: 6, color: "#faad14" }} />
          {warehouse_id}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20, background: "#fff" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Quản lý kệ hàng</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm kệ hàng
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={shelves}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}
