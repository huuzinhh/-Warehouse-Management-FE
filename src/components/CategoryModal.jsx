// components/CategoryModal.js
import React, { useEffect } from "react";
import { Modal, Form, Input, message } from "antd";
import CategoryService from "../service/CategoryService";

const CategoryModal = ({
  open,
  onCancel,
  onSuccess,
  editingCategory,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        form.setFieldsValue({
          name: editingCategory.name,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingCategory, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let newCategory;

      if (editingCategory) {
        // Cập nhật danh mục
        await CategoryService.update(editingCategory.id, {
          name: values.name,
          active: editingCategory.isActive,
        });
        message.success("Cập nhật danh mục thành công");
      } else {
        // Thêm danh mục mới
        newCategory = await CategoryService.create({
          name: values.name,
          active: true,
        });
        message.success("Thêm danh mục thành công");
      }

      form.resetFields();
      if (onSuccess) {
        onSuccess(newCategory); // newCategory sẽ là undefined trong trường hợp edit
      }
      onCancel();
    } catch (error) {
      console.error("Lỗi khi thêm/sửa danh mục:", error);
      message.error(
        editingCategory
          ? "Cập nhật danh mục thất bại"
          : "Thêm danh mục thất bại"
      );
    }
  };

  return (
    <Modal
      title={editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[
            { required: true, message: "Vui lòng nhập tên danh mục" },
            { min: 2, message: "Tên danh mục phải có ít nhất 2 ký tự" },
          ]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryModal;
