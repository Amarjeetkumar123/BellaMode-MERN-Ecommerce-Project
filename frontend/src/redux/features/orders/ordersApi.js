import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Customer-facing order endpoints only (a buyer's own orders). Seller-dashboard
// order views — list, stats, status — live in storeApi under
// /api/stores/:storeId/orders.
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
        getOrder: builder.query({
            query: (id) => ({ url: `/${id}`, method: "GET" }),
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetOrderQuery,
} = ordersApi;

export default ordersApi;
