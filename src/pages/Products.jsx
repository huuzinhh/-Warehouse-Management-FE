import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Modal, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ProductService from "../service/ProductService";
import ProductModal from "../components/ProductModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // state quản lý modal xóa
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  // 🔹 Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Gọi song song
      const [productData, batchData] = await Promise.all([
        ProductService.getAll(),
        ProductService.getInventory(),
      ]);

      // Gộp tồn kho theo productName
      const stockMap = batchData.reduce((acc, batch) => {
        const name = batch.productName;
        acc[name] = (acc[name] || 0) + batch.remainingQuantity;
        return acc;
      }, {});

      // Gắn tồn kho vào danh sách sản phẩm
      const mergedData = productData.map((p) => ({
        ...p,
        stock: stockMap[p.name] || 0,
      }));

      setProducts(mergedData);
    } catch (error) {
      console.error("Fetch products or stock failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 Mở modal xác nhận xóa
  const showDeleteConfirm = (record) => {
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
  };

  // 🔹 Khi người dùng xác nhận xóa
  const handleDeleteConfirmOk = async () => {
    try {
      if (deleteRecord) {
        await ProductService.delete(deleteRecord.id);
        // fetchProducts();
        setProducts((prev) => prev.filter((p) => p.id !== deleteRecord.id));
      }
    } catch {
      // lỗi đã được toast
    } finally {
      setIsDeleteConfirmVisible(false);
      setDeleteRecord(null);
    }
  };

  const handleToggleActive = async (checked, record) => {
    try {
      // Gọi API để cập nhật trạng thái
      await ProductService.toggle(record.id);

      // Cập nhật state local
      setProducts((prev) =>
        prev.map((p) => (p.id === record.id ? { ...p, active: checked } : p))
      );
    } catch (error) {
      console.error("Toggle active failed:", error);
    }
  };

  const columns = [
    { title: "Mã SKU", dataIndex: "sku", width: 100 },
    { title: "Tên sản phẩm", dataIndex: "name" },
    { title: "Danh mục", dataIndex: "categoryName" },
    { title: "Đơn vị", dataIndex: "baseUnit", width: 100 },
    { title: "Mức tồn", dataIndex: "minStockLevel", width: 100 },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      render: (stock, record) =>
        stock < record.minStockLevel ? (
          <Tag color="red">{stock}</Tag>
        ) : (
          <Tag color="green">{stock}</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      width: 120,
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) => handleToggleActive(checked, record)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setModalMode("edit");
              setEditingProduct(record);
              setModalVisible(true);
            }}
          >
            Sửa
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
          >
            Xóa
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
          <b>SẢN PHẨM</b>
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setModalMode("create");
            setEditingProduct(null);
            setModalVisible(true);
          }}
        >
          Thêm
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={products}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 6 }}
      />

      {/* 🔹 Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteConfirmVisible}
        onOk={handleDeleteConfirmOk}
        onCancel={() => {
          setIsDeleteConfirmVisible(false);
          setDeleteRecord(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc muốn xóa sản phẩm <strong>{deleteRecord?.name}</strong>{" "}
          không?
        </p>
      </Modal>

      <ProductModal
        open={modalVisible}
        mode={modalMode}
        initialValues={editingProduct}
        loading={submitLoading}
        onCancel={() => setModalVisible(false)}
        onOk={async (values, form) => {
          try {
            setSubmitLoading(true);

            // Chuẩn hóa dữ liệu gửi lên BE
            const payload = {
              sku: values.sku,
              name: values.name,
              baseUnit: values.baseUnit,
              minStockLevel: values.minStockLevel,
              categoryId: values.categoryId,
              conversions:
                values.conversions?.map((c) => ({
                  unitName: c.unitName,
                  ratioToBase: c.ratioToBase,
                })) || [],
            };

            if (modalMode === "create") {
              const newProduct = await ProductService.create(payload);
              // fetch lại danh sách để sync ID thực tế
              await fetchProducts();
            } else {
              await ProductService.update(editingProduct.id, payload);
              await fetchProducts();
            }

            setModalVisible(false);
            form.resetFields();
          } finally {
            setSubmitLoading(false);
          }
        }}
      />
    </>
  );
}
