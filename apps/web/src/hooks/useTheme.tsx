'use client'
import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectTheme, toggleTheme } from '../lib/redux/featuresSlice/themeSlice'

export const useTheme = () => {
    const theme = useSelector(selectTheme)
    const dispatch = useDispatch()

    const toggle = useCallback(() => {
        dispatch(toggleTheme())
    }, [dispatch])

    return { theme, toggle }
}
