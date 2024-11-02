import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    products: [],
    selectedItems: 0,
    totalPrice: 0,
    tax: 0,
    taxRate: 0.05, // 5%
    grandTotal: 0,
}
const cartslice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const isExits = state.products.find((product) => product._id === action.payload._id);
            if (!isExits) {
                state.products.push({ ...action.payload, quantity: 1 })
            } else {
                console.log("Product already added into the cart.");
            }
            state.selectedItems = setSelectedItems(state);
            state.totalPrice = setTotalPrice(state);
            state.tax = setTax(state);
            state.grandTotal = setGrandTotal(state);
        },
        updateQuantity: (state, action) => {
            const products = state.products.map((product) => {
                if (product._id === action.payload._id) {
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
            state.products = state.products.filter((product) => product._id !== action.payload._id);
            state.selectedItems = setSelectedItems(state);
            state.totalPrice = setTotalPrice(state);
            state.tax = setTax(state);
            state.grandTotal = setGrandTotal(state);
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

export const { addToCart, updateQuantity, removeFromCart } = cartslice.actions
export default cartslice.reducer
