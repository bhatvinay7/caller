import {Response} from 'express'
import { AuthRequest } from 'types';
const getCredentials=async (req:AuthRequest,res:Response)=>{
    try{     
     if(!req.user){
         return res.status(401).json({message:"user is unauthorized"})
     }   
     return res.status(200).json(req.user)
    }
    catch(error:any){
        return res.status(500).json({message:"error.message"})
    }
}
export default getCredentials