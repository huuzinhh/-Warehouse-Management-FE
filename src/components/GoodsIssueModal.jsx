import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Row,
  Col,
  Card,
  Table,
  message,
  AutoComplete,
  Select,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ProductService from "../service/ProductService";
import PartnerService from "../service/PartnerService";
import SelectBatchModal from "./SelectBatchModal";
import { getUserIdFromToken } from "../service/localStorageService";

const { Option } = Select;

export default function GoodsIssueModal({ open, onCancel, onOk, loading }) {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (open) {
      fetchProducts();
      fetchCustomers();
    }
  }, [open]);

  const fetchProducts = async () => {
    try {
      const productData = await ProductService.getAll();
      const data = productData.filter((item) => item.active);
      setProducts(data || []);
    } catch (error) {
      console.error("Fetch products error:", error);
      message.error("Không thể tải danh sách sản phẩm");
    }
  };

  const fetchCustomers = async () => {
    try {
      const partnerData = await PartnerService.getAll();
      const customers = partnerData.filter(
        (item) => item.partnerType === "CUSTOMER"
      );
      setCustomers(customers || []);
    } catch (error) {
      console.error("Fetch customers error:", error);
      message.error("Không thể tải danh sách khách hàng");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Khi chọn thêm 1 lô hàng
  const handleAddBatch = (batch) => {
    // Kiểm tra xem lô hàng đã được chọn chưa
    const existingBatch = selectedBatches.find((b) => b.id === batch.id);
    if (existingBatch) {
      message.warning("Lô hàng này đã được chọn!");
      return;
    }

    setSelectedBatches((prev) => [...prev, batch]);
    setSearchTerm("");
    setSelectedProduct(null);
  };

  // ✅ Thay đổi số lượng
  const handleQuantityChange = (batchId, newQuantity) => {
    if (newQuantity <= 0) return;

    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId ? { ...batch, quantity: newQuantity } : batch
      )
    );
  };

  // ✅ Xóa lô hàng
  const handleRemoveBatch = (batchId) => {
    setSelectedBatches((prev) => prev.filter((batch) => batch.id !== batchId));
  };

  // ✅ Tính tổng số lượng base unit
  const calculateTotalBaseQuantity = () => {
    return selectedBatches.reduce((total, batch) => {
      const baseQuantity = batch.quantity * (batch.ratioToBase || 1);
      return total + baseQuantity;
    }, 0);
  };

  // Columns hiển thị lô hàng trong phiếu xuất
  const batchColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      width: 150,
    },
    {
      title: "Mã lô",
      dataIndex: "batchCode",
      key: "batchCode",
      width: 120,
    },
    {
      title: "Vị trí",
      dataIndex: "locationName",
      key: "locationName",
      width: 120,
    },
    {
      title: "Đơn vị",
      dataIndex: "unitName",
      key: "unitName",
      width: 100,
    },
    {
      title: "SL xuất",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (quantity, record) => (
        <InputNumber
          value={quantity}
          min={0.01}
          max={record.maxQuantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
          style={{ width: "100%" }}
          step={0.01}
          precision={2}
          size="middle"
        />
      ),
    },
    {
      title: "SL còn (Base)",
      dataIndex: "remainingQuantity",
      key: "remainingQuantity",
      width: 120,
      render: (qty) => (
        <span style={{ color: qty > 0 ? "#389e0d" : "#cf1322" }}>
          {typeof qty === "number" ? qty.toLocaleString() : "0"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          danger
          size="middle"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveBatch(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  // ✅ Submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedBatches.length === 0) {
        message.error("Vui lòng chọn ít nhất 1 lô hàng để xuất!");
        return;
      }

      // Kiểm tra số lượng hợp lệ
      const invalidBatch = selectedBatches.find(
        (batch) =>
          !batch.quantity ||
          batch.quantity <= 0 ||
          batch.quantity > batch.maxQuantity
      );

      if (invalidBatch) {
        message.error(
          `Số lượng xuất của lô ${invalidBatch.batchCode} không hợp lệ!`
        );
        return;
      }

      const createdById = getUserIdFromToken();

      // ✅ Tạo payload đúng format backend yêu cầu
      const payload = {
        issueCode: values.issueCode || null,
        issueDate:
          values.issueDate?.format("YYYY-MM-DDTHH:mm:ss") ||
          new Date().toISOString(),
        customerId: values.customerId,
        createdById,
        issueType: "SALE",
        amountPaid: 0,
        details: selectedBatches.map((b) => ({
          productId: b.productId,
          inventoryBatchId: b.batchId,
          unitConversionId: b.unitConversionId,
          quantity: b.quantity,
        })),
      };

      console.log("Payload gửi đi:", payload);

      // ✅ Gọi callback để tạo phiếu xuất
      onOk(payload, form, () => {
        setSelectedBatches([]);
        setSearchTerm("");
        form.resetFields();
      });
    } catch (error) {
      console.error("Lỗi validate form:", error);
    }
  };

  const handleSelectProduct = (value, option) => {
    const selectedProduct = option.product;
    setSelectedProduct(selectedProduct);
    setBatchModalOpen(true);
  };

  return (
    <>
      <Modal
        title="Tạo phiếu xuất kho"
        open={open}
        onCancel={() => {
          form.resetFields();
          onCancel();
          setSelectedBatches([]);
          setSearchTerm("");
          setSelectedProduct(null);
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
        okText="Lưu phiếu xuất"
        cancelText="Hủy"
        width="97vw"
        style={{
          maxWidth: "1800px",
          top: 20,
        }}
        bodyStyle={{
          maxHeight: "85vh",
          overflow: "auto",
        }}
      >
        <Row gutter={24}>
          {/* CỘT 1: Thông tin cơ bản */}
          <Col span={5}>
            <Card title="Thông tin phiếu xuất" bordered={false} size="middle">
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Mã phiếu xuất"
                  name="issueCode"
                  rules={[
                    { required: false, message: "Vui lòng nhập mã phiếu" },
                  ]}
                >
                  <Input
                    placeholder="Để trống để tự động tạo mã"
                    size="middle"
                  />
                </Form.Item>

                <Form.Item
                  label="Khách hàng"
                  name="customerId"
                  rules={[
                    { required: true, message: "Vui lòng chọn khách hàng" },
                  ]}
                >
                  <Select
                    placeholder="Chọn khách hàng"
                    showSearch
                    size="middle"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {customers.map((customer) => (
                      <Option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Ngày xuất"
                  name="issueDate"
                  rules={[{ required: true, message: "Chọn ngày xuất" }]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: "100%" }}
                    size="middle"
                    defaultValue={dayjs()}
                  />
                </Form.Item>

                {/* Thống kê */}
                <div style={{ marginBottom: 16 }}>
                  <Statistic
                    title="Tổng số lượng (Base Unit)"
                    value={calculateTotalBaseQuantity()}
                    precision={2}
                    valueStyle={{ fontSize: "16px" }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Statistic
                    title="Số lô hàng"
                    value={selectedBatches.length}
                    valueStyle={{ fontSize: "16px" }}
                  />
                </div>

                {selectedBatches.length > 0 && (
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: "#f0f8ff",
                      borderRadius: "6px",
                      border: "1px solid #d6e4ff",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      <strong>Thông tin:</strong>
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      • {selectedBatches.length} lô hàng
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      • {calculateTotalBaseQuantity().toFixed(2)} tổng SL
                    </div>
                  </div>
                )}
              </Form>
            </Card>
          </Col>

          {/* CỘT 2: Danh sách lô hàng xuất */}
          <Col span={19}>
            <Card
              title="Danh sách lô hàng xuất kho"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    if (!selectedProduct) {
                      message.warning("Vui lòng chọn sản phẩm trước!");
                      return;
                    }
                    setBatchModalOpen(true);
                  }}
                  size="middle"
                  disabled={!selectedProduct}
                >
                  Thêm lô hàng
                </Button>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <AutoComplete
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSelect={handleSelectProduct}
                  options={filteredProducts.map((product) => ({
                    value: product.name,
                    label: (
                      <div>
                        <div>
                          <strong>{product.sku}</strong> - {product.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          Đơn vị: {product.baseUnit} | Quy đổi:{" "}
                          {product.conversions
                            ?.filter((c) => c.ratioToBase !== 1)
                            .map((c) => c.unitName)
                            .join(", ")}
                        </div>
                      </div>
                    ),
                    product: product,
                  }))}
                  style={{ width: "100%" }}
                >
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="Tìm kiếm sản phẩm để chọn lô hàng..."
                    size="middle"
                  />
                </AutoComplete>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Gõ tên hoặc SKU sản phẩm, click chọn để mở modal chọn lô hàng
                </div>
              </div>

              <Table
                dataSource={selectedBatches}
                columns={batchColumns}
                rowKey="id"
                pagination={false}
                scroll={{ y: 400 }}
                size="middle"
                locale={{
                  emptyText:
                    "Chưa có lô hàng nào. Tìm kiếm sản phẩm và chọn lô hàng để xuất kho.",
                }}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4}>
                        <strong>Tổng cộng</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>
                          {calculateTotalBaseQuantity().toFixed(2)}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} colSpan={2}>
                        <strong>{selectedBatches.length} lô hàng</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* Modal chọn lô hàng */}
      <SelectBatchModal
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        product={selectedProduct}
        onSelect={handleAddBatch}
      />
    </>
  );
}
