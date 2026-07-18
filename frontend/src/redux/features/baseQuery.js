import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../utils/baseUrl";

// Shared base query that attaches the JWT from localStorage as the Authorization header.
export const createBaseQuery = (path) =>
    fetchBaseQuery({
        baseUrl: `${getBaseUrl()}${path}`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
            if (token) headers.set("Authorization", token);
            return headers;
        },
    });
