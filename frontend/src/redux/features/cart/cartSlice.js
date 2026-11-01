import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    products: [],
    selectedItems: 0,
    totalPrice: 0,
    tax: 0,
    taxRate: 0.05, // 5%
    grandTotal: 0,
}
// One line per product + size + colour: the same shirt in M and L is two lines.
export const lineKey = (p) => [p._id, p.size || '', p.color || ''].join('|');
const sameLine = (p, key) => (p.key || p._id) === key;

const cartslice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // payload: product fields (+ size, color) and an optional quantity (default 1)
        addToCart: (state, action) => {
            const { quantity = 1, ...item } = action.payload;
            const key = lineKey(item);
            const line = state.products.find((p) => sameLine(p, key));
            if (line) line.quantity += quantity;
            else state.products.push({ ...item, key, quantity });
            state.selectedItems = setSelectedItems(state);
            state.totalPrice = setTotalPrice(state);
            state.tax = setTax(state);
            state.grandTotal = setGrandTotal(state);
        },
        updateQuantity: (state, action) => {
            const products = state.products.map((product) => {
                if (sameLine(product, action.payload.key || action.payload._id)) {
                    if (action.payload.type === 'increment') {
                        product.quantity += 1;
                    } else if (action.payload.type === 'decrement') {
                        if (product.quantity > 1) {
                            product.quantity -= 1;
                        }
                    }
                }
                return product;
            })
            state.selectedItems = setSelectedItems(state);
            state.totalPrice = setTotalPrice(state);
            state.tax = setTax(state);
            state.grandTotal = setGrandTotal(state);
        },
        removeFromCart: (state, action) => {
            state.products = state.products.filter((product) => !sameLine(product, action.payload.key || action.payload._id));
            state.selectedItems = setSelectedItems(state);
            state.totalPrice = setTotalPrice(state);
            state.tax = setTax(state);
            state.grandTotal = setGrandTotal(state);
        },
        clearCart: (state) => {
            state.products = [];
            state.selectedItems = 0;
            state.totalPrice = 0;
            state.tax = 0;
            state.grandTotal = 0;
        }
    }
})

export const setSelectedItems = (state) => state.products.reduce((total, product) => {
    return Number(total + product.quantity);
}, 0)
export const setTotalPrice = (state) => state.products.reduce((total, product) => {
    return Number(total + product.quantity * product.price);
}, 0)
export const setTax = (state) => setTotalPrice(state) * state.taxRate;
export const setGrandTotal = (state) => {
    return setTotalPrice(state) + setTotalPrice(state) * state.taxRate
}

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartslice.actions
export default cartslice.reducer
