// src/App.jsx
import React from "react";
import { RouterProvider } from "react-router-dom";
import { App as AntdApp } from "antd";
import router from "./routes";
import ToastProvider from "./providers/ToastProvider";
import Chatbot from "./components/ChatBot";

export default function App() {
  return (
    <AntdApp>
      <ToastProvider>
        <RouterProvider router={router} />
        <Chatbot />
      </ToastProvider>
    </AntdApp>
  );
}
