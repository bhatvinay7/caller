import { Response } from "express"
import { Channel, User } from "mongodb"
import mongoose from "mongoose";
import { AuthRequest } from 'types'
export const joinRoom = async (req: AuthRequest, res: Response) => {
    try {
        const {roomId} = req.body
        const user = req.user
        if (!roomId || !user.userId) {
            return res.status(400).json({ message: "roomId or userId is not provided" })
        }
        const room = await Channel.findOne({ roomId: roomId })
        const userData=await User.findById({_id:new mongoose.Types.ObjectId(user.userId)})
        if(userData){
        if (!room) {

                const newRoom = await Channel.create({
                    roomId,
                    users: [userData]
                } 
            )
            return res.status(201).json({ message: `New room created with roomId ${roomId}` })
        }
        else {
            const addToRoom = await Channel.updateOne(
                {roomId:roomId},
                { $push: { users:userData } }
            )
        }
        return res.status(200).json({ message: `User is successfully added to room` })
    }
    else{
        return res.send(404)
    }
    }
    catch (error: any) {
        console.log(error)
        return res.status(500).json({ message: "Error occured while joining to room" })
    }
}