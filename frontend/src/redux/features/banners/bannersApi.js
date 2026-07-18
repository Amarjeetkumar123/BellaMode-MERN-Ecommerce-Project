import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const bannersApi = createApi({
    reducerPath: "bannersApi",
    baseQuery: createBaseQuery("/api/banners"),
    tagTypes: ["Banners"],
    endpoints: (builder) => ({
        getBanners: builder.query({
            query: (params) => ({ url: "/", method: "GET", params }),
            providesTags: ["Banners"],
        }),
        createBanner: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Banners"],
        }),
        updateBanner: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/${id}`, method: "PATCH", body }),
            invalidatesTags: ["Banners"],
        }),
        deleteBanner: builder.mutation({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: ["Banners"],
        }),
    }),
});

export const {
    useGetBannersQuery,
    useCreateBannerMutation,
    useUpdateBannerMutation,
    useDeleteBannerMutation,
} = bannersApi;

export default bannersApi;
