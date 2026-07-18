import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const productsApi = createApi({
    reducerPath: "productsApi",
    baseQuery: createBaseQuery("/api/products"),
    tagTypes: ["Products"],
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: (params) => ({ url: "/", method: "GET", params }),
            providesTags: ["Products"],
        }),
        getProductFilters: builder.query({
            query: (params) => ({ url: "/filters", method: "GET", params }),
        }),
        getProduct: builder.query({
            query: (idOrSlug) => ({ url: `/${idOrSlug}`, method: "GET" }),
            providesTags: ["Products"],
        }),
        createProduct: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Products"],
        }),
        updateProduct: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/${id}`, method: "PATCH", body }),
            invalidatesTags: ["Products"],
        }),
        deleteProduct: builder.mutation({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: ["Products"],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductFiltersQuery,
    useGetProductQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productsApi;

export default productsApi;
