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
import ToastService from "../service/ToastService";
import GoodsIssuseService from "../service/GoodsIssueService";

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
      message.error("Không thể tải danh sách khách hàng");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBatch = (newBatch) => {
    // Lấy danh sách các batch cùng product + batchCode đã chọn trước đó
    const sameBatches = selectedBatches.filter(
      (b) =>
        b.productId === newBatch.productId && b.batchCode === newBatch.batchCode
    );

    // Tính tổng quy đổi về đơn vị gốc
    const totalBaseQty =
      sameBatches.reduce((sum, b) => sum + b.quantity * b.ratioToBase, 0) +
      newBatch.quantity * newBatch.ratioToBase;

    // Kiểm tra vượt tồn kho
    if (totalBaseQty > newBatch.remainingQuantity + 1e-6) {
      message.error(
        `Lô ${newBatch.batchCode}: tổng SL xuất (${totalBaseQty}) vượt tồn kho (${newBatch.remainingQuantity})`
      );
      ToastService.error(
        `Lô ${newBatch.batchCode}: tổng SL xuất (${totalBaseQty}) vượt tồn kho (${newBatch.remainingQuantity})`
      );
      return;
    }

    // Nếu không vượt thì thêm bình thường
    setSelectedBatches((prev) => [...prev, newBatch]);
    setSearchTerm("");
    setSelectedProduct(null);
  };

  const handleQuantityChange = (batchId, newQuantity) => {
    if (newQuantity <= 0) return;
    setSelectedBatches((prev) =>
      prev.map((batch) =>
        batch.id === batchId ? { ...batch, quantity: newQuantity } : batch
      )
    );
  };

  const handleRemoveBatch = (batchId) => {
    setSelectedBatches((prev) => prev.filter((batch) => batch.id !== batchId));
  };

  const calculateTotalAmount = () =>
    selectedBatches.reduce(
      (sum, b) =>
        sum + (b.unitPrice || 0) * (b.quantity || 0) * (b.ratioToBase || 1),
      0
    );

  const batchColumns = [
    { title: "Sản phẩm", dataIndex: "productName", key: "productName" },
    { title: "Mã lô", dataIndex: "batchCode", key: "batchCode" },
    { title: "Vị trí", dataIndex: "locationName", key: "locationName" },
    { title: "Đơn vị", dataIndex: "unitName", key: "unitName" },
    {
      title: "Giá xuất (VNĐ)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price) =>
        price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "SL xuất",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <InputNumber
          value={quantity}
          min={0.01}
          max={record.maxQuantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
          style={{ width: "100%" }}
          step={0.01}
          precision={2}
        />
      ),
    },
    {
      title: "Thành tiền (VNĐ)",
      key: "amount",
      render: (_, record) => {
        const amount =
          (record.unitPrice || 0) *
          (record.quantity || 0) *
          (record.ratioToBase || 1);
        return (
          <strong>
            {amount.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </strong>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedBatches.length === 0) {
        ToastService.error("Vui lòng chọn ít nhất 1 lô hàng để xuất!");
        return;
      }

      const invalidBatch = selectedBatches.find(
        (b) => !b.quantity || b.quantity <= 0 || b.quantity > b.maxQuantity
      );
      if (invalidBatch) {
        ToastService.error(
          `Số lượng xuất của lô ${invalidBatch.batchCode} không hợp lệ!`
        );
        return;
      }

      const createdById = getUserIdFromToken();
      const generateIssueCode = () => {
        const now = new Date();
        const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
        const randomNum = Math.floor(Math.random() * 900 + 100);
        return `PX${yyyymmdd}${randomNum}`;
      };

      const issueCode = values.issueCode?.trim() || generateIssueCode();
      const issueDate =
        values.issueDate?.format("YYYY-MM-DDTHH:mm:ss") ||
        new Date().toISOString();

      let payload;

      if (values.issueType === "CANCEL") {
        payload = {
          issueCode,
          issueDate,
          createdById,
          issueType: "CANCEL",
          details: selectedBatches.map((b) => ({
            inventoryBatchId: b.batchId,
            unitConversionId: b.unitConversionId,
            quantity: b.quantity,
          })),
        };
      } else {
        payload = {
          issueCode,
          issueDate,
          createdById,
          issueType: values.issueType,
          customerId: values.issueType === "SALE" ? values.customerId : null,
          amountPaid: 0,
          details: selectedBatches.map((b) => ({
            productId: b.productId,
            inventoryBatchId: b.batchId,
            unitConversionId: b.unitConversionId,
            quantity: b.quantity,
          })),
        };
      }

      // ✅ Gọi callback cha thay vì tự xử lý API
      await onOk(payload, form, () => {
        setSelectedBatches([]);
        setSearchTerm("");
        setSelectedProduct(null);
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
        style={{ maxWidth: "1800px", top: 20 }}
        styles={{ body: { maxHeight: "85vh", overflow: "auto" } }}
      >
        <Row gutter={24}>
          {/* CỘT 1 */}
          <Col span={5}>
            <Card title="Thông tin phiếu xuất" bordered={false}>
              <Form form={form} layout="vertical">
                <Form.Item label="Mã phiếu xuất" name="issueCode">
                  <Input placeholder="VD: PX0001 hoặc để trống để tự tạo" />
                </Form.Item>
                <Form.Item
                  label="Loại xuất hàng"
                  name="issueType"
                  initialValue="SALE"
                  rules={[{ required: true, message: "Chọn loại xuất hàng" }]}
                >
                  <Select
                    onChange={(value) => form.setFieldValue("issueType", value)}
                  >
                    <Option value="SALE">Bán hàng</Option>
                    <Option value="CANCEL">Hủy hàng (hư hỏng)</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) =>
                    prev.issueType !== curr.issueType
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue("issueType") === "SALE" && (
                      <Form.Item
                        label="Khách hàng"
                        name="customerId"
                        rules={[{ required: true, message: "Chọn khách hàng" }]}
                      >
                        <Select
                          showSearch
                          placeholder="Chọn khách hàng"
                          optionFilterProp="label"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? "")
                              .toLowerCase()
                              .localeCompare(
                                (optionB?.label ?? "").toLowerCase()
                              )
                          }
                          options={customers.map((c) => ({
                            value: c.id,
                            label: `${c.name} - ${c.phone}`,
                          }))}
                        />
                      </Form.Item>
                    )
                  }
                </Form.Item>

                <Form.Item
                  label="Ngày xuất"
                  name="issueDate"
                  initialValue={dayjs()} // ✅ thay defaultValue bằng initialValue
                  rules={[{ required: true, message: "Chọn ngày xuất" }]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Statistic
                  title="Tổng tiền (VNĐ)"
                  value={calculateTotalAmount()}
                  precision={0}
                  valueStyle={{ color: "#cf1322" }}
                  formatter={(v) =>
                    parseFloat(v).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })
                  }
                />
              </Form>
            </Card>
          </Col>

          {/* CỘT 2 */}
          <Col span={19}>
            <Card
              title="Danh sách lô hàng xuất kho"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  disabled={!selectedProduct}
                  onClick={() => {
                    if (!selectedProduct) {
                      message.warning("Vui lòng chọn sản phẩm trước!");
                      ToastService.warning("Vui lòng chọn sản phẩm trước!");
                      return;
                    }
                    setBatchModalOpen(true);
                  }}
                >
                  Thêm lô hàng
                </Button>
              }
            >
              <AutoComplete
                value={searchTerm}
                onChange={setSearchTerm}
                onSelect={handleSelectProduct}
                options={filteredProducts.map((product) => ({
                  value: product.name,
                  label: (
                    <div>
                      <strong>{product.sku}</strong> - {product.name}
                    </div>
                  ),
                  product,
                }))}
                style={{ width: "100%", marginBottom: 16 }}
              >
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Tìm kiếm sản phẩm để chọn lô hàng..."
                />
              </AutoComplete>

              <Table
                dataSource={selectedBatches}
                columns={batchColumns}
                rowKey="id"
                pagination={false}
                scroll={{ y: 400 }}
              />

              {/* Tổng tiền dưới bảng */}
              <div style={{ textAlign: "right", marginTop: 16 }}>
                <strong style={{ fontSize: "16px" }}>
                  Tổng tiền phiếu xuất:{" "}
                  {calculateTotalAmount().toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </strong>
              </div>
            </Card>
          </Col>
        </Row>
      </Modal>

      <SelectBatchModal
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        product={selectedProduct}
        onSelect={handleAddBatch}
      />
    </>
  );
}
