import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Public blog reads only. Seller blog management lives in storeApi under
// /api/stores/:storeId/blogs.
const blogsApi = createApi({
    reducerPath: "blogsApi",
    baseQuery: createBaseQuery("/api/blogs"),
    tagTypes: ["Blogs"],
    endpoints: (builder) => ({
        getBlogs: builder.query({
            query: (params) => ({ url: "/", method: "GET", params }),
            providesTags: ["Blogs"],
        }),
        getBlog: builder.query({
            query: (slug) => ({ url: `/${slug}`, method: "GET" }),
        }),
    }),
});

export const { useGetBlogsQuery, useGetBlogQuery } = blogsApi;

export default blogsApi;
