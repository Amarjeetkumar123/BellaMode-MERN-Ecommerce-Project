import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const ordersApi = createApi({
    reducerPath: "ordersApi",
    baseQuery: createBaseQuery("/api/orders"),
    tagTypes: ["Orders"],
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Orders"],
        }),
        getMyOrders: builder.query({
            query: () => ({ url: "/myorders", method: "GET" }),
            providesTags: ["Orders"],
        }),
        getOrderStats: builder.query({
            query: (params) => ({ url: "/stats", method: "GET", params }),
            providesTags: ["Orders"],
        }),
        getAllOrders: builder.query({
            query: (params) => ({ url: "/", method: "GET", params }),
            providesTags: ["Orders"],
        }),
        getOrder: builder.query({
            query: (id) => ({ url: `/${id}`, method: "GET" }),
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({ url: `/${id}/status`, method: "PATCH", body: { status } }),
            invalidatesTags: ["Orders"],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetAllOrdersQuery,
    useGetOrderStatsQuery,
    useGetOrderQuery,
    useUpdateOrderStatusMutation,
} = ordersApi;

export default ordersApi;
