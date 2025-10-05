import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function Products() {
  const [products, setProducts] = useState([]);

  // Giả lập dữ liệu (sau này thay bằng API từ backend)
  useEffect(() => {
    setProducts([
      {
        id: 1,
        name: "Gạo ST25",
        category: "Thực phẩm",
        unit: "Kg",
        price: 25000,
        stock: 120,
        supplier: "Nhà cung A",
        created_at: "2025-01-01",
      },
      {
        id: 2,
        name: "Bánh Oreo",
        category: "Bánh kẹo",
        unit: "Hộp",
        price: 15000,
        stock: 300,
        supplier: "Nhà cung B",
        created_at: "2025-01-05",
      },
    ]);
  }, []);

  const columns = [
    {
      title: "Mã SP",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      width: 100,
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      key: "price",
      render: (price) => price.toLocaleString(),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      render: (stock) =>
        stock < 50 ? <Tag color="red">{stock}</Tag> : <Tag color="green">{stock}</Tag>,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Quản lý sản phẩm</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm sản phẩm
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={products}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}
