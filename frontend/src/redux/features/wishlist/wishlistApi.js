import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Account-synced wishlist — every endpoint is per-user and requires the JWT,
// which createBaseQuery attaches automatically.
const optimistic = async ({ dispatch, queryFulfilled }, edit) => {
    const patch = dispatch(wishlistApi.util.updateQueryData("getWishlist", undefined, (draft) => {
        if (draft?.data?.wishlist) edit(draft.data.wishlist);
    }));
    try { await queryFulfilled; } catch { patch.undo(); }
};

const wishlistApi = createApi({
    reducerPath: "wishlistApi",
    baseQuery: createBaseQuery("/api/wishlist"),
    tagTypes: ["Wishlist"],
    endpoints: (builder) => ({
        getWishlist: builder.query({
            query: () => ({ url: "/", method: "GET" }),
            providesTags: ["Wishlist"],
        }),
        // Both take the product and update the cached list at once, so the heart fills
        // on click; a failed request rolls it back.
        addToWishlist: builder.mutation({
            query: (product) => ({ url: `/${product._id}`, method: "POST" }),
            onQueryStarted: (product, api) => optimistic(api, (list) => { list.push(product); }),
            invalidatesTags: ["Wishlist"],
        }),
        removeFromWishlist: builder.mutation({
            query: (product) => ({ url: `/${product._id}`, method: "DELETE" }),
            onQueryStarted: (product, api) => optimistic(api, (list) => {
                const i = list.findIndex((p) => p._id === product._id);
                if (i >= 0) list.splice(i, 1);
            }),
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
