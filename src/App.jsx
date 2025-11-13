// src/App.jsx
import React from "react";
import { RouterProvider } from "react-router-dom";
import { App as AntdApp } from "antd";
import router from "./routes";
import ToastProvider from "./providers/ToastProvider";
import ChatbotFloatButton from "./components/ChatbotFloatButton";

export default function App() {
  return (
    <AntdApp>
      <ToastProvider>
        <RouterProvider router={router} />
        <ChatbotFloatButton />
      </ToastProvider>
    </AntdApp>
  );
}
