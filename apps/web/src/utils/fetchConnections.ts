import axios from "../lib/axios"

export async function fetchrooms(){
    try{
      const response =await axios.get("/api/v1/user/fetchrooms")
      return response.data 
    }
    catch(error){
        throw error
    }
}