import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Help requests about an order: customers raise them, admins reply.
const supportApi = createApi({
    reducerPath: "supportApi",
    baseQuery: createBaseQuery("/api/support"),
    tagTypes: ["Support"],
    endpoints: (builder) => ({
        createRequest: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Support"],
        }),
        getMyRequests: builder.query({
            query: () => ({ url: "/mine", method: "GET" }),
            providesTags: ["Support"],
        }),
        getRequests: builder.query({
            query: (params) => ({ url: "/", method: "GET", params }),
            providesTags: ["Support"],
        }),
        updateRequest: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/${id}`, method: "PATCH", body }),
            invalidatesTags: ["Support"],
        }),
    }),
});

export const {
    useCreateRequestMutation,
    useGetMyRequestsQuery,
    useGetRequestsQuery,
    useUpdateRequestMutation,
} = supportApi;

export default supportApi;
