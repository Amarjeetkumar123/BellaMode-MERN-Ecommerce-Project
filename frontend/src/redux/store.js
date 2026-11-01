import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import authReducer from "./features/auth/authSlice";
import guestWishlistReducer from "./features/wishlist/guestWishlistSlice";
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

// The bag and signed-out hearts survive a refresh: saved to this browser, restored on load.
const SAVED = { cart: 'wearly_cart', guestWishlist: 'wearly_wishlist' };
const load = (key) => { try { return JSON.parse(localStorage.getItem(key)) || undefined; } catch { return undefined; } };
const preloadedState = Object.fromEntries(Object.entries(SAVED).map(([slice, key]) => [slice, load(key)]).filter(([, v]) => v));

export const store = configureStore({
    preloadedState,
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        guestWishlist: guestWishlistReducer,
        ...Object.fromEntries(apis.map((api) => [api.reducerPath, api.reducer])),
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});

const last = {};
store.subscribe(() => {
    const state = store.getState();
    Object.entries(SAVED).forEach(([slice, key]) => {
        if (state[slice] === last[slice]) return;
        last[slice] = state[slice];
        try { localStorage.setItem(key, JSON.stringify(state[slice])); } catch { /* storage full or blocked: just won't persist */ }
    });
});
