import React, { useEffect, useState } from "react";
import { Table, Button, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from "@ant-design/icons";

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  // Giả lập dữ liệu (sau này bạn thay bằng dữ liệu từ API)
  useEffect(() => {
    setCustomers([
      {
        id: 1,
        name: "Nguyễn Văn A",
        email: "vana@example.com",
        phone: "0909123456",
        address: "123 Lê Lợi, Q.1, TP.HCM",
      },
      {
        id: 2,
        name: "Trần Thị B",
        email: "thib@example.com",
        phone: "0987654321",
        address: "45 Hai Bà Trưng, Q.3, TP.HCM",
      },
      {
        id: 3,
        name: "Lê Văn C",
        email: "vanc@example.com",
        phone: "0911222333",
        address: "78 Nguyễn Huệ, Q.1, TP.HCM",
      },
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
      title: "Mã KH",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <span>
          <MailOutlined style={{ marginRight: 6, color: "#1677ff" }} />
          {email}
        </span>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <span>
          <PhoneOutlined style={{ marginRight: 6, color: "#52c41a" }} />
          {phone}
        </span>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (address) => (
        <span>
          <HomeOutlined style={{ marginRight: 6, color: "#faad14" }} />
          {address}
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
        <h2>Quản lý khách hàng</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm khách hàng
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={customers}
        columns={columns}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}
