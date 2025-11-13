import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  message,
  Tag,
  Row,
  Col,
  Table,
  Divider,
  DatePicker,
} from "antd";
import {
  BarcodeOutlined,
  SearchOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { BrowserMultiFormatReader } from "@zxing/browser";
import AdjustmentService from "../service/AdjustmentService";
import ProductService from "../service/ProductService";
import { getUserIdFromToken } from "../service/localStorageService";
import ToastService from "../service/ToastService";

export default function AdjustmentModal({ open, onCancel, onOk, userId }) {
  const [form] = Form.useForm();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batchList, setBatchList] = useState([]); // Danh sách lô đã quét

  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const currentStreamRef = useRef(null);
  const scanningStoppedRef = useRef(false);
  const isProcessingRef = useRef(false); // tránh quét trùng lặp
  const addedBatchCodesRef = useRef(new Set()); // Theo dõi các batch đã thêm
  const scanCooldownRef = useRef(false);

  useEffect(() => {
    if (!open) {
      stopScanner();
      form.resetFields();
      setBatchList([]);
      addedBatchCodesRef.current.clear(); // QUAN TRỌNG: Clear set khi đóng modal
    }
  }, [open]);

  const generateAdjustmentCode = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const randomPart = Math.floor(100 + Math.random() * 900); // 3 chữ số ngẫu nhiên
    return `ADJ-${datePart}-${randomPart}`;
  };

  /** ==========================
   *  CAMERA SCAN HANDLING
   *  ========================== */
  const startScanner = async () => {
    if (scanning) return;

    try {
      setScanning(true);
      scanningStoppedRef.current = false; // QUAN TRỌNG: Reset lại trạng thái
      isProcessingRef.current = false; // Reset trạng thái xử lý

      // Chờ video element render
      await new Promise((resolve) => {
        const checkVideo = setInterval(() => {
          if (videoRef.current) {
            clearInterval(checkVideo);
            resolve();
          }
        }, 100);
      });

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (devices.length === 0) {
        ToastService.error("Không tìm thấy thiết bị camera!");
        setScanning(false);
        return;
      }

      const deviceId = devices[0].deviceId;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });
      currentStreamRef.current = stream;

      if (!videoRef.current) {
        ToastService.error("Lỗi khi khởi động camera!");
        stopScanner();
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // QUAN TRỌNG: Đảm bảo callback decode được gọi lại liên tục
      reader.decodeFromVideoElement(videoRef.current, async (result, err) => {
        if (scanningStoppedRef.current) return;

        if (scanCooldownRef.current) return;
        if (result) {
          const code = result.getText();
          if (scanningStoppedRef.current) return;

          // Tạm dừng scanner trong khi xử lý
          scanningStoppedRef.current = true;

          scanCooldownRef.current = true; // ⛔ chặn tạm thời
          setTimeout(() => (scanCooldownRef.current = false), 3000); // ⏳ nghỉ 2 giây

          console.log("✅ Đã quét được:", code);
          ToastService.success(`Đã quét mã lô: ${code}`);

          await handleAddBatchByCode(code);

          // QUAN TRỌNG: Sau khi xử lý xong, cho phép quét tiếp
          scanningStoppedRef.current = false;
        }

        if (err && !String(err).includes("NotFoundException")) {
          console.warn("⚠️ Lỗi khi quét:", err);
        }
      });
    } catch (error) {
      console.error(error);
      message.error("Không thể truy cập camera!");
      setScanning(false);
    }
  };

  const stopScanner = () => {
    try {
      scanningStoppedRef.current = true;
      isProcessingRef.current = false;

      if (readerRef.current) {
        readerRef.current.stopContinuousDecode?.();
        readerRef.current.stopStreams?.();
        readerRef.current = null;
      }

      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach((track) => track.stop());
        currentStreamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.pause?.();
        videoRef.current.srcObject = null;
      }
    } catch (error) {
      console.warn("Lỗi khi dừng scanner:", error);
    } finally {
      setScanning(false);
      console.log("✅ Camera đã dừng hoàn toàn");
    }
  };

  /** ==========================
   *  HANDLE ADDING BATCH
   *  ========================== */
  const handleAddBatchByCode = async (code) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    console.log("🔍 Đang xử lý mã:", code);
    console.log(
      "📋 Batch list hiện tại:",
      batchList.map((b) => b.batchCode)
    );
    console.log("🎯 Set đã thêm:", Array.from(addedBatchCodesRef.current));

    try {
      // Kiểm tra trùng lặp bằng cả Set và batchList để chắc chắn
      if (
        addedBatchCodesRef.current.has(code) ||
        batchList.some((b) => b.batchCode === code)
      ) {
        console.log("🚫 Đã tìm thấy trùng lặp cho:", code);
        ToastService.info("Lô hàng đã được thêm trước đó!");
        return;
      }

      const batch = await ProductService.getInventoryByBatchCode(code);
      if (!batch) {
        return;
      }

      // Kiểm tra lại với batchCode từ API response
      if (
        addedBatchCodesRef.current.has(batch.batchCode) ||
        batchList.some((b) => b.batchCode === batch.batchCode)
      ) {
        console.log("🚫 Đã tìm thấy trùng lặp sau API cho:", batch.batchCode);
        ToastService.info("Lô hàng đã được thêm trước đó!");
        return;
      }

      // CẬP NHẬT ĐỒNG THỜI cả ref và state
      addedBatchCodesRef.current.add(batch.batchCode);

      setBatchList((prev) => [
        ...prev,
        {
          uniqueKey: `${batch.batchCode}-${Date.now()}`,
          id: batch.id,
          batchCode: batch.batchCode,
          productName: batch.productName,
          locationName: batch.locationName,
          systemQty: batch.remainingQuantity,
          actualQty: null,
        },
      ]);

      ToastService.success(`Đã thêm lô hàng: ${batch.batchCode}`);
      console.log("✅ Đã thêm lô hàng thành công:", batch.batchCode);
    } catch (err) {
      console.error(err);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleRemoveBatch = (code) => {
    addedBatchCodesRef.current.delete(code); // QUAN TRỌNG: Xóa khỏi Set khi remove
    setBatchList((prev) => prev.filter((b) => b.batchCode !== code));
    ToastService.info(`Đã xóa lô hàng: ${code}`);
  };

  const handleChangeActualQty = (code, value) => {
    setBatchList((prev) =>
      prev.map((b) => (b.batchCode === code ? { ...b, actualQty: value } : b))
    );
  };

  /** ==========================
   *  SUBMIT FORM
   *  ========================== */
  const handleSubmit = async (values) => {
    if (batchList.length === 0) {
      ToastService.warning("Vui lòng chọn ít nhất một lô hàng!");
      return;
    }

    // Kiểm tra xem tất cả các lô đã được nhập số lượng thực tế chưa
    const batchesWithoutActualQty = batchList.filter(
      (b) => b.actualQty === null
    );
    if (batchesWithoutActualQty.length > 0) {
      ToastService.warning(
        `Vui lòng nhập số lượng thực tế cho ${batchesWithoutActualQty.length} lô hàng!`
      );
      return;
    }

    const details = batchList.map((b) => ({
      inventoryBatchId: b.id,
      actualQuantity: b.actualQty,
    }));

    const payload = {
      code: values.code,
      createdBy: getUserIdFromToken(),
      adjustDate: values.adjustDate
        ? values.adjustDate.format("YYYY-MM-DDTHH:mm:ss")
        : dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      details,
    };

    try {
      setLoading(true);
      await AdjustmentService.create(payload);
      ToastService.success("Tạo phiếu điều chỉnh tồn kho thành công!");
      onOk();
    } catch (e) {
      console.error(e);
      ToastService.error("Lỗi khi tạo phiếu điều chỉnh!");
    } finally {
      setLoading(false);
    }
  };

  /** ==========================
   *  TABLE COLUMNS
   *  ========================== */
  const columns = [
    {
      title: "Mã lô",
      dataIndex: "batchCode",
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
    },
    {
      title: "Tồn hệ thống",
      dataIndex: "systemQty",
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: "Thực tế",
      dataIndex: "actualQty",
      render: (val, record) => (
        <InputNumber
          min={0}
          value={val}
          onChange={(v) => handleChangeActualQty(record.batchCode, v)}
          style={{ width: "100%" }}
          placeholder="Nhập số lượng"
        />
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "locationName",
    },
    {
      title: "",
      render: (_, record) => (
        <Button
          type="text"
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleRemoveBatch(record.batchCode)}
          title="Xóa lô hàng"
        />
      ),
    },
  ];

  /** ==========================
   *  RENDER
   *  ========================== */
  return (
    <Modal
      title="Tạo phiếu điều chỉnh tồn kho"
      open={open}
      onCancel={() => {
        stopScanner();
        onCancel();
      }}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          code: generateAdjustmentCode(),
        }}
      >
        <Row gutter={24}>
          {/* Cột trái: thông tin phiếu */}
          <Col span={6}>
            <Form.Item
              label="Mã phiếu"
              name="code"
              rules={[{ required: true, message: "Nhập mã phiếu" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Ngày điều chỉnh"
              name="adjustDate"
              rules={[{ required: true, message: "Chọn ngày điều chỉnh" }]}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Form.Item>

            <Divider />
            <p>
              <b>Tổng số lô đã quét:</b>{" "}
              <Tag color="purple">{batchList.length}</Tag>
            </p>
            <p>
              <b>Lô chưa nhập số lượng:</b>{" "}
              <Tag color="orange">
                {batchList.filter((b) => b.actualQty === null).length}
              </Tag>
            </p>
          </Col>

          {/* Cột phải: khu vực quét */}
          <Col span={18}>
            {scanning ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <video
                  ref={videoRef}
                  style={{
                    width: 320,
                    height: 240,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                  autoPlay
                  playsInline
                  muted
                />
                <Button
                  icon={<StopOutlined />}
                  danger
                  onClick={stopScanner}
                  style={{ borderRadius: 8, marginTop: 8 }}
                >
                  Dừng quét
                </Button>
              </div>
            ) : (
              <Space>
                <Input
                  placeholder="Nhập hoặc quét mã lô"
                  style={{ width: 200 }}
                  onPressEnter={(e) => {
                    e.preventDefault();
                    handleAddBatchByCode(e.target.value.trim());
                  }}
                />
                <Button
                  icon={<BarcodeOutlined />}
                  type="primary"
                  onClick={startScanner}
                >
                  Quét
                </Button>
              </Space>
            )}

            <Divider />
            <Table
              size="small"
              columns={columns}
              dataSource={batchList}
              rowKey={(record) => record.uniqueKey}
              pagination={false}
              scroll={{ y: 300 }}
              locale={{ emptyText: "Chưa có lô hàng nào được quét" }}
            />
          </Col>
        </Row>

        <Divider />
        <div style={{ textAlign: "right" }}>
          <Button
            onClick={() => {
              stopScanner();
              onCancel();
            }}
            style={{ marginRight: 8 }}
          >
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu phiếu
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
