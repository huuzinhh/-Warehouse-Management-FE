import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import axiosInstance from "../service/axiosInstance";

const { Option } = Select;

export default function Shelves() {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [form] = Form.useForm();

  const locationTypeMap = {
    KE_LON: "Kệ lớn",
    KE_NHO: "Kệ nhỏ",
    THUNG: "Thùng",
    PALLET: "Pallet",
    SAN: "Sàn",
    KHU_LANH: "Phòng lạnh",
  };
  const typeColorMap = {
    KE_LON: "volcano",
    KE_NHO: "blue",
    THUNG: "cyan",
    PALLET: "green",
    SAN: "purple",
    KHU_LANH: "geekblue",
  };

  useEffect(() => {
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    try {
      setLoading(true);
      const apiResponse = await axiosInstance.get("/api/locations");
      if (apiResponse.code === 1000 && Array.isArray(apiResponse.result)) {
        const shelvesData = apiResponse.result.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
        }));
        setShelves(shelvesData);
      } else {
        throw new Error("Dữ liệu không hợp lệ từ server");
      }
    } catch (error) {
      console.error("Lỗi khi lấy vị trí:", error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (shelf = null) => {
    setEditingShelf(shelf);
    if (shelf) {
      form.setFieldsValue({
        name: shelf.name,
        type: shelf.type,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let apiResponse;
      if (editingShelf) {
        apiResponse = await axiosInstance.put(
          `/api/locations/${editingShelf.id}`,
          {
            name: values.name,
            type: values.type,
          }
        );
      } else {
        apiResponse = await axiosInstance.post("/api/locations", {
          name: values.name,
          type: values.type,
        });
      }
      if (apiResponse.code === 1000) {
        setIsModalVisible(false);
        fetchShelves();
        message.success(
          apiResponse.message ||
            (editingShelf ? "Cập nhật thành công" : "Thêm thành công")
        );
      } else {
        throw new Error("Thao tác thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm/sửa vị trí:", error);
    }
  };

  const showDeleteConfirm = (record) => {
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
    console.log("Đang mở modal xóa cho:", record.name);
  };

  const handleDeleteConfirmOk = async () => {
    if (deleteRecord) {
      try {
        const apiResponse = await axiosInstance.delete(
          `/api/locations/${deleteRecord.id}`
        );
        if (apiResponse.code === 1000) {
          setShelves(shelves.filter((shelf) => shelf.id !== deleteRecord.id));
          message.success(apiResponse.message || "Xóa thành công");
        } else {
          throw new Error("Xóa thất bại");
        }
      } catch (error) {
        console.error("Lỗi khi xóa vị trí:", error);
        message.error("Không thể xóa vị trí. Vui lòng thử lại!");
      }
    }
    setIsDeleteConfirmVisible(false);
    setDeleteRecord(null);
  };

  const columns = [
    {
      title: "Mã vị trí",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Tên vị trí",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span>
          <AppstoreOutlined style={{ marginRight: 6, color: "#1677ff" }} />
          {name}
        </span>
      ),
    },
    {
      title: "Loại vị trí",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={typeColorMap[type] || "default"}>
          {locationTypeMap[type] || type}
        </Tag>
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
            onClick={() => showModal(record)}
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
    <div style={{ padding: 20, background: "#fff" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Quản lý vị trí</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm vị trí
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={shelves}
        columns={columns}
        pagination={{ pageSize: 5 }}
        loading={loading}
      />

      <Modal
        title={editingShelf ? "Sửa vị trí" : "Thêm vị trí"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên vị trí"
            rules={[{ required: true, message: "Vui lòng nhập tên vị trị" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại kệ"
            rules={[{ required: true, message: "Vui lòng chọn loại vị trí" }]}
          >
            <Select placeholder="Chọn loại vị trí">
              {Object.entries(locationTypeMap).map(([value, label]) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={isDeleteConfirmVisible}
        onOk={handleDeleteConfirmOk}
        onCancel={() => {
          setIsDeleteConfirmVisible(false);
          setDeleteRecord(null);
        }}
      >
        <p>Bạn có chắc muốn xóa kệ "{deleteRecord?.name}"?</p>
      </Modal>
    </div>
  );
}
