import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Tag, message } from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import AdjustmentService from "../service/AdjustmentService";
import dayjs from "dayjs";
import AdjustmentModal from "../components/AdjustmentModal";
import AdjustmentViewModal from "../components/AdjustmentViewModal";
import { getUserIdFromToken } from "../service/localStorageService";

export default function Adjusment() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);

  // ===== Gọi API lấy danh sách phiếu kiểm kho =====
  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const res = await AdjustmentService.getAll();
      console.log("res: ", res);

      setAdjustments((res || []).reverse());
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách phiếu kiểm kho!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  // ===== Xem chi tiết phiếu =====
  const handleView = async (record) => {
    try {
      const res = await AdjustmentService.getById(record.id);
      if (!res) {
        message.error("Không thể tải chi tiết phiếu!");
        return;
      }
      setSelectedAdjustment(res);
      setViewModalOpen(true);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải chi tiết phiếu!");
    }
  };

  // ===== Xóa phiếu kiểm kho =====
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa phiếu kiểm kho #${record.id}?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await AdjustmentService.delete(record.id);
          message.success("Đã xóa phiếu kiểm kho!");
          fetchAdjustments();
        } catch (err) {
          message.error("Xóa thất bại!");
        }
      },
    });
  };

  const columns = [
    { title: "Mã phiếu", dataIndex: "code", key: "code" },
    {
      title: "Ngày tạo",
      dataIndex: "adjustmentDate",
      key: "adjustmentDate",
      render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    { title: "Người kiểm", dataIndex: "createdByName", key: "createdByName" },

    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)} // ✅ Gọi modal chi tiết
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
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
        <h2>Quản lý phiếu kiểm kho</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpenModal(true)}
        >
          Tạo phiếu mới
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={adjustments}
        loading={loading}
        bordered
      />

      <AdjustmentModal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => {
          setOpenModal(false);
          fetchAdjustments();
        }}
      />

      {/* Modal xem chi tiết */}
      <AdjustmentViewModal
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        adjustment={selectedAdjustment}
      />
    </div>
  );
}
