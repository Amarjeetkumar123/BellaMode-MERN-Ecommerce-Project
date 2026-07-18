import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

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
        createBlog: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Blogs"],
        }),
        updateBlog: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/${id}`, method: "PATCH", body }),
            invalidatesTags: ["Blogs"],
        }),
        deleteBlog: builder.mutation({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: ["Blogs"],
        }),
    }),
});

export const {
    useGetBlogsQuery,
    useGetBlogQuery,
    useCreateBlogMutation,
    useUpdateBlogMutation,
    useDeleteBlogMutation,
} = blogsApi;

export default blogsApi;
