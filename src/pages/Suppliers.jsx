import React, { useEffect, useState } from "react";
import { Table, Button, Space, Switch, Tag, Modal, Form, Input, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance"; 

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const apiResponse = await axiosInstance.get("/api/suppliers");
      if (apiResponse.code === 1000 && Array.isArray(apiResponse.result)) {
        const suppliersData = apiResponse.result.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          address: item.address,
          isActive: item.active // Ánh xạ active thành isActive cho toggle
        }));
        setSuppliers(suppliersData);
      } else {
        throw new Error("Dữ liệu không hợp lệ từ server");
      }
    } catch (error) {
      console.error("Lỗi khi lấy nhà cung cấp:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = async (checked, record) => {
    try {
      const apiResponse = await axiosInstance.put(`/api/suppliers/toggle/${record.id}`, {
        active: checked
      });
      if (apiResponse.code === 1000) {
        const updatedSuppliers = suppliers.map((supplier) =>
          supplier.id === record.id ? { ...supplier, isActive: checked } : supplier
        );
        setSuppliers(updatedSuppliers);
        message.success(`Nhà cung cấp ${record.name} đã được ${checked ? "bật" : "tắt"}`);
      } else {
        throw new Error("Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi toggle trạng thái:", error);
    }
  };

  const showModal = (supplier = null) => {
    setEditingSupplier(supplier);
    if (supplier) {
      form.setFieldsValue({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let apiResponse;
      if (editingSupplier) {
        apiResponse = await axiosInstance.put(`/api/suppliers/${editingSupplier.id}`, {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          active: editingSupplier.isActive
        });
      } else {
        apiResponse = await axiosInstance.post("/api/suppliers", {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: values.address,
          active: true
        });
      }
      if (apiResponse.code === 1000) {
        setIsModalVisible(false);
        fetchSuppliers();
        message.success(apiResponse.message || (editingSupplier ? "Cập nhật thành công" : "Thêm thành công"));
      } else {
        throw new Error("Thao tác thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm/sửa nhà cung cấp:", error);
    }
  };

  const showDeleteConfirm = (record) => {
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
    console.log("Đang mở modal xóa cho:", record.name);
  };

  const handleDeleteConfirmOk = async () => {
    if (deleteRecord) {
      try {
        const apiResponse = await axiosInstance.delete(`/api/suppliers/${deleteRecord.id}`);
        if (apiResponse.code === 1000) {
          setSuppliers(suppliers.filter((supplier) => supplier.id !== deleteRecord.id));
          message.success(apiResponse.message || "Xóa thành công");
        } else {
          throw new Error("Xóa thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi xóa nhà cung cấp:", error);
        message.error("Không thể xóa nhà cung cấp. Vui lòng thử lại!");
      }
    }
    setIsDeleteConfirmVisible(false);
    setDeleteRecord(null);
  };

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
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "is_active",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleSwitchChange(checked, record)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
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
            rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}
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

      <Modal
        title="Xác nhận xóa"
        open={isDeleteConfirmVisible}
        onOk={handleDeleteConfirmOk}
        onCancel={() => {
          setIsDeleteConfirmVisible(false);
          setDeleteRecord(null);
        }}
      >
        <p>Bạn có chắc muốn xóa nhà cung cấp "{deleteRecord?.name}"?</p>
      </Modal>
    </div>
  );
}