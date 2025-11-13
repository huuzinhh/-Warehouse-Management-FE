import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Tag, message } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
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

  // ✅ Thêm state cho modal xóa
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  // ===== Gọi API lấy danh sách phiếu kiểm kho =====
  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const res = await AdjustmentService.getAll();
      console.log("res: ", res);
      setAdjustments(res || []);
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
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
  };

  const handleDeleteConfirmOk = async () => {
    if (!deleteRecord) return;
    try {
      await AdjustmentService.delete(deleteRecord.id);
      message.success("Đã xóa phiếu kiểm kho!");
      fetchAdjustments();
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Xóa thất bại!");
    } finally {
      setIsDeleteConfirmVisible(false);
      setDeleteRecord(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = new Blob([await AdjustmentService.exportExcel()], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "adjustments.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export Excel failed:", err);
    }
  };

  // 🔹 Xuất PDF (cho từng phiếu)
  const handleExportPdf = async (record) => {
    try {
      const response = await AdjustmentService.exportPdf(record.id);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${record.code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export PDF failed:", err);
    }
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
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            Xem
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={() => handleExportPdf(record)}
          >
            In
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
          marginBottom: 16,
        }}
      >
        <h2>
          <b>KIỂM KÊ KHO</b>
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenModal(true)}
          >
            Thêm
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={adjustments}
        loading={loading}
        bordered
        pagination={{ pageSize: 6 }}
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

      {/* ✅ Modal xác nhận xóa - giống GoodsIssue */}
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
          Bạn có chắc muốn xóa phiếu kiểm kho{" "}
          <strong>{deleteRecord?.code}</strong> không?
        </p>
      </Modal>
    </>
  );
}
