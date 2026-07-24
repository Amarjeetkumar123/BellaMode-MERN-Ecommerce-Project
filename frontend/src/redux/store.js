import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import authReducer from "./features/auth/authSlice";
import authApi from "./features/auth/authApi";
import productsApi from "./features/products/productsApi";
import categoriesApi from "./features/categories/categoriesApi";
import ordersApi from "./features/orders/ordersApi";
import reviewsApi from "./features/reviews/reviewsApi";
import blogsApi from "./features/blogs/blogsApi";
import bannersApi from "./features/banners/bannersApi";
import settingsApi from "./features/settings/settingsApi";
import paymentsApi from "./features/payments/paymentsApi";
import uploadApi from "./features/upload/uploadApi";
import wishlistApi from "./features/wishlist/wishlistApi";
import storeApi from "./features/stores/storeApi";
import storefrontApi from "./features/storefronts/storefrontApi";

const apis = [
    authApi,
    productsApi,
    categoriesApi,
    ordersApi,
    reviewsApi,
    blogsApi,
    bannersApi,
    settingsApi,
    paymentsApi,
    uploadApi,
    wishlistApi,
    storeApi,
    storefrontApi,
];

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        ...Object.fromEntries(apis.map((api) => [api.reducerPath, api.reducer])),
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});
