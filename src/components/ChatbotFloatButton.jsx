import React, { useState } from "react";
import { FloatButton, Modal, Input, Button, List, Avatar } from "antd";
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
} from "@ant-design/icons";

export default function ChatbotFloatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");
    // (Tùy chọn) gọi API Chatbot ở đây
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Tôi đã nhận được tin nhắn của bạn 👍" },
      ]);
    }, 800);
  };

  return (
    <>
      {/* Float Button ở góc phải */}
      <FloatButton
        icon={<MessageOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setOpen(true)}
      />

      {/* Modal Chatbot */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#1890ff", // Màu nền xanh
              color: "white", // Màu chữ trắng
              margin: "-20px -24px 0 -24px", // Mở rộng background ra toàn bộ chiều ngang
              padding: "16px 24px", // Padding cho title
              borderRadius: "8px 8px 0 0", // Bo góc trên
            }}
          >
            <span>Chatbot hỗ trợ</span>
          </div>
        }
        footer={null}
        width={400}
        style={{
          position: "fixed",
          right: 24,
          bottom: 80, // Đặt modal ngay trên float button
          top: "auto",
          left: "auto",
          margin: 0,
          padding: 0,
        }}
        bodyStyle={{
          height: 450,
          display: "flex",
          flexDirection: "column",
          padding: "10px 16px",
        }}
        wrapClassName="chatbot-modal-wrapper"
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginBottom: 12,
            paddingRight: 4,
          }}
        >
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item
                style={{
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    background: msg.sender === "user" ? "#1677ff" : "#f0f0f0",
                    color: msg.sender === "user" ? "white" : "black",
                    padding: "8px 12px",
                    borderRadius: 10,
                    maxWidth: "80%",
                  }}
                >
                  {msg.text}
                </div>
              </List.Item>
            )}
          />
        </div>

        <Input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          suffix={
            <SendOutlined
              style={{ color: "#1677ff", cursor: "pointer" }}
              onClick={handleSend}
            />
          }
        />
      </Modal>

      <style jsx>{`
        :global(.chatbot-modal-wrapper .ant-modal) {
          position: fixed;
          right: 24px;
          bottom: 80px;
          top: auto !important;
          left: auto !important;
        }

        :global(.chatbot-modal-wrapper .ant-modal-content) {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </>
  );
}
