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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ProductService from "../service/ProductService";
import PartnerService from "../service/PartnerService";
import LocationService from "../service/LocationService";
import ProductModal from "./ProductModal";
import { getUserIdFromToken } from "../service/localStorageService";

const { Option } = Select;

export default function GoodsReceiptModal({ open, onCancel, onOk, loading }) {
  const [form] = Form.useForm();
  const [productList, setProductList] = useState([]);
  const [products, setProducts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProducts();
      fetchPartners();
      fetchLocations();
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

  const fetchPartners = async () => {
    try {
      const partnerData = await PartnerService.getAll();
      const supplier = partnerData.filter(
        (item) => item.partnerType === "SUPPLIER"
      );
      setPartners(supplier || []);
    } catch (error) {
      console.error("Fetch partners error:", error);
      message.error("Không thể tải danh sách nhà cung cấp");
    }
  };

  const fetchLocations = async () => {
    try {
      const locationData = await LocationService.getAll();
      setLocations(locationData || []);
    } catch (error) {
      console.error("Fetch locations error:", error);
      message.error("Không thể tải danh sách vị trí");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductUnits = (product) => {
    if (!product) return [];

    const units = [];

    if (product.baseUnit) {
      units.push({
        unitName: product.baseUnit,
        ratioToBase: 1,
        isBaseUnit: true,
        conversionId: product.conversions?.find((c) => c.ratioToBase === 1)?.id,
      });
    }

    if (product.conversions && product.conversions.length > 0) {
      product.conversions.forEach((conversion) => {
        if (conversion.ratioToBase !== 1) {
          units.push({
            unitName: conversion.unitName,
            ratioToBase: conversion.ratioToBase,
            isBaseUnit: false,
            conversionId: conversion.id,
          });
        }
      });
    }

    return units;
  };

  const handleSelectProduct = (value, option) => {
    const selectedProduct = option.product;
    const productUnits = getProductUnits(selectedProduct);

    const existingProduct = productList.find(
      (p) => p.productId === selectedProduct.id
    );
    if (existingProduct) {
      message.warning("Sản phẩm đã có trong danh sách");
      return;
    }

    const newProduct = {
      key: Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: 1,
      unitPrice: 0,
      selectedUnit: productUnits[0]?.unitName || selectedProduct.baseUnit,
      selectedUnitConversionId: productUnits[0]?.conversionId,
      selectedLocationId: locations[0]?.id,
      baseUnit: selectedProduct.baseUnit,
      availableUnits: productUnits,
    };

    setProductList([...productList, newProduct]);
    setSearchTerm("");
  };

  const handleQuantityChange = (key, value) => {
    if (value <= 0) {
      return;
    }
    setProductList((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: value } : item
      )
    );
  };

  const handleUnitPriceChange = (key, value) => {
    if (value < 0) {
      return;
    }
    setProductList((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, unitPrice: value } : item
      )
    );
  };

  const handleUnitChange = (key, value, option) => {
    const product = productList.find((item) => item.key === key);
    const selectedUnit = product.availableUnits?.find(
      (unit) => unit.unitName === value
    );

    setProductList((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              selectedUnit: value,
              selectedUnitConversionId: selectedUnit?.conversionId,
            }
          : item
      )
    );
  };

  const handleLocationChange = (key, value) => {
    setProductList((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, selectedLocationId: value } : item
      )
    );
  };

  const removeProduct = (key) => {
    setProductList((prev) => prev.filter((p) => p.key !== key));
  };

  const handleProductAdded = (newProduct) => {
    fetchProducts();
    setProductModalOpen(false);

    const productUnits = getProductUnits(newProduct);
    const productToAdd = {
      key: Date.now(),
      productId: newProduct.id,
      productName: newProduct.name,
      sku: newProduct.sku,
      quantity: 1,
      unitPrice: 0,
      selectedUnit: productUnits[0]?.unitName || newProduct.baseUnit,
      selectedUnitConversionId: productUnits[0]?.conversionId,
      selectedLocationId: locations[0]?.id,
      baseUnit: newProduct.baseUnit,
      availableUnits: productUnits,
    };

    setProductList((prev) => [...prev, productToAdd]);
  };

  // Columns hiển thị sản phẩm trong phiếu nhập - không cố định width để tự động co giãn
  const productColumns = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Vị trí",
      key: "location",
      render: (_, record) => (
        <Select
          value={record.selectedLocationId}
          onChange={(value) => handleLocationChange(record.key, value)}
          style={{ width: "100%", minWidth: "120px" }}
          placeholder="Chọn vị trí"
          size="middle"
        >
          {locations.map((location) => (
            <Option key={location.id} value={location.id}>
              {location.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Đơn vị nhập",
      key: "unit",
      render: (_, record) => (
        <Select
          value={record.selectedUnit}
          onChange={(value, option) =>
            handleUnitChange(record.key, value, option)
          }
          style={{ width: "100%", minWidth: "120px" }}
          size="middle"
        >
          {record.availableUnits?.map((unit) => (
            <Option key={unit.unitName} value={unit.unitName}>
              {unit.unitName} {unit.isBaseUnit && "(Cơ bản)"}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <InputNumber
          value={quantity}
          min={0.001}
          step={1}
          onChange={(value) => handleQuantityChange(record.key, value)}
          style={{ width: "100%", minWidth: "80px" }}
          precision={3}
          size="middle"
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (unitPrice, record) => (
        <InputNumber
          value={unitPrice}
          min={0}
          onChange={(value) => handleUnitPriceChange(record.key, value)}
          style={{ width: "100%", minWidth: "120px" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/,/g, "")}
          addonAfter="₫"
          size="middle"
        />
      ),
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_, record) => {
        const total = record.quantity * record.unitPrice;
        return <strong>{total?.toLocaleString()} ₫</strong>;
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
          onClick={() => removeProduct(record.key)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  // Tính tổng tiền tự động
  const totalAmount = productList.reduce(
    (sum, product) => sum + product.quantity * product.unitPrice,
    0
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (productList.length === 0) {
        return;
      }

      const productsWithoutPrice = productList.filter((p) => p.unitPrice <= 0);
      if (productsWithoutPrice.length > 0) {
        return;
      }

      if (!values.partnerId) {
        return;
      }

      const productsWithoutLocation = productList.filter(
        (p) => !p.selectedLocationId
      );
      if (productsWithoutLocation.length > 0) {
        return;
      }

      const generateReceiptCode = () => {
        const now = new Date();
        const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
        const randomNum = Math.floor(Math.random() * 900 + 100);
        return `PN${yyyymmdd}${randomNum}`;
      };

      const receiptCode = values.receiptCode?.trim() || generateReceiptCode();

      const payload = {
        receiptCode: receiptCode,
        partnerId: values.partnerId,
        createdById: getUserIdFromToken(),
        receiptDate: values.receiptDate?.format("YYYY-MM-DDTHH:mm:ss"),
        paidAmount: values.paidAmount || 0,
        totalAmount: totalAmount,
        details: productList.map((product) => {
          return {
            productId: product.productId,
            locationId: product.selectedLocationId,
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            unitConversionId: product.selectedUnitConversionId,
          };
        }),
      };

      console.log("Payload gửi đi:", payload);

      onOk(payload, form, () => {
        setProductList([]);
        setSearchTerm("");
        form.resetFields();
      });
    } catch (err) {
      console.error("Validation error:", err);
    }
  };

  return (
    <>
      <Modal
        title="Thêm phiếu nhập kho"
        open={open}
        onCancel={() => {
          form.resetFields();
          onCancel();
          setProductList([]);
          setSearchTerm("");
        }}
        onOk={handleOk}
        confirmLoading={loading}
        okText="Lưu phiếu nhập"
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
          {" "}
          <Col span={5}>
            <Card title="Thông tin cơ bản" bordered={false} size="middle">
              <Form form={form} layout="vertical">
                <Form.Item label="Mã phiếu nhập" name="receiptCode">
                  <Input
                    placeholder="VD: PN0001 hoặc để trống để tự tạo"
                    size="middle"
                  />
                </Form.Item>

                <Form.Item
                  label="Nhà cung cấp"
                  name="partnerId"
                  rules={[
                    { required: true, message: "Vui lòng chọn nhà cung cấp" },
                  ]}
                >
                  <Select
                    placeholder="Chọn nhà cung cấp"
                    showSearch
                    size="middle"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {partners.map((partner) => (
                      <Option key={partner.id} value={partner.id}>
                        {partner.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Ngày nhập"
                  name="receiptDate"
                  rules={[{ required: true, message: "Chọn ngày nhập" }]}
                >
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    style={{ width: "100%" }}
                    size="middle"
                    defaultValue={dayjs()}
                  />
                </Form.Item>

                <Form.Item label="Tổng tiền">
                  <InputNumber
                    value={totalAmount}
                    style={{ width: "100%" }}
                    size="middle"
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " ₫"
                    }
                    parser={(v) => v.replace(/[₫,\s]/g, "")}
                    disabled
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Tổng tiền được tính tự động
                  </div>
                </Form.Item>

                <Form.Item
                  label="Đã thanh toán"
                  name="paidAmount"
                  rules={[
                    { required: true, message: "Vui lòng nhập số tiền đã trả" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={totalAmount}
                    style={{ width: "100%" }}
                    size="middle"
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(v) => v.replace(/,/g, "")}
                    placeholder="Nhập số tiền đã thanh toán"
                    addonAfter="₫"
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>
          {/* Cột danh sách sản phẩm - chiếm nhiều không gian hơn */}
          <Col span={19}>
            <Card
              title="Danh sách sản phẩm"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setProductModalOpen(true)}
                  size="middle"
                >
                  Thêm sản phẩm mới
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
                    placeholder="Tìm kiếm sản phẩm..."
                    size="middle"
                  />
                </AutoComplete>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
                >
                  Gõ tên hoặc SKU sản phẩm và click chọn để thêm vào danh sách
                </div>
              </div>

              <Table
                dataSource={productList}
                columns={productColumns}
                rowKey="key"
                pagination={false}
                scroll={{ y: 400 }}
                size="middle"
                locale={{
                  emptyText:
                    "Chưa có sản phẩm nào. Tìm kiếm sản phẩm hoặc thêm sản phẩm mới.",
                }}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6}>
                        <strong>Tổng cộng</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} colSpan={2}>
                        <strong>{totalAmount?.toLocaleString()} ₫</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Modal>

      <ProductModal
        open={productModalOpen}
        onCancel={() => setProductModalOpen(false)}
        onOk={handleProductAdded}
        mode="create"
      />
    </>
  );
}
