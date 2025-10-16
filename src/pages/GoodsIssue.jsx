import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import GoodsIssuseService from "../service/GoodsIssueService";
import dayjs from "dayjs";
import GoodsIssueModal from "../components/GoodsIssueModal";
import GoodsIssueViewModal from "../components/GoodsIssueViewModal";
import { getUserIdFromToken } from "../service/localStorageService";

export default function GoodsIssue() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewVisible, setViewVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // ✅ Modal xác nhận xóa
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  // 🔹 Lấy danh sách phiếu xuất
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await GoodsIssuseService.getAll();
      setIssues(data || []);
    } catch {
      // axiosInstance đã hiển thị lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // 🔹 Tạo phiếu xuất
  const handleCreateIssue = async (payload, form, resetProducts) => {
    try {
      setSubmitLoading(true);
      await GoodsIssuseService.create(payload);
      fetchIssues();
      form.resetFields();
      resetProducts();
      setModalVisible(false);
    } catch (error) {
      // axiosInstance đã hiển thị lỗi
      console.error("Lỗi validate form:", error);
      message.error("Vui lòng điền đầy đủ thông tin phiếu xuất!");
    } finally {
      setSubmitLoading(false);
    }
  };

  // 🔹 Xử lý xóa
  const handleDelete = (record) => {
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
  };

  const handleDeleteConfirmOk = async () => {
    if (!deleteRecord) return;
    try {
      await GoodsIssuseService.delete(deleteRecord.id);
      fetchIssues();
    } catch {
      // axiosInstance đã hiển thị lỗi
    } finally {
      setIsDeleteConfirmVisible(false);
      setDeleteRecord(null);
    }
  };

  const columns = [
    { title: "Mã phiếu", dataIndex: "issueCode" },
    {
      title: "Ngày xuất",
      dataIndex: "issueDate",
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => (v ? v.toLocaleString() + " ₫" : "-"),
    },
    { title: "Khách hàng", dataIndex: "customerName" },
    { title: "Người lập phiếu", dataIndex: "createdByName" },
    {
      title: "Thao tác",
      render: (_, r) => (
        <Space>
          <Button
            onClick={async () => {
              try {
                const detail = await GoodsIssuseService.getById(r.id);
                setSelectedIssue(detail);
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
        <h2>Quản lý phiếu xuất kho</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Thêm phiếu xuất
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={issues}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
      />

      {/* 🔹 Modal tạo phiếu */}
      <GoodsIssueModal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreateIssue}
        loading={submitLoading}
      />

      {/* 🔹 Modal xem chi tiết */}
      <GoodsIssueViewModal
        open={viewVisible}
        onCancel={() => {
          setViewVisible(false);
          setSelectedIssue(null);
        }}
        goodsIssue={selectedIssue} // ✅ đổi từ issue → goodsIssue
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
          Bạn có chắc muốn xóa phiếu xuất{" "}
          <strong>{deleteRecord?.issueCode}</strong> không?
        </p>
      </Modal>
    </div>
  );
}
