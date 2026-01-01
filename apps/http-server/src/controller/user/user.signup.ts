import {Response,Request} from "express"
import { UserSignup, userSchema } from "../../zodvalidator/validator.js"
import bcrypt from "bcrypt"
import { User } from "mongodb"
export const userSignup=async(req:Request,res:Response)=>{
    try{
     const data:UserSignup=req.body   
     const result=userSchema.safeParse(data)
     if(result.error){
       return res.status(400).json({message:result.error.issues.map(error=>error.message)})
     }
     const user=await User.findOne({email:data.email})
     if(user){
        return res.status(409).json({message:["user already exists"]})
     }
     const password=bcrypt.hashSync(data.password, bcrypt.genSaltSync(10))
     await User.create({...data,password:password})
     return res.status(201).json({message:"Signup successful"})
    }
    catch(error){
        return res.status(500).json({message:["server error,please try again!"]})
    }
}