import { createSlice } from "@reduxjs/toolkit";

const loadUserFromLocalStorage = () => {
    try {
        const serializedState = localStorage.getItem('user');
        return serializedState ? { user: JSON.parse(serializedState) } : { user: null };
    } catch (error) {
        console.error("Error loading user from localStorage:", error);
        return { user: null };
    }
};

const initialState = loadUserFromLocalStorage();
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { user } = action.payload;
            state.user = user;
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            localStorage.removeItem('user');
        }
    }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
