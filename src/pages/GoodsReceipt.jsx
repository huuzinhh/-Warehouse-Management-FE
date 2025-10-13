import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import GoodsReceiptService from "../service/GoodsReceiptService";
import dayjs from "dayjs";
import GoodsReceiptModal from "../components/GoodsReceiptModal";
import GoodsReceiptViewModal from "../components/GoodsReceiptViewModal";

export default function GoodsReceipt() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // ✅ State cho modal xác nhận xóa
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await GoodsReceiptService.getAll();
      setReceipts(data || []);
    } catch {
      // lỗi đã được toast trong axiosInstance
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleCreateReceipt = async (payload, form, resetProducts) => {
    try {
      setSubmitLoading(true);
      await GoodsReceiptService.create(payload);
      fetchReceipts();
      form.resetFields();
      resetProducts();
      setModalVisible(false);
    } catch {
      // lỗi đã được axiosInstance xử lý
    } finally {
      setSubmitLoading(false);
    }
  };

  // ✅ Khi nhấn "Xóa" thì mở modal xác nhận
  const handleDelete = (record) => {
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
  };

  // ✅ Khi người dùng xác nhận OK trong modal
  const handleDeleteConfirmOk = async () => {
    if (!deleteRecord) return;
    try {
      await GoodsReceiptService.delete(deleteRecord.id);
      fetchReceipts();
    } catch {
      // axiosInstance đã xử lý toast lỗi
    } finally {
      setIsDeleteConfirmVisible(false);
      setDeleteRecord(null);
    }
  };

  const columns = [
    { title: "Mã phiếu", dataIndex: "receiptCode" },
    {
      title: "Ngày nhập",
      dataIndex: "receiptDate",
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => (v ? v.toLocaleString() + " ₫" : "-"),
    },
    { title: "Nhà cung cấp", dataIndex: "partnerName" },
    { title: "Người lập phiếu", dataIndex: "createdByName" },
    {
      title: "Thao tác",
      render: (_, r) => (
        <Space>
          <Button
            onClick={async () => {
              try {
                const detail = await GoodsReceiptService.getById(r.id);
                setSelectedReceipt(detail);
                setViewVisible(true);
              } catch {
                // axiosInstance đã hiển thị lỗi
              }
            }}
          >
            Xem
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(r)}
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
        <h2>Quản lý phiếu nhập kho</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Thêm phiếu nhập
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={receipts}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
      />

      {/* 🔹 Modal tạo phiếu */}
      <GoodsReceiptModal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreateReceipt}
        loading={submitLoading}
      />

      {/* 🔹 Modal xem chi tiết */}
      <GoodsReceiptViewModal
        open={viewVisible}
        onCancel={() => {
          setViewVisible(false);
          setSelectedReceipt(null);
        }}
        receipt={selectedReceipt}
      />

      {/* 🔹 Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteConfirmVisible}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        onOk={handleDeleteConfirmOk}
        onCancel={() => {
          setIsDeleteConfirmVisible(false);
          setDeleteRecord(null);
        }}
      >
        <p>
          Bạn có chắc muốn xóa phiếu nhập{" "}
          <strong>{deleteRecord?.receiptCode}</strong> không?
        </p>
      </Modal>
    </div>
  );
}
