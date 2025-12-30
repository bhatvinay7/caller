import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface ThemeState {
    mode: 'light' | 'dark'
}

// Check local storage or system preference for initial state
const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
        if (savedTheme) {
            return savedTheme
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark'
        }
    }
    return 'light'
}

const initialState: ThemeState = {
    mode: 'light', // Default to light, will need to be set on mount to avoid hydration mismatch
}

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light'
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', state.mode)
            }
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.mode = action.payload
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', state.mode)
            }
        },
        initializeTheme: (state) => {
            const initial = getInitialTheme();
            state.mode = initial;
        }
    },
})

export const { toggleTheme, setTheme, initializeTheme } = themeSlice.actions

export const selectTheme = (state: RootState) => state.theme.mode

export default themeSlice.reducer
