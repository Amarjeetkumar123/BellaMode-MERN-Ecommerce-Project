import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const categoriesApi = createApi({
    reducerPath: "categoriesApi",
    baseQuery: createBaseQuery("/api/categories"),
    tagTypes: ["Categories"],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: (params) => ({ url: "/", method: "GET", params }),
            providesTags: ["Categories"],
        }),
        // Seller dashboard — only the caller's own store.
        getMyCategories: builder.query({
            query: (params) => ({ url: "/mine", method: "GET", params }),
            providesTags: ["Categories"],
        }),
        createCategory: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Categories"],
        }),
        updateCategory: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/${id}`, method: "PATCH", body }),
            invalidatesTags: ["Categories"],
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: ["Categories"],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetMyCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoriesApi;

export default categoriesApi;
