import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Tag } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import GoodsIssuseService from "../service/GoodsIssueService";
import dayjs from "dayjs";
import GoodsIssueModal from "../components/GoodsIssueModal";
import GoodsIssueViewModal from "../components/GoodsIssueViewModal";
import TableFilter from "../components/TableFilter";

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

  const [filteredGoodsIssues, setFilteredGoodsIssues] = useState([]);

  // 🔹 Lấy danh sách phiếu xuất
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await GoodsIssuseService.getAll();
      const sorted = (data || []).sort(
        (a, b) => new Date(b.issueDate) - new Date(a.issueDate) // mới → cũ
      );

      setIssues(sorted);
      setFilteredGoodsIssues(sorted);
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
      if (payload.issueType === "CANCEL") {
        await GoodsIssuseService.cancelGoods(payload);
      } else {
        await GoodsIssuseService.create(payload);
      }
      await fetchIssues();
      form.resetFields();
      resetProducts();
      setModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi tạo phiếu:", error);
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

  // 🔹 Xuất Excel
  const handleExportExcel = async () => {
    try {
      const blob = new Blob([await GoodsIssuseService.exportExcel()], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "goods_issues.xlsx");
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
      const response = await GoodsIssuseService.exportPdf(record.id);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${record.issueCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export PDF failed:", err);
    }
  };

  const columns = [
    { title: "Mã phiếu", dataIndex: "issueCode" },
    {
      title: "Ngày xuất",
      dataIndex: "issueDate",
      sorter: (a, b) => new Date(a.issueDate) - new Date(b.issueDate),
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (v) => (v ? v.toLocaleString() + " ₫" : "-"),
    },
    { title: "Khách hàng", dataIndex: "customerName" },
    { title: "Người lập phiếu", dataIndex: "createdByName" },
    {
      title: "Loại",
      dataIndex: "issueType",
      render: (type) => {
        let color = "default";
        let label = type;
        switch (type) {
          case "SALE":
            color = "green";
            label = "Bán hàng";
            break;
          case "CANCEL":
            color = "red";
            label = "Hủy hàng";
            break;
          default:
            color = "blue";
            label = "Khác";
            break;
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
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
          <Button icon={<FilePdfOutlined />} onClick={() => handleExportPdf(r)}>
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
        }}
      >
        <h2>
          <b>XUẤT KHO</b>
        </h2>
        <TableFilter
          data={issues}
          onFilter={setFilteredGoodsIssues}
          searchFields={["issueCode", "partnerName", "createdByName"]}
          dateFilters={[
            {
              field: "issueDate",
              placeholder: ["Từ ngày", "Đến ngày"],
              mode: "range",
            },
          ]}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            Thêm
          </Button>
        </div>
      </div>

      <Table
        rowKey="id"
        dataSource={filteredGoodsIssues}
        columns={columns}
        pagination={{ pageSize: 6 }}
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
        goodsIssue={selectedIssue}
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
    </>
  );
}
