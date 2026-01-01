import axios from "../lib/axios"

export async function joinroom(roomId:string){
    try{
      const response =await axios.post("/api/v1/user/joinroom",{roomId})
      return response.data as {message:string}
    }
    catch(error){
        throw error
    }
}
