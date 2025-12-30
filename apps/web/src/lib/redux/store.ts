import { configureStore,EnhancedStore } from '@reduxjs/toolkit'
import sideBarReducer from "./featuresSlice/slideBarSlice"
import userState from './featuresSlice/userDetails'
export const makeStore= ():EnhancedStore => {
  return configureStore({
    reducer: {
        sideBar:sideBarReducer,
        user:userState,
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']