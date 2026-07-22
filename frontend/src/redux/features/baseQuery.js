import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../utils/baseUrl";

// Shared base query. Auth rides on an httpOnly cookie that the browser attaches
// automatically, so the JWT is never readable by page scripts (and therefore not
// stealable via XSS). `credentials: "include"` is what sends it cross-origin.
export const createBaseQuery = (path) =>
    fetchBaseQuery({
        baseUrl: `${getBaseUrl()}${path}`,
        credentials: "include",
    });
