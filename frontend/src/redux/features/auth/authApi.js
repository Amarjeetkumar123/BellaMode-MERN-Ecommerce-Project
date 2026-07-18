import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "../baseQuery";

const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: createBaseQuery("/api/auth"),
    tagTypes: ["Users"],
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (newUser) => ({ url: "/register", method: "POST", body: newUser }),
        }),
        loginUser: builder.mutation({
            query: (credentials) => ({ url: "/login", method: "POST", body: credentials }),
        }),
        logoutUser: builder.mutation({
            query: () => ({ url: "/logout", method: "POST" }),
        }),
        getMe: builder.query({
            query: () => ({ url: "/me", method: "GET" }),
        }),
        editProfile: builder.mutation({
            query: (profileData) => ({ url: "/edit-profile", method: "PATCH", body: profileData }),
        }),
        getUsers: builder.query({
            query: (params) => ({ url: "/users", method: "GET", params }),
            providesTags: ["Users"],
        }),
        updateUserRole: builder.mutation({
            query: ({ userId, role }) => ({ url: `/users/${userId}`, method: "PUT", body: { role } }),
            invalidatesTags: ["Users"],
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({ url: `/users/${userId}`, method: "DELETE" }),
            invalidatesTags: ["Users"],
        }),
    }),
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useGetMeQuery,
    useEditProfileMutation,
    useGetUsersQuery,
    useUpdateUserRoleMutation,
    useDeleteUserMutation,
} = authApi;

export default authApi;
