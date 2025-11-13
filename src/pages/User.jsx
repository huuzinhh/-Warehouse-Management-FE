import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Modal, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import UserService from "../service/UserService";
import UserModal from "../components/UserModal";
import dayjs from "dayjs";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingUser, setEditingUser] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  // 🔹 Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error("Fetch users failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Hiển thị modal xác nhận xóa
  const showDeleteConfirm = (record) => {
    setDeleteRecord(record);
    setIsDeleteConfirmVisible(true);
  };

  // 🔹 Xác nhận xóa
  const handleDeleteConfirmOk = async () => {
    try {
      if (deleteRecord) {
        await UserService.delete(deleteRecord.id);
        setUsers((prev) => prev.filter((u) => u.id !== deleteRecord.id));
      }
    } catch (error) {
      console.error("Delete user failed:", error);
    } finally {
      setIsDeleteConfirmVisible(false);
      setDeleteRecord(null);
    }
  };

  // 🔹 Bật / Tắt trạng thái người dùng
  const handleToggleActive = async (checked, record) => {
    try {
      await UserService.changeStatus(record.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === record.id ? { ...u, enabled: checked } : u))
      );
    } catch (error) {
      console.error("Toggle active failed:", error);
    }
  };

  const columns = [
    { title: "Tên đăng nhập", dataIndex: "username" },
    { title: "Họ tên", dataIndex: "fullName" },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (g) => (g === "MALE" ? "Nam" : g === "FEMALE" ? "Nữ" : "-"),
    },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone" },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      render: (dob) => (dob ? dayjs(dob).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      render: (roles) =>
        roles?.map((r) => (
          <Tag key={r} color={r === "ADMIN" ? "red" : "blue"}>
            {r}
          </Tag>
        )),
    },
    {
      title: "Trạng thái",
      dataIndex: "enabled",
      render: (enabled, record) => (
        <Switch
          checked={enabled}
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
              setEditingUser(record);
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
          <b>NGƯỜI DÙNG</b>
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setModalMode("create");
            setEditingUser(null);
            setModalVisible(true);
          }}
        >
          Thêm người dùng
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={users}
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
          Bạn có chắc muốn xóa người dùng{" "}
          <strong>{deleteRecord?.username}</strong> không?
        </p>
      </Modal>

      {/* 🔹 Modal thêm/sửa người dùng */}
      <UserModal
        open={modalVisible}
        mode={modalMode}
        initialValues={editingUser}
        loading={submitLoading}
        onCancel={() => setModalVisible(false)}
        onOk={async (values, form) => {
          try {
            setSubmitLoading(true);

            if (modalMode === "create") {
              const payload = {
                username: values.username,
                password: values.password,
                fullName: values.fullName,
                gender: values.gender,
                email: values.email,
                phone: values.phone,
                dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
                roles: values.roles,
              };
              await UserService.create(payload);
            } else {
              const payload = {
                fullName: values.fullName,
                gender: values.gender,
                email: values.email,
                phone: values.phone,
                dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
                roles: values.roles,
              };
              await UserService.update(editingUser.id, payload);
            }

            await fetchUsers();
            setModalVisible(false);
            form.resetFields();
          } catch (error) {
            console.error("Submit user failed:", error);
          } finally {
            setSubmitLoading(false);
          }
        }}
      />
    </>
  );
}
