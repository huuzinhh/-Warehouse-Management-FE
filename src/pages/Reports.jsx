import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

export default function Reports() {
  const dashboardUrl =
    "http://localhost:3000/public/dashboard/09929246-c827-44a7-92bd-da08d85090a2";

  const [iframeHeight, setIframeHeight] = useState(window.innerHeight - 180);

  useEffect(() => {
    const handleResize = () => setIframeHeight(window.innerHeight - 180);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <iframe
        src={dashboardUrl}
        title="Warehouse Dashboard"
        width="100%"
        height={iframeHeight}
        style={{
          border: "1px solid #eee",
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
}
