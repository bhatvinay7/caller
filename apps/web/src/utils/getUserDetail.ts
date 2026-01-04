import axiosPublic from '../lib/axios'
import { userCredentials } from 'types'
export async function getUserDetail():Promise<userCredentials>{
    const response=await axiosPublic.get(`/api/v1/user/getUserDetail`)
    return response.data
}