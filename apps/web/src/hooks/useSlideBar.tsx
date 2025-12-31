import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { sideBarState, toggleSidebar } from '../lib/redux/featuresSlice/slideBarSlice'

export default function useSlideBar() {
  const value = useSelector(sideBarState)
  const dispatch = useDispatch()

  const call_SlideBar_Dispatch = useCallback((isOpen: boolean) => {
    dispatch(toggleSidebar(isOpen))
  }, [dispatch])

  return { value, call_SlideBar_Dispatch }
}
