// src/providers/ToastProvider.jsx
import React from 'react';
import { App, ConfigProvider } from 'antd';
import toastService from '../service/ToastService';

export default function ToastProvider({ children }) {
  const { message, notification, modal } = App.useApp();

  // Khởi tạo toast service với instance từ Antd App
  React.useEffect(() => {
    toastService.setToastInstance({
      success: (content, duration) => message.success(content, duration),
      error: (content, duration) => message.error(content, duration),
      warning: (content, duration) => message.warning(content, duration),
      info: (content, duration) => message.info(content, duration),
    });
  }, [message]);

  return (
    <ConfigProvider>
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}