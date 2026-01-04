import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
export type IncomingCall = {
  from: string;
  offer: RTCSessionDescriptionInit;
  channelId: string;
};

export type userActionType = {
  action: string;
  incomingCall: IncomingCall | null;
}

const userACtions = ["startcall", "calling", "receivecall", "endcall", "none"] as const
const initialState: userActionType = {
  action: userACtions[4],
  incomingCall: null,
}

export const userActionSlice = createSlice({
  name: 'userAction',
  initialState,
  reducers: {
    setUserAction(state, action: PayloadAction<string>) {
      state.action = action.payload
    },
    setIncomingCall(state, action: PayloadAction<IncomingCall | null>) {
      state.incomingCall = action.payload
    }
  }
})

export const { setUserAction, setIncomingCall } = userActionSlice.actions
export const userActionState = (state: RootState) => state.userAction.action
export const incomingCallState = (state: RootState) => state.userAction.incomingCall

export default userActionSlice.reducer
