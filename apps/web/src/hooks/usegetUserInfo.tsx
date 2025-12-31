import React from 'react'
import {useDispatch} from 'react-redux'
import {getUser_details} from "../lib/redux/featuresSlice/userDetails"
import { userCredentials } from 'types'
export default function useUserDetail():userCredentials{
    const disPatch=useDispatch()
    const user:userCredentials=disPatch(getUser_details() as any)
  return  user
}