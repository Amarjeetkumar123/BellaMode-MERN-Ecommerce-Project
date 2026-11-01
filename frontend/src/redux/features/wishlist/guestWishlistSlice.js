import { createSlice } from '@reduxjs/toolkit'

// Hearts saved while signed out live in this browser (persisted in store.js) and
// move onto the account at sign-in. Keeps just what the cards and drawer show.
const snapshot = (p) => ({
    _id: p._id, slug: p.slug, name: p.name, brand: p.brand, price: p.price, oldPrice: p.oldPrice,
    images: (p.images || []).slice(0, 1), image: p.image, sizes: p.sizes, colors: p.colors,
});

const guestWishlistSlice = createSlice({
    name: 'guestWishlist',
    initialState: { items: [] },
    reducers: {
        toggleGuestWish: (state, action) => {
            const i = state.items.findIndex((p) => p._id === action.payload._id);
            if (i >= 0) state.items.splice(i, 1);
            else state.items.push(snapshot(action.payload));
        },
        clearGuestWishlist: (state) => { state.items = []; },
    },
});

export const { toggleGuestWish, clearGuestWishlist } = guestWishlistSlice.actions;
export default guestWishlistSlice.reducer;
