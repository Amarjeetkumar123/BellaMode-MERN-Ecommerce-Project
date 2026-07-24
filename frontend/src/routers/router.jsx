import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import CategoryPage from "../pages/category/CategoryPage";
import HomeRoute from "../pages/HomeRoute";
import NotFound from "../pages/NotFound";
import Search from "../pages/search/Search";
import ShopPage from "../pages/shop/ShopPage";
import SingleProduct from "../pages/shop/productDetails/SingleProduct";
import StorefrontPage from "../pages/storefront/StorefrontPage";
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
import ManageStores from "../pages/dashboard/admin/ManageStores";
import CreateStore from "../pages/dashboard/seller/CreateStore";
import RequireStore from "../pages/dashboard/seller/RequireStore";
import Payouts from "../pages/dashboard/seller/Payouts";

const STORE_MGR = ["SELLER", "SUPERADMIN"];

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            // Root renders the Men department on the marketplace apex, or the seller's
            // storefront when served from their subdomain (acme.wearly.com).
            { path: "/", element: <HomeRoute /> },
            { path: "/categories/:categoryName", element: <CategoryPage /> },
            { path: "/search", element: <Search /> },
            { path: "/shop", element: <ShopPage /> },
            { path: "/shop/:id", element: <SingleProduct /> },
            { path: "/store/:slug", element: <StorefrontPage /> },
            { path: "/checkout", element: <PrivateRoute><Checkout /></PrivateRoute> },
            {
                path: "/dashboard",
                element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
                children: [
                    { path: "", element: <UserDashboard /> },
                    { path: "profile", element: <Profile /> },
                    { path: "orders", element: <MyOrders /> },
                    { path: "create-store", element: <CreateStore /> },
                    { path: "admin", element: <PrivateRoute roles={STORE_MGR}><RequireStore><AdminDashboard /></RequireStore></PrivateRoute> },
                    { path: "manage-products", element: <PrivateRoute roles={STORE_MGR}><RequireStore><ManageProducts /></RequireStore></PrivateRoute> },
                    { path: "manage-categories", element: <PrivateRoute roles={STORE_MGR}><RequireStore><ManageCategories /></RequireStore></PrivateRoute> },
                    { path: "manage-orders", element: <PrivateRoute roles={STORE_MGR}><RequireStore><ManageOrders /></RequireStore></PrivateRoute> },
                    { path: "add-new-post", element: <PrivateRoute roles={STORE_MGR}><RequireStore><AddNewPost /></RequireStore></PrivateRoute> },
                    { path: "settings", element: <PrivateRoute roles={STORE_MGR}><RequireStore><DashboardSettings /></RequireStore></PrivateRoute> },
                    { path: "payouts", element: <PrivateRoute roles={STORE_MGR}><RequireStore><Payouts /></RequireStore></PrivateRoute> },
                    { path: "manage-stores", element: <PrivateRoute roles={["SUPERADMIN"]}><ManageStores /></PrivateRoute> },
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
