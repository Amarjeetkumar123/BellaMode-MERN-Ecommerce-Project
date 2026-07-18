import { createSlice } from "@reduxjs/toolkit";

const loadFromLocalStorage = () => {
    try {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        return { user: user ? JSON.parse(user) : null, token: token || null };
    } catch (error) {
        console.error("Error loading auth from localStorage:", error);
        return { user: null, token: null };
    }
};

const initialState = loadFromLocalStorage();

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            localStorage.setItem("user", JSON.stringify(user));
            if (token) {
                state.token = token;
                localStorage.setItem("token", token);
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },
    },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
