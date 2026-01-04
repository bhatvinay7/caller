// store/sidebarSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { getUserDetail } from "../../../utils/getUserDetail";
import { userCredentials } from "types";

const initialState: userCredentials = {
  username: "",
  userId: "",
  picture: "",
  email: "",
  token: "",
  isVerified: false,
};

export const getUser_details = createAsyncThunk(
  "auth/getDetails",
  async (_, thunkAPI) => {
    try {
      const res = await getUserDetail();
      return {...res,picture:""}
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUser_details.fulfilled, (state, action) => {
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.userId = action.payload.userId;
        state.picture = action.payload.picture;
        state.isVerified = action.payload.isVerified;
        state.token = action.payload.token;
      })
  },
});

export const userInfo = (state: RootState) => state.user;

export default userSlice.reducer;
