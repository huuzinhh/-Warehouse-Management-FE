import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import PartnerService from "../service/PartnerService";
import TableFilter from "../components/TableFilter";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [form] = Form.useForm();
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // 🔹 Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await PartnerService.getAll();
      const customersData = data
        .filter((item) => item.partnerType === "CUSTOMER")
        .map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          address: item.address,
          isActive: item.active,
        }));
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
      message.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🔹 Hiển thị modal thêm/sửa
  const showModal = (customer = null) => {
    setEditingCustomer(customer);
    if (customer) {
      form.setFieldsValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 🔹 Submit form thêm/sửa
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        partnerType: "CUSTOMER", // 👈 khác supplier ở đây
      };

      if (editingCustomer) {
        await PartnerService.update(editingCustomer.id, payload);
        message.success("Cập nhật khách hàng thành công");
      } else {
        await PartnerService.create(payload);
        message.success("Thêm khách hàng thành công");
      }

      setIsModalVisible(false);
      fetchCustomers();
    } catch (error) {
      console.error("Lỗi khi thêm/sửa khách hàng:", error);
      message.error("Thao tác thất bại");
    }
  };

  // 🔹 Xóa khách hàng
  const showDeleteConfirm = (record) => {
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
  };

  const handleDeleteConfirmOk = async () => {
    try {
      if (deleteRecord) {
        await PartnerService.delete(deleteRecord.id);
        message.success("Xóa khách hàng thành công");
        setCustomers((prev) =>
          prev.filter((customer) => customer.id !== deleteRecord.id)
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa khách hàng:", error);
      message.error("Không thể xóa khách hàng");
    } finally {
      setIsDeleteConfirmVisible(false);
      setDeleteRecord(null);
    }
  };

  // 🔹 Cấu hình cột bảng
  const columns = [
    { title: "Mã KH", dataIndex: "id", key: "id", width: 100 },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
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
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h2>
          <b>KHÁCH HÀNG</b>
        </h2>
        <TableFilter
          data={customers}
          onFilter={setFilteredCustomers}
          searchFields={["name", "email", "phone", "address"]}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={filteredCustomers}
        columns={columns}
        pagination={{ pageSize: 6 }}
        loading={loading}
      />

      {/* 🔹 Modal thêm/sửa */}
      <Modal
        title={editingCustomer ? "Sửa khách hàng" : "Thêm khách hàng"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khách hàng"
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
          Bạn có chắc muốn xóa khách hàng <strong>{deleteRecord?.name}</strong>{" "}
          không?
        </p>
      </Modal>
    </>
  );
}
