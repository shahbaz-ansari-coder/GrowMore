// userSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    email: '',
    name: '',
    capital_price: '',
    loss_price: 0,
    profit_price: 0,
    isLoggedIn: false, // 👈 added login status
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { email, name, capital_price, loss_price, profit_price } = action.payload
            state.email = email
            state.name = name
            state.capital_price = capital_price
            state.loss_price = loss_price || 0
            state.profit_price = profit_price || 0
            state.isLoggedIn = true
        },
        logoutUser: (state) => {
            state.email = ''
            state.name = ''
            state.capital_price = ''
            state.loss_price = 0
            state.profit_price = 0
            state.isLoggedIn = false
        },
    },
})

// ✅ Export actions
export const { setUser, logoutUser } = userSlice.actions

// ✅ Export reducer
export default userSlice.reducer