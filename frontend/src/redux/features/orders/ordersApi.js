import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";
import supportApi from "../support/supportApi";

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
        cancelOrder: builder.mutation({
            query: ({ id, reason }) => ({ url: `/${id}/cancel`, method: "PATCH", body: reason ? { reason } : {} }),
            invalidatesTags: ["Orders"],
            // a paid order that can't be refunded automatically opens a refund request
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try { await queryFulfilled; dispatch(supportApi.util.invalidateTags(["Support"])); } catch { /* shown by the caller */ }
            },
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
    useCancelOrderMutation,
} = ordersApi;

export default ordersApi;
