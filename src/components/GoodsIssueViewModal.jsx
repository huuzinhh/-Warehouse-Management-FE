import React from "react";
import { Modal, Descriptions, Table, Tag } from "antd";
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
      title: "Đơn vị hiển thị",
      dataIndex: "displayUnit",
      key: "displayUnit",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (v) => v?.toLocaleString(),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (v) => v?.toLocaleString() + " ₫",
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v) => v?.toLocaleString() + " ₫",
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={850}
      title={`Chi tiết phiếu xuất kho (${goodsIssue.issueCode})`}
    >
      <Descriptions
        bordered
        size="small"
        column={2}
        labelStyle={{ fontWeight: 600, width: 200 }}
      >
        <Descriptions.Item label="Mã phiếu xuất">
          {goodsIssue.issueCode}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày xuất">
          {dayjs(goodsIssue.issueDate).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>

        <Descriptions.Item label="Loại xuất kho">
          <Tag color={goodsIssue.issueType === "SALE" ? "blue" : "green"}>
            {goodsIssue.issueType === "SALE"
              ? "Bán hàng"
              : goodsIssue.issueType}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Khách hàng">
          {goodsIssue.customerName || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Người lập phiếu">
          {goodsIssue.createdByName}
        </Descriptions.Item>

        <Descriptions.Item label="Tổng tiền">
          {goodsIssue.totalAmount?.toLocaleString() + " ₫"}
        </Descriptions.Item>
      </Descriptions>

      <h3 style={{ marginTop: 20 }}>Chi tiết hàng xuất</h3>
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
