import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseUrl } from "../../utils/baseUrl";
import { logout } from "./auth/authSlice";

// Shared base query. Auth rides on an httpOnly cookie that the browser attaches
// automatically, so the JWT is never readable by page scripts (and therefore not
// stealable via XSS). `credentials: "include"` is what sends it cross-origin.
// A 401 while the UI thinks you're signed in means the cookie expired: sign out
// locally so the page stops acting signed-in (hearts, checkout, dashboard).
export const createBaseQuery = (path) => {
    const base = fetchBaseQuery({ baseUrl: `${getBaseUrl()}${path}`, credentials: "include" });
    return async (args, api, extra) => {
        const result = await base(args, api, extra);
        if (result.error?.status === 401 && api.getState().auth?.user) api.dispatch(logout());
        return result;
    };
};
