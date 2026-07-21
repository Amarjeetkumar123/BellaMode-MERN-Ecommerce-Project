import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Account-synced wishlist — every endpoint is per-user and requires the JWT,
// which createBaseQuery attaches automatically.
const wishlistApi = createApi({
    reducerPath: "wishlistApi",
    baseQuery: createBaseQuery("/api/wishlist"),
    tagTypes: ["Wishlist"],
    endpoints: (builder) => ({
        getWishlist: builder.query({
            query: () => ({ url: "/", method: "GET" }),
            providesTags: ["Wishlist"],
        }),
        addToWishlist: builder.mutation({
            query: (productId) => ({ url: `/${productId}`, method: "POST" }),
            invalidatesTags: ["Wishlist"],
        }),
        removeFromWishlist: builder.mutation({
            query: (productId) => ({ url: `/${productId}`, method: "DELETE" }),
            invalidatesTags: ["Wishlist"],
        }),
    }),
});

export const {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} = wishlistApi;

export default wishlistApi;
