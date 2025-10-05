import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import "antd/dist/reset.css";
import "./index.css";

export default function App() {
  return <RouterProvider router={router} />;
}
