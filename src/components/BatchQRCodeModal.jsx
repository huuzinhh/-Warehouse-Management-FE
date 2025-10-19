import React from "react";
import { Modal, Button } from "antd";
import { QRCodeCanvas } from "qrcode.react";

export default function BatchQRCodeModal({ open, onCancel, batch }) {
  if (!batch) return null;

  const qrValue = batch.batchCode; // hoặc URL, ví dụ: `${window.location.origin}/batch/${batch.batchCode}`

  const handleDownload = () => {
    const canvas = document.getElementById("batch-qr");
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${batch.batchCode}.png`;
    link.click();
  };

  return (
    <Modal
      title={`Mã QR cho lô hàng: ${batch.batchCode}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>,
        <Button key="download" type="primary" onClick={handleDownload}>
          Tải ảnh QR
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center", padding: 20 }}>
        <QRCodeCanvas
          id="batch-qr"
          value={qrValue}
          size={200}
          includeMargin
          level="H"
        />
        <p style={{ marginTop: 10 }}>
          <b>Mã lô:</b> {batch.batchCode}
        </p>
        <p>{batch.productName}</p>
      </div>
    </Modal>
  );
}
