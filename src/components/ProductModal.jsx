import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Space,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CategoryService from "../service/CategoryService";
import CategoryModal from "./CategoryModal"; // Import CategoryModal

export default function ProductModal({
  open,
  onCancel,
  onOk,
  loading = false,
  mode = "create",
  initialValues = {},
}) {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false); // State cho modal danh mục
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getAll();
      // Lọc chỉ những category có active = true
      const activeCategories = res
        .filter((c) => c.active)
        .map((c) => ({ label: c.name, value: c.id }));
      setCategories(activeCategories);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialValues) {
        // Lọc các conversion có ratioToBase khác 1
        const conversions = initialValues.conversions || [];
        const filtered = conversions
          .filter((c) => c.ratioToBase !== 1)
          .map((c) => ({
            id: c.id, // Đảm bảo ID được truyền vào Form
            unitName: c.unitName,
            ratioToBase: c.ratioToBase,
          }));

        // Set filtered conversions và các giá trị khác
        form.setFieldsValue({
          ...initialValues,
          conversions: filtered,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, mode, initialValues, form]);

  const handleCategorySuccess = (newCategory) => {
    // Refresh danh sách danh mục
    fetchCategories().then(() => {
      // Sau khi fetch xong, tự động chọn danh mục vừa tạo
      if (newCategory && newCategory.id) {
        form.setFieldsValue({
          categoryId: newCategory.id,
        });
      }
    });
    setCategoryModalOpen(false);
  };

  // Hàm validation kiểm tra trùng tên đơn vị
  const validateUnitName = (_, value, fieldName) => {
    const baseUnit = form.getFieldValue("baseUnit");
    const conversions = form.getFieldValue("conversions") || [];

    // Kiểm tra trùng với đơn vị cơ bản
    if (baseUnit && value.toLowerCase() === baseUnit.toLowerCase()) {
      return Promise.reject(
        new Error("Tên đơn vị không được trùng với đơn vị cơ bản")
      );
    }

    // Kiểm tra trùng với các đơn vị khác (trừ chính nó)
    const duplicateCount = conversions.filter((conv, index) => {
      if (index === fieldName) return false;
      return conv?.unitName?.toLowerCase() === value.toLowerCase();
    }).length;

    if (duplicateCount > 0) {
      return Promise.reject(new Error("Tên đơn vị đã tồn tại"));
    }

    return Promise.resolve();
  };

  // Hàm validation cho đơn vị cơ bản
  const validateBaseUnit = (_, value) => {
    const conversions = form.getFieldValue("conversions") || [];
    const duplicate = conversions.some(
      (conv) => conv?.unitName?.toLowerCase() === value.toLowerCase()
    );

    if (duplicate) {
      return Promise.reject(
        new Error("Đơn vị cơ bản không được trùng với đơn vị quy đổi")
      );
    }

    return Promise.resolve();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // ⚠️ KHÔNG filter, KHÔNG map lại
      values.conversions = values.conversions || [];

      onOk(values, form);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  // Hàm xử lý khi thêm đơn vị mới
  const handleAddUnit = () => {
    const conversions = form.getFieldValue("conversions") || [];
    form.setFieldValue("conversions", [...conversions, {}]);
  };

  return (
    <>
      <Modal
        title={mode === "edit" ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={open}
        onCancel={() => {
          form.resetFields();
          onCancel();
        }}
        onOk={handleSubmit}
        okText={mode === "edit" ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        confirmLoading={loading}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã SKU"
            name="sku"
            rules={[{ required: true, message: "Vui lòng nhập mã SKU" }]}
          >
            <Input placeholder="Nhập mã SKU..." />
          </Form.Item>

          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input placeholder="Nhập tên sản phẩm..." />
          </Form.Item>

          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select
              placeholder="Chọn danh mục"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{
                      padding: "8px 12px",
                      borderTop: "1px solid #d9d9d9",
                    }}
                  >
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={() => setCategoryModalOpen(true)}
                      style={{ width: "100%", justifyContent: "flex-start" }}
                    >
                      Thêm danh mục mới
                    </Button>
                  </div>
                </>
              )}
              options={categories}
            />
          </Form.Item>

          <Form.Item label="Đơn vị cơ bản" required>
            <Row gutter={8}>
              <Col flex="auto">
                <Form.Item
                  name="baseUnit"
                  noStyle
                  rules={[
                    { required: true, message: "Vui lòng nhập đơn vị cơ bản" },
                    { validator: validateBaseUnit },
                  ]}
                >
                  <Input placeholder="Ví dụ: gr, hộp, chai, lon,..." />
                </Form.Item>
              </Col>
              <Col>
                <Button type="default" onClick={handleAddUnit}>
                  Thêm đơn vị
                </Button>
              </Col>
            </Row>
          </Form.Item>

          <Form.List name="conversions">
            {(fields, { remove }) => (
              <>
                {fields.length > 0 && (
                  <label
                    style={{
                      fontWeight: 500,
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Đơn vị quy đổi khác
                  </label>
                )}
                {fields.map(({ key, name, ...restField }) => {
                  // Trong mode edit, ẩn các đơn vị có ratioToBase = 1 (đơn vị cơ bản nằm trong conversions)
                  if (mode === "edit") {
                    const conversionValue = form.getFieldValue([
                      "conversions",
                      name,
                    ]);
                    if (conversionValue?.ratioToBase === 1) {
                      return null;
                    }
                  }

                  return (
                    <Row
                      key={key}
                      gutter={8}
                      style={{ marginBottom: 8 }}
                      align="middle"
                    >
                      {/* --- QUAN TRỌNG: Thêm trường id ẩn để Backend định danh --- */}
                      <Form.Item {...restField} name={[name, "id"]} hidden>
                        <Input />
                      </Form.Item>
                      {/* ------------------------------------------------------- */}

                      <Col flex="3 1 200px">
                        <Form.Item
                          {...restField}
                          name={[name, "unitName"]}
                          rules={[
                            { required: true, message: "Nhập tên đơn vị" },
                            {
                              validator: (_, value) =>
                                validateUnitName(_, value, name),
                            },
                          ]}
                        >
                          <Input placeholder="Tên đơn vị (ví dụ: kg, lốc, thùng,...)" />
                        </Form.Item>
                      </Col>

                      <Col flex="2 1 150px">
                        <Form.Item
                          {...restField}
                          name={[name, "ratioToBase"]}
                          rules={[
                            { required: true, message: "Nhập tỉ lệ quy đổi" },
                            {
                              type: "number",
                              min: 0.0001,
                              message: "Tỉ lệ phải lớn hơn 0",
                            },
                            {
                              validator: (_, value) => {
                                if (value === 1) {
                                  return Promise.reject(
                                    new Error("Tỉ lệ quy đổi phải khác 1")
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            placeholder="Tỉ lệ so với cơ bản"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>

                      <Col>
                        <MinusCircleOutlined
                          onClick={() => remove(name)}
                          style={{
                            color: "red",
                            fontSize: 20,
                            cursor: "pointer",
                            marginBottom: 22,
                          }}
                        />
                      </Col>
                    </Row>
                  );
                })}
              </>
            )}
          </Form.List>

          <Form.Item
            label="Mức tồn tối thiểu"
            name="minStockLevel"
            rules={[{ required: true, message: "Vui lòng nhập mức tồn" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập mức tồn tối thiểu..."
            />
          </Form.Item>

          <Form.Item
            label="Ngưỡng chậm luân chuyển (Ngày)"
            name="slowMovingThreshold"
            tooltip="Số ngày tối đa lô hàng được phép tồn kho trước khi bị cảnh báo chậm luân chuyển."
            rules={[
              {
                required: true,
                message: "Vui lòng nhập ngưỡng ngày chậm luân chuyển",
              },
              {
                type: "number",
                min: 1,
                message: "Ngưỡng phải là số ngày dương",
              },
            ]}
          >
            <InputNumber
              min={1}
              precision={0} // Chỉ cho phép số nguyên
              style={{ width: "100%" }}
              placeholder="Ví dụ: 90, 180, 365 ngày"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm danh mục */}
      <CategoryModal
        open={categoryModalOpen}
        onCancel={() => setCategoryModalOpen(false)}
        onSuccess={handleCategorySuccess}
        loading={categoryLoading}
      />
    </>
  );
}
