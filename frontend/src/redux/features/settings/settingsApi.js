import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const settingsApi = createApi({
    reducerPath: "settingsApi",
    baseQuery: createBaseQuery("/api/settings"),
    tagTypes: ["Settings"],
    endpoints: (builder) => ({
        getSettings: builder.query({
            query: () => ({ url: "/", method: "GET" }),
            providesTags: ["Settings"],
        }),
        updateSettings: builder.mutation({
            query: (body) => ({ url: "/", method: "PATCH", body }),
            invalidatesTags: ["Settings"],
        }),
    }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
export default settingsApi;
