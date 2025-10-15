// pages/Categories.js
import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Space, Switch, Tag, Modal, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import CategoryService from "../service/CategoryService";
import CategoryModal from "../components/CategoryModal";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch categories với useCallback
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      message.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Xử lý toggle trạng thái
  const handleSwitchChange = async (checked, record) => {
    try {
      await CategoryService.toggleActive(record.id);
      setCategories((prev) =>
        prev.map((c) => (c.id === record.id ? { ...c, active: checked } : c))
      );
      message.success(
        `Danh mục "${record.name}" đã được ${checked ? "bật" : "tắt"}`
      );
    } catch (error) {
      console.error("Lỗi khi toggle trạng thái:", error);
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  // Mở modal thêm/sửa
  const openModal = (category = null) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  // Xử lý khi modal thêm/sửa thành công
  const handleModalSuccess = () => {
    fetchCategories();
  };

  // Hiển thị modal xác nhận xóa
  const showDeleteConfirm = (record) => {
    setDeleteRecord(record);
    setDeleteConfirmOpen(true);
  };

  // Xử lý xóa danh mục
  const handleDeleteConfirmOk = async () => {
    if (deleteRecord) {
      try {
        await CategoryService.delete(deleteRecord.id);
        setCategories((prev) => prev.filter((c) => c.id !== deleteRecord.id));
        message.success("Xóa danh mục thành công");
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        message.error("Không thể xóa danh mục");
      }
    }
    setDeleteConfirmOpen(false);
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
      dataIndex: "active",
      key: "display_status",
      render: (active) =>
        active ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "is_active",
      render: (active, record) => (
        <Switch
          checked={active}
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
            onClick={() => openModal(record)}
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
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

      {/* Modal thêm/sửa tách riêng */}
      <CategoryModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        editingCategory={editingCategory}
        loading={modalLoading}
      />

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa"
        open={deleteConfirmOpen}
        onOk={handleDeleteConfirmOk}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteRecord(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc muốn xóa danh mục "{deleteRecord?.name}"?</p>
        <p style={{ color: "#ff4d4f", fontStyle: "italic" }}>
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}
