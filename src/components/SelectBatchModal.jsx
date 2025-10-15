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

export default function SelectBatchModal({
  open,
  onCancel,
  product,
  onSelect,
}) {
  const [batches, setBatches] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product?.id) {
      setLoading(true);
      ProductService.getInventoryByProductId(product.id)
        .then((res) => {
          setBatches(res || []);
        })
        .finally(() => setLoading(false));
    }
  }, [product]);

  // Set đơn vị mặc định khi product thay đổi
  useEffect(() => {
    if (product?.conversions?.length > 0) {
      // Mặc định chọn base unit đầu tiên
      const baseUnit =
        product.conversions.find((conv) => conv.ratioToBase === 1) ||
        product.conversions[0];
      setSelectedUnit(baseUnit);
    }
  }, [product]);

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
      title: "Giá nhập",
      dataIndex: "unitCost",
      render: (cost) => (cost ? `$${cost.toLocaleString()}` : "-"),
    },
  ];

  // Tính số lượng tối đa có thể xuất theo đơn vị đã chọn
  const calculateMaxQuantity = () => {
    if (!selectedRow || !selectedUnit) return 0;

    const baseQuantity = selectedRow.remainingQuantity;
    const maxInSelectedUnit = baseQuantity / selectedUnit.ratioToBase;
    return Math.floor(maxInSelectedUnit * 100) / 100; // Làm tròn 2 chữ số
  };

  const handleConfirm = () => {
    if (!selectedRow) {
      message.warning("Vui lòng chọn lô hàng!");
      return;
    }

    if (!selectedUnit) {
      message.warning("Vui lòng chọn đơn vị!");
      return;
    }

    if (quantity <= 0) {
      message.warning("Số lượng phải lớn hơn 0!");
      return;
    }

    const maxQuantity = calculateMaxQuantity();
    if (quantity > maxQuantity) {
      message.warning(
        `Số lượng không được vượt quá ${maxQuantity} ${selectedUnit.unitName}!`
      );
      return;
    }

    // Tạo batch object với đầy đủ thông tin
    const batchData = {
      id: `${selectedRow.batchId}_${selectedUnit.id}`, // Unique key cho table
      batchId: selectedRow.batchId,
      batchCode: selectedRow.batchCode,
      productId: product.id,
      productName: product.name,
      inventoryBatchId: selectedRow.batchId,
      unitConversionId: selectedUnit.id,
      unitName: selectedUnit.unitName,
      ratioToBase: selectedUnit.ratioToBase,
      quantity: quantity,
      remainingQuantity: selectedRow.remainingQuantity,
      maxQuantity: maxQuantity,
      locationName: selectedRow.locationName,
    };

    onSelect(batchData);

    // Reset form
    setSelectedRow(null);
    setQuantity(1);
    message.success("Đã thêm lô hàng vào phiếu xuất!");
  };

  const handleUnitChange = (unitId) => {
    const unit = product.conversions.find((conv) => conv.id === unitId);
    setSelectedUnit(unit);
    // Reset quantity khi đổi đơn vị
    setQuantity(1);
  };

  return (
    <Modal
      open={open}
      title={`Chọn lô hàng - ${product?.name || ""}`}
      onCancel={() => {
        setSelectedRow(null);
        setQuantity(1);
        onCancel();
      }}
      footer={null}
      width={800}
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
        rowKey="batchId"
        loading={loading}
        rowSelection={{
          type: "radio",
          onChange: (_, rows) => {
            setSelectedRow(rows[0]);
            setQuantity(1); // Reset quantity khi chọn lô mới
          },
        }}
        pagination={false}
        scroll={{ y: 250 }}
      />

      {selectedRow && product && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            backgroundColor: "#f5f5f5",
            borderRadius: 6,
          }}
        >
          <h4>Thông tin xuất kho</h4>

          <div style={{ marginBottom: 12 }}>
            <strong>Lô hàng:</strong> {selectedRow.batchCode} |
            <strong> Vị trí:</strong> {selectedRow.locationName} |
            <strong> Tồn kho (base):</strong> {selectedRow.remainingQuantity}{" "}
            {product.baseUnit}
          </div>

          <Divider />

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                Đơn vị xuất
              </div>
              <Select
                style={{ width: 150 }}
                value={selectedUnit?.id}
                onChange={handleUnitChange}
                options={product.conversions.map((conv) => ({
                  label: `${conv.unitName} (1${conv.unitName} = ${conv.ratioToBase}${product.baseUnit})`,
                  value: conv.id,
                }))}
              />
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                Số lượng xuất{" "}
                {selectedUnit &&
                  `(Tối đa: ${calculateMaxQuantity()} ${
                    selectedUnit.unitName
                  })`}
              </div>
              <InputNumber
                style={{ width: 150 }}
                min={0.01}
                max={calculateMaxQuantity()}
                value={quantity}
                onChange={setQuantity}
                step={0.01}
                precision={2}
              />
            </div>

            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={!selectedUnit}
            >
              Thêm vào phiếu
            </Button>
          </div>

          {selectedUnit && quantity > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
              <strong>Quy đổi:</strong> {quantity} {selectedUnit.unitName} ={" "}
              {quantity * selectedUnit.ratioToBase} {product.baseUnit}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
