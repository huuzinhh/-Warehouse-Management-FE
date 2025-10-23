import React from "react";
import { Modal, Descriptions, Table, Tag, Divider } from "antd";
import dayjs from "dayjs";

export default function GoodsIssueViewModal({ open, onCancel, goodsIssue }) {
  if (!goodsIssue) return null;

  const columns = [
    {
      title: "Mã lô",
      dataIndex: "batchCode",
      key: "batchCode",
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Vị trí",
      dataIndex: "locationName",
      key: "locationName",
      render: (v) => v || "-",
    },
    {
      title: "Đơn vị hiển thị",
      dataIndex: "displayUnit",
      key: "displayUnit",
      width: 120,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      render: (v) => (v != null ? v.toLocaleString() : "-"),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right",
      render: (v) => (v != null ? v.toLocaleString("vi-VN") + " ₫" : "-"),
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right",
      render: (v) => (v != null ? v.toLocaleString("vi-VN") + " ₫" : "-"),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      title={
        <span style={{ fontWeight: 600 }}>
          Chi tiết phiếu xuất kho ({goodsIssue.issueCode})
        </span>
      }
    >
      <Descriptions
        bordered
        size="small"
        column={2}
        labelStyle={{ fontWeight: 600, width: 180 }}
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="Mã phiếu xuất">
          {goodsIssue.issueCode}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày xuất">
          {dayjs(goodsIssue.issueDate).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>

        <Descriptions.Item label="Loại xuất kho">
          <Tag color={goodsIssue.issueType === "SALE" ? "green" : "red"}>
            {goodsIssue.issueType === "SALE" ? "Bán hàng" : "Hủy hàng"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Khách hàng">
          {goodsIssue.customerName || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Người lập phiếu">
          {goodsIssue.createdByName}
        </Descriptions.Item>

        <Descriptions.Item label="Tổng tiền">
          {goodsIssue.totalAmount?.toLocaleString("vi-VN") + " ₫"}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: "12px 0" }} />

      <h3 style={{ marginBottom: 10 }}>Chi tiết hàng xuất</h3>
      <Table
        dataSource={goodsIssue.details || []}
        columns={columns}
        pagination={false}
        rowKey={(r) => r.batchCode + r.productName}
        bordered
        size="small"
      />
    </Modal>
  );
}
