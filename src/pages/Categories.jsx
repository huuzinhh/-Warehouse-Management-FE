import React, { useEffect, useState } from "react";
import { Table, Button, Space, Switch, Tag, Modal, Form, Input, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false); // State cho modal xóa
  const [deleteRecord, setDeleteRecord] = useState(null); // Lưu record cần xóa

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const apiResponse = await axiosInstance.get("/api/categories");
      if (apiResponse.code === 1000 && Array.isArray(apiResponse.result)) {
        const categoriesData = apiResponse.result.map(item => ({
          id: item.id,
          name: item.name,
          isActive: item.active
        }));
        setCategories(categoriesData);
      } else {
        throw new Error("Dữ liệu không hợp lệ từ server");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchChange = async (checked, record) => {
    try {
      const apiResponse = await axiosInstance.put(`/api/categories/toggle/${record.id}`, {
        active: checked
      });
      if (apiResponse.code === 1000) {
        const updatedCategories = categories.map((category) =>
          category.id === record.id ? { ...category, isActive: checked } : category
        );
        setCategories(updatedCategories);
        message.success(`Danh mục ${record.name} đã được ${checked ? "bật" : "tắt"}`);
      } else {
        throw new Error("Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi toggle trạng thái:", error);
    }
  };

  const showModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({ name: category.name });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let apiResponse;
      if (editingCategory) {
        apiResponse = await axiosInstance.put(`/api/categories/${editingCategory.id}`, {
          name: values.name,
          active: editingCategory.isActive
        });
      } else {
        apiResponse = await axiosInstance.post("/api/categories", {
          name: values.name,
          active: true
        });
      }
      if (apiResponse.code === 1000) {
        setIsModalVisible(false);
        fetchCategories();
        message.success(apiResponse.message || (editingCategory ? "Cập nhật thành công" : "Thêm thành công"));
      } else {
        throw new Error("Thao tác thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm/sửa danh mục:", error);
    }
  };

  // Hiển thị modal xóa
  const showDeleteConfirm = (record) => {
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
    console.log("Hiển thị modal xóa cho:", record.name);
  };

  // Xử lý xóa khi OK
  const handleDeleteConfirmOk = async () => {
    if (deleteRecord) {
      try {
        const apiResponse = await axiosInstance.delete(`/api/categories/${deleteRecord.id}`);
        if (apiResponse.code === 1000) {
          setCategories(categories.filter((category) => category.id !== deleteRecord.id));
          message.success(apiResponse.message || "Xóa thành công");
        } else {
          throw new Error("Xóa thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        message.error("Không thể xóa danh mục. Vui lòng thử lại!");
      }
    }
    setIsDeleteConfirmVisible(false);
    setDeleteRecord(null);
  };

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
      title: "Trạng thái hiển thị",
      dataIndex: "isActive",
      key: "display_status",
      render: (isActive) =>
        isActive ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
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
        <h2>Quản lý danh mục</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm danh mục
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={categories}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
      />

      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteConfirmVisible}
        onOk={handleDeleteConfirmOk}
        onCancel={() => {
          setIsDeleteConfirmVisible(false);
          setDeleteRecord(null);
        }}
      >
        <p>Bạn có chắc muốn xóa danh mục "{deleteRecord?.name}"?</p>
      </Modal>
    </div>
  );
}