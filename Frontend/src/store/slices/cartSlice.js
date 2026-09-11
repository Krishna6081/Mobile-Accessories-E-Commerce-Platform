import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    subtotal: 0,
    itemCount: 0,
    isOpen: false,
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.subtotal = action.payload.subtotal || 0;
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    toggleCartDrawer: (state, action) => {
      state.isOpen = action.payload !== undefined ? action.payload : !state.isOpen;
    },
  },
});

export const { setCart, toggleCartDrawer } = cartSlice.actions;
export default cartSlice.reducer;
