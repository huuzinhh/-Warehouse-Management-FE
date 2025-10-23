import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Space, message } from "antd";
import axiosInstance from "../service/axiosInstance";
import BatchQRCodeModal from "../components/BatchQRCodeModal";

export default function InventoryBatch() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await axiosInstance.get("/api/inventory-batches");
      console.log("res: ", res);
      console.log("res.result: ", res.result);

      setBatches(res.result || []);
    } catch (e) {
      message.error("Không thể tải danh sách lô hàng!");
    }
  };

  const columns = [
    {
      title: "Mã lô",
      dataIndex: "batchCode",
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    { title: "Sản phẩm", dataIndex: "productName" },
    { title: "Vị trí kho", dataIndex: "locationName" },
    {
      title: "Số lượng ban đầu",
      dataIndex: "initialQuantity",
      align: "center",
    },
    {
      title: "Số lượng còn",
      dataIndex: "remainingQuantity",
      align: "center",
    },
    {
      title: "Giá nhập",
      dataIndex: "unitCost",
      align: "right",
      render: (v) => v.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setSelectedBatch(record);
              setShowQR(true);
            }}
          >
            Xem mã QR
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={batches}
        pagination={{ pageSize: 8 }}
      />

      <BatchQRCodeModal
        open={showQR}
        onCancel={() => setShowQR(false)}
        batch={selectedBatch}
      />
    </>
  );
}
