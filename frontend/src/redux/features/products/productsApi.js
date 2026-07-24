import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Public / marketplace product reads only. Seller catalogue management (create,
// update, delete, own listing) lives in storeApi under /api/stores/:storeId/products.
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
    }),
});

export const {
    useGetProductsQuery,
    useGetProductFiltersQuery,
    useGetProductQuery,
} = productsApi;

export default productsApi;
