import { configureStore } from '@reduxjs/toolkit'
import sideBarReducer from "./featuresSlice/slideBarSlice"
import userState from './featuresSlice/userDetails'
import themeReducer from "./featuresSlice/themeSlice"

export const store = configureStore({
  reducer: {
    sideBar: sideBarReducer,
    user: userState,
    theme: themeReducer,
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store