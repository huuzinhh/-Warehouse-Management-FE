import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  // ✅ Giả lập dữ liệu (sau này thay bằng API từ backend)
  useEffect(() => {
    setCategories([
      { id: 1, name: "Thực phẩm", is_active: true },
      { id: 2, name: "Đồ uống", is_active: false },
      { id: 3, name: "Gia vị", is_active: true },
    ]);
  }, []);

  const columns = [
    {
      title: "Mã danh mục",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active) =>
        is_active ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
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
            onClick={() => console.log("Edit", record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => console.log("Delete", record)}
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
        <h2>Quản lý danh mục</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm danh mục
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={categories}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}
