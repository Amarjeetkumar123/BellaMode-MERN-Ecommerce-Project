import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Public banner reads only. Seller banner management lives in storeApi under
// /api/stores/:storeId/banners.
const bannersApi = createApi({
    reducerPath: "bannersApi",
    baseQuery: createBaseQuery("/api/banners"),
    tagTypes: ["Banners"],
    endpoints: (builder) => ({
        getBanners: builder.query({
            query: (params) => ({ url: "/", method: "GET", params }),
            providesTags: ["Banners"],
        }),
    }),
});

export const { useGetBannersQuery } = bannersApi;

export default bannersApi;
