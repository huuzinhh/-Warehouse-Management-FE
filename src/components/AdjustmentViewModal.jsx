import React from "react";
import { Modal, Descriptions, Table, Tag, Divider } from "antd";
import dayjs from "dayjs";

export default function AdjustmentViewModal({ open, onCancel, adjustment }) {
  if (!adjustment) return null;

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
      ellipsis: true,
    },
    {
      title: "Loại điều chỉnh",
      dataIndex: "type",
      key: "type",
      render: (v) => {
        const typeConfig = {
          INCREASE: { color: "green", text: "Tăng" },
          DECREASE: { color: "red", text: "Giảm" },
          NO_CHANGE: { color: "blue", text: "Không thay đổi" },
        };

        const config = typeConfig[v] || {
          color: "default",
          text: v || "Không xác định",
        };

        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Tồn hệ thống",
      dataIndex: "systemQuantity",
      key: "systemQuantity",
      align: "right",
      render: (v) => (v != null ? v.toLocaleString() : "-"),
    },
    {
      title: "Thực tế",
      dataIndex: "actualQuantity",
      key: "actualQuantity",
      align: "right",
      render: (v) => (v != null ? v.toLocaleString() : "-"),
    },
    {
      title: "Chênh lệch",
      dataIndex: "differenceQuantity",
      key: "differenceQuantity",
      align: "right",
      render: (v) =>
        v === 0 ? (
          "-"
        ) : (
          <Tag color={v > 0 ? "green" : "red"}>{v.toLocaleString()}</Tag>
        ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitCost",
      key: "unitCost",
      align: "right",
      render: (v) => (v != null ? v.toLocaleString("vi-VN") + " ₫" : "-"),
    },
    {
      title: "Giá trị chênh lệch",
      dataIndex: "totalDifference",
      key: "totalDifference",
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
          Chi tiết phiếu điều chỉnh ({adjustment.code})
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
        <Descriptions.Item label="Mã phiếu">
          {adjustment.code}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày điều chỉnh">
          {dayjs(adjustment.adjustmentDate).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>

        <Descriptions.Item label="Người lập phiếu">
          {adjustment.createdByName || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          {adjustment.cancelled ? (
            <Tag color="red">Đã hủy</Tag>
          ) : (
            <Tag color="green">Hoàn thành</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Tổng giá trị chênh lệch" span={2}>
          {adjustment.totalDifference?.toLocaleString("vi-VN") + " ₫"}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: "12px 0" }} />

      <h3 style={{ marginBottom: 10 }}>Chi tiết điều chỉnh</h3>
      <Table
        dataSource={adjustment.details || []}
        columns={columns}
        pagination={false}
        rowKey={(r) => `${r.batchCode}-${r.id}`}
        bordered
        size="small"
      />
    </Modal>
  );
}
