/* eslint-disable react-refresh/only-export-components -- this is the route table, not a component file */
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import CategoryPage from "../pages/category/CategoryPage";
import NotFound from "../pages/NotFound";
import Search from "../pages/search/Search";
import ShopPage from "../pages/shop/ShopPage";
import SalePage from "../pages/sale/SalePage";
import SingleProduct from "../pages/shop/productDetails/SingleProduct";
import Checkout from "../pages/checkout/Checkout";
import Login from "../components/Login";
import Register from "../components/Register";
import OrderPlaced from "../pages/order/OrderPlaced";
import Shipping from "../pages/help/Shipping";
import SizeGuide from "../pages/help/SizeGuide";
import JournalPost from "../pages/journal/JournalPost";

import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import UserDashboard from "../pages/dashboard/user/UserDashboard";
import Profile from "../pages/dashboard/user/Profile";
import MyOrders from "../pages/dashboard/user/MyOrders";
// Admin pages load only when an admin opens them, so shoppers download less.
const AdminDashboard = lazy(() => import("../pages/dashboard/admin/AdminDashboard"));
const ManageProducts = lazy(() => import("../pages/dashboard/admin/ManageProducts"));
const ManageCategories = lazy(() => import("../pages/dashboard/admin/ManageCategories"));
const ManageOrders = lazy(() => import("../pages/dashboard/admin/ManageOrders"));
const AddNewPost = lazy(() => import("../pages/dashboard/admin/AddNewPost"));
const DashboardSettings = lazy(() => import("../pages/dashboard/admin/DashboardSettings"));
const ManageUsers = lazy(() => import("../pages/dashboard/admin/ManageUsers"));
const ManageHelp = lazy(() => import("../pages/dashboard/admin/ManageHelp"));

const ADMIN = ["ADMIN", "SUPERADMIN"];

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
            { path: "/sale", element: <SalePage /> },
            { path: "/shop/:id", element: <SingleProduct /> },
            { path: "/checkout", element: <PrivateRoute><Checkout /></PrivateRoute> },
            { path: "/order/:id", element: <PrivateRoute><OrderPlaced /></PrivateRoute> },
            { path: "/help/shipping", element: <Shipping /> },
            { path: "/size-guide", element: <SizeGuide /> },
            { path: "/journal/:slug", element: <JournalPost /> },
            {
                path: "/dashboard",
                element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
                children: [
                    { path: "", element: <UserDashboard /> },
                    { path: "profile", element: <Profile /> },
                    { path: "orders", element: <MyOrders /> },
                    { path: "admin", element: <PrivateRoute roles={ADMIN}><AdminDashboard /></PrivateRoute> },
                    { path: "manage-products", element: <PrivateRoute roles={ADMIN}><ManageProducts /></PrivateRoute> },
                    { path: "manage-categories", element: <PrivateRoute roles={ADMIN}><ManageCategories /></PrivateRoute> },
                    { path: "manage-orders", element: <PrivateRoute roles={ADMIN}><ManageOrders /></PrivateRoute> },
                    { path: "help-requests", element: <PrivateRoute roles={ADMIN}><ManageHelp /></PrivateRoute> },
                    { path: "add-new-post", element: <PrivateRoute roles={ADMIN}><AddNewPost /></PrivateRoute> },
                    { path: "settings", element: <PrivateRoute roles={ADMIN}><DashboardSettings /></PrivateRoute> },
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
