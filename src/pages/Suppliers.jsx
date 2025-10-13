import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Switch,
  Tag,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import PartnerService from "../service/PartnerService";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [form] = Form.useForm();

  // 🔹 Lấy danh sách nhà cung cấp
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await PartnerService.getAll();
      const suppliersData = data
        .filter((item) => item.partnerType === "SUPPLIER")
        .map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          address: item.address,
          isActive: item.active,
        }));
      setSuppliers(suppliersData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhà cung cấp:", error);
      message.error("Không thể tải danh sách nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // 🔹 Hiển thị modal thêm/sửa
  const showModal = (supplier = null) => {
    setEditingSupplier(supplier);
    if (supplier) {
      form.setFieldsValue({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 🔹 Lưu khi submit modal
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        address: values.address,
        phone: values.phone,
        email: values.email,
        partnerType: "SUPPLIER",
      };

      if (editingSupplier) {
        await PartnerService.update(editingSupplier.id, payload);
        message.success("Cập nhật nhà cung cấp thành công");
      } else {
        await PartnerService.create(payload);
        message.success("Thêm nhà cung cấp thành công");
      }

      setIsModalVisible(false);
      fetchSuppliers();
    } catch (error) {
      console.error("Lỗi khi thêm/sửa nhà cung cấp:", error);
      message.error("Thao tác thất bại");
    }
  };

  // 🔹 Xóa nhà cung cấp
  const showDeleteConfirm = (record) => {
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
  };

  const handleDeleteConfirmOk = async () => {
    try {
      if (deleteRecord) {
        await PartnerService.delete(deleteRecord.id);
        message.success("Xóa nhà cung cấp thành công");
        setSuppliers((prev) =>
          prev.filter((supplier) => supplier.id !== deleteRecord.id)
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa nhà cung cấp:", error);
      message.error("Không thể xóa nhà cung cấp");
    } finally {
      setIsDeleteConfirmVisible(false);
      setDeleteRecord(null);
    }
  };

  // 🔹 Cấu hình cột bảng
  const columns = [
    {
      title: "Mã NCC",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span>
          <UserOutlined style={{ marginRight: 6, color: "#1677ff" }} />
          {name}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <span>
          <MailOutlined style={{ marginRight: 6, color: "#52c41a" }} />
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
          <PhoneOutlined style={{ marginRight: 6, color: "#faad14" }} />
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
          <HomeOutlined style={{ marginRight: 6, color: "#a0d911" }} />
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
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
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
        <h2>Quản lý nhà cung cấp</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm nhà cung cấp
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={suppliers}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
      />

      {/* 🔹 Modal thêm/sửa */}
      <Modal
        title={editingSupplier ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Vui lòng nhập email hợp lệ",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 🔹 Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteConfirmVisible}
        onOk={handleDeleteConfirmOk}
        onCancel={() => {
          setIsDeleteConfirmVisible(false);
          setDeleteRecord(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc muốn xóa nhà cung cấp{" "}
          <strong>{deleteRecord?.name}</strong> không?
        </p>
      </Modal>
    </div>
  );
}
