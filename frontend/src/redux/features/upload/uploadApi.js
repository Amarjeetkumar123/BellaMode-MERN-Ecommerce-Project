import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const uploadApi = createApi({
    reducerPath: "uploadApi",
    baseQuery: createBaseQuery("/api/upload"),
    endpoints: (builder) => ({
        // Multipart file upload — pass a File object.
        uploadFile: builder.mutation({
            query: (file) => {
                const formData = new FormData();
                formData.append("image", file);
                return { url: "/", method: "POST", body: formData };
            },
        }),
        // Ingest a remote image URL.
        uploadByUrl: builder.mutation({
            query: (imageUrl) => ({ url: "/url", method: "POST", body: { imageUrl } }),
        }),
    }),
});

export const { useUploadFileMutation, useUploadByUrlMutation } = uploadApi;
export default uploadApi;
