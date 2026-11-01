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
];

// The bag survives a refresh: it's saved to this browser and restored on load.
const CART_KEY = 'wearly_cart';
const savedCart = (() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || undefined; } catch { return undefined; }
})();

export const store = configureStore({
    preloadedState: savedCart ? { cart: savedCart } : undefined,
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        ...Object.fromEntries(apis.map((api) => [api.reducerPath, api.reducer])),
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});

let lastCart;
store.subscribe(() => {
    const { cart } = store.getState();
    if (cart === lastCart) return;
    lastCart = cart;
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* storage full or blocked: bag just won't persist */ }
});
