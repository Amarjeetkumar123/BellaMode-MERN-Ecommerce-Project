import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

// Public storefront settings read only (default/marketplace store). A seller edits
// their own store's settings via storeApi under /api/stores/:storeId/settings.
const settingsApi = createApi({
    reducerPath: "settingsApi",
    baseQuery: createBaseQuery("/api/settings"),
    tagTypes: ["Settings"],
    endpoints: (builder) => ({
        getSettings: builder.query({
            query: () => ({ url: "/", method: "GET" }),
            providesTags: ["Settings"],
        }),
    }),
});

export const { useGetSettingsQuery } = settingsApi;
export default settingsApi;
