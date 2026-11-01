import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const newsletterApi = createApi({
    reducerPath: "newsletterApi",
    baseQuery: createBaseQuery("/api/newsletter"),
    endpoints: (builder) => ({
        subscribe: builder.mutation({
            query: (email) => ({ url: "/", method: "POST", body: { email } }),
        }),
    }),
});

export const { useSubscribeMutation } = newsletterApi;
export default newsletterApi;
