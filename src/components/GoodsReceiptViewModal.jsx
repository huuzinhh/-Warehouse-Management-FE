import React from "react";
import { Modal, Table, Descriptions } from "antd";
import dayjs from "dayjs";

export default function GoodsReceiptViewModal({ open, onCancel, receipt }) {
  if (!receipt) return null;

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
      align: "center",
      width: 70,
    },
    { title: "Tên sản phẩm", dataIndex: "productName" },
    { title: "Đơn vị", dataIndex: "displayUnit" },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (v) => v?.toLocaleString(),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      render: (v) => v?.toLocaleString() + " ₫",
    },
    {
      title: "Thành tiền",
      render: (_, r) =>
        ((r.quantity || 0) * (r.unitPrice || 0)).toLocaleString() + " ₫",
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Chi tiết phiếu nhập"
      footer={null}
      width={800}
    >
      <Descriptions
        bordered
        size="small"
        column={2}
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="Mã phiếu">
          {receipt.receiptCode}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày nhập">
          {receipt.receiptDate
            ? dayjs(receipt.receiptDate).format("DD/MM/YYYY HH:mm")
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Nhà cung cấp">
          {receipt.partnerName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Người lập phiếu">
          {receipt.createdByName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền" span={2}>
          <strong>{receipt.totalAmount?.toLocaleString()} ₫</strong>
        </Descriptions.Item>
      </Descriptions>

      <Table
        rowKey={(r, i) => i}
        columns={columns}
        dataSource={receipt.details || []}
        pagination={false}
        bordered
        size="small"
      />
    </Modal>
  );
}
