import Jwt,{JwtPayload} from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
const JWT_SECRET=process.env.JWT_SECRET!
export function authVerify(token:string):Jwt.JwtPayload{
    try{
     const decode=Jwt.verify(token,JWT_SECRET)
     return decode as JwtPayload
    }
    catch(error){
        console.log(error)
        const err=new Error("user is unauthorized")
        err.name="authError"
        throw err
    }
}