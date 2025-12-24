import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Radio,
  Button,
  Divider,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";

export default function ProfileModal({
  open,
  initialValues,
  onUpdate,
  onChangePassword, // Hàm gọi API đổi mật khẩu từ cha truyền xuống
  onCancel,
  loading,
}) {
  const [form] = Form.useForm();
  // mode: 'view' | 'edit' | 'password'
  const [mode, setMode] = useState("view");

  useEffect(() => {
    if (open) {
      resetToView();
    } else {
      form.resetFields();
    }
  }, [open, initialValues]);

  const resetToView = () => {
    form.setFieldsValue({
      ...initialValues,
      dob: initialValues?.dob ? dayjs(initialValues.dob) : null,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setMode("view");
  };

  const handleFinish = (values) => {
    if (mode === "edit") {
      onUpdate(values, () => setMode("view"));
    } else if (mode === "password") {
      onChangePassword(values, () => resetToView());
    }
  };

  // Render Footer dựa trên chế độ hiện tại
  const renderFooter = () => {
    if (mode === "view") {
      return [
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
        <Button key="change-pw" danger onClick={() => setMode("password")}>
          Đổi mật khẩu
        </Button>,
        <Button key="edit" type="primary" onClick={() => setMode("edit")}>
          Chỉnh sửa
        </Button>,
      ];
    }
    return [
      <Button key="back" onClick={resetToView}>
        Trở lại
      </Button>,
      <Button
        key="save"
        type="primary"
        loading={loading}
        onClick={() => form.submit()}
      >
        {mode === "edit" ? "Lưu cập nhật" : "Xác nhận đổi mật khẩu"}
      </Button>,
    ];
  };

  return (
    <Modal
      open={open}
      title={
        mode === "view"
          ? "Thông tin cá nhân"
          : mode === "edit"
          ? "Chỉnh sửa thông tin"
          : "Đổi mật khẩu"
      }
      onCancel={onCancel}
      width={600}
      footer={renderFooter()}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        disabled={mode === "view"}
      >
        {/* CHẾ ĐỘ XEM & SỬA THÔNG TIN */}
        {mode !== "password" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ fontSize: "16px" }}>
                <strong>Tên đăng nhập:</strong>{" "}
                <span style={{ color: "#1677ff" }}>
                  {initialValues?.username}
                </span>
              </p>
            </div>
            <Divider orientation="left" plain>
              Thông tin cơ bản
            </Divider>

            <Form.Item
              name="fullName"
              label="Họ tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[{ required: true, message: "Chọn giới tính" }]}
                >
                  <Radio.Group>
                    <Radio value="MALE">Nam</Radio>
                    <Radio value="FEMALE">Nữ</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dob" label="Ngày sinh">
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Email không hợp lệ",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="Số điện thoại">
              <Input />
            </Form.Item>

            <Form.Item name="roles" label="Vai trò hệ thống">
              <Select
                disabled
                options={[
                  { label: "ADMIN", value: "ADMIN" },
                  { label: "STAFF", value: "STAFF" },
                ]}
              />
            </Form.Item>
          </>
        ) : (
          /* CHẾ ĐỘ ĐỔI MẬT KHẨU */
          <>
            <div style={{ marginBottom: 20, color: "#666" }}>
              Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để bảo mật tài
              khoản.
            </div>
            <Form.Item
              name="oldPassword"
              label="Mật khẩu hiện tại"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu mới phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
