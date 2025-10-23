import React, { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, Radio } from "antd";
import dayjs from "dayjs";

export default function UserModal({
  open,
  mode,
  initialValues,
  onOk,
  onCancel,
  loading,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        ...initialValues,
        dob: initialValues?.dob ? dayjs(initialValues.dob) : null,
      });
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title={mode === "create" ? "Thêm người dùng" : "Cập nhật người dùng"}
      okText={mode === "create" ? "Thêm" : "Lưu"}
      cancelText="Hủy"
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={(values) => onOk(values, form)}
      >
        {mode === "create" && (
          <>
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[{ required: true, message: "Nhập tên đăng nhập" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="fullName"
          label="Họ tên"
          rules={[{ required: true, message: "Nhập họ tên" }]}
        >
          <Input />
        </Form.Item>

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

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="phone" label="Số điện thoại">
          <Input placeholder="VD: 0912345678" />
        </Form.Item>

        <Form.Item name="dob" label="Ngày sinh">
          <DatePicker
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
            placeholder="Chọn ngày sinh"
          />
        </Form.Item>

        <Form.Item
          name="roles"
          label="Vai trò"
          rules={[{ required: true, message: "Chọn ít nhất 1 vai trò" }]}
        >
          <Select
            mode="multiple"
            options={[
              { label: "ADMIN", value: "ADMIN" },
              { label: "STAFF", value: "STAFF" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
