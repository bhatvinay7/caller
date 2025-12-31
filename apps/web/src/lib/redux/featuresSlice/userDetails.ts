// store/sidebarSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { getUserDetail } from "../../../utils/getUserDetail";

export interface UserState {
  username: string | null;
  email: string | null;
  userId: string | null;
  picture: string | null;
  isVerified: boolean;
  token: string | null;
  state: "idle" | "loading" | "succeeded" | "failed" | "pending";
  error: string | null;
}

const initialState: UserState = {
  username: "",
  userId: "",
  picture: "",
  email: "",
  token: "",
  isVerified: false,
  state: "pending",
  error: null,
};

export const getUser_details = createAsyncThunk(
  "auth/getDetails",
  async (_, thunkAPI) => {
    try {
      const res = await getUserDetail();
      return res;
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
      .addCase(getUser_details.pending, (state) => {
        state.state = "loading";
      })
      .addCase(getUser_details.fulfilled, (state, action) => {
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.userId = action.payload.userId;
        state.picture = action.payload.picture;
        state.isVerified = action.payload.isVerified;
        state.token = action.payload.token;
        state.state = "succeeded";
      })
      .addCase(getUser_details.rejected, (state) => {
        state.state = "failed";
      });
  },
});

export const userInfo = (state: RootState) => state.user;

export default userSlice.reducer;
