import { createSlice } from "@reduxjs/toolkit";

// Only the (non-sensitive) user profile is persisted, so the UI knows who is
// signed in after a reload. The JWT lives in an httpOnly cookie and is
// deliberately never written to localStorage.
const loadFromLocalStorage = () => {
    try {
        // Clear any token left over from the previous localStorage-based scheme.
        localStorage.removeItem("token");
        const user = localStorage.getItem("user");
        return { user: user ? JSON.parse(user) : null };
    } catch (error) {
        console.error("Error loading auth from localStorage:", error);
        return { user: null };
    }
};

const initialState = loadFromLocalStorage();

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { user } = action.payload;
            state.user = user;
            localStorage.setItem("user", JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            localStorage.removeItem("user");
        },
    },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
