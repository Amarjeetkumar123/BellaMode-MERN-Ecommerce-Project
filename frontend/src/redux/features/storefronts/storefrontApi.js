import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Public per-seller storefront profile (approved stores only). The product grid on
// a storefront page reuses productsApi's getProducts with a `store` param.
const storefrontApi = createApi({
    reducerPath: "storefrontApi",
    baseQuery: createBaseQuery("/api/storefronts"),
    endpoints: (builder) => ({
        getStorefront: builder.query({
            query: (slug) => ({ url: `/${slug}`, method: "GET" }),
        }),
        // Maps the current Host header to a storefront (or null on the apex domain).
        resolveHost: builder.query({
            query: () => ({ url: `/resolve`, method: "GET" }),
        }),
    }),
});

export const { useGetStorefrontQuery, useResolveHostQuery } = storefrontApi;

export default storefrontApi;
