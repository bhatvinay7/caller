import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { userActionState, setUserAction } from '../lib/redux/featuresSlice/userActionSlice'

export default function useUserAction() {
  const action = useSelector(userActionState)
  const dispatch = useDispatch()

  const userAction = useCallback((action: string) => {
    dispatch(setUserAction(action))
  }, [dispatch])

  return { action, userAction }
}
