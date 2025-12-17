import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Space, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance";
import BatchQRCodeModal from "../components/BatchQRCodeModal";
import TableFilter from "../components/TableFilter";
import dayjs from "dayjs";

export default function InventoryBatch() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [filteredBatches, setFilteredBatches] = useState([]);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const res = await axiosInstance.get("/api/inventory-batches");
      let list = res.result || [];

      //Sort theo productName, sau đó theo batchCode (nếu cần)
      list.sort((a, b) => {
        const nameCompare = a.productName.localeCompare(b.productName, "vi");
        if (nameCompare !== 0) return nameCompare;

        // nếu muốn các batch cùng sản phẩm cũng được sort theo mã lô
        return a.batchCode.localeCompare(b.batchCode, "vi");
      });

      setBatches(list);
      setFilteredBatches(list);
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
    {
      title: "Ngày nhập",
      dataIndex: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      sorter: (a, b) => a.productName.localeCompare(b.productName),
      defaultSortOrder: "ascend",
    },
    {
      title: "Vị trí kho",
      dataIndex: "locationName",
      sorter: (a, b) => a.locationName.localeCompare(b.locationName),
    },
    {
      title: "Số lượng ban đầu",
      dataIndex: "initialQuantity",
      align: "center",
      sorter: (a, b) => a.initialQuantity - b.initialQuantity,
    },
    {
      title: "Số lượng còn",
      dataIndex: "remainingQuantity",
      align: "center",
      sorter: (a, b) => a.remainingQuantity - b.remainingQuantity,
    },
    {
      title: "Giá nhập",
      dataIndex: "unitCost",
      align: "right",
      render: (v) => v.toLocaleString("vi-VN") + " ₫",
      sorter: (a, b) => a.unitCost - b.unitCost,
    },
    {
      title: "Trạng thái",
      dataIndex: "slowMoving",
      key: "slowMoving",
      align: "center",
      // Cho phép lọc nhanh các lô hàng đang bị cảnh báo
      filters: [
        { text: "Chậm luân chuyển", value: true },
        { text: "Bình thường", value: false },
      ],
      onFilter: (value, record) => record.isSlowMoving === value,
      render: (isSlowMoving) =>
        isSlowMoving ? (
          <Tag color="error" style={{ fontWeight: "bold" }}>
            CHẬM LUÂN CHUYỂN
          </Tag>
        ) : (
          <Tag color="success">Bình thường</Tag>
        ),
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedBatch(record);
              setShowQR(true);
            }}
          >
            QR
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
          <b>TỒN KHO</b>
        </h2>
        <TableFilter
          data={batches}
          onFilter={setFilteredBatches}
          searchFields={["batchCode", "productName", "locationName"]}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredBatches}
        pagination={{ pageSize: 7 }}
        onRow={(record) => ({
          style: {
            backgroundColor: record.slowMoving ? "#fff1f0" : "inherit",
            transition: "all 0.3s",
          },
        })}
      />

      <BatchQRCodeModal
        open={showQR}
        onCancel={() => setShowQR(false)}
        batch={selectedBatch}
      />
    </>
  );
}
