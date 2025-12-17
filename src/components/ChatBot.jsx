import React, { useState, useEffect, useRef } from "react";
import { Button, Input, List, Spin } from "antd";
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { getUserIdFromToken } from "../service/localStorageService";

// 1️⃣ IMPORT THƯ VIỆN MARKDOWN
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const FloatingChat = () => {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasRestored, setHasRestored] = useState(false);

  const chatContainerRef = useRef(null);
  const userId = getUserIdFromToken();
  const isLoggedIn = !!userId;

  if (!isLoggedIn) {
    return null;
  }

  const getSessionId = () => {
    let id = localStorage.getItem("sessionId");
    if (!id) {
      id = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("sessionId", id);
    }
    return id;
  };

  useEffect(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        localStorage.removeItem("chatMessages");
      }
    }
    setHasRestored(true);
  }, []);

  useEffect(() => {
    if (hasRestored) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages, hasRestored]);

  useEffect(() => {
    if (chatContainerRef.current && visible) {
      setTimeout(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, loading, visible]);

  const handleOpenChat = () => {
    setVisible(true);
    if (hasRestored && messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          sender: "bot",
          text: "Xin chào! Tôi là trợ lý kho thông minh. Tôi có thể giúp gì cho bạn hôm nay?",
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now(), sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5678/webhook/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          message: input.trim(),
          userId,
        }),
      });
      const data = await response.json();
      const botReply = data.response || "Xin lỗi, tôi không hiểu yêu cầu.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: botReply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: "Lỗi kết nối." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!visible && (
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          size="large"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            width: 60,
            height: 60,
            fontSize: 24,
          }}
          onClick={handleOpenChat}
        />
      )}

      {visible && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 380,
            height: 520,
            background: "white",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1677ff, #0d5bdd)",
              color: "white",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 600,
            }}
          >
            <span>Trợ lý kho thông minh</span>
            <CloseOutlined
              style={{ fontSize: 18, cursor: "pointer" }}
              onClick={() => setVisible(false)}
            />
          </div>

          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 12px",
              background: "#f8f9fa",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <List
              dataSource={messages}
              renderItem={(msg) => (
                <List.Item
                  key={msg.id}
                  style={{
                    border: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    justifyContent:
                      msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: msg.sender === "user" ? "#1677ff" : "#ffffff",
                      color: msg.sender === "user" ? "#fff" : "#333",
                      padding: "10px 14px",
                      borderRadius: 18,
                      maxWidth: "85%", // Tăng nhẹ width để hiển thị bảng/list đẹp hơn
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      // CSS để render Markdown đẹp hơn
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {/* 2️⃣ SỬ DỤNG REACT-MARKDOWN ĐỂ RENDER */}
                    {msg.sender === "user" ? (
                      msg.text
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Tùy chỉnh CSS cho các thẻ HTML bên trong Markdown
                          p: ({ node, ...props }) => (
                            <p
                              style={{ margin: 0, marginBottom: 8 }}
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              style={{ paddingLeft: 20, margin: 0 }}
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li style={{ marginBottom: 4 }} {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong style={{ color: "#1677ff" }} {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>
                </List.Item>
              )}
            />
            {loading && (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <Spin size="small" />
                <div style={{ color: "#999", fontSize: 13, marginTop: 6 }}>
                  Đang suy nghĩ...
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: 12,
              borderTop: "1px solid #eee",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Input
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={handleSend}
              disabled={loading}
              style={{ borderRadius: 20 }}
              size="large"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{ borderRadius: 20, width: 44, height: 44 }}
              size="large"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
