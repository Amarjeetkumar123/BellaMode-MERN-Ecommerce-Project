import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const reviewsApi = createApi({
    reducerPath: "reviewsApi",
    baseQuery: createBaseQuery("/api/reviews"),
    tagTypes: ["Reviews"],
    endpoints: (builder) => ({
        getReviewsByProduct: builder.query({
            query: (productId) => ({ url: `/product/${productId}`, method: "GET" }),
            providesTags: ["Reviews"],
        }),
        addReview: builder.mutation({
            query: (body) => ({ url: "/", method: "POST", body }),
            invalidatesTags: ["Reviews"],
        }),
    }),
});

export const { useGetReviewsByProductQuery, useAddReviewMutation } = reviewsApi;
export default reviewsApi;
