import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import CategoryPage from "../pages/category/CategoryPage";
import NotFound from "../pages/NotFound";
import Search from "../pages/search/Search";
import ShopPage from "../pages/shop/ShopPage";
import SingleProduct from "../pages/shop/productDetails/SingleProduct";
import Checkout from "../pages/checkout/Checkout";
import Login from "../components/Login";
import Register from "../components/Register";

import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import UserDashboard from "../pages/dashboard/user/UserDashboard";
import Profile from "../pages/dashboard/user/Profile";
import MyOrders from "../pages/dashboard/user/MyOrders";
import AdminDashboard from "../pages/dashboard/admin/AdminDashboard";
import ManageProducts from "../pages/dashboard/admin/ManageProducts";
import ManageCategories from "../pages/dashboard/admin/ManageCategories";
import ManageOrders from "../pages/dashboard/admin/ManageOrders";
import AddNewPost from "../pages/dashboard/admin/AddNewPost";
import DashboardSettings from "../pages/dashboard/admin/DashboardSettings";
import ManageUsers from "../pages/dashboard/admin/ManageUsers";

const STORE_MGR = ["SELLER", "SUPERADMIN"];

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            // No separate homepage — the root renders the Men department directly.
            { path: "/", element: <CategoryPage /> },
            { path: "/categories/:categoryName", element: <CategoryPage /> },
            { path: "/search", element: <Search /> },
            { path: "/shop", element: <ShopPage /> },
            { path: "/shop/:id", element: <SingleProduct /> },
            { path: "/checkout", element: <PrivateRoute><Checkout /></PrivateRoute> },
            {
                path: "/dashboard",
                element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
                children: [
                    { path: "", element: <UserDashboard /> },
                    { path: "profile", element: <Profile /> },
                    { path: "orders", element: <MyOrders /> },
                    { path: "admin", element: <PrivateRoute roles={STORE_MGR}><AdminDashboard /></PrivateRoute> },
                    { path: "manage-products", element: <PrivateRoute roles={STORE_MGR}><ManageProducts /></PrivateRoute> },
                    { path: "manage-categories", element: <PrivateRoute roles={STORE_MGR}><ManageCategories /></PrivateRoute> },
                    { path: "manage-orders", element: <PrivateRoute roles={STORE_MGR}><ManageOrders /></PrivateRoute> },
                    { path: "add-new-post", element: <PrivateRoute roles={STORE_MGR}><AddNewPost /></PrivateRoute> },
                    { path: "settings", element: <PrivateRoute roles={STORE_MGR}><DashboardSettings /></PrivateRoute> },
                    { path: "manage-users", element: <PrivateRoute roles={["SUPERADMIN"]}><ManageUsers /></PrivateRoute> },
                ],
            },
            // Catch-all: unknown URLs render a branded 404 inside the normal layout.
            { path: "*", element: <NotFound /> },
        ],
        errorElement: <NotFound />,
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
]);

export default router;
