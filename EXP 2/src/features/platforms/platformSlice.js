import { createSlice } from "@reduxjs/toolkit";

const platformSlice = createSlice({
  name: "platforms",

  initialState: {
    platforms: ["Twitter", "Instagram", "LinkedIn"],
  },

  reducers: {},
});

export default platformSlice.reducer;