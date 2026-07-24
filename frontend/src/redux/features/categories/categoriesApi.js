import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Public / marketplace category reads only. Seller category management lives in
// storeApi under /api/stores/:storeId/categories.
const categoriesApi = createApi({
    reducerPath: "categoriesApi",
    baseQuery: createBaseQuery("/api/categories"),
    tagTypes: ["Categories"],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: (params) => ({ url: "/", method: "GET", params }),
            providesTags: ["Categories"],
        }),
    }),
});

export const { useGetCategoriesQuery } = categoriesApi;

export default categoriesApi;
