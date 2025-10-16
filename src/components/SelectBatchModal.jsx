import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  InputNumber,
  Select,
  Button,
  message,
  Tag,
  Alert,
  Divider,
} from "antd";
import ProductService from "../service/ProductService";
import ToastService from "../service/ToastService";

export default function SelectBatchModal({
  open,
  onCancel,
  product,
  onSelect,
}) {
  const [batches, setBatches] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product?.id) {
      setLoading(true);
      ProductService.getInventoryByProductId(product.id)
        .then((res) => {
          const mapped = (res || []).map((b) => ({
            ...b,
            key: b.id,
            selectedUnit:
              product.conversions.find((c) => c.ratioToBase === 1) ||
              product.conversions[0],
            quantity: 1,
          }));
          setBatches(mapped);
        })
        .finally(() => setLoading(false));
    }
  }, [product]);

  const getMaxQuantity = (record) => {
    const unit = record.selectedUnit;
    if (!unit) return 0;
    return (
      Math.floor((record.remainingQuantity / unit.ratioToBase) * 100) / 100
    );
  };

  const handleUnitChange = (batchId, unitId) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              selectedUnit: product.conversions.find((c) => c.id === unitId),
              quantity: 1,
            }
          : b
      )
    );
  };

  const handleQuantityChange = (batchId, value) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, quantity: value } : b))
    );
  };

  const handleConfirm = () => {
    if (selectedRows.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 lô hàng!");
      ToastService.warning("Vui lòng chọn ít nhất 1 lô hàng!");
      return;
    }

    try {
      const selectedBatchData = batches
        .filter((b) => selectedRows.includes(b.id))
        .map((b) => {
          const maxQ = getMaxQuantity(b);
          if (!b.selectedUnit || !b.quantity || b.quantity <= 0) {
            throw new Error(`Lô ${b.batchCode}: số lượng không hợp lệ`);
          }
          if (b.quantity > maxQ) {
            throw new Error(
              `Lô ${b.batchCode}: vượt quá SL tối đa ${maxQ} ${b.selectedUnit.unitName}`
            );
          }

          return {
            id: `${b.id}_${b.selectedUnit.id}`,
            batchId: b.id,
            batchCode: b.batchCode,
            productId: product.id,
            productName: product.name,
            inventoryBatchId: b.id,
            unitConversionId: b.selectedUnit.id,
            unitName: b.selectedUnit.unitName,
            ratioToBase: b.selectedUnit.ratioToBase,
            quantity: b.quantity,
            remainingQuantity: b.remainingQuantity,
            maxQuantity: maxQ,
            locationName: b.locationName,
            unitPrice: b.unitCost || 0,
          };
        });

      // ✅ Kiểm tra trùng batch: tổng số lượng quy đổi ra đơn vị gốc
      const overLimitBatches = [];
      const batchTotalMap = {};

      for (const batch of selectedBatchData) {
        const totalBaseQty =
          (batchTotalMap[batch.batchId] || 0) +
          batch.quantity * batch.ratioToBase;
        batchTotalMap[batch.batchId] = totalBaseQty;

        // Tìm remainingQuantity của batch gốc
        const originalBatch = batches.find((b) => b.id === batch.batchId);
        if (
          originalBatch &&
          totalBaseQty > originalBatch.remainingQuantity + 1e-6
        ) {
          overLimitBatches.push({
            batchCode: batch.batchCode,
            available: originalBatch.remainingQuantity,
          });
        }
      }

      if (overLimitBatches.length > 0) {
        const msg = overLimitBatches
          .map(
            (b) =>
              `Lô ${b.batchCode}: tổng quy đổi vượt quá tồn kho (${b.available})`
          )
          .join("\n");
        throw new Error(msg);
      }

      selectedBatchData.forEach((batch) => onSelect(batch));
      message.success(
        `Đã thêm ${selectedBatchData.length} lô hàng vào phiếu xuất!`
      );
      setSelectedRows([]);
      onCancel();
    } catch (error) {
      message.error(error.message);
      ToastService.error(error.message);
    }
  };

  const columns = [
    {
      title: "Mã lô",
      dataIndex: "batchCode",
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    { title: "Vị trí", dataIndex: "locationName" },
    {
      title: "SL còn (Base)",
      dataIndex: "remainingQuantity",
      render: (qty) => (
        <span style={{ color: qty > 0 ? "#389e0d" : "#cf1322" }}>{qty}</span>
      ),
    },
    {
      title: "Giá vốn (VNĐ)",
      dataIndex: "unitCost",
      render: (value) =>
        value?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Đơn vị xuất",
      dataIndex: "unit",
      render: (_, record) => (
        <Select
          value={record.selectedUnit?.id}
          onChange={(value) => handleUnitChange(record.id, value)}
          options={product.conversions.map((c) => ({
            label: `${c.unitName} (x${c.ratioToBase})`,
            value: c.id,
          }))}
          style={{ width: 110 }}
        />
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (_, record) => (
        <InputNumber
          min={0.01}
          step={0.01}
          precision={2}
          value={record.quantity}
          max={getMaxQuantity(record)}
          onChange={(v) => handleQuantityChange(record.id, v)}
          style={{ width: 110 }}
        />
      ),
    },
    {
      title: "Tối đa",
      render: (_, record) =>
        `${getMaxQuantity(record)} ${record.selectedUnit?.unitName || ""}`,
    },
  ];

  return (
    <Modal
      open={open}
      title={`Chọn lô hàng - ${product?.name || ""}`}
      onCancel={onCancel}
      footer={null}
      width={950}
    >
      {product && (
        <Alert
          message={`Sản phẩm: ${product.name} (${product.sku}) - Đơn vị gốc: ${product.baseUnit}`}
          type="info"
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        columns={columns}
        dataSource={batches}
        loading={loading}
        rowKey="id"
        pagination={false}
        rowSelection={{
          type: "checkbox",
          onChange: (keys) => setSelectedRows(keys),
          selectedRowKeys: selectedRows,
        }}
        scroll={{ y: 350 }}
      />

      <Divider />
      <div style={{ textAlign: "right" }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Hủy
        </Button>
        <Button type="primary" onClick={handleConfirm}>
          Thêm vào phiếu
        </Button>
      </div>
    </Modal>
  );
}
