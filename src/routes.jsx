import { createBrowserRouter } from "react-router-dom";
import TopLayout from "./layout/TopLayout";
import Dashboard from "./pages/Dashboard";
import GoodsReceipt from "./pages/GoodsReceipt";
import GoodsIssue from "./pages/GoodsIssue";
import Reports from "./pages/Reports";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import Customers from "./pages/Customers";
import Locations from "./pages/Locations";


const router = createBrowserRouter([
  {
    path: "/",
    element: <TopLayout />,
    children: [
      
      { path: "/", element: <Dashboard /> },
      { path: "/login", element: <Login /> },
      { path: "/receipt", element: <GoodsReceipt /> },
      { path: "/issue", element: <GoodsIssue /> },
      { path: "/reports", element: <Reports /> },
      { path: "/products", element: <Products /> },
      { path: "/categories", element: <Categories /> },
      { path: "/customers", element: <Customers /> },
      { path: "/locations", element: <Locations /> }
    ],
  },
]);

export default router;
