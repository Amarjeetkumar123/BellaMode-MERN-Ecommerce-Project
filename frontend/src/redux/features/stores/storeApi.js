import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// All seller-scoped, id-driven endpoints live under /api/stores/:storeId/… .
// Every seller mutation carries the storeId in the URL; the backend's loadOwnedStore
// guard rejects any store the caller doesn't own.
const storeApi = createApi({
    reducerPath: "storeApi",
    baseQuery: createBaseQuery("/api/stores"),
    tagTypes: ["Store", "StoreProducts", "StoreCategories", "StoreOrders", "StoreSettings", "StoreBanners"],
    endpoints: (builder) => ({
        // ---- store CRUD ----
        listStores: builder.query({
            query: (params) => ({ url: "/", method: "GET", params }),
            providesTags: ["Store"],
        }),
        createStore: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Store"],
        }),
        getStore: builder.query({
            query: (storeId) => ({ url: `/${storeId}`, method: "GET" }),
            providesTags: ["Store"],
        }),
        updateStore: builder.mutation({
            query: ({ storeId, ...body }) => ({ url: `/${storeId}`, method: "PATCH", body }),
            invalidatesTags: ["Store"],
        }),
        updateStoreStatus: builder.mutation({
            query: ({ storeId, ...body }) => ({ url: `/${storeId}/status`, method: "PATCH", body }),
            invalidatesTags: ["Store"],
        }),

        // ---- products ----
        getStoreProducts: builder.query({
            query: ({ storeId, ...params }) => ({ url: `/${storeId}/products`, method: "GET", params }),
            providesTags: ["StoreProducts"],
        }),
        createStoreProduct: builder.mutation({
            query: ({ storeId, ...body }) => ({ url: `/${storeId}/products`, method: "POST", body }),
            invalidatesTags: ["StoreProducts"],
        }),
        updateStoreProduct: builder.mutation({
            query: ({ storeId, id, ...body }) => ({ url: `/${storeId}/products/${id}`, method: "PATCH", body }),
            invalidatesTags: ["StoreProducts"],
        }),
        deleteStoreProduct: builder.mutation({
            query: ({ storeId, id }) => ({ url: `/${storeId}/products/${id}`, method: "DELETE" }),
            invalidatesTags: ["StoreProducts"],
        }),

        // ---- categories ----
        getStoreCategories: builder.query({
            query: ({ storeId, ...params }) => ({ url: `/${storeId}/categories`, method: "GET", params }),
            providesTags: ["StoreCategories"],
        }),
        createStoreCategory: builder.mutation({
            query: ({ storeId, ...body }) => ({ url: `/${storeId}/categories`, method: "POST", body }),
            invalidatesTags: ["StoreCategories"],
        }),
        updateStoreCategory: builder.mutation({
            query: ({ storeId, id, ...body }) => ({ url: `/${storeId}/categories/${id}`, method: "PATCH", body }),
            invalidatesTags: ["StoreCategories"],
        }),
        deleteStoreCategory: builder.mutation({
            query: ({ storeId, id }) => ({ url: `/${storeId}/categories/${id}`, method: "DELETE" }),
            invalidatesTags: ["StoreCategories"],
        }),

        // ---- orders (seller dashboard) ----
        getStoreOrders: builder.query({
            query: ({ storeId, ...params }) => ({ url: `/${storeId}/orders`, method: "GET", params }),
            providesTags: ["StoreOrders"],
        }),
        getStoreOrderStats: builder.query({
            query: ({ storeId, ...params }) => ({ url: `/${storeId}/orders/stats`, method: "GET", params }),
            providesTags: ["StoreOrders"],
        }),
        updateStoreOrderStatus: builder.mutation({
            query: ({ storeId, id, status }) => ({ url: `/${storeId}/orders/${id}/status`, method: "PATCH", body: { status } }),
            invalidatesTags: ["StoreOrders"],
        }),

        // ---- settings ----
        getStoreSettings: builder.query({
            query: (storeId) => ({ url: `/${storeId}/settings`, method: "GET" }),
            providesTags: ["StoreSettings"],
        }),
        updateStoreSettings: builder.mutation({
            query: ({ storeId, ...body }) => ({ url: `/${storeId}/settings`, method: "PATCH", body }),
            invalidatesTags: ["StoreSettings"],
        }),

        // ---- banners ----
        createStoreBanner: builder.mutation({
            query: ({ storeId, ...body }) => ({ url: `/${storeId}/banners`, method: "POST", body }),
            invalidatesTags: ["StoreBanners"],
        }),
        deleteStoreBanner: builder.mutation({
            query: ({ storeId, id }) => ({ url: `/${storeId}/banners/${id}`, method: "DELETE" }),
            invalidatesTags: ["StoreBanners"],
        }),

        // ---- blogs ----
        createStoreBlog: builder.mutation({
            query: ({ storeId, ...body }) => ({ url: `/${storeId}/blogs`, method: "POST", body }),
        }),
        deleteStoreBlog: builder.mutation({
            query: ({ storeId, id }) => ({ url: `/${storeId}/blogs/${id}`, method: "DELETE" }),
        }),
    }),
});

export const {
    useListStoresQuery,
    useCreateStoreMutation,
    useGetStoreQuery,
    useUpdateStoreMutation,
    useUpdateStoreStatusMutation,
    useGetStoreProductsQuery,
    useCreateStoreProductMutation,
    useUpdateStoreProductMutation,
    useDeleteStoreProductMutation,
    useGetStoreCategoriesQuery,
    useCreateStoreCategoryMutation,
    useUpdateStoreCategoryMutation,
    useDeleteStoreCategoryMutation,
    useGetStoreOrdersQuery,
    useGetStoreOrderStatsQuery,
    useUpdateStoreOrderStatusMutation,
    useGetStoreSettingsQuery,
    useUpdateStoreSettingsMutation,
    useCreateStoreBannerMutation,
    useDeleteStoreBannerMutation,
    useCreateStoreBlogMutation,
    useDeleteStoreBlogMutation,
} = storeApi;

export default storeApi;
