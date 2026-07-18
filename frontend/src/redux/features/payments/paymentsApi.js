import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const paymentsApi = createApi({
    reducerPath: "paymentsApi",
    baseQuery: createBaseQuery("/api/payments"),
    endpoints: (builder) => ({
        createPaymentOrder: builder.mutation({
            query: (body) => ({ url: "/order", method: "POST", body }),
        }),
        verifyPayment: builder.mutation({
            query: (body) => ({ url: "/verify", method: "POST", body }),
        }),
    }),
});

export const { useCreatePaymentOrderMutation, useVerifyPaymentMutation } = paymentsApi;
export default paymentsApi;
