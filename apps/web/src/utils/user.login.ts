import axios from "../lib/axios"
type user={
    email:string,
    password:string
}
export async function userLogin({email,password}:user){
    try{
      const response =await axios.post("/api/v1/user/login",{email,password})
      return response.data as {message:string}
    }
    catch(error){
        throw error
    }
}