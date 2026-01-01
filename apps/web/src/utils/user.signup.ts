import axios from "../lib/axios"

export async function userSignup(username:string,email:string,password:string){
    try{
      const response =await axios.post("/api/v1/user/signup",{username,email,password})
      return response.data as {message:string}
    }
    catch(error){
        throw error
    }
}